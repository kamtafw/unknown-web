import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { EventLiveSessionState, LiveSocketDescriptor } from "@/types/events/api"
import { useEventLiveRoom } from "./use-event-live-room"

const harness = vi.hoisted(() => ({
  context: { manager: null as null | Record<string, ReturnType<typeof vi.fn>>, status: "idle" as string },
  revalidator: vi.fn(),
}))
vi.mock("@/components/events/events-socket-provider", () => ({
  useEventsSocket: () => harness.context,
}))
vi.mock("@/lib/events/socket-room", () => ({
  createEventRoomRevalidator: (...args: unknown[]) => harness.revalidator(...args),
}))

const descriptor: LiveSocketDescriptor = { namespace: "/live", joinEvent: "live:join", sessionId: 55 }
const state = (overrides: Partial<EventLiveSessionState["session"]> = {}): EventLiveSessionState => ({
  eventId: "e1",
  session: {
    id: 55, title: "Live", status: "live", sessionType: "public", participantCount: 2,
    startedAt: null, endedAt: null, mediaProvider: "livekit", mediaStatus: "ready",
    currentUserRole: "listener", isJoined: true, ...overrides,
  },
  socket: descriptor,
})

let manager: Record<string, ReturnType<typeof vi.fn>>
beforeEach(() => {
  manager = {
    joinRoom: vi.fn().mockResolvedValue(undefined),
    getRoomStatus: vi.fn().mockReturnValue("joined"),
    leaveRoom: vi.fn(),
  }
  harness.context = { manager, status: "connected" }
  harness.revalidator.mockReset().mockReturnValue("revalidator")
})
afterEach(() => { harness.context = { manager: null, status: "idle" } })

describe("useEventLiveRoom", () => {
  it("joins only after HTTP confirms active participation and a valid descriptor", () => {
    const { unmount } = renderHook(() => useEventLiveRoom(state()))
    expect(manager.joinRoom).toHaveBeenCalledWith(descriptor, "revalidator")
    expect(harness.revalidator).toHaveBeenCalledWith("e1", 55)
    unmount()
    expect(manager.leaveRoom).toHaveBeenCalledWith(55)
  })

  it("does not join for nonparticipants, non-live sessions, or missing descriptors", () => {
    const { rerender, unmount } = renderHook(
      ({ liveState }: { liveState: EventLiveSessionState }) => useEventLiveRoom(liveState),
      { initialProps: { liveState: state({ isJoined: false }) } },
    )
    expect(manager.joinRoom).not.toHaveBeenCalled()
    rerender({ liveState: state({ status: "waiting" }) })
    rerender({ liveState: { ...state(), socket: null } })
    expect(manager.joinRoom).not.toHaveBeenCalled()
    unmount()
  })

  it("waits for the independent Events connection", () => {
    harness.context = { manager, status: "connecting" }
    const { rerender, unmount } = renderHook(() => useEventLiveRoom(state()))
    expect(manager.joinRoom).not.toHaveBeenCalled()
    act(() => { harness.context = { manager, status: "connected" } })
    rerender()
    expect(manager.joinRoom).toHaveBeenCalledTimes(1)
    unmount()
  })

  it("does not leave a room during a temporary transport reconnect", () => {
    const { rerender, unmount } = renderHook(() => useEventLiveRoom(state()))
    act(() => { harness.context = { manager, status: "reconnecting" } })
    rerender()
    expect(manager.leaveRoom).not.toHaveBeenCalled()
    act(() => { harness.context = { manager, status: "connected" } })
    rerender()
    expect(manager.joinRoom).toHaveBeenCalledTimes(2)
    expect(manager.leaveRoom).not.toHaveBeenCalled()
    unmount()
    expect(manager.leaveRoom).toHaveBeenCalledWith(55)
  })
})
