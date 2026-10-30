import { beforeEach, describe, expect, it, vi } from "vitest"
import { eventsApi } from "./api"
import { createEventRoomRevalidator } from "./socket-room"

vi.mock("./api", () => ({
  eventsApi: {
    getEventLiveSession: vi.fn(),
  },
}))

const getEventLiveSession = vi.mocked(eventsApi.getEventLiveSession)
const state = (overrides: Record<string, unknown> = {}) => ({
  eventId: "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11",
  session: {
    id: 71,
    status: "live",
    isJoined: true,
  },
  socket: {
    namespace: "/live",
    joinEvent: "live:join",
    sessionId: 71,
  },
  ...overrides,
})

describe("createEventRoomRevalidator", () => {
  beforeEach(() => vi.clearAllMocks())

  it("authorizes replay only for the same live session and an active participant", async () => {
    getEventLiveSession.mockResolvedValue(state() as never)
    const revalidate = createEventRoomRevalidator("3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11", 71)

    await expect(revalidate()).resolves.toBe(true)
    expect(getEventLiveSession).toHaveBeenCalledWith("3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11")
  })

  it.each([
    ["different session", state({ session: { id: 72, status: "live", isJoined: true } })],
    ["inactive participation", state({ session: { id: 71, status: "live", isJoined: false } })],
    ["ended session", state({ session: { id: 71, status: "ended", isJoined: true } })],
    ["missing descriptor", state({ socket: null })],
    ["descriptor for another session", state({ socket: { namespace: "/live", joinEvent: "live:join", sessionId: 72 } })],
  ])("rejects replay for %s", async (_label, response) => {
    getEventLiveSession.mockResolvedValue(response as never)
    await expect(createEventRoomRevalidator("event-id", 71)()).resolves.toBe(false)
  })

  it.each([403, 404])("treats HTTP %i as revoked or unavailable membership", async (status) => {
    getEventLiveSession.mockRejectedValue({ response: { status } })
    await expect(createEventRoomRevalidator("event-id", 71)()).resolves.toBe(false)
  })

  it("keeps authentication, network and server failures retryable", async () => {
    const failure = { response: { status: 500 } }
    getEventLiveSession.mockRejectedValue(failure)
    await expect(createEventRoomRevalidator("event-id", 71)()).rejects.toBe(failure)
  })
})
