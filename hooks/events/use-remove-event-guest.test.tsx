import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { isGuestNotFound, useRemoveEventGuest } from "./use-remove-event-guest"

const removeEventGuest = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { removeEventGuest: (...a: unknown[]) => removeEventGuest(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const OTHER = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
const err = (status: number, message?: string) =>
	Object.assign(new Error("x"), { response: { status, data: message ? { message } : {} } })
const twoPages = (key: string) => ({
	pages: [
		{ page: 1, hasNext: true, [key]: [] },
		{ page: 2, hasNext: false, [key]: [] },
	],
	pageParams: [1, 2],
})

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
)
const seed = () => {
	const keys = {
		guests: eventKeys.guests(7, 3, ID, 20),
		comments: eventKeys.comments(7, 3, ID, 20),
		otherEvent: eventKeys.guests(7, 3, OTHER, 20),
		otherAccount: eventKeys.guests(8, 3, ID, 20),
		otherSession: eventKeys.comments(7, 2, ID, 20),
	}
	client.setQueryData(keys.guests, twoPages("guests"))
	client.setQueryData(keys.comments, twoPages("comments"))
	client.setQueryData(keys.otherEvent, twoPages("guests"))
	client.setQueryData(keys.otherAccount, twoPages("guests"))
	client.setQueryData(keys.otherSession, twoPages("comments"))
	return keys
}

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 3 })
})

describe("isGuestNotFound", () => {
	it("matches only a 404 whose message says the guest was not found", () => {
		expect(isGuestNotFound(err(404, "Guest not found in this event."))).toBe(true)
		expect(isGuestNotFound(err(404, "Event not found."))).toBe(false)
		expect(isGuestNotFound(err(404))).toBe(false)
		expect(isGuestNotFound(err(403, "Guest not found in this event."))).toBe(false)
		expect(isGuestNotFound(new Error("offline"))).toBe(false)
		expect(isGuestNotFound(null)).toBe(false)
	})
})

describe("useRemoveEventGuest", () => {
	it("sends the user id for this event and resolves 'removed'", async () => {
		removeEventGuest.mockResolvedValue(undefined)
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		let out: unknown
		await act(async () => {
			out = await result.current.remove(42)
		})
		expect(out).toBe("removed")
		expect(removeEventGuest).toHaveBeenCalledWith(ID, 42)
		expect(result.current.error).toBeNull()
	})

	it.each([0, -1, 1.5, NaN])("does not send the invalid user id %s", async (id) => {
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		let out: unknown = true
		await act(async () => {
			out = await result.current.remove(id)
		})
		expect(out).toBe(false)
		expect(removeEventGuest).not.toHaveBeenCalled()
	})

	it("on success refreshes this event's guests and comments only, keeping page 1", async () => {
		removeEventGuest.mockResolvedValue(undefined)
		const keys = seed()
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		await act(async () => {
			await result.current.remove(42)
		})
		for (const k of [keys.guests, keys.comments]) {
			expect(client.getQueryState(k)?.isInvalidated).toBe(true)
			expect((client.getQueryData(k) as { pages: unknown[] }).pages).toHaveLength(1)
		}
		for (const k of [keys.otherEvent, keys.otherAccount, keys.otherSession]) {
			expect(client.getQueryState(k)?.isInvalidated).toBe(false)
			expect((client.getQueryData(k) as { pages: unknown[] }).pages).toHaveLength(2)
		}
	})

	it("treats 'Guest not found' as already removed and refreshes the same lists", async () => {
		removeEventGuest.mockRejectedValue(err(404, "Guest not found in this event."))
		const keys = seed()
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		let out: unknown
		await act(async () => {
			out = await result.current.remove(42)
		})
		expect(out).toBe("already_removed")
		expect(result.current.error).toBeNull()
		expect(client.getQueryState(keys.guests)?.isInvalidated).toBe(true)
		expect(client.getQueryState(keys.comments)?.isInvalidated).toBe(true)
	})

	it.each([
		[404, "Event not found.", "not_found"],
		[404, undefined, "not_found"],
		[403, "Only event hosts can remove guests.", "forbidden"],
		[401, undefined, "unauthorized"],
		[400, "user id required", "validation"],
		[500, undefined, "server"],
	])(
		"a %i (%s) resolves false, reports %s and leaves the caches alone",
		async (status, message, kind) => {
			removeEventGuest.mockRejectedValue(err(status, message))
			const keys = seed()
			const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
			let out: unknown = true
			await act(async () => {
				out = await result.current.remove(42)
			})
			expect(out).toBe(false)
			await waitFor(() => expect(result.current.error).toBe(kind))
			expect(client.getQueryState(keys.guests)?.isInvalidated).toBe(false)
			expect(client.getQueryState(keys.comments)?.isInvalidated).toBe(false)
			expect((client.getQueryData(keys.guests) as { pages: unknown[] }).pages).toHaveLength(2)
		},
	)

	it("reports a network failure and can retry", async () => {
		removeEventGuest.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined)
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		await act(async () => {
			await result.current.remove(42)
		})
		await waitFor(() => expect(result.current.error).toBe("network"))
		let out: unknown
		await act(async () => {
			out = await result.current.remove(42)
		})
		expect(out).toBe("removed")
		await waitFor(() => expect(result.current.error).toBeNull())
	})

	it("ignores a second call while one is in flight", async () => {
		let release: () => void = () => {}
		removeEventGuest.mockImplementation(() => new Promise<void>((resolve) => (release = resolve)))
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		let first: Promise<unknown> = Promise.resolve(false)
		act(() => {
			first = result.current.remove(1)
		})
		expect(await result.current.remove(1)).toBe(false)
		await waitFor(() => expect(result.current.isPending).toBe(true))
		expect(removeEventGuest).toHaveBeenCalledTimes(1)
		release()
		expect(await first).toBe("removed")
	})
})
