// P3-10: the handoff's cache invalidation matrix (section 6), exercised across the real mutation
// hooks over a mocked `eventsApi`. One cache is seeded with every kind of entry for this account,
// session and event, and for a different event, account and login session. Each write must touch
// exactly the entries the matrix names and nothing else; a failed write must touch nothing.
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails, EventSubmission } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useDeleteEvent, useUpdateEvent } from "./use-event-mutations"
import { usePostEventComment } from "./use-post-event-comment"
import { useRemoveEventGuest } from "./use-remove-event-guest"
import { useEventRsvp } from "./use-event-rsvp"

const updateEvent = vi.fn()
const deleteEvent = vi.fn()
const postEventComment = vi.fn()
const removeEventGuest = vi.fn()
const setRsvp = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		updateEvent: (...a: unknown[]) => updateEvent(...a),
		deleteEvent: (...a: unknown[]) => deleteEvent(...a),
		postEventComment: (...a: unknown[]) => postEventComment(...a),
		removeEventGuest: (...a: unknown[]) => removeEventGuest(...a),
		setRsvp: (...a: unknown[]) => setRsvp(...a),
		getEventCommentsPage: vi.fn().mockResolvedValue({ page: 1, hasNext: false, comments: [] }),
		getEventGuestsPage: vi.fn().mockResolvedValue({ page: 1, hasNext: false, guests: [] }),
	},
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const OTHER = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
const details = (id: string): EventDetails => ({
	kind: "full", id, name: "A", startDate: "2026-11-01", endDate: "2026-11-01", startTime: "", endTime: "",
	isLive: false, isLocked: false, privacy: "public", coverImage: null, liveSessionId: null, address: null, hashtags: [],
	coordinates: null, hosts: [], liveSessionStatus: null, links: [], documents: [], rsvp: { state: "none" },
})
const submission: EventSubmission = { kind: "json", body: { name: "A" } }
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })
const twoPages = (k: string) => ({
	pages: [{ page: 1, hasNext: true, [k]: [] }, { page: 2, hasNext: false, [k]: [] }],
	pageParams: [1, 2],
})

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>

/** every entry the matrix talks about, for this event (mine) and for entries that must never be touched */
function seed() {
	const k = {
		detail: eventKeys.detail(7, 2, ID),
		rsvp: eventKeys.rsvp(7, 2, ID),
		resources: eventKeys.resources(7, 2, ID),
		comments: eventKeys.comments(7, 2, ID, 20),
		guests: eventKeys.guests(7, 2, ID, 20),
		nearby: eventKeys.nearby(7, 2, { latitude: 9.9, longitude: 8.9 }, 25, 10),
		myEvents: eventKeys.myEvents(7, 2, "", 10),
		// never touched
		otherEventResources: eventKeys.resources(7, 2, OTHER),
		otherEventComments: eventKeys.comments(7, 2, OTHER, 20),
		otherEventGuests: eventKeys.guests(7, 2, OTHER, 20),
		otherEventDetail: eventKeys.detail(7, 2, OTHER),
		otherAccountResources: eventKeys.resources(8, 2, ID),
		otherAccountComments: eventKeys.comments(8, 2, ID, 20),
		otherAccountGuests: eventKeys.guests(8, 2, ID, 20),
		otherSessionResources: eventKeys.resources(7, 1, ID),
		otherSessionComments: eventKeys.comments(7, 1, ID, 20),
		otherSessionGuests: eventKeys.guests(7, 1, ID, 20),
	}
	client.setQueryData(k.detail, details(ID))
	client.setQueryData(k.rsvp, "going")
	client.setQueryData(k.resources, { links: [], documents: [] })
	client.setQueryData(k.comments, twoPages("comments"))
	client.setQueryData(k.guests, twoPages("guests"))
	client.setQueryData(k.nearby, { pages: [], pageParams: [] })
	client.setQueryData(k.myEvents, { pages: [], pageParams: [] })
	client.setQueryData(k.otherEventResources, { links: [], documents: [] })
	client.setQueryData(k.otherEventComments, twoPages("comments"))
	client.setQueryData(k.otherEventGuests, twoPages("guests"))
	client.setQueryData(k.otherEventDetail, details(OTHER))
	client.setQueryData(k.otherAccountResources, { links: [], documents: [] })
	client.setQueryData(k.otherAccountComments, twoPages("comments"))
	client.setQueryData(k.otherAccountGuests, twoPages("guests"))
	client.setQueryData(k.otherSessionResources, { links: [], documents: [] })
	client.setQueryData(k.otherSessionComments, twoPages("comments"))
	client.setQueryData(k.otherSessionGuests, twoPages("guests"))
	return k
}
type Keys = ReturnType<typeof seed>
const untouched = (k: Keys) =>
	[
		k.otherEventResources, k.otherEventComments, k.otherEventGuests, k.otherEventDetail,
		k.otherAccountResources, k.otherAccountComments, k.otherAccountGuests,
		k.otherSessionResources, k.otherSessionComments, k.otherSessionGuests,
	] as const
