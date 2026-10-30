import type { QueryClient } from "@tanstack/react-query"
import type { EventDetails, EventLiveSessionState } from "@/types/events/api"
import { isEventId } from "./server"
import { eventKeys, keyBelongsTo, keyEventId } from "./query-keys"
import type { EventsSocketManager } from "./socket-manager"

export interface EventsRealtimeScope {
  accountId: number | null
  sessionGeneration: number | null
}

interface LiveSessionAvailablePayload {
  event_id: string
  session_id: number
  phase: "created" | "started" | "ended"
  status: string
  is_live: boolean
  recipient_ids: unknown[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isPositiveSessionId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
}

function parseAvailablePayload(value: unknown): LiveSessionAvailablePayload | null {
  if (!isRecord(value)) return null
  if (
    typeof value.event_id !== "string" ||
    !isEventId(value.event_id) ||
    !isPositiveSessionId(value.session_id) ||
    (value.phase !== "created" && value.phase !== "started" && value.phase !== "ended") ||
    typeof value.status !== "string" ||
    typeof value.is_live !== "boolean" ||
    !Array.isArray(value.recipient_ids)
  ) return null

  return value as unknown as LiveSessionAvailablePayload
}

function parseSessionId(value: unknown): number | null {
  return isRecord(value) && isPositiveSessionId(value.session_id) ? value.session_id : null
}

/**
 * A session-scoped event contains no event UUID. Resolve it only from cached
 * live-session/detail records belonging to the current account and login epoch.
 * Never search or invalidate another account's cache.
 */
export function findCachedEventIdsForLiveSession(
  client: QueryClient,
  scope: EventsRealtimeScope,
  sessionId: number,
): string[] {
  if (scope.accountId === null) return []

  const eventIds = new Set<string>()
  for (const [key, state] of client.getQueriesData<EventLiveSessionState>({
    queryKey: eventKeys.liveSessionRoot(),
  })) {
    if (!keyBelongsTo(key, scope.accountId, scope.sessionGeneration)) continue
    if (state?.session?.id !== sessionId) continue
    const eventId = keyEventId(key)
    if (eventId && isEventId(eventId)) eventIds.add(eventId)
  }

  for (const [key, details] of client.getQueriesData<EventDetails>({
    queryKey: eventKeys.detailRoot(),
  })) {
    if (!keyBelongsTo(key, scope.accountId, scope.sessionGeneration)) continue
    if (details?.liveSessionId !== sessionId) continue
    const eventId = keyEventId(key)
    if (eventId && isEventId(eventId)) eventIds.add(eventId)
  }

  return [...eventIds]
}

function invalidateEventDetailsAndLiveSession(
  client: QueryClient,
  scope: EventsRealtimeScope,
  eventId: string,
): Promise<void[]> {
  if (scope.accountId === null) return Promise.resolve([])
  return Promise.all([
    client.invalidateQueries({
      queryKey: eventKeys.detail(scope.accountId, scope.sessionGeneration, eventId),
      exact: true,
    }),
    client.invalidateQueries({
      queryKey: eventKeys.liveSession(scope.accountId, scope.sessionGeneration, eventId),
      exact: true,
    }),
  ])
}

/**
 * Register the documented raw /live lifecycle events. The event-level
 * availability event is expected in the backend's personal user room; this
 * function deliberately does not invent a client-side personal-room join.
 */
export function attachEventsRealtimeHandlers(
  manager: EventsSocketManager,
  client: QueryClient,
  scope: EventsRealtimeScope,
): () => void {
  const seen = new Set<string>()
  const remember = (key: string): boolean => {
    if (seen.has(key)) return false
    seen.add(key)
    if (seen.size > 300) seen.delete(seen.values().next().value as string)
    return true
  }

  const offAvailable = manager.on("event:live-session:available", (raw: unknown) => {
    const payload = parseAvailablePayload(raw)
    if (!payload || scope.accountId === null) return
    const eventId = payload.event_id
    const dedupeKey = `available:${eventId}:${payload.session_id}:${payload.phase}`
    if (!remember(dedupeKey)) return

    void Promise.all([
      invalidateEventDetailsAndLiveSession(client, scope, eventId),
      client.invalidateQueries({
        queryKey: [...eventKeys.myEventsRoot(), scope.accountId, scope.sessionGeneration],
      }),
    ])
  })

  const attachSessionEvent = (eventName: "live:session:started" | "live:session:ended" | "live:session:cancelled") =>
    manager.on(eventName, (raw: unknown) => {
      const sessionId = parseSessionId(raw)
      if (sessionId === null || scope.accountId === null) return
      if (!remember(`${eventName}:${sessionId}`)) return

      const eventIds = findCachedEventIdsForLiveSession(client, scope, sessionId)
      for (const eventId of eventIds) {
        void invalidateEventDetailsAndLiveSession(client, scope, eventId)
      }

      if (eventName === "live:session:ended" || eventName === "live:session:cancelled") {
        // This removes socket-room intent only. It does not persist event leave.
        manager.leaveRoom(sessionId)
      }
    })

  const offStarted = attachSessionEvent("live:session:started")
  const offEnded = attachSessionEvent("live:session:ended")
  const offCancelled = attachSessionEvent("live:session:cancelled")

  return () => {
    offAvailable()
    offStarted()
    offEnded()
    offCancelled()
    seen.clear()
  }
}
