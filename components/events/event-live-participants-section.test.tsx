import type { EventLiveSessionState, LiveParticipant } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveParticipantsSection } from "./event-live-participants-section"

const useEventLiveParticipants = vi.fn()
vi.mock("@/hooks/events/use-event-live-participants", () => ({
  useEventLiveParticipants: (...args: unknown[]) => useEventLiveParticipants(...args),
}))

const liveState: EventLiveSessionState = {
  eventId: "e1",
  session: {
    id: 55, title: "Live", status: "live", sessionType: "public", participantCount: 12,
    startedAt: null, endedAt: null, mediaProvider: "livekit", mediaStatus: "ready",
    currentUserRole: "host", isJoined: true,
  },
  socket: null,
}
const ada: LiveParticipant = {
  id: 1,
  user: { userId: 9, userUuid: "u9", name: "Ada Obi", username: "ada", photo: null },
  role: "co_host",
  isActive: true,
  isMuted: true,
  mediaConnected: false,
  microphonePublished: true,
  cameraPublished: false,
  joinedAt: "2026-10-30T09:00:00Z",
}

const baseQuery = (overrides: Record<string, unknown> = {}) => ({
  enabled: true,
  participants: [],
  hasLoaded: true,
  isInitialLoading: false,
  error: null,
  phase: null,
  hasNextPage: false,
  isFetchingNextPage: false,
  isRefreshing: false,
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  ...overrides,
})

beforeEach(() => useEventLiveParticipants.mockReset())

describe("EventLiveParticipantsSection", () => {
  it("renders participant identity, role, application presence and media state separately", () => {
    useEventLiveParticipants.mockReturnValue(baseQuery({ participants: [ada] }))
    render(<EventLiveParticipantsSection liveState={liveState} />)
    expect(screen.getByRole("heading", { name: "Participants" })).toBeInTheDocument()
    expect(screen.getByText("12 total")).toBeInTheDocument()
    expect(screen.getByText("Ada Obi")).toBeInTheDocument()
    expect(screen.getByText("co host")).toBeInTheDocument()
    expect(screen.getByText("App: Active")).toBeInTheDocument()
    expect(screen.getByText("Media: Not connected")).toBeInTheDocument()
    expect(screen.getByText("Microphone: Published · Muted")).toBeInTheDocument()
    expect(screen.getByText("Camera: Not published")).toBeInTheDocument()
    expect(useEventLiveParticipants).toHaveBeenCalledWith(liveState)
  })

  it("shows an empty state only after the first page successfully loads", () => {
    useEventLiveParticipants.mockReturnValue(baseQuery())
    render(<EventLiveParticipantsSection liveState={liveState} />)
    expect(screen.getByText("No participants to display yet.")).toBeInTheDocument()
  })

  it("shows a loading state and does not call it an empty roster", () => {
    useEventLiveParticipants.mockReturnValue(baseQuery({ hasLoaded: false, isInitialLoading: true }))
    render(<EventLiveParticipantsSection liveState={liveState} />)
    expect(screen.getByLabelText("Loading participants")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByText("No participants to display yet.")).not.toBeInTheDocument()
  })

  it("offers retry for an initial failure and keeps loaded rows on refresh failure", () => {
    const refetch = vi.fn()
    useEventLiveParticipants.mockReturnValue(baseQuery({ hasLoaded: false, error: "server", refetch }))
    const { rerender } = render(<EventLiveParticipantsSection liveState={liveState} />)
    expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t load the live participants/i)
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refetch).toHaveBeenCalledTimes(1)

    const refresh = vi.fn()
    useEventLiveParticipants.mockReturnValue(baseQuery({ participants: [ada], error: "server", refetch: refresh }))
    rerender(<EventLiveParticipantsSection liveState={liveState} />)
    expect(screen.getByText("Ada Obi")).toBeInTheDocument()
    expect(screen.getByRole("alert")).toHaveTextContent(/previously loaded participants are still shown/i)
    fireEvent.click(screen.getByRole("button", { name: /try again/i }))
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it("loads more only when the backend reports another page", () => {
    const fetchNextPage = vi.fn()
    useEventLiveParticipants.mockReturnValue(baseQuery({ participants: [ada], hasNextPage: true, fetchNextPage }))
    render(<EventLiveParticipantsSection liveState={liveState} />)
    fireEvent.click(screen.getByRole("button", { name: "Load more participants" }))
    expect(fetchNextPage).toHaveBeenCalledTimes(1)
  })

  it("does not render for a non-live session", () => {
    useEventLiveParticipants.mockReturnValue(baseQuery({ enabled: false }))
    const { container } = render(
      <EventLiveParticipantsSection liveState={{ ...liveState, session: { ...liveState.session, status: "waiting" } }} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
