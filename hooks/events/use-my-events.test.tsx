import { useAuthStore } from "@/stores/auth-store"
import type { EventCard, EventsPage } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMyEvents } from "./use-my-events"

const getNearbyPage = vi.fn()
const getMyEventsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		getNearbyPage: (...a: unknown[]) => getNearbyPage(...a),
		getMyEventsPage: (...a: unknown[]) => getMyEventsPage(...a),
	},
}))

const card = (id: string): EventCard => ({
	id,
	name: id,
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "",
	endTime: "",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: [],
	address: null,
	coordinates: null,
	hosts: [],
	viewerRsvp: null,
	distanceKm: null,
})
const page = (n: number, ids: string[], hasNext: boolean): EventsPage => ({
	events: ids.map(card),
	page: n,
	hasNext,
})

function wrapper() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	return function Wrapper({ children }: { children: ReactNode }) {
		return createElement(QueryClientProvider, { client }, children)
	}
}

beforeEach(() => {
	getNearbyPage.mockReset()
	getMyEventsPage.mockReset()
	useAuthStore.setState({ user: { pkid: 7 } as never, sessionGeneration: 0 })
})

describe("useMyEvents", () => {
	it("needs no location and never calls the nearby endpoint", async () => {
		getMyEventsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useMyEvents(), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		expect(getMyEventsPage).toHaveBeenCalledWith(
			{ search: "", page: 1, limit: 20 },
			expect.anything(),
		)
		expect(getNearbyPage).not.toHaveBeenCalled()
	})

	it("passes the trimmed search term to the My Events endpoint", async () => {
		getMyEventsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useMyEvents("  jazz  "), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		expect(getMyEventsPage.mock.calls[0][0]).toMatchObject({ search: "jazz" })
	})

	it("paginates by following `next`", async () => {
		getMyEventsPage
			.mockResolvedValueOnce(page(1, ["a"], true))
			.mockResolvedValueOnce(page(2, ["b"], false))
		const { result } = renderHook(() => useMyEvents(), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(async () => {
			await result.current.fetchNextPage()
		})
		await waitFor(() => expect(result.current.events.map((e) => e.id)).toEqual(["a", "b"]))
		expect(result.current.hasNextPage).toBe(false)
		expect(getMyEventsPage.mock.calls[1][0]).toMatchObject({ page: 2 })
	})

	it("does not fetch before the account is known", async () => {
		useAuthStore.setState({ user: null })
		const { result } = renderHook(() => useMyEvents(), { wrapper: wrapper() })
		await act(async () => {})
		expect(getMyEventsPage).not.toHaveBeenCalled()
		expect(result.current.isInitialLoading).toBe(true)
	})

	it("refetches for a different account rather than reusing the first account's events", async () => {
		getMyEventsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useMyEvents(), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		act(() => useAuthStore.setState({ user: { pkid: 8 } as never }))
		await waitFor(() => expect(getMyEventsPage).toHaveBeenCalledTimes(2))
	})

	it("surfaces an error when the first page fails", async () => {
		getMyEventsPage.mockRejectedValue(new Error("boom"))
		const { result } = renderHook(() => useMyEvents(), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.isError).toBe(true))
		expect(result.current.events).toEqual([])
	})
})
