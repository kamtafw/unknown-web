import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails } from "@/types/events/api"
import { EventLiveSessionRoom } from "./event-live-session-room"

const harness = vi.hoisted(() => ({
  liveState: null as unknown,
  post: vi.fn(),
  sendReaction: vi.fn(),
  comments: [] as Array<{ id: number; content: string; createdAt: string; user: { firstName: string; lastName: string; username: string } }>,
}))
vi.mock("@/hooks/events/use-event-live-session", () => ({
  useEventLiveSession: () => ({ status: "ready", state: harness.liveState }),
}))
vi.mock("@/components/events/events-socket-provider", () => ({
  useEventsSocket: () => ({ manager: null, status: "idle" }),
}))
vi.mock("@/hooks/events/use-live-session-comments", () => ({
  useLiveSessionComments: () => ({
    comments: harness.comments,
    isInitialLoading: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn(),
    error: null,
    refetch: vi.fn(),
  }),
  usePostLiveSessionComment: () => ({ post: harness.post, isPending: false, error: null }),
}))
vi.mock("@/hooks/events/use-live-session-reactions", () => ({
  useLiveSessionReactions: () => ({
    reactionCounts: { "❤️": 2 },
    sendReaction: harness.sendReaction,
    isSending: false,
    error: null,
  }),
}))

const details = { id: "event-1", kind: "full" } as EventFullDetails
const liveState = (isJoined: boolean, status: "live" | "waiting" = "live") => ({
  eventId: "event-1",
  session: { id: 12, status, isJoined },
  socket: null,
})
function renderRoom() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <EventLiveSessionRoom details={details} />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  harness.liveState = liveState(true)
  harness.post.mockReset().mockResolvedValue(true)
  harness.sendReaction.mockReset()
  harness.comments = [{
    id: 1, content: "Hello live", createdAt: "2026-10-31T10:00:00Z",
    user: { firstName: "Tiva", lastName: "User", username: "tiva" },
  }]
  useAuthStore.setState({ user: { pkid: 7 } as never, sessionGeneration: 1 })
})

describe("EventLiveSessionRoom", () => {
  it("does not render for a session that is not live", () => {
    harness.liveState = liveState(true, "waiting")
    renderRoom()
    expect(screen.queryByRole("region", { name: "Live discussion" })).not.toBeInTheDocument()
  })

  it("shows a join prompt without comment or reaction controls for a nonparticipant", () => {
    harness.liveState = liveState(false)
    renderRoom()
    expect(screen.getByText("Join this event to view live comments and reactions.")).toBeInTheDocument()
    expect(screen.queryByLabelText("Write a live comment")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /React with/ })).not.toBeInTheDocument()
  })

  it("lets an admitted participant post comments and send reactions", async () => {
    renderRoom()
    expect(screen.getByText("Hello live")).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText("Write a live comment"), { target: { value: "  Good session  " } })
    fireEvent.click(screen.getByRole("button", { name: "Send" }))
    await waitFor(() => expect(harness.post).toHaveBeenCalledWith("  Good session  "))
    fireEvent.click(screen.getByRole("button", { name: "React with ❤️; 2 total" }))
    expect(harness.sendReaction).toHaveBeenCalledWith("❤️")
  })
})
