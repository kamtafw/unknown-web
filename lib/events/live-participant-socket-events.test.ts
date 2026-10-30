import { QueryClient } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { EventsSocketManager } from "./socket-manager"
import { attachEventsRealtimeHandlers, invalidateEventsAfterSocketReconnect } from "./socket-events"
import { eventKeys } from "./query-keys"
import type { EventLiveSessionState, LiveParticipantsPage } from "@/types/events/api"

const eventId = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const otherEventId = "a9c7b3d2-1e4f-4a6b-8c0d-2f7a9b1c5e33"
const scope = { accountId: 42, sessionGeneration: 7 }

class FakeManager {
  handlers = new Map<string, Set<(payload: unknown) => void>>()
  on(event: string, handler: (payload: unknown) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }
  emit(event: string, payload: unknown) {
    for (const handler of this.handlers.get(event) ?? []) handler(payload)
  }
}

function liveState(sessionId: number, count: number): EventLiveSessionState {
  return {
    eventId,
    session: {
      id: sessionId, title: "Live", status: "live", sessionType: "public",
      participantCount: count, startedAt: null, endedAt: null,
      mediaProvider: "livekit", mediaStatus: "ready", currentUserRole: "host", isJoined: true,
    },
    socket: { namespace: "/live", joinEvent: "live:join", sessionId },
  }
}

const participantPage: LiveParticipantsPage = { page: 1, hasNext: false, participants: [] }
const joined = (overrides: Record<string, unknown> = {}) => ({
  session_id: 55,
  user: { id: "user-9", pkid: 9, username: "ada", first_name: "Ada", last_name: "Obi", profile_photo: null },
  role: "listener",
  participant_count: 3,
  ...overrides,
})
const left = (overrides: Record<string, unknown> = {}) => ({
  session_id: 55,
  user: { id: "user-9", pkid: 9, username: "ada", first_name: "Ada", last_name: "Obi", profile_photo: null },
  participant_count: 1,
  ...overrides,
})

const clients: QueryClient[] = []
function createClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  clients.push(client)
  return client
}
afterEach(() => {
  for (const client of clients.splice(0)) client.clear()
})

describe("participant presence socket reconciliation", () => {
  it("accepts a documented join, uses server count and invalidates only this session roster", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(55, 2))
    client.setQueryData(eventKeys.liveSession(84, 7, eventId), liveState(55, 8))
    const currentKey = eventKeys.liveParticipants(42, 7, 55, 20, null)
    const otherSessionKey = eventKeys.liveParticipants(42, 7, 56, 20, null)
    const otherAccountKey = eventKeys.liveParticipants(84, 7, 55, 20, null)
    client.setQueryData(currentKey, { pages: [participantPage], pageParams: [1] })
    client.setQueryData(otherSessionKey, { pages: [participantPage], pageParams: [1] })
    client.setQueryData(otherAccountKey, { pages: [participantPage], pageParams: [1] })
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:participant:joined", joined())

    expect(client.getQueryData<EventLiveSessionState>(eventKeys.liveSession(42, 7, eventId))?.session.participantCount).toBe(3)
    expect(client.getQueryData<EventLiveSessionState>(eventKeys.liveSession(84, 7, eventId))?.session.participantCount).toBe(8)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: eventKeys.liveSession(42, 7, eventId), exact: true,
    })
    const predicate = invalidate.mock.calls.find(([arg]) => !!arg?.predicate)?.[0]?.predicate
    expect(predicate).toBeTypeOf("function")
    const matches = (key: readonly unknown[]) => predicate?.({ queryKey: key } as never)
    expect(matches(currentKey)).toBe(true)
    expect(matches(otherSessionKey)).toBe(false)
    expect(matches(otherAccountKey)).toBe(false)

    manager.emit("live:participant:joined", joined())
    expect(invalidate.mock.calls.filter(([arg]) => arg?.queryKey?.[1] === "live-session")).toHaveLength(1)
    detach()
  })

  it("uses the server count for leave and never locally decrements it", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(55, 2))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:participant:left", left())
    expect(client.getQueryData<EventLiveSessionState>(eventKeys.liveSession(42, 7, eventId))?.session.participantCount).toBe(1)
    expect(invalidate).toHaveBeenCalled()
    detach()
  })

  it("does not let a delayed join roll back a newer count; HTTP reconciliation is still requested", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(55, 5))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:participant:joined", joined({ participant_count: 4 }))
    expect(client.getQueryData<EventLiveSessionState>(eventKeys.liveSession(42, 7, eventId))?.session.participantCount).toBe(5)
    expect(invalidate).toHaveBeenCalled()
    detach()
  })

  it("ignores malformed, envelope-wrapped, unknown-role and wrong-session events", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(55, 2))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:participant:joined", { success: true, data: joined() })
    manager.emit("live:participant:joined", joined({ role: "administrator" }))
    manager.emit("live:participant:joined", joined({ session_id: 56 }))
    manager.emit("live:participant:left", left({ participant_count: -1 }))
    manager.emit("live:participant:left", left({ user: { pkid: 0 } }))

    expect(invalidate).not.toHaveBeenCalled()
    detach()
  })

  it("does not apply a session event without a matching current-account session cache", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(84, 7, eventId), liveState(55, 2))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)
    manager.emit("live:participant:joined", joined())
    expect(invalidate).not.toHaveBeenCalled()
    detach()
  })

  it("invalidates participant queries after reconnect for this account and login generation", async () => {
    const client = createClient()
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    await invalidateEventsAfterSocketReconnect(client, scope)
    const predicate = invalidate.mock.calls[0][0]?.predicate
    expect(predicate).toBeTypeOf("function")
    const matches = (key: readonly unknown[]) => predicate?.({ queryKey: key } as never)
    expect(matches(eventKeys.liveParticipants(42, 7, 55, 20, null))).toBe(true)
    expect(matches(eventKeys.liveParticipants(84, 7, 55, 20, null))).toBe(false)
    expect(matches(eventKeys.liveParticipants(42, 6, 55, 20, null))).toBe(false)
  })
  it("allows a later rejoin by the same user even when the server count repeats", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(55, 2))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:participant:joined", joined({ participant_count: 3 }))
    manager.emit("live:participant:left", left({ participant_count: 2 }))
    manager.emit("live:participant:joined", joined({ participant_count: 3 }))

    expect(client.getQueryData<EventLiveSessionState>(eventKeys.liveSession(42, 7, eventId))?.session.participantCount).toBe(3)
    expect(invalidate.mock.calls.filter(([arg]) => arg?.queryKey?.[1] === "live-session")).toHaveLength(3)
    detach()
  })

})
