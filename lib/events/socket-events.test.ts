import { QueryClient, QueryObserver } from "@tanstack/react-query"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { EventsSocketManager } from "./socket-manager"
import {
  attachEventsRealtimeHandlers,
  findCachedEventIdsForLiveSession,
  invalidateEventsAfterSocketReconnect,
} from "./socket-events"
import { eventKeys } from "./query-keys"
import type { EventDetails, EventLiveSessionState } from "@/types/events/api"

const eventId = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const otherEventId = "a9c7b3d2-1e4f-4a6b-8c0d-2f7a9b1c5e33"
const scope = { accountId: 42, sessionGeneration: 7 }

class FakeManager {
  handlers = new Map<string, Set<(payload: unknown) => void>>()
  leaveRoom = vi.fn()

  on(event: string, handler: (payload: unknown) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(handler)
    return () => this.handlers.get(event)?.delete(handler)
  }

  emit(event: string, payload: unknown) {
    for (const handler of this.handlers.get(event) ?? []) handler(payload)
  }
}

function liveState(id: number, idOfEvent: string): EventLiveSessionState {
  return {
    eventId: idOfEvent,
    session: {
      id,
      title: "Test session",
      status: "live",
      sessionType: "private",
      participantCount: 2,
      startedAt: "2026-10-30T08:00:00Z",
      endedAt: null,
      mediaProvider: "livekit",
      mediaStatus: "ready",
      currentUserRole: "listener",
      isJoined: true,
    },
    socket: { namespace: "/live", joinEvent: "live:join", sessionId: id },
  }
}

function availablePayload(overrides: Record<string, unknown> = {}) {
  return {
    event_id: eventId,
    session_id: 99,
    phase: "ended",
    status: "ended",
    is_live: false,
    recipient_ids: [42],
    ...overrides,
  }
}

const clients: QueryClient[] = []
function createClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  clients.push(client)
  return client
}

afterEach(() => {
  for (const client of clients.splice(0)) client.clear()
})

describe("Events realtime cache handlers", () => {
  it("invalidates only the current account/session event and My Events for availability updates", () => {
    const client = createClient()
    const manager = new FakeManager()
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("event:live-session:available", availablePayload())
    expect(invalidate).toHaveBeenCalledTimes(3)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: eventKeys.detail(42, 7, eventId),
      exact: true,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: eventKeys.liveSession(42, 7, eventId),
      exact: true,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: [...eventKeys.myEventsRoot(), 42, 7],
    })

    // Re-delivery of the same lifecycle phase is harmless.
    manager.emit("event:live-session:available", availablePayload())
    expect(invalidate).toHaveBeenCalledTimes(3)
    detach()
    expect(manager.handlers.size).toBe(0)
  })

  it("ignores malformed payloads and does not accept an HTTP envelope as a socket event", () => {
    const client = createClient()
    const manager = new FakeManager()
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("event:live-session:available", { success: true, data: availablePayload() })
    manager.emit("event:live-session:available", availablePayload({ phase: "cancelled" }))
    manager.emit("event:live-session:available", availablePayload({ session_id: 0 }))

    expect(invalidate).not.toHaveBeenCalled()
    detach()
  })

  it("resolves session events only from current account and login-session cache entries", () => {
    const client = createClient()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(99, eventId))
    client.setQueryData(eventKeys.liveSession(84, 7, otherEventId), liveState(99, otherEventId))
    client.setQueryData(eventKeys.liveSession(42, 6, otherEventId), liveState(99, otherEventId))

    expect(findCachedEventIdsForLiveSession(client, scope, 99)).toEqual([eventId])
  })

  it("refreshes the matching event after a session event and leaves the room on end", () => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(99, eventId))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("live:session:ended", { session_id: 99, ended_at: "2026-10-30T09:00:00Z" })

    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: eventKeys.detail(42, 7, eventId),
      exact: true,
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: eventKeys.liveSession(42, 7, eventId),
      exact: true,
    })
    expect(manager.leaveRoom).toHaveBeenCalledWith(99)

    manager.emit("live:session:ended", { session_id: 99, ended_at: "2026-10-30T09:00:00Z" })
    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(manager.leaveRoom).toHaveBeenCalledTimes(1)
    detach()
  })

  it.each([
    ["live:session:started", false],
    ["live:session:cancelled", true],
  ] as const)("handles %s from the admitted session room", (eventName, shouldLeave) => {
    const client = createClient()
    const manager = new FakeManager()
    client.setQueryData(eventKeys.liveSession(42, 7, eventId), liveState(99, eventId))
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit(eventName, { session_id: 99 })

    expect(invalidate).toHaveBeenCalledTimes(2)
    expect(manager.leaveRoom).toHaveBeenCalledTimes(shouldLeave ? 1 : 0)
    detach()
  })

  it("reconciles only this account/login session's event queries after reconnect", async () => {
    const client = createClient()
    const invalidate = vi.spyOn(client, "invalidateQueries").mockResolvedValue(undefined)
    await invalidateEventsAfterSocketReconnect(client, scope)

    expect(invalidate).toHaveBeenCalledTimes(1)
    const predicate = invalidate.mock.calls[0][0]?.predicate
    expect(predicate).toBeTypeOf("function")
    const matches = (key: readonly unknown[]) => predicate?.({ queryKey: key } as never)

    expect(matches(eventKeys.detail(42, 7, eventId))).toBe(true)
    expect(matches(eventKeys.liveSession(42, 7, eventId))).toBe(true)
    expect(matches([...eventKeys.myEventsRoot(), 42, 7, { search: "", limit: 20 }])).toBe(true)
    expect(matches(eventKeys.detail(84, 7, eventId))).toBe(false)
    expect(matches(eventKeys.detail(42, 6, eventId))).toBe(false)
    expect(matches(eventKeys.resources(42, 7, eventId))).toBe(false)
    expect(matches(eventKeys.nearby(42, 7, { latitude: 1, longitude: 2 }, 25, 20))).toBe(false)
  })

  it("refetches ended-event details so a former full viewer can become a restricted preview", async () => {
    const client = createClient()
    const manager = new FakeManager()
    const detailKey = eventKeys.detail(42, 7, eventId)
    const full = {
      id: eventId,
      kind: "full" as const,
      liveSessionId: 99,
      isLive: true,
    } as EventDetails
    const preview = {
      id: eventId,
      kind: "preview" as const,
      liveSessionId: 99,
      isLive: false,
    } as EventDetails
    client.setQueryData(detailKey, full)

    const observer = new QueryObserver(client, {
      queryKey: detailKey,
      queryFn: async () => preview,
      staleTime: Infinity,
      retry: false,
    })
    const unsubscribe = observer.subscribe(() => {})
    const detach = attachEventsRealtimeHandlers(manager as unknown as EventsSocketManager, client, scope)

    manager.emit("event:live-session:available", availablePayload())

    await vi.waitFor(() => {
      expect(client.getQueryData(detailKey)).toEqual(preview)
    })

    detach()
    unsubscribe()
  })
})
