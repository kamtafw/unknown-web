// P3-08A: real guest, comment and removal hooks over a mocked `eventsApi`. Proves the lists are
// re-read through the normal read path after a removal, so the removed guest's comments are not
// left stale.
import type { EventGuest } from "@/types/events/api"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventComments } from "./use-event-comments"
import { useEventGuests } from "./use-event-guests"
import { useRemoveEventGuest } from "./use-remove-event-guest"

const getEventGuestsPage = vi.fn()
const getEventCommentsPage = vi.fn()
const removeEventGuest = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		getEventGuestsPage: (...a: unknown[]) => getEventGuestsPage(...a),
		getEventCommentsPage: (...a: unknown[]) => getEventCommentsPage(...a),
		removeEventGuest: (...a: unknown[]) => removeEventGuest(...a),
	},
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const guest = (userId: number): EventGuest => ({ userId, name: `G${userId}`, username: `g${userId}`, photo: null, role: "guest" })
const comment = (id: string) => ({ id, message: `m-${id}`, createdAt: null, author: null })

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("removing a guest refreshes guests and comments", () => {
	it("drops the guest and their comments after a refetch of page 1", async () => {
		getEventGuestsPage.mockResolvedValue({ page: 1, hasNext: false, guests: [guest(2), guest(1)] })
		getEventCommentsPage.mockResolvedValue({ page: 1, hasNext: false, comments: [comment("b"), comment("a")] })
		const all = renderHook(
			() => ({ guests: useEventGuests(ID, 20), comments: useEventComments(ID, 20), write: useRemoveEventGuest(ID) }),
			{ wrapper },
		)
		await waitFor(() => expect(all.result.current.guests.guests).toHaveLength(2))
		await waitFor(() => expect(all.result.current.comments.comments).toHaveLength(2))

		removeEventGuest.mockResolvedValue(undefined)
		getEventGuestsPage.mockResolvedValue({ page: 1, hasNext: false, guests: [guest(1)] })
		getEventCommentsPage.mockResolvedValue({ page: 1, hasNext: false, comments: [comment("a")] })
		await act(async () => {
			await all.result.current.write.remove(2)
		})
		await waitFor(() => expect(all.result.current.guests.guests.map((g) => g.userId)).toEqual([1]))
		await waitFor(() => expect(all.result.current.comments.comments.map((c) => c.id)).toEqual(["a"]))
	})

	it("a failed removal leaves both lists as they were", async () => {
		getEventGuestsPage.mockResolvedValue({ page: 1, hasNext: false, guests: [guest(2)] })
		getEventCommentsPage.mockResolvedValue({ page: 1, hasNext: false, comments: [comment("a")] })
		const all = renderHook(
			() => ({ guests: useEventGuests(ID, 20), comments: useEventComments(ID, 20), write: useRemoveEventGuest(ID) }),
			{ wrapper },
		)
		await waitFor(() => expect(all.result.current.guests.guests).toHaveLength(1))
		await waitFor(() => expect(all.result.current.comments.comments).toHaveLength(1))
		getEventGuestsPage.mockClear()
		getEventCommentsPage.mockClear()
		removeEventGuest.mockRejectedValue(Object.assign(new Error("x"), { response: { status: 403, data: {} } }))
		await act(async () => {
			await all.result.current.write.remove(2)
		})
		expect(getEventGuestsPage).not.toHaveBeenCalled()
		expect(getEventCommentsPage).not.toHaveBeenCalled()
		expect(all.result.current.guests.guests).toHaveLength(1)
	})
})
