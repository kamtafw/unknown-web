import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventComments } from "./use-event-comments"
import { usePostEventComment } from "./use-post-event-comment"

const postEventComment = vi.fn()
const getEventCommentsPage = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		postEventComment: (...a: unknown[]) => postEventComment(...a),
		getEventCommentsPage: (...a: unknown[]) => getEventCommentsPage(...a),
	},
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const OTHER = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })
const comment = (id: string) => ({ id, message: `m-${id}`, createdAt: null, author: null })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("usePostEventComment", () => {
	it("sends the trimmed message for this event and resolves true", async () => {
		postEventComment.mockResolvedValue(undefined)
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		let ok = false
		await act(async () => {
			ok = await result.current.post("  hello  ")
		})
		expect(ok).toBe(true)
		expect(postEventComment).toHaveBeenCalledWith(ID, "hello")
		expect(result.current.error).toBeNull()
	})

	it("does not send a blank or whitespace-only message", async () => {
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		let ok = true
		await act(async () => {
			ok = (await result.current.post("   \n ")) || (await result.current.post(""))
		})
		expect(ok).toBe(false)
		expect(postEventComment).not.toHaveBeenCalled()
	})

	it.each([
		[400, "validation"],
		[401, "unauthorized"],
		[403, "forbidden"],
		[404, "not_found"],
		[413, "too_large"],
		[500, "server"],
	])("a %i resolves false (never a false success), reports %s and does not touch the thread", async (status, kind) => {
		const key = eventKeys.comments(7, 3, ID, 20)
		client.setQueryData(key, { pages: [{ page: 1, hasNext: true, comments: [] }, { page: 2, hasNext: false, comments: [] }], pageParams: [1, 2] })
		postEventComment.mockRejectedValue(err(status))
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		let ok = true
		await act(async () => {
			ok = await result.current.post("hi")
		})
		expect(ok).toBe(false)
		await waitFor(() => expect(result.current.error).toBe(kind))
		expect(client.getQueryState(key)?.isInvalidated).toBe(false)
		expect((client.getQueryData(key) as { pages: unknown[] }).pages).toHaveLength(2)
	})

	it("a network failure is reported as network", async () => {
		postEventComment.mockRejectedValue(new Error("offline"))
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		await act(async () => {
			await result.current.post("hi")
		})
		await waitFor(() => expect(result.current.error).toBe("network"))
	})

	it("ignores a second call while one is in flight", async () => {
		let release: () => void = () => {}
		postEventComment.mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					release = resolve
				}),
		)
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		let first: Promise<boolean> = Promise.resolve(false)
		act(() => {
			first = result.current.post("one")
		})
		// same render tick: the hook's own guard, not the button's disabled state
		expect(await result.current.post("two")).toBe(false)
		await waitFor(() => expect(result.current.isPending).toBe(true))
		expect(postEventComment).toHaveBeenCalledTimes(1)
		release()
		expect(await first).toBe(true)
		await waitFor(() => expect(result.current.isPending).toBe(false))
		// once it has finished, a new post goes through
		let third: Promise<boolean> = Promise.resolve(false)
		act(() => {
			third = result.current.post("three")
		})
		await waitFor(() => expect(postEventComment).toHaveBeenCalledTimes(2))
		release()
		expect(await third).toBe(true)
	})

	it("after a success, page 1 of this event's thread is refetched through the read path and shows the new comment", async () => {
		getEventCommentsPage.mockImplementation(async ({ page }: { page: number }) =>
			page === 1
				? { page: 1, hasNext: true, comments: [comment("c2"), comment("c1")] }
				: { page: 2, hasNext: false, comments: [comment("c0")] },
		)
		const both = renderHook(() => ({ read: useEventComments(ID, 20), write: usePostEventComment(ID) }), { wrapper })
		await waitFor(() => expect(both.result.current.read.hasNextPage).toBe(true))
		await act(() => both.result.current.read.fetchNextPage())
		await waitFor(() => expect(both.result.current.read.comments.map((c) => c.id)).toEqual(["c2", "c1", "c0"]))
		getEventCommentsPage.mockClear()

		// the server now has a newer comment; the post response itself carries none
		getEventCommentsPage.mockImplementation(async ({ page }: { page: number }) =>
			page === 1
				? { page: 1, hasNext: true, comments: [comment("c3"), comment("c2")] }
				: { page: 2, hasNext: false, comments: [comment("c1"), comment("c0")] },
		)
		postEventComment.mockResolvedValue(undefined)
		await act(async () => {
			await both.result.current.write.post("new one")
		})
		await waitFor(() => expect(both.result.current.read.comments.map((c) => c.id)).toEqual(["c3", "c2"]))
		// only page 1 was requested again, and the older page was dropped (re-loaded on demand)
		expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
		expect(getEventCommentsPage.mock.calls[0][0]).toEqual({ eventId: ID, page: 1, limit: 20 })
		expect(both.result.current.read.hasNextPage).toBe(true)
	})

	it("does not refetch another event's, account's or session's thread", async () => {
		getEventCommentsPage.mockResolvedValue({ page: 1, hasNext: false, comments: [comment("a")] })
		const other = renderHook(() => useEventComments(OTHER, 20), { wrapper })
		await waitFor(() => expect(other.result.current.hasLoaded).toBe(true))
		client.setQueryData(eventKeys.comments(8, 3, ID, 20), { pages: [{ page: 1, hasNext: false, comments: [] }], pageParams: [1] })
		client.setQueryData(eventKeys.comments(7, 2, ID, 20), { pages: [{ page: 1, hasNext: false, comments: [] }], pageParams: [1] })
		getEventCommentsPage.mockClear()
		postEventComment.mockResolvedValue(undefined)
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		await act(async () => {
			await result.current.post("hi")
		})
		expect(getEventCommentsPage).not.toHaveBeenCalled()
		expect(client.getQueryState(eventKeys.comments(7, 3, OTHER, 20))?.isInvalidated).toBe(false)
		expect(client.getQueryState(eventKeys.comments(8, 3, ID, 20))?.isInvalidated).toBe(false)
		expect(client.getQueryState(eventKeys.comments(7, 2, ID, 20))?.isInvalidated).toBe(false)
	})

	it("does not treat the response as a comment: nothing is inserted into the cache", async () => {
		const key = eventKeys.comments(7, 3, ID, 20)
		const before = { pages: [{ page: 1, hasNext: false, comments: [comment("a")] }], pageParams: [1] }
		client.setQueryData(key, before)
		postEventComment.mockResolvedValue({ message: "hi", id: "fake" })
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		await act(async () => {
			await result.current.post("hi")
		})
		const data = client.getQueryData<typeof before>(key)
		expect(data?.pages[0].comments.map((c) => c.id)).toEqual(["a"])
	})
})
