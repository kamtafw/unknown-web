import type { EventFullDetails } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveSessionStatus, LIVE_SESSION_NOT_ADMITTED } from "./event-live-session-status"

const useEventLiveSession = vi.fn()
const useEventLiveParticipants = vi.fn()
vi.mock("@/hooks/events/use-event-live-session", () => ({
  useEventLiveSession: (...args: unknown[]) => useEventLiveSession(...args),
}))
vi.mock("@/hooks/events/use-event-live-participants", () => ({
  useEventLiveParticipants: (...args: unknown[]) => useEventLiveParticipants(...args),
}))

const details: EventFullDetails = {
  kind: "full", id: "e1", name: "Jazz night", startDate: "2026-11-01", endDate: "2026-11-01",
  startTime: "18:00", endTime: "20:00", isLive: false, isLocked: false, privacy: "public",
  coverImage: null, liveSessionId: 55, address: null, hashtags: [], coordinates: null, hosts: [],
  liveSessionStatus: "waiting", links: [], documents: [], rsvp: { state: "none" },
}

const ready = (status: string, participantCount: number | null = 0) => ({
  status: "ready",
  state: {
    eventId: "e1",
    session: {
      id: 55, title: "T", status, participantCount, sessionType: "public", startedAt: null,
      endedAt: null, mediaProvider: "livekit", mediaStatus: "ready", currentUserRole: "host", isJoined: true,
    },
    socket: null,
  },
  refetch: vi.fn(),
})

beforeEach(() => {
  useEventLiveSession.mockReset()
  useEventLiveParticipants.mockReset()
  useEventLiveParticipants.mockReturnValue({
    enabled: true, participants: [], hasLoaded: false, isInitialLoading: false, error: null, phase: null,
    hasNextPage: false, isFetchingNextPage: false, isRefreshing: false,
    fetchNextPage: vi.fn(), refetch: vi.fn(),
  })
})

describe("EventLiveSessionStatus", () => {
  it("hands the details to the hook", () => {
    useEventLiveSession.mockReturnValue({ status: "disabled", state: null, refetch: vi.fn() })
    render(<EventLiveSessionStatus details={details} />)
    expect(useEventLiveSession).toHaveBeenCalledWith(details)
  })

  it.each([
    ["waiting", "Waiting to start"],
    ["live", "Live"],
    ["ended", "Ended"],
    ["cancelled", "Cancelled"],
  ])("shows a %s session as a status line", (status, label) => {
    useEventLiveSession.mockReturnValue(ready(status))
    render(<EventLiveSessionStatus details={details} />)
    expect(screen.getByRole("status")).toHaveTextContent(`Live session: ${label}`)
  })

  it("shows the participant count only while live", () => {
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

  it("shows the participant roster only for a live session", () => {
    useEventLiveSession.mockReturnValue(ready("live", 3))
    render(<EventLiveSessionStatus details={details} />)
    expect(screen.getByRole("heading", { name: "Participants" })).toBeInTheDocument()
  })

  it("offers no lifecycle, admission or media controls", () => {
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

  it("says the live session is for the host and currently-present guests when not admitted", () => {
    useEventLiveSession.mockReturnValue({ status: "not_admitted", state: null, refetch: vi.fn() })
    render(<EventLiveSessionStatus details={{ ...details, isLive: true }} />)
    expect(screen.getByRole("note")).toHaveTextContent(LIVE_SESSION_NOT_ADMITTED)
    expect(screen.queryByText(/sign in|session has expired|Join this event/i)).not.toBeInTheDocument()
  })

  it.each(["disabled", "no_session", "unavailable"])("renders nothing for %s", (status) => {
    useEventLiveSession.mockReturnValue({ status, state: null, refetch: vi.fn() })
    const { container } = render(<EventLiveSessionStatus details={details} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders nothing for a not-admitted viewer of an event that is not live", () => {
    useEventLiveSession.mockReturnValue({ status: "not_admitted", state: null, refetch: vi.fn() })
    const { container } = render(<EventLiveSessionStatus details={details} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("a failed read says so and retries", () => {
    const refetch = vi.fn()
    useEventLiveSession.mockReturnValue({ status: "error", state: null, refetch })
    render(<EventLiveSessionStatus details={details} />)
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t load the live session status/i)
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)
  })
})
