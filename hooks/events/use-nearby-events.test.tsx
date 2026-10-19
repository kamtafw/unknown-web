import { useAuthStore } from "@/stores/auth-store"
import type { EventCard, EventsPage } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { createElement, type ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useNearbyEvents } from "./use-nearby-events"

const getNearbyPage = vi.fn()
const getMyEventsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		getNearbyPage: (...a: unknown[]) => getNearbyPage(...a),
		getMyEventsPage: (...a: unknown[]) => getMyEventsPage(...a),
	},
}))

const card = (id: string, name = id, extra: Partial<EventCard> = {}): EventCard => ({
	id,
	name,
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "10:00",
	endTime: "12:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: [],
	address: null,
	coordinates: null,
	hosts: [],
	viewerRsvp: null,
	distanceKm: 1,
	...extra,
})
const page = (n: number, events: EventCard[], hasNext: boolean): EventsPage => ({
	events,
	page: n,
	hasNext,
})

function wrapper() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	return function Wrapper({ children }: { children: ReactNode }) {
		return createElement(QueryClientProvider, { client }, children)
	}
}

const here = { latitude: 9.9, longitude: 8.9 }

beforeEach(() => {
	getNearbyPage.mockReset()
	getMyEventsPage.mockReset()
	useAuthStore.setState({ user: { pkid: 7 } as never, sessionGeneration: 0 })
})

describe("useNearbyEvents", () => {
	it("makes no request at all without coordinates (no global fallback)", async () => {
		const { result } = renderHook(() => useNearbyEvents(null), { wrapper: wrapper() })
		await act(async () => {})
		expect(getNearbyPage).not.toHaveBeenCalled()
		expect(getMyEventsPage).not.toHaveBeenCalled()
		expect(result.current.events).toEqual([])
		expect(result.current.isInitialLoading).toBe(false)
	})

	it("makes no request before the account is known", async () => {
		useAuthStore.setState({ user: null })
		renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await act(async () => {})
		expect(getNearbyPage).not.toHaveBeenCalled()
	})

	it("fetches page 1 with the exact coordinates and only ever calls the nearby endpoint", async () => {
		getNearbyPage.mockResolvedValue(page(1, [card("a")], false))
		const { result } = renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		expect(getNearbyPage).toHaveBeenCalledWith(
			{ latitude: 9.9, longitude: 8.9, page: 1, limit: 20 },
			expect.anything(),
		)
		expect(getMyEventsPage).not.toHaveBeenCalled()
	})

	it("fetches for a 0,0 location", async () => {
		getNearbyPage.mockResolvedValue(page(1, [card("a")], false))
		const { result } = renderHook(() => useNearbyEvents({ latitude: 0, longitude: 0 }), {
			wrapper: wrapper(),
		})
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		expect(getNearbyPage.mock.calls[0][0]).toMatchObject({ latitude: 0, longitude: 0 })
	})

	it("keeps going past an empty page while `next` is set", async () => {
		getNearbyPage
			.mockResolvedValueOnce(page(1, [], true))
			.mockResolvedValueOnce(page(2, [card("a")], false))
		const { result } = renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events.map((e) => e.id)).toEqual(["a"]))
		expect(getNearbyPage).toHaveBeenCalledTimes(2)
		expect(getNearbyPage.mock.calls[1][0]).toMatchObject({ page: 2 })
	})

	it("reports scanning, not empty, while only empty pages have loaded", async () => {
		let release: (p: EventsPage) => void = () => {}
		getNearbyPage
			.mockResolvedValueOnce(page(1, [], true))
			.mockReturnValueOnce(new Promise<EventsPage>((r) => (release = r)))
		const { result } = renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.isScanning).toBe(true))
		await act(async () => release(page(2, [], false)))
		await waitFor(() => expect(result.current.isScanning).toBe(false))
		expect(result.current.events).toEqual([])
	})

	it("dedupes across pages and keeps server order", async () => {
		getNearbyPage
			.mockResolvedValueOnce(page(1, [card("a"), card("b")], true))
			.mockResolvedValueOnce(page(2, [card("b"), card("c")], false))
		const { result } = renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(async () => {
			await result.current.fetchNextPage()
		})
		await waitFor(() => expect(result.current.events.map((e) => e.id)).toEqual(["a", "b", "c"]))
	})

	it("searches locally across ALL nearby pages and never calls My Events or a global search", async () => {
		getNearbyPage
			.mockResolvedValueOnce(page(1, [card("a", "Jazz night")], true))
			.mockResolvedValueOnce(page(2, [card("b", "Tech meetup", { hashtags: ["code"] })], false))
		const { result } = renderHook(() => useNearbyEvents(here, "meetup"), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.coverage).toBe("complete"))
		expect(result.current.events.map((e) => e.id)).toEqual(["b"])
		expect(getNearbyPage).toHaveBeenCalledTimes(2)
		expect(getMyEventsPage).not.toHaveBeenCalled()
	})

	it("does not claim complete coverage when a page fails during the scan", async () => {
		getNearbyPage
			.mockResolvedValueOnce(page(1, [card("a", "Jazz night")], true))
			.mockRejectedValueOnce(new Error("boom"))
		const { result } = renderHook(() => useNearbyEvents(here, "zzz"), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.coverage).toBe("partial"))
		expect(result.current.events).toEqual([])
	})

	it("isolates the cache per account: a new account refetches", async () => {
		getNearbyPage.mockResolvedValue(page(1, [card("a")], false))
		const { result } = renderHook(() => useNearbyEvents(here), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		expect(getNearbyPage).toHaveBeenCalledTimes(1)

		act(() => useAuthStore.setState({ user: { pkid: 8 } as never }))
		await waitFor(() => expect(getNearbyPage).toHaveBeenCalledTimes(2))
	})

	it("does not show the previous location's results while a new location loads", async () => {
		let release: (p: EventsPage) => void = () => {}
		getNearbyPage
			.mockResolvedValueOnce(page(1, [card("old")], false))
			.mockReturnValueOnce(new Promise<EventsPage>((r) => (release = r)))
		const { result, rerender } = renderHook(({ c }) => useNearbyEvents(c), {
			wrapper: wrapper(),
			initialProps: { c: here as typeof here | null },
		})
		await waitFor(() => expect(result.current.events).toHaveLength(1))

		rerender({ c: { latitude: 10.5, longitude: 7.4 } })
		expect(result.current.events).toEqual([])
		expect(result.current.isInitialLoading).toBe(true)
		await act(async () => release(page(1, [card("new")], false)))
		await waitFor(() => expect(result.current.events.map((e) => e.id)).toEqual(["new"]))
	})

	it("clears results when location is lost", async () => {
		getNearbyPage.mockResolvedValue(page(1, [card("a")], false))
		const { result, rerender } = renderHook(({ c }) => useNearbyEvents(c), {
			wrapper: wrapper(),
			initialProps: { c: here as typeof here | null },
		})
		await waitFor(() => expect(result.current.events).toHaveLength(1))
		rerender({ c: null })
		expect(result.current.events).toEqual([])
		expect(getNearbyPage).toHaveBeenCalledTimes(1)
	})
})
