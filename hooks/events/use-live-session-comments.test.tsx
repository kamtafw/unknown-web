import { liveSessionKeys } from "@/lib/events/live-query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { LiveSessionComment, LiveSessionCommentsPage } from "@/types/events/live"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
	flattenLiveSessionCommentPages,
	useLiveSessionComments,
	usePostLiveSessionComment,
} from "./use-live-session-comments"

const getCommentsPage = vi.fn()
const postComment = vi.fn()
vi.mock("@/lib/events/live-api", () => ({
	LIVE_SESSION_COMMENTS_PAGE_SIZE: 50,
	liveSessionApi: {
		getCommentsPage: (...args: unknown[]) => getCommentsPage(...args),
		postComment: (...args: unknown[]) => postComment(...args),
	},
}))

const SESSION = 12
const comment = (id: number, content = `comment-${id}`): LiveSessionComment => ({
	id,
	content,
	createdAt: "2026-10-31T09:00:00Z",
	user: {
		id: `user-${id}`,
		pkid: id,
		firstName: "Test",
		lastName: "User",
		username: `user${id}`,
		photo: null,
	},
})
const page = (n: number, ids: number[], hasNext: boolean): LiveSessionCommentsPage => ({
	page: n,
	hasNext,
	comments: ids.map((id) => comment(id)),
})
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("flattenLiveSessionCommentPages", () => {
	it("preserves backend page order and keeps the first occurrence of each id", () => {
		expect(
			flattenLiveSessionCommentPages([page(1, [8, 7], true), page(2, [7, 6], false)]).map((item) => item.id),
		).toEqual([8, 7, 6])
	})
	it("does not sort by timestamp", () => {
		const older = { ...comment(1), createdAt: "2026-01-01T00:00:00Z" }
		const newer = { ...comment(2), createdAt: "2026-06-01T00:00:00Z" }
		expect(flattenLiveSessionCommentPages([{ page: 1, hasNext: false, comments: [older, newer] }]))
			.toEqual([older, newer])
	})
	it("handles missing pages", () => {
		expect(flattenLiveSessionCommentPages(undefined)).toEqual([])
	})
})

describe("useLiveSessionComments", () => {
	it("loads the first page with the mobile default page size", async () => {
		getCommentsPage.mockResolvedValue(page(1, [3, 2], false))
		const { result } = renderHook(() => useLiveSessionComments(SESSION), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(getCommentsPage).toHaveBeenCalledWith(
			{ sessionId: SESSION, page: 1, limit: 50 },
			expect.anything(),
		)
		expect(result.current.comments.map((item) => item.id)).toEqual([3, 2])
		expect(result.current.hasNextPage).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it("uses the backend next signal, not page length, to fetch another page", async () => {
		getCommentsPage.mockResolvedValueOnce(page(1, [3], true)).mockResolvedValueOnce(page(2, [2], false))
		const { result } = renderHook(() => useLiveSessionComments(SESSION, 20), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((item) => item.id)).toEqual([3, 2]))
		expect(getCommentsPage.mock.calls[1][0]).toEqual({ sessionId: SESSION, page: 2, limit: 20 })
		expect(result.current.hasNextPage).toBe(false)
	})

	it("allows an empty page to have a next page when the backend says so", async () => {
		getCommentsPage.mockResolvedValueOnce(page(1, [], true)).mockResolvedValueOnce(page(2, [1], false))
		const { result } = renderHook(() => useLiveSessionComments(SESSION), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(result.current.comments).toEqual([])
		expect(result.current.hasNextPage).toBe(true)
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((item) => item.id)).toEqual([1]))
	})

	it("deduplicates repeated comment ids across pages without reordering", async () => {
		getCommentsPage.mockResolvedValueOnce(page(1, [3, 2], true)).mockResolvedValueOnce(page(2, [2, 1], false))
		const { result } = renderHook(() => useLiveSessionComments(SESSION), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.comments.map((item) => item.id)).toEqual([3, 2, 1]))
	})

	it("keeps loaded comments when a later page fails", async () => {
		getCommentsPage.mockResolvedValueOnce(page(1, [3], true)).mockRejectedValueOnce(err(403))
		const { result } = renderHook(() => useLiveSessionComments(SESSION), { wrapper })
		await waitFor(() => expect(result.current.hasNextPage).toBe(true))
		await act(() => result.current.fetchNextPage())
		await waitFor(() => expect(result.current.phase).toBe("next-page"))
		expect(result.current.comments.map((item) => item.id)).toEqual([3])
		expect(result.current.error).toBe("forbidden")
	})

	it("does not request for an invalid session id or missing account", () => {
		renderHook(() => useLiveSessionComments(0), { wrapper })
		useAuthStore.setState({ user: null })
		renderHook(() => useLiveSessionComments(SESSION), { wrapper })
		expect(getCommentsPage).not.toHaveBeenCalled()
	})

	it("scopes cache entries by account, login generation, session and page size", async () => {
		getCommentsPage.mockResolvedValue(page(1, [1], false))
		const { result } = renderHook(() => useLiveSessionComments(SESSION, 20), { wrapper })
		await waitFor(() => expect(result.current.hasLoaded).toBe(true))
		expect(client.getQueryData(liveSessionKeys.comments(7, 3, SESSION, 20))).toBeDefined()
		expect(client.getQueryData(liveSessionKeys.comments(8, 3, SESSION, 20))).toBeUndefined()
		expect(client.getQueryData(liveSessionKeys.comments(7, 2, SESSION, 20))).toBeUndefined()
		expect(client.getQueryData(liveSessionKeys.comments(7, 3, SESSION, 50))).toBeUndefined()
	})
})

