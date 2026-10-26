import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails, EventFullDetails, EventLiveSessionState } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { classifyLiveSessionError, useEventLiveSession } from "./use-event-live-session"

const getEventLiveSession = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventLiveSession: (...a: unknown[]) => getEventLiveSession(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const base = {
	id: ID,
	name: "A",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: false,
	privacy: "public" as const,
	coverImage: null,
	liveSessionId: 55 as number | null,
	address: null,
	hashtags: [],
}
const full = (over: Partial<EventFullDetails> = {}): EventFullDetails => ({
	...base,
	kind: "full",
	coordinates: null,
	hosts: [],
	liveSessionStatus: "waiting",
	links: [],
	documents: [],
	rsvp: { state: "none" },
	...over,
})
const preview: EventDetails = { ...base, kind: "preview" }

const sessionState = (status: "waiting" | "live" = "waiting"): EventLiveSessionState => ({
	eventId: ID,
	session: {
		id: 55,
		title: "T",
		status,
		sessionType: "private",
		participantCount: 0,
		startedAt: null,
		endedAt: null,
		mediaProvider: "p2p",
		mediaStatus: "legacy",
		currentUserRole: null,
		isJoined: false,
	},
	socket: null,
})

const err = (status: number, message = "x") =>
	Object.assign(new Error("x"), { response: { status, data: { message } } })

function setup(initial: EventDetails | null) {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	)
	return { client, ...renderHook(({ d }) => useEventLiveSession(d), { wrapper, initialProps: { d: initial } }) }
}

beforeEach(() => {
	getEventLiveSession.mockReset()
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 0 })
})

describe("useEventLiveSession: when it asks", () => {
	it("makes no request without details", () => {
		const { result } = setup(null)
		expect(result.current.status).toBe("disabled")
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})

	it("makes no request for a restricted preview, even with a valid id and a session id shown", () => {
		const { result } = setup({ ...preview, isLive: true })
		expect(result.current.status).toBe("disabled")
		expect(result.current.state).toBeNull()
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})

	it("makes no request for an event with no session attached that is not live", () => {
		const { result } = setup(full({ liveSessionId: null, isLive: false }))
		expect(result.current.status).toBe("disabled")
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})

	it("makes no request for an id that is not a UUID", () => {
		const { result } = setup(full({ id: "../../etc" }))
		expect(result.current.status).toBe("disabled")
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})

	it("makes no request while the account is unknown", () => {
		useAuthStore.setState({ user: null as never })
		const { result } = setup(full())
		expect(result.current.status).toBe("disabled")
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})

	it("asks for a full event with a session attached, and for a live one with none", async () => {
		getEventLiveSession.mockResolvedValue(sessionState())
		const a = setup(full())
		await waitFor(() => expect(a.result.current.status).toBe("ready"))
		expect(getEventLiveSession.mock.calls[0][0]).toBe(ID)

		getEventLiveSession.mockClear()
		getEventLiveSession.mockRejectedValue(err(404, "This event does not have a live session."))
		const b = setup(full({ liveSessionId: null, isLive: true }))
		await waitFor(() => expect(b.result.current.status).toBe("no_session"))
		expect(getEventLiveSession).toHaveBeenCalledTimes(1)
	})
})