const stale = (key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated === true
const present = (key: readonly unknown[]) => client.getQueryData(key) !== undefined
const pagesIn = (key: readonly unknown[]) => (client.getQueryData(key) as { pages: unknown[] }).pages.length

function expectOthersUntouched(k: Keys) {
	for (const key of untouched(k)) {
		expect(present(key)).toBe(true)
		expect(stale(key)).toBe(false)
	}
	for (const key of [k.otherEventComments, k.otherEventGuests, k.otherAccountComments, k.otherAccountGuests, k.otherSessionComments, k.otherSessionGuests]) {
		expect(pagesIn(key)).toBe(2)
	}
}
function expectAllUntouched(k: Keys) {
	for (const key of Object.values(k)) {
		expect(present(key)).toBe(true)
		expect(stale(key)).toBe(false)
	}
	expect(pagesIn(k.comments)).toBe(2)
	expect(pagesIn(k.guests)).toBe(2)
}

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false, retryDelay: 0 } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 2 })
})

describe("cache invalidation matrix (handoff section 6)", () => {
	it("update event: details replaced, resources and both lists stale; comments and guests untouched", async () => {
		updateEvent.mockResolvedValue(details(ID))
		const k = seed()
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		expect(stale(k.resources)).toBe(true)
		expect(stale(k.nearby)).toBe(true)
		expect(stale(k.myEvents)).toBe(true)
		expect(stale(k.comments)).toBe(false)
		expect(stale(k.guests)).toBe(false)
		expect(pagesIn(k.comments)).toBe(2)
		expect(pagesIn(k.guests)).toBe(2)
		expect(stale(k.rsvp)).toBe(false)
		expectOthersUntouched(k)
	})

	it("a failed update touches nothing", async () => {
		updateEvent.mockRejectedValue(err(400))
		const k = seed()
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }).catch(() => undefined))
		expectAllUntouched(k)
	})

	it.each([
		["succeeds", () => deleteEvent.mockResolvedValue(undefined)],
		["is a 404 (already gone)", () => deleteEvent.mockRejectedValue(err(404))],
	])("delete event that %s: details, RSVP, resources, comments and guests are removed; lists refresh", async (_n, arrange) => {
		arrange()
		const k = seed()
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync().catch(() => undefined))
		for (const key of [k.detail, k.rsvp, k.resources, k.comments, k.guests]) expect(present(key)).toBe(false)
		expect(stale(k.nearby)).toBe(true)
		expect(stale(k.myEvents)).toBe(true)
		expectOthersUntouched(k)
	})

	it.each([[409], [403], [500]])("a refused delete (%i) keeps everything", async (status) => {
		deleteEvent.mockRejectedValue(err(status))
		const k = seed()
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync().catch(() => undefined))
		expectAllUntouched(k)
	})

	it("post comment: only this event's comments refresh from page 1; guests, resources, details and lists untouched", async () => {
		postEventComment.mockResolvedValue(undefined)
		const k = seed()
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		await act(async () => {
			await result.current.post("hello")
		})
		expect(stale(k.comments)).toBe(true)
		expect(pagesIn(k.comments)).toBe(1)
		for (const key of [k.guests, k.resources, k.detail, k.rsvp, k.nearby, k.myEvents]) expect(stale(key)).toBe(false)
		expect(pagesIn(k.guests)).toBe(2)
		expectOthersUntouched(k)
	})

	it("a rejected comment touches nothing", async () => {
		postEventComment.mockRejectedValue(err(404))
		const k = seed()
		const { result } = renderHook(() => usePostEventComment(ID), { wrapper })
		await act(async () => {
			await result.current.post("hello")
		})
		expectAllUntouched(k)
	})

	it.each([
		["removed", () => removeEventGuest.mockResolvedValue(undefined)],
		["already removed (Guest not found)", () => removeEventGuest.mockRejectedValue(
			Object.assign(new Error("x"), { response: { status: 404, data: { message: "Guest not found in this event." } } }),
		)],
	])("remove guest (%s): guests and comments refresh from page 1; details, resources, RSVP and lists untouched", async (_n, arrange) => {
		arrange()
		const k = seed()
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		await act(async () => {
			await result.current.remove(42)
		})
		for (const key of [k.guests, k.comments]) {
			expect(stale(key)).toBe(true)
			expect(pagesIn(key)).toBe(1)
		}
		for (const key of [k.detail, k.resources, k.rsvp, k.nearby, k.myEvents]) expect(stale(key)).toBe(false)
		expectOthersUntouched(k)
	})

	it.each([[403], [401], [500]])("a failed guest removal (%i) touches nothing", async (status) => {
		removeEventGuest.mockRejectedValue(err(status))
		const k = seed()
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		await act(async () => {
			await result.current.remove(42)
		})
		expectAllUntouched(k)
	})

	it("an event-level Not found removal (404 other than Guest not found) is an error and touches nothing", async () => {
		removeEventGuest.mockRejectedValue(err(404))
		const k = seed()
		const { result } = renderHook(() => useRemoveEventGuest(ID), { wrapper })
		await act(async () => {
			await result.current.remove(42)
		})
		expectAllUntouched(k)
	})

	it("RSVP updates details and its own entry only; it never touches a sub-resource or a list", async () => {
		setRsvp.mockResolvedValue({ status: "interested" })
		const k = seed()
		const { result } = renderHook(() => useEventRsvp(ID, details(ID)), { wrapper })
		await act(async () => {
			result.current.setRsvp("interested")
		})
		await vi.waitFor(() => expect(client.getQueryData(k.rsvp)).toBe("interested"))
		for (const key of [k.resources, k.comments, k.guests, k.nearby, k.myEvents]) expect(stale(key)).toBe(false)
		expect(pagesIn(k.comments)).toBe(2)
		expect(pagesIn(k.guests)).toBe(2)
		expectOthersUntouched(k)
	})
})
