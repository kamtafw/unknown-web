import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventCard, EventDetails } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventRsvp } from "./use-event-rsvp"

const setRsvp = vi.fn()
vi.mock("@/lib/events/api", () => ({ eventsApi: { setRsvp: (...a: unknown[]) => setRsvp(...a) } }))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const base = {
	id: ID,
	name: "A",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "",
	endTime: "",
	isLive: false,
	isLocked: true,
	privacy: "private" as const,
	coverImage: null,
	liveSessionId: null,
	address: null,
	hashtags: [],
}
const preview: EventDetails = { ...base, kind: "preview" }
type FullDetails = Extract<EventDetails, { kind: "full" }>
const full = (rsvp: FullDetails["rsvp"]): EventDetails => ({
	...base,
	kind: "full",
	coordinates: null,
	hosts: [],
	liveSessionStatus: null,
	links: [],
	documents: [],
	rsvp,
})
const card = (viewerRsvp: EventCard["viewerRsvp"]): EventCard => ({
	id: ID,
	name: "A",
	startDate: "",
	endDate: "",
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
	viewerRsvp,
	distanceKm: null,
})

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
)

beforeEach(() => {
	setRsvp.mockReset()
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 0 })
})

describe("useEventRsvp: what is known", () => {
	it("is unknown for a preview with nothing else to go on (not 'not responded')", () => {
		const { result } = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		expect(result.current.rsvp).toEqual({ state: "unknown" })
	})

	it("is unknown while details are still loading", () => {
		const { result } = renderHook(() => useEventRsvp(ID, null), { wrapper })
		expect(result.current.rsvp).toEqual({ state: "unknown" })
	})

	it("takes a full response as authoritative, including 'none'", () => {
		expect(
			renderHook(() => useEventRsvp(ID, full({ state: "none" })), { wrapper }).result.current.rsvp,
		).toEqual({ state: "none" })
		expect(
			renderHook(() => useEventRsvp(ID, full({ state: "set", status: "going" })), { wrapper })
				.result.current.rsvp,
		).toEqual({ state: "set", status: "going" })
	})

	it("seeds a preview from a list entry of the same account and session", () => {
		client.setQueryData(eventKeys.nearby(7, 0, { latitude: 1, longitude: 1 }, 25, 20), {
			pages: [{ events: [card("interested")], page: 1, hasNext: false }],
			pageParams: [1],
		})
		const { result } = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		expect(result.current.rsvp).toEqual({ state: "set", status: "interested" })
	})

	it("does not seed from another account's or session's list", () => {
		client.setQueryData(eventKeys.nearby(8, 0, { latitude: 1, longitude: 1 }, 25, 20), {
			pages: [{ events: [card("going")], page: 1, hasNext: false }],
			pageParams: [1],
		})
		client.setQueryData(eventKeys.myEvents(7, 4, "", 20), {
			pages: [{ events: [card("going")], page: 1, hasNext: false }],
			pageParams: [1],
		})
		const { result } = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		expect(result.current.rsvp).toEqual({ state: "unknown" })
	})

	it("does not read a list card without a status as 'none'", () => {
		client.setQueryData(eventKeys.nearby(7, 0, { latitude: 1, longitude: 1 }, 25, 20), {
			pages: [{ events: [card(null)], page: 1, hasNext: false }],
			pageParams: [1],
		})
		expect(renderHook(() => useEventRsvp(ID, preview), { wrapper }).result.current.rsvp).toEqual({
			state: "unknown",
		})
	})
})

describe("useEventRsvp: saving", () => {
	it("updates a preview from the mutation response", async () => {
		let finish!: (v: { eventId: string; status: "going" }) => void
		setRsvp.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve
			}),
		)
		const { result } = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		act(() => result.current.setRsvp("going"))
		await waitFor(() => expect(result.current.isPending).toBe(true))
		expect(result.current.pendingStatus).toBe("going")
		expect(result.current.rsvp).toEqual({ state: "unknown" }) // not shown as saved before the response
		await act(async () => finish({ eventId: ID, status: "going" }))
		await waitFor(() => expect(result.current.rsvp).toEqual({ state: "set", status: "going" }))
		expect(setRsvp).toHaveBeenCalledWith(ID, "going")
	})

	it("patches a full details entry in place", async () => {
		setRsvp.mockResolvedValue({ eventId: ID, status: "not_going" })
		const key = eventKeys.detail(7, 0, ID)
		client.setQueryData(key, full({ state: "none" }))
		const { result } = renderHook(() => useEventRsvp(ID, full({ state: "none" })), { wrapper })
		act(() => result.current.setRsvp("not_going"))
		await waitFor(() =>
			expect(client.getQueryData<EventDetails>(key)).toMatchObject({
				rsvp: { state: "set", status: "not_going" },
			}),
		)
	})

	it("surfaces a failure without changing what is known", async () => {
		setRsvp.mockRejectedValue(
			Object.assign(new Error("x"), {
				response: { status: 400, data: { message: "Event has ended." } },
			}),
		)
		const { result } = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		act(() => result.current.setRsvp("going"))
		await waitFor(() => expect(result.current.error?.message).toBe("Event has ended."))
		expect(result.current.rsvp).toEqual({ state: "unknown" })
	})

	it("keeps each account's answer apart", async () => {
		setRsvp.mockResolvedValue({ eventId: ID, status: "going" })
		const first = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		act(() => first.result.current.setRsvp("going"))
		await waitFor(() => expect(first.result.current.rsvp.state).toBe("set"))
		useAuthStore.setState({ user: { pkid: 99, id: "other" } as never })
		const second = renderHook(() => useEventRsvp(ID, preview), { wrapper })
		expect(second.result.current.rsvp).toEqual({ state: "unknown" })
	})
})
