import type { EventFullDetails } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveSessionControls } from "./event-live-session-controls"

const create = vi.fn()
const end = vi.fn()
const start = vi.fn()
const clearError = vi.fn()
const useEventLiveSessionControls = vi.fn()
const useEventLiveSession = vi.fn()

vi.mock("@/hooks/events/use-event-live-session-controls", () => ({
	useEventLiveSessionControls: (...args: unknown[]) => useEventLiveSessionControls(...args),
}))
vi.mock("@/hooks/events/use-event-live-session", () => ({
	useEventLiveSession: (...args: unknown[]) => useEventLiveSession(...args),
}))
vi.mock("@/lib/toast", () => ({ toast: { success: vi.fn() } }))

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

beforeEach(() => {
	create.mockReset()
	end.mockReset()
	start.mockReset()
	clearError.mockReset()
	useEventLiveSessionControls.mockReset().mockReturnValue({
		create,
		start,
		end,
		isPending: false,
		errorMessage: null,
		clearError,
	})
	useEventLiveSession.mockReset().mockReturnValue({
		status: "disabled",
		state: null,
		refetch: vi.fn(),
	})
})

describe("EventLiveSessionControls", () => {
	it("lets the event host create a waiting session when none is attached", async () => {
		create.mockResolvedValue(true)
		render(<EventLiveSessionControls details={details} isHost />)

		fireEvent.click(screen.getByRole("button", { name: "Create live session" }))
		expect(create).toHaveBeenCalledOnce()
	})

	it("offers browser start and microphone publishing to the host for a waiting session", () => {
		useEventLiveSession.mockReturnValue({
			status: "ready",
			state: {
				eventId: "e1",
				session: { id: 71, title: "Test", status: "waiting", participantCount: 1 },
				socket: null,
			},
			refetch: vi.fn(),
		})
		render(<EventLiveSessionControls details={{ ...details, liveSessionId: 71 }} isHost />)

		expect(screen.getByRole("button", { name: "Start session and go live" })).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "End live session" })).toBeInTheDocument()
	})

	it("does not render controls for a non-host", () => {
		const { container } = render(<EventLiveSessionControls details={details} isHost={false} />)
		expect(container).toBeEmptyDOMElement()
	})
})
