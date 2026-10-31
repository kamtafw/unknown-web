import type { EventFullDetails } from "@/types/events/api"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventJoinControl } from "./event-join-control"

const join = vi.fn()
const leave = vi.fn()
const useEventLiveSession = vi.fn()
const useEventGuests = vi.fn()
vi.mock("@/hooks/events/use-join-event", () => ({
  useJoinEvent: () => ({ join, isPending: false, errorMessage: null, clearError: vi.fn() }),
}))
vi.mock("@/hooks/events/use-leave-event", () => ({
  useLeaveEvent: () => ({ leave, isPending: false, errorMessage: null, clearError: vi.fn() }),
}))
vi.mock("@/hooks/events/use-event-guests", () => ({
  useEventGuests: (...args: unknown[]) => useEventGuests(...args),
}))
vi.mock("@/hooks/events/use-event-live-session", () => ({
  useEventLiveSession: (...args: unknown[]) => useEventLiveSession(...args),
}))
vi.mock("./event-live-audio-listener", () => ({
  EventLiveAudioListener: ({ sessionId }: { sessionId: number }) => <div data-testid="audio" data-session={sessionId} />,
}))

const details: EventFullDetails = {
  kind: "full",
  id: "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11",
  name: "Live event",
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

describe("EventJoinControl leave flow", () => {
  beforeEach(() => {
    join.mockReset()
    leave.mockReset()
    useEventLiveSession.mockReset()
    useEventGuests.mockReset()
    useEventGuests.mockReturnValue({ hasLoaded: false, error: "forbidden" })
    useEventLiveSession.mockReturnValue({
      status: "ready",
      state: { session: { id: 55, isJoined: true } },
    })
  })

  it("restores the joined state and lets the viewer leave, unmounting audio only after success", async () => {
    leave.mockResolvedValue(true)
    const { queryByTestId } = render(<EventJoinControl details={details} />)
    expect(screen.getByTestId("audio")).toHaveAttribute("data-session", "55")

    fireEvent.click(screen.getByRole("button", { name: "Leave event" }))
    await waitFor(() => expect(queryByTestId("audio")).not.toBeInTheDocument())
    expect(leave).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: "Join event" })).toBeInTheDocument()
  })

  it("keeps the listener mounted when the backend leave fails", async () => {
    leave.mockResolvedValue(false)
    render(<EventJoinControl details={details} />)

    fireEvent.click(screen.getByRole("button", { name: "Leave event" }))
    await waitFor(() => expect(leave).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId("audio")).toBeInTheDocument()
  })


  it("offers leave to a persistent guest even when the live session is no longer active", () => {
    useEventLiveSession.mockReturnValue({ status: "ready", state: null })
    useEventGuests.mockReturnValue({ hasLoaded: true, error: null })
    render(<EventJoinControl details={{ ...details, isLive: false, liveSessionStatus: "ended" }} />)
    expect(screen.getByText("You're on the guest list for this event.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Leave event" })).toBeInTheDocument()
  })


  it("offers rejoin rather than a second leave while a live session is active but the guest is inactive", () => {
    useEventLiveSession.mockReturnValue({
      status: "ready",
      state: { session: { id: 55, isJoined: false } },
    })
    useEventGuests.mockReturnValue({ hasLoaded: true, error: null })
    render(<EventJoinControl details={details} />)
    expect(screen.getByRole("button", { name: "Join event" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Leave event" })).not.toBeInTheDocument()
  })

  it("offers join when the canonical session read says the viewer is not joined", () => {
    useEventLiveSession.mockReturnValue({
      status: "ready",
      state: { session: { id: 55, isJoined: false } },
    })
    render(<EventJoinControl details={details} />)
    expect(screen.getByRole("button", { name: "Join event" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Leave event" })).not.toBeInTheDocument()
  })
})
