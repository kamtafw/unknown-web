import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventGuest, EventGuestsPage } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { flattenGuestPages, useEventGuests } from "./use-event-guests"

const getEventGuestsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventGuestsPage: (...a: unknown[]) => getEventGuestsPage(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const guest = (userId: number, over: Partial<EventGuest> = {}): EventGuest => ({
	userId,
	name: `Guest ${userId}`,
	username: `g${userId}`,
	photo: null,
	role: "guest",
	...over,
})
const page = (n: number, ids: number[], hasNext: boolean): EventGuestsPage => ({
	page: n,
	guests: ids.map((id) => guest(id)),
	hasNext,
})
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

beforeEach(() => {
	getEventGuestsPage.mockReset()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("flattenGuestPages", () => {
	it("keeps the backend order, appends pages and drops a repeated user id (first wins)", () => {
		const pages = [page(1, [3, 2], true), page(2, [2, 1], false)]
		expect(flattenGuestPages(pages).map((g) => g.userId)).toEqual([3, 2, 1])
	})
	it("does not sort", () => {
		expect(flattenGuestPages([page(1, [9, 1, 5], false)]).map((g) => g.userId)).toEqual([9, 1, 5])
	})
	it("handles no pages", () => {
		expect(flattenGuestPages(undefined)).toEqual([])
	})
})

describe("useEventGuests", () => {
	it("loads page 1 for this event with the page size", async () => {
		getEventGuestsPage.mockResolvedValue(page(1, [1], false))
		const { result } = renderHook(() => useEventGuests(ID, 20), { wrapper })
		expect(result.current.isInitialLoading).toBe(true)
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(getEventGuestsPage).toHaveBeenCalledTimes(1)
		expect(getEventGuestsPage.mock.calls[0][0]).toEqual({ eventId: ID, page: 1, limit: 20 })
		expect(result.current.guests.map((g) => g.userId)).toEqual([1])
		expect(result.current.error).toBeNull()
	})

	it("fetches the next page only because `next` says so, and appends in order", async () => {
		getEventGuestsPage.mockResolvedValueOnce(page(1, [3, 2], true)).mockResolvedValueOnce(page(2, [1], false))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.guests.map((g) => g.userId)).toEqual([3, 2, 1]))
		expect(getEventGuestsPage.mock.calls[1][0]).toMatchObject({ eventId: ID, page: 2 })
		expect(result.current.hasNextPage).toBe(false)
	})

	it("makes no further request when `next` is null, whatever the page size", async () => {
		getEventGuestsPage.mockResolvedValue(page(1, Array.from({ length: 20 }, (_, i) => i + 1), false))
		const { result } = renderHook(() => useEventGuests(ID, 20), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.hasNextPage).toBe(false)
		await act(() => result.current.fetchNextPage())
		expect(getEventGuestsPage).toHaveBeenCalledTimes(1)
	})

	it("a short page with a next link still has a next page (rows are not counted)", async () => {
		getEventGuestsPage.mockResolvedValue(page(1, [1], true))
		const { result } = renderHook(() => useEventGuests(ID, 20), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
	})

	it("an empty, terminal result is loaded and empty, not an error", async () => {
		getEventGuestsPage.mockResolvedValue(page(1, [], false))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.guests).toEqual([])
		expect(result.current.error).toBeNull()
	})

	it.each([
		[401, "unauthorized"],
		[403, "forbidden"],
		[404, "not_found"],
		[500, "server"],
	])("an initial %i is %s, never an empty list, and a refusal is not retried", async (status, kind) => {
		getEventGuestsPage.mockRejectedValue(err(status))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe(kind))
		expect(result.current.phase).toBe("initial")
		expect(result.current.hasLoaded).toBe(false)
		expect(result.current.guests).toEqual([])
		expect(result.current.isInitialLoading).toBe(false)
		if (status < 500) expect(getEventGuestsPage).toHaveBeenCalledTimes(1)
	})

	it("a network failure is reported as network", async () => {
		getEventGuestsPage.mockRejectedValue(new Error("offline"))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe("network"))
	})

	it("an initial failure can be retried with refetch", async () => {
		getEventGuestsPage.mockRejectedValueOnce(err(500)).mockRejectedValueOnce(err(500)).mockResolvedValue(page(1, [1], false))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe("server"))
		await act(() => result.current.refetch())
		await waitFor(() => expect(result.current.guests.map((g) => g.userId)).toEqual([1]))
		expect(result.current.error).toBeNull()
	})

	it("a failed later page keeps the loaded guests and can be retried", async () => {
		getEventGuestsPage.mockResolvedValueOnce(page(1, [2], true)).mockRejectedValueOnce(err(500)).mockRejectedValueOnce(err(500))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.phase).toBe("next-page"))
		expect(result.current.guests.map((g) => g.userId)).toEqual([2])
		expect(result.current.hasNextPage).toBe(true)
		getEventGuestsPage.mockResolvedValueOnce(page(2, [1], false))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.guests.map((g) => g.userId)).toEqual([2, 1]))
		expect(result.current.error).toBeNull()
	})

	it("a 403 on a later page keeps the loaded guests", async () => {
		getEventGuestsPage.mockResolvedValueOnce(page(1, [2], true)).mockRejectedValueOnce(err(403))
		const { result } = renderHook(() => useEventGuests(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.error).toBe("forbidden"))
		expect(result.current.phase).toBe("next-page")
		expect(result.current.guests.map((g) => g.userId)).toEqual([2])
	})

	it("caches under the account, session, event and page-size key only", async () => {
		getEventGuestsPage.mockResolvedValue(page(1, [1], false))
		const { result } = renderHook(() => useEventGuests(ID, 20), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(client.getQueryData(eventKeys.guests(7, 3, ID, 20))).toBeDefined()
		expect(client.getQueryData(eventKeys.guests(8, 3, ID, 20))).toBeUndefined()
		expect(client.getQueryData(eventKeys.guests(7, 2, ID, 20))).toBeUndefined()
		expect(client.getQueryData(eventKeys.guests(7, 3, "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22", 20))).toBeUndefined()
	})

	it("does not show another account's cached guests", async () => {
		client.setQueryData(eventKeys.guests(8, 3, ID, 20), { pages: [page(1, [99], false)], pageParams: [1] })
		getEventGuestsPage.mockResolvedValue(page(1, [1], false))
		const { result } = renderHook(() => useEventGuests(ID, 20), { wrapper })
		expect(result.current.guests).toEqual([])
		await waitFor(() => expect(result.current.guests.map((g) => g.userId)).toEqual([1]))
	})

	it("makes no request for an invalid id or without an account", () => {
		renderHook(() => useEventGuests("../../etc"), { wrapper })
		useAuthStore.setState({ user: null })
		renderHook(() => useEventGuests(ID), { wrapper })
		expect(getEventGuestsPage).not.toHaveBeenCalled()
	})
})
