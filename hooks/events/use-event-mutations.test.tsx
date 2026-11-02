import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails, EventSubmission } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useCreateEvent, useDeleteEvent, useUpdateEvent } from "./use-event-mutations"

const createEvent = vi.fn()
const updateEvent = vi.fn()
const deleteEvent = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		createEvent: (...a: unknown[]) => createEvent(...a),
		updateEvent: (...a: unknown[]) => updateEvent(...a),
		deleteEvent: (...a: unknown[]) => deleteEvent(...a),
	},
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const created: EventDetails = {
	kind: "full",
	id: ID,
	name: "A",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "",
	endTime: "",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	liveSessionId: null,
	address: null,
	hashtags: [],
	coordinates: null,
	hosts: [],
	liveSessionStatus: null,
	links: [],
	documents: [],
	rsvp: { state: "none" },
}
const submission: EventSubmission = { kind: "json", body: { name: "A", passcode: "0042" } }

let client: QueryClient
const wrapper = ({ children }: { children: ReactNode }) => (
	<QueryClientProvider client={client}>{children}</QueryClientProvider>
)
const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 2 })
})

describe("useCreateEvent", () => {
	it("seeds the details cache for the new event and refreshes both lists", async () => {
		createEvent.mockResolvedValue(created)
		const spy = vi.spyOn(client, "invalidateQueries")
		const { result } = renderHook(() => useCreateEvent(), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		expect(client.getQueryData(eventKeys.detail(7, 2, ID))).toEqual(created)
		const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey)
		expect(keys).toContainEqual(eventKeys.nearbyRoot())
		expect(keys).toContainEqual(eventKeys.myEventsRoot())
	})

	it("forwards the submission and progress callback", async () => {
		createEvent.mockResolvedValue(created)
		const onProgress = vi.fn()
		const { result } = renderHook(() => useCreateEvent(), { wrapper })
		await act(() => result.current.mutateAsync({ submission, onProgress }))
		expect(createEvent).toHaveBeenCalledWith(submission, { onProgress })
	})

	it("does not keep the passcode-bearing variables after it finishes", async () => {
		createEvent.mockResolvedValue(created)
		const { result } = renderHook(() => useCreateEvent(), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		await waitFor(() => expect(client.getMutationCache().getAll()).toHaveLength(0))
	})

	it("leaves lists and cache alone when it fails", async () => {
		createEvent.mockRejectedValue(err(400))
		const spy = vi.spyOn(client, "invalidateQueries")
		const { result } = renderHook(() => useCreateEvent(), { wrapper })
		await act(async () => {
			await result.current.mutateAsync({ submission }).catch(() => {})
		})
		expect(spy).not.toHaveBeenCalled()
	})
})

describe("useUpdateEvent", () => {
	it("replaces the cached details with the response and refreshes the lists", async () => {
		updateEvent.mockResolvedValue({ ...created, name: "B" })
		client.setQueryData(eventKeys.detail(7, 2, ID), created)
		const spy = vi.spyOn(client, "invalidateQueries")
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		expect(client.getQueryData<EventDetails>(eventKeys.detail(7, 2, ID))?.name).toBe("B")
		expect(updateEvent).toHaveBeenCalledWith(ID, submission, { onProgress: undefined })
		// two lists, plus this event's resources (P3-04)
		expect(spy).toHaveBeenCalledTimes(3)
	})

	it("asks the server again when the response body was unreadable", async () => {
		updateEvent.mockResolvedValue(null)
		const spy = vi.spyOn(client, "invalidateQueries")
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		const keys = spy.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey)
		expect(keys).toContainEqual(eventKeys.detail(7, 2, ID))
	})
})

describe("resources cache consistency (P3-04)", () => {
	const OTHER = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
	const seed = () => {
		const keys = {
			mine: eventKeys.resources(7, 2, ID),
			otherEvent: eventKeys.resources(7, 2, OTHER),
			otherAccount: eventKeys.resources(8, 2, ID),
			otherSession: eventKeys.resources(7, 1, ID),
		}
		for (const k of Object.values(keys)) client.setQueryData(k, { links: [], documents: [] })
		return keys
	}

	it("a successful edit marks only this event's resources for this account and session stale", async () => {
		updateEvent.mockResolvedValue(created)
		const keys = seed()
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }))
		expect(client.getQueryState(keys.mine)?.isInvalidated).toBe(true)
		expect(client.getQueryState(keys.otherEvent)?.isInvalidated).toBe(false)
		expect(client.getQueryState(keys.otherAccount)?.isInvalidated).toBe(false)
		expect(client.getQueryState(keys.otherSession)?.isInvalidated).toBe(false)
	})

	it("a failed edit leaves the resources alone", async () => {
		updateEvent.mockRejectedValue(err(400))
		const keys = seed()
		const { result } = renderHook(() => useUpdateEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync({ submission }).catch(() => undefined))
		expect(client.getQueryState(keys.mine)?.isInvalidated).toBe(false)
	})

	it("deleting drops only this event's resources for this account and session", async () => {
		deleteEvent.mockResolvedValue(undefined)
		const keys = seed()
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync())
		expect(client.getQueryData(keys.mine)).toBeUndefined()
		expect(client.getQueryData(keys.otherEvent)).toBeDefined()
		expect(client.getQueryData(keys.otherAccount)).toBeDefined()
		expect(client.getQueryData(keys.otherSession)).toBeDefined()
	})

	it("a 404 on delete also drops them; a refused delete keeps them", async () => {
		const keys = seed()
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		deleteEvent.mockRejectedValue(err(409))
		await act(() => result.current.mutateAsync().catch(() => undefined))
		expect(client.getQueryData(keys.mine)).toBeDefined()
		deleteEvent.mockRejectedValue(err(404))
		await act(() => result.current.mutateAsync().catch(() => undefined))
		expect(client.getQueryData(keys.mine)).toBeUndefined()
	})
})

describe("useDeleteEvent", () => {
	it("forgets the event's details and RSVP and refreshes the lists", async () => {
		deleteEvent.mockResolvedValue(undefined)
		client.setQueryData(eventKeys.detail(7, 2, ID), created)
		client.setQueryData(eventKeys.rsvp(7, 2, ID), "going")
		const spy = vi.spyOn(client, "invalidateQueries")
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		await act(() => result.current.mutateAsync())
		expect(client.getQueryData(eventKeys.detail(7, 2, ID))).toBeUndefined()
		expect(client.getQueryData(eventKeys.rsvp(7, 2, ID))).toBeUndefined()
		expect(spy).toHaveBeenCalledTimes(2)
	})

	it("also cleans up when the event is already gone (404)", async () => {
		deleteEvent.mockRejectedValue(err(404))
		client.setQueryData(eventKeys.detail(7, 2, ID), created)
		const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
		await act(async () => {
			await result.current.mutateAsync().catch(() => {})
		})
		expect(client.getQueryData(eventKeys.detail(7, 2, ID))).toBeUndefined()
	})

	it("keeps the event when the delete is refused (live, or not a host)", async () => {
		client.setQueryData(eventKeys.detail(7, 2, ID), created)
		for (const status of [409, 403]) {
			deleteEvent.mockRejectedValueOnce(err(status))
			const { result } = renderHook(() => useDeleteEvent(ID), { wrapper })
			await act(async () => {
				await result.current.mutateAsync().catch(() => {})
			})
		}
		expect(client.getQueryData(eventKeys.detail(7, 2, ID))).toEqual(created)
	})
})
