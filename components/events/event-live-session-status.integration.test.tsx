// P4-01: the real hook and the real component, with only the HTTP client mocked.
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveSessionStatus } from "./event-live-session-status"

const getEventLiveSession = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: { getEventLiveSession: (...a: unknown[]) => getEventLiveSession(...a) },
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const details: EventFullDetails = {
	kind: "full",
	id: ID,
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: true,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	liveSessionId: 55,
	address: null,
	hashtags: [],
	coordinates: null,
	hosts: [],
	liveSessionStatus: "live",
	links: [],
	documents: [],
	rsvp: { state: "none" },
}
const err = (status: number, message: string) =>
	Object.assign(new Error("x"), { response: { status, data: { message } } })

function mount(d: EventFullDetails = details) {
	const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	return render(
		<QueryClientProvider client={client}>
			<EventLiveSessionStatus details={d} />
		</QueryClientProvider>,
	)
}

beforeEach(() => {
	getEventLiveSession.mockReset()
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 0 })
})

describe("EventLiveSessionStatus with the real hook", () => {
	it("loads, then shows the session's status and count", async () => {
		getEventLiveSession.mockResolvedValue({
			eventId: ID,
			session: { id: 55, status: "live", participantCount: 2 },
			socket: null,
		})
		mount()
		expect(screen.getByLabelText("Checking the live session")).toBeInTheDocument()
		expect(await screen.findByRole("status")).toHaveTextContent("Live session: Live · 2 participants")
	})

	it("a 403 on a live event reads as an access note, not an error or a login prompt", async () => {
		getEventLiveSession.mockRejectedValue(
			err(403, "Join this event before accessing its live session."),
		)
		mount()
		expect(await screen.findByRole("note")).toHaveTextContent(
			/host and guests who are currently in the event/i,
		)
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		expect(screen.queryByText(/Join this event/)).not.toBeInTheDocument()
	})

	it("'no live session' shows nothing, and so does an unavailable event", async () => {
		for (const message of ["This event does not have a live session.", "Event not found."]) {
			getEventLiveSession.mockRejectedValue(err(404, message))
			const { container, unmount } = mount()
			await waitFor(() => expect(getEventLiveSession).toHaveBeenCalled())
			await waitFor(() => expect(screen.queryByLabelText("Checking the live session")).toBeNull())
			expect(container).toBeEmptyDOMElement()
			unmount()
			getEventLiveSession.mockClear()
		}
	})

	it("makes no request when nothing is attached and the event is not live", () => {
		const { container } = mount({ ...details, liveSessionId: null, isLive: false })
		expect(container).toBeEmptyDOMElement()
		expect(getEventLiveSession).not.toHaveBeenCalled()
	})
})
