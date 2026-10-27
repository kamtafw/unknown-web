import type { EventFullDetails } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveSessionStatus, LIVE_SESSION_NOT_ADMITTED } from "./event-live-session-status"

const useEventLiveSession = vi.fn()
vi.mock("@/hooks/events/use-event-live-session", () => ({
	useEventLiveSession: (...a: unknown[]) => useEventLiveSession(...a),
}))

const details: EventFullDetails = {
	kind: "full",
	id: "e1",
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	liveSessionId: 55,
	address: null,
	hashtags: [],
	coordinates: null,
	hosts: [],
	liveSessionStatus: "waiting",
	links: [],
	documents: [],
	rsvp: { state: "none" },
}

const ready = (status: string, participantCount: number | null = 0) => ({
	status: "ready",
	state: {
		eventId: "e1",
		session: { id: 55, title: "T", status, participantCount },
		socket: null,
	},
	refetch: vi.fn(),
})

beforeEach(() => useEventLiveSession.mockReset())

describe("EventLiveSessionStatus", () => {
	it("hands the details to the hook (so it can refuse a preview itself)", () => {
		useEventLiveSession.mockReturnValue({ status: "disabled", state: null, refetch: vi.fn() })
		render(<EventLiveSessionStatus details={details} />)
		expect(useEventLiveSession).toHaveBeenCalledWith(details)
	})

	it.each([
		["waiting", "Waiting to start"],
		["live", "Live"],
		["ended", "Ended"],
		["cancelled", "Cancelled"],
	])("shows a %s session as one status line", (status, label) => {
		useEventLiveSession.mockReturnValue(ready(status))
		render(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("status")).toHaveTextContent(`Live session: ${label}`)
	})

	it("shows the participant count only while the session is live", () => {
		useEventLiveSession.mockReturnValue(ready("live", 12))
		const { rerender } = render(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("status")).toHaveTextContent("12 participants")

		useEventLiveSession.mockReturnValue(ready("live", 1))
		rerender(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("status")).toHaveTextContent("1 participant")
		expect(screen.getByRole("status")).not.toHaveTextContent("1 participants")

		useEventLiveSession.mockReturnValue(ready("live", null))
		rerender(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("status")).not.toHaveTextContent(/participant/)

		useEventLiveSession.mockReturnValue(ready("waiting", 4))
		rerender(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("status")).not.toHaveTextContent(/participant/)
	})

	it("offers no controls: no start, end, join, leave or media action", () => {
		useEventLiveSession.mockReturnValue(ready("live", 3))
		render(<EventLiveSessionStatus details={details} />)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
	})

	it("shows a busy placeholder while loading", () => {
		useEventLiveSession.mockReturnValue({ status: "loading", state: null, refetch: vi.fn() })
		render(<EventLiveSessionStatus details={details} />)
		expect(screen.getByLabelText("Checking the live session")).toHaveAttribute("aria-busy", "true")
	})

	it("says a live event's session is for the host and currently-present guests when the viewer is not admitted (no login prompt)", () => {
		useEventLiveSession.mockReturnValue({ status: "not_admitted", state: null, refetch: vi.fn() })
		render(<EventLiveSessionStatus details={{ ...details, isLive: true }} />)
		expect(screen.getByRole("note")).toHaveTextContent(LIVE_SESSION_NOT_ADMITTED)
		// the documented rule: the host and guests who are currently in the event (guide §4.18)
		expect(screen.getByRole("note")).toHaveTextContent(
			"Live session details are available to the host and guests who are currently in the event.",
		)
		expect(screen.queryByText(/sign in|session has expired|Join this event/i)).not.toBeInTheDocument()
	})

	it.each(["disabled", "no_session", "unavailable"])(
		"renders nothing for %s",
		(status) => {
			useEventLiveSession.mockReturnValue({ status, state: null, refetch: vi.fn() })
			const { container } = render(<EventLiveSessionStatus details={details} />)
			expect(container).toBeEmptyDOMElement()
		},
	)

	it("renders nothing for a not-admitted viewer of an event that is not live", () => {
		useEventLiveSession.mockReturnValue({ status: "not_admitted", state: null, refetch: vi.fn() })
		const { container } = render(<EventLiveSessionStatus details={details} />)
		expect(container).toBeEmptyDOMElement()
	})

	it("a failed read says so and retries; it is never shown as an ended or missing session", () => {
		const refetch = vi.fn()
		useEventLiveSession.mockReturnValue({ status: "error", state: null, refetch })
		render(<EventLiveSessionStatus details={details} />)
		expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t load the live session status/i)
		expect(screen.queryByText(/ended|cancelled|waiting/i)).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: /try again/i }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})
})