describe("usePostLiveSessionComment", () => {
	it("trims the content, posts it and inserts the canonical response into the last loaded page", async () => {
		const key = liveSessionKeys.comments(7, 3, SESSION, 50)
		client.setQueryData(key, {
			pages: [page(1, [3, 2], true), page(2, [1], false)],
			pageParams: [1, 2],
		})
		postComment.mockResolvedValue(comment(4, "new comment"))
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		let success = false
		await act(async () => { success = await result.current.post("  new comment  ") })
		expect(success).toBe(true)
		expect(postComment).toHaveBeenCalledWith(SESSION, { content: "new comment" })
		const data = client.getQueryData<{ pages: LiveSessionCommentsPage[] }>(key)
		expect(data?.pages[0].comments.map((item) => item.id)).toEqual([3, 2])
		expect(data?.pages[1].comments.map((item) => item.id)).toEqual([1, 4])
		expect(result.current.error).toBeNull()
	})

	it("does not duplicate a comment already present in any loaded page", async () => {
		const key = liveSessionKeys.comments(7, 3, SESSION, 50)
		const existing = comment(4)
		client.setQueryData(key, { pages: [page(1, [4], false)], pageParams: [1] })
		postComment.mockResolvedValue(existing)
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		await act(async () => { expect(await result.current.post("hello")).toBe(true) })
		expect(client.getQueryData<{ pages: LiveSessionCommentsPage[] }>(key)?.pages[0].comments)
			.toHaveLength(1)
	})

	it("does not fabricate a cache entry when the comments query has not loaded", async () => {
		postComment.mockResolvedValue(comment(4))
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		await act(async () => { expect(await result.current.post("hello")).toBe(true) })
		expect(client.getQueryData(liveSessionKeys.comments(7, 3, SESSION, 50))).toBeUndefined()
	})

	it("rejects blank input and invalid session ids without a request", async () => {
		const { result } = renderHook(() => usePostLiveSessionComment(0), { wrapper })
		await act(async () => {
			expect(await result.current.post("  \n ")).toBe(false)
			expect(await result.current.post("hello")).toBe(false)
		})
		expect(postComment).not.toHaveBeenCalled()
	})

	it("does not allow concurrent submissions from the same hook instance", async () => {
		let release: (value: LiveSessionComment) => void = () => {}
		postComment.mockImplementation(() => new Promise<LiveSessionComment>((resolve) => { release = resolve }))
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		let first: Promise<boolean> = Promise.resolve(false)
		act(() => { first = result.current.post("first") })
		expect(await result.current.post("second")).toBe(false)
		await waitFor(() => expect(result.current.isPending).toBe(true))
		expect(postComment).toHaveBeenCalledTimes(1)
		release(comment(1))
		expect(await first).toBe(true)
	})

	it("does not write a pending response into a different account after an account switch", async () => {
		const originalKey = liveSessionKeys.comments(7, 3, SESSION, 50)
		const otherKey = liveSessionKeys.comments(99, 3, SESSION, 50)
		client.setQueryData(originalKey, { pages: [page(1, [1], false)], pageParams: [1] })
		client.setQueryData(otherKey, { pages: [page(1, [9], false)], pageParams: [1] })
		let release: (value: LiveSessionComment) => void = () => {}
		postComment.mockImplementation(() => new Promise<LiveSessionComment>((resolve) => { release = resolve }))
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		let first: Promise<boolean> = Promise.resolve(false)
		act(() => { first = result.current.post("hello") })
		useAuthStore.setState({ user: { pkid: 99, id: "other" } as never })
		await waitFor(() => expect(useAuthStore.getState().user?.pkid).toBe(99))
		await act(async () => { release(comment(2)); expect(await first).toBe(true) })
		expect(client.getQueryData<{ pages: LiveSessionCommentsPage[] }>(originalKey)?.pages[0].comments.map((item) => item.id))
			.toEqual([1, 2])
		expect(client.getQueryData<{ pages: LiveSessionCommentsPage[] }>(otherKey)?.pages[0].comments.map((item) => item.id))
			.toEqual([9])
	})

	it("reports a rejected create and leaves the cached thread unchanged", async () => {
		const key = liveSessionKeys.comments(7, 3, SESSION, 50)
		client.setQueryData(key, { pages: [page(1, [1], false)], pageParams: [1] })
		postComment.mockRejectedValue(err(403))
		const { result } = renderHook(() => usePostLiveSessionComment(SESSION), { wrapper })
		await act(async () => { expect(await result.current.post("hello")).toBe(false) })
		await waitFor(() => expect(result.current.error).toBe("forbidden"))
		expect(client.getQueryData<{ pages: LiveSessionCommentsPage[] }>(key)?.pages[0].comments.map((item) => item.id))
			.toEqual([1])
	})
})
