import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventComment, EventCommentsPage } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { flattenCommentPages, useEventComments } from "./use-event-comments"

const getEventCommentsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventCommentsPage: (...a: unknown[]) => getEventCommentsPage(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const comment = (id: string, message = `m-${id}`): EventComment => ({ id, message, createdAt: null, author: null })
const page = (n: number, ids: string[], hasNext: boolean): EventCommentsPage => ({
	page: n,
	comments: ids.map((id) => comment(id)),
	hasNext,
})
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

beforeEach(() => {
	getEventCommentsPage.mockReset()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("flattenCommentPages", () => {
	it("keeps the backend order, appends pages and drops repeated ids (first wins)", () => {
		const pages = [page(1, ["c", "b"], true), page(2, ["b", "a"], false)]
		expect(flattenCommentPages(pages).map((c) => c.id)).toEqual(["c", "b", "a"])
	})
	it("does not sort by time", () => {
		const older = { ...comment("x"), createdAt: "2026-01-01T00:00:00Z" }
		const newer = { ...comment("y"), createdAt: "2026-06-01T00:00:00Z" }
		expect(flattenCommentPages([{ page: 1, hasNext: false, comments: [older, newer] }]).map((c) => c.id)).toEqual(["x", "y"])
	})
	it("handles no pages", () => {
		expect(flattenCommentPages(undefined)).toEqual([])
	})
})

describe("useEventComments", () => {
	it("loads page 1 for this event with the page size", async () => {
		getEventCommentsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID, 20), { wrapper })
		expect(result.current.isInitialLoading).toBe(true)
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
		expect(getEventCommentsPage.mock.calls[0][0]).toEqual({ eventId: ID, page: 1, limit: 20 })
		expect(result.current.comments.map((c) => c.id)).toEqual(["a"])
		expect(result.current.hasNextPage).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it("fetches the next page only when `next` says so, appends and de-duplicates", async () => {
		getEventCommentsPage.mockResolvedValueOnce(page(1, ["c", "b"], true)).mockResolvedValueOnce(page(2, ["b", "a"], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["c", "b", "a"]))
		expect(getEventCommentsPage.mock.calls[1][0]).toMatchObject({ eventId: ID, page: 2 })
		expect(result.current.hasNextPage).toBe(false)
	})

	it("a terminal page offers no further page", async () => {
		getEventCommentsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.hasNextPage).toBe(false)
	})

	it("an empty page with a next link still allows loading more", async () => {
		getEventCommentsPage.mockResolvedValueOnce(page(1, [], true)).mockResolvedValueOnce(page(2, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.comments).toEqual([])
		expect(result.current.hasNextPage).toBe(true)
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["a"]))
	})

	it("a fully empty, terminal result is loaded and empty", async () => {
		getEventCommentsPage.mockResolvedValue(page(1, [], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.comments).toEqual([])
		expect(result.current.hasNextPage).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it.each([
		[401, "unauthorized"],
		[403, "forbidden"],
		[404, "not_found"],
		[500, "server"],
	])("an initial %i is %s, never an empty thread, and a refusal is not retried", async (status, kind) => {
		getEventCommentsPage.mockRejectedValue(err(status))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe(kind))
		expect(result.current.phase).toBe("initial")
		expect(result.current.hasLoaded).toBe(false)
		expect(result.current.comments).toEqual([])
		expect(result.current.isInitialLoading).toBe(false)
		if (status < 500) expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
	})

	it("a network failure is reported as network", async () => {
		getEventCommentsPage.mockRejectedValue(new Error("offline"))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe("network"))
	})

	it("an initial failure can be retried with refetch", async () => {
		getEventCommentsPage.mockRejectedValueOnce(err(500)).mockRejectedValueOnce(err(500)).mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.error).toBe("server"))
		await act(() => result.current.refetch())
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["a"]))
		expect(result.current.error).toBeNull()
	})

	it("a failed later page keeps the loaded comments and can be retried", async () => {
		getEventCommentsPage.mockResolvedValueOnce(page(1, ["b"], true)).mockRejectedValueOnce(err(500)).mockRejectedValueOnce(err(500))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.phase).toBe("next-page"))
		expect(result.current.comments.map((c) => c.id)).toEqual(["b"])
		expect(result.current.hasLoaded).toBe(true)
		expect(result.current.hasNextPage).toBe(true)
		getEventCommentsPage.mockResolvedValueOnce(page(2, ["a"], false))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["b", "a"]))
		expect(result.current.error).toBeNull()
	})

	it("a 404 on a later page keeps the loaded comments", async () => {
		getEventCommentsPage.mockResolvedValueOnce(page(1, ["b"], true)).mockRejectedValueOnce(err(404))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.error).toBe("not_found"))
		expect(result.current.phase).toBe("next-page")
		expect(result.current.comments.map((c) => c.id)).toEqual(["b"])
	})

	it("manual refresh refetches, and a failed refresh keeps the loaded comments", async () => {
		getEventCommentsPage.mockResolvedValueOnce(page(1, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))

		getEventCommentsPage.mockResolvedValueOnce(page(1, ["n", "a"], false))
		await act(() => result.current.refetch())
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["n", "a"]))
		expect(getEventCommentsPage).toHaveBeenCalledTimes(2)

		getEventCommentsPage.mockRejectedValueOnce(err(500)).mockRejectedValueOnce(err(500))
		await act(() => result.current.refetch())
		await waitFor(() => expect(result.current.phase).toBe("refresh"))
		expect(result.current.comments.map((c) => c.id)).toEqual(["n", "a"])
	})

	it("caches under the account, session, event and page-size key only", async () => {
		getEventCommentsPage.mockResolvedValue(page(1, ["a"], false))
		const { result } = renderHook(() => useEventComments(ID, 20), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(client.getQueryData(eventKeys.comments(7, 3, ID, 20))).toBeDefined()
		expect(client.getQueryData(eventKeys.comments(8, 3, ID, 20))).toBeUndefined()
		expect(client.getQueryData(eventKeys.comments(7, 2, ID, 20))).toBeUndefined()
		expect(client.getQueryData(eventKeys.comments(7, 3, "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22", 20))).toBeUndefined()
	})

	it("does not show another account's cached comments", async () => {
		client.setQueryData(eventKeys.comments(8, 3, ID, 20), { pages: [page(1, ["secret"], false)], pageParams: [1] })
		getEventCommentsPage.mockResolvedValue(page(1, ["mine"], false))
		const { result } = renderHook(() => useEventComments(ID, 20), { wrapper })
		expect(result.current.comments).toEqual([])
		await waitFor(() => expect(result.current.comments.map((c) => c.id)).toEqual(["mine"]))
	})

	it("makes no request for an invalid id or without an account", () => {
		renderHook(() => useEventComments("../../etc"), { wrapper })
		useAuthStore.setState({ user: null })
		renderHook(() => useEventComments(ID), { wrapper })
		expect(getEventCommentsPage).not.toHaveBeenCalled()
	})
})
