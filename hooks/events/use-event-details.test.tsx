import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useEventDetails } from "./use-event-details"

const getEventDetails = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventDetails: (...a: unknown[]) => getEventDetails(...a) },
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
	liveSessionId: null,
	address: null,
	hashtags: [],
}
const full = (hostId: string): EventDetails => ({
	...base,
	kind: "full",
	coordinates: null,
	hosts: [{ id: hostId, name: "H", username: "h", photo: null }],
	liveSessionStatus: null,
	links: [],
	documents: [],
	rsvp: { state: "none" },
})
const preview: EventDetails = { ...base, kind: "preview" }

const err = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })

function wrapper() {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	return function EventDetailsWrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={client}>{children}</QueryClientProvider>
	}
}

beforeEach(() => {
	getEventDetails.mockReset()
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 0 })
})

describe("useEventDetails", () => {
	it("makes no request when nothing is selected", () => {
		const { result } = renderHook(() => useEventDetails(null), { wrapper: wrapper() })
		expect(result.current.status).toBe("none")
		expect(getEventDetails).not.toHaveBeenCalled()
	})

	it("makes no request for an id that is not a UUID", () => {
		const { result } = renderHook(() => useEventDetails("../../etc"), { wrapper: wrapper() })
		expect(result.current.status).toBe("invalid")
		expect(getEventDetails).not.toHaveBeenCalled()
	})

	it("loads a full event and recognises the viewer as a host by UUID", async () => {
		getEventDetails.mockResolvedValue(full("me"))
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		expect(result.current.status).toBe("loading")
		await waitFor(() => expect(result.current.status).toBe("ready"))
		expect(result.current.details?.kind).toBe("full")
		expect(result.current.isHost).toBe(true)
	})

	it("does not treat another host as the viewer", async () => {
		getEventDetails.mockResolvedValue(full("someone-else"))
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.status).toBe("ready"))
		expect(result.current.isHost).toBe(false)
	})

	it("never reports a preview viewer as a host", async () => {
		getEventDetails.mockResolvedValue(preview)
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.status).toBe("ready"))
		expect(result.current.details?.kind).toBe("preview")
		expect(result.current.isHost).toBe(false)
	})

	it("reports a 404 as unavailable without retrying", async () => {
		getEventDetails.mockRejectedValue(err(404))
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		await waitFor(() => expect(result.current.status).toBe("unavailable"))
		expect(getEventDetails).toHaveBeenCalledTimes(1)
	})

	it("reports other failures as an error after one retry", async () => {
		getEventDetails.mockRejectedValue(err(500))
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		// the hook retries a transient failure once, with the default 1 s backoff
		await waitFor(() => expect(result.current.status).toBe("error"), { timeout: 4000 })
		expect(getEventDetails).toHaveBeenCalledTimes(2)
	}, 8000)

	it("does not request without a signed-in account", () => {
		useAuthStore.setState({ user: null })
		const { result } = renderHook(() => useEventDetails(ID), { wrapper: wrapper() })
		expect(getEventDetails).not.toHaveBeenCalled()
		expect(result.current.status).toBe("loading")
	})
})