describe("useEventLiveSession: what it reports", () => {
	it("loads, then is ready with the session state", async () => {
		getEventLiveSession.mockResolvedValue(sessionState("live"))
		const { result } = setup(full())
		expect(result.current.status).toBe("loading")
		await waitFor(() => expect(result.current.status).toBe("ready"))
		expect(result.current.state?.session.status).toBe("live")
	})

	it("403 is not_admitted (an access state), whatever the backend's text", async () => {
		getEventLiveSession.mockRejectedValue(err(403, "Join this event before accessing its live session."))
		const { result } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("not_admitted"))
		expect(result.current.state).toBeNull()
		expect(getEventLiveSession).toHaveBeenCalledTimes(1) // no retry on a refusal
	})

	it("tells the two 404s apart: no live session versus the event being unavailable", async () => {
		getEventLiveSession.mockRejectedValue(err(404, "This event does not have a live session."))
		const a = setup(full())
		await waitFor(() => expect(a.result.current.status).toBe("no_session"))

		getEventLiveSession.mockRejectedValue(err(404, "Event not found."))
		const b = setup(full())
		await waitFor(() => expect(b.result.current.status).toBe("unavailable"))
		expect(getEventLiveSession).toHaveBeenCalledTimes(2) // neither 404 is retried
	})

	it.each([
		["a server error", () => err(500)],
		["a network failure", () => new Error("offline")],
		["an unreadable body", () => Object.assign(new Error("x"), { name: "EventPayloadError" })],
	])("%s is an error (after one retry), never empty or ended", async (_name, failure) => {
		getEventLiveSession.mockRejectedValue(failure())
		const { result } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("error"), { timeout: 4000 })
		expect(result.current.state).toBeNull()
		expect(getEventLiveSession).toHaveBeenCalledTimes(2)
	})

	it("does not retry a 401 (the shared auth flow handles it)", async () => {
		getEventLiveSession.mockRejectedValue(err(401))
		const { result } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("error"))
		expect(getEventLiveSession).toHaveBeenCalledTimes(1)
	})
})

describe("useEventLiveSession: scoping", () => {
	it("serves nothing once the viewer drops from full details to a preview (cached data is not shown)", async () => {
		getEventLiveSession.mockResolvedValue(sessionState("live"))
		const { result, rerender } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("ready"))
		rerender({ d: preview })
		expect(result.current.status).toBe("disabled")
		expect(result.current.state).toBeNull()
		expect(getEventLiveSession).toHaveBeenCalledTimes(1)
	})

	it("does not serve one login session's or account's entry to another", async () => {
		getEventLiveSession.mockResolvedValue(sessionState("live"))
		const { result, client } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("ready"))

		act(() => useAuthStore.setState({ sessionGeneration: 1 }))
		expect(result.current.status).toBe("loading")
		await waitFor(() => expect(result.current.status).toBe("ready"))

		act(() => useAuthStore.setState({ user: { pkid: 8, id: "other" } as never }))
		expect(result.current.status).toBe("loading")
		await waitFor(() => expect(result.current.status).toBe("ready"))

		expect(getEventLiveSession).toHaveBeenCalledTimes(3)
		const keys = client.getQueryCache().getAll().map((q) => q.queryKey)
		expect(keys).toContainEqual(["events", "live-session", 7, 0, ID])
		expect(keys).toContainEqual(["events", "live-session", 7, 1, ID])
		expect(keys).toContainEqual(["events", "live-session", 8, 1, ID])
	})

	it("passes an abort signal to the request", async () => {
		getEventLiveSession.mockResolvedValue(sessionState())
		const { result } = setup(full())
		await waitFor(() => expect(result.current.status).toBe("ready"))
		expect(getEventLiveSession.mock.calls[0][1]).toBeInstanceOf(AbortSignal)
	})
})

describe("classifyLiveSessionError", () => {
	const res = (status: number, message?: unknown) => ({ response: { status, data: { message } } })

	it("classifies by status and, for 404 only, by message", () => {
		expect(classifyLiveSessionError(res(403, "anything"))).toBe("not_admitted")
		expect(classifyLiveSessionError(res(404, "This event does not have a live session."))).toBe("no_session")
		expect(classifyLiveSessionError(res(404, "this event DOES NOT HAVE A LIVE SESSION"))).toBe("no_session")
		expect(classifyLiveSessionError(res(404, "Event not found."))).toBe("unavailable")
		expect(classifyLiveSessionError(res(404))).toBe("unavailable")
		expect(classifyLiveSessionError(res(404, 5))).toBe("unavailable")
		expect(classifyLiveSessionError({ response: { status: 404 } })).toBe("unavailable")
		expect(classifyLiveSessionError(res(500))).toBe("error")
		expect(classifyLiveSessionError(res(401))).toBe("error")
		expect(classifyLiveSessionError(null)).toBe("error")
		expect(classifyLiveSessionError(new Error("offline"))).toBe("error")
	})
})
