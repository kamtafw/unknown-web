import type { QueryClient } from "@tanstack/react-query"
import type { EventDetails, EventLiveSessionState, LiveParticipantRole } from "@/types/events/api"
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

interface ParticipantPresencePayload {
  sessionId: number
  userId: number
  participantCount: number
}

const LIVE_ROLES = new Set<LiveParticipantRole>(["host", "co_host", "speaker", "listener"])

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

/** Only the documented identity/count fields are consumed; socket snapshots are not roster rows. */
function parseParticipantPresence(value: unknown, joined: boolean): ParticipantPresencePayload | null {
  if (!isRecord(value) || !isPositiveSessionId(value.session_id) || !isRecord(value.user)) return null
  const userId = value.user.pkid
  const participantCount = value.participant_count
  if (
    typeof userId !== "number" || !Number.isSafeInteger(userId) || userId <= 0 ||
    typeof participantCount !== "number" || !Number.isSafeInteger(participantCount) || participantCount < 0
  ) return null
  if (joined && (typeof value.role !== "string" || !LIVE_ROLES.has(value.role as LiveParticipantRole))) return null
  return { sessionId: value.session_id, userId, participantCount }
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

function applyAuthoritativeParticipantCount(
  client: QueryClient,
  scope: EventsRealtimeScope,
  eventIds: string[],
  sessionId: number,
  participantCount: number,
  direction: "joined" | "left",
): void {
  if (scope.accountId === null) return
  for (const eventId of eventIds) {
    const key = eventKeys.liveSession(scope.accountId, scope.sessionGeneration, eventId)
    const current = client.getQueryData<EventLiveSessionState>(key)
    if (!current || current.session.id !== sessionId) continue
    const previous = current.session.participantCount
    // A delayed join must not roll the count backwards; a delayed leave must not roll it forwards.
    // Ambiguous ordering is resolved by the subsequent canonical HTTP refetch.
    const directionIsPlausible =
      previous === null || (direction === "joined" ? participantCount >= previous : participantCount <= previous)
    if (directionIsPlausible && previous !== participantCount) {
      client.setQueryData<EventLiveSessionState>(key, {
        ...current,
        session: { ...current.session, participantCount },
      })
    }
  }
}

function invalidateLiveParticipantQueries(
  client: QueryClient,
  scope: EventsRealtimeScope,
  sessionId: number,
): Promise<void> {
  return client.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey
      return (
        key[0] === eventKeys.all[0] &&
        key[1] === "live-participants" &&
        keyBelongsTo(key, scope.accountId, scope.sessionGeneration) &&
        key[4] === sessionId
      )
    },
  })
}

/**
 * Missed events are not documented as replayed after reconnect. Mark this account/session's active
 * event details, My Events, live-session and participant queries stale for HTTP reconciliation.
 */
export function invalidateEventsAfterSocketReconnect(
  client: QueryClient,
  scope: EventsRealtimeScope,
): Promise<void> {
  if (scope.accountId === null) return Promise.resolve()
  const roots = new Set(["detail", "my-events", "live-session", "live-participants"])
  return client.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey
      return (
        key[0] === eventKeys.all[0] &&
        roots.has(key[1] as string) &&
        keyBelongsTo(key, scope.accountId, scope.sessionGeneration)
      )
    },
  })
}

/**
 * Register the documented raw /live lifecycle and participant events. The event-level availability
 * event is expected in the backend's personal user room; this function deliberately does not
 * invent a client-side personal-room join.
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

  const attachParticipantEvent = (eventName: "live:participant:joined" | "live:participant:left") =>
    manager.on(eventName, (raw: unknown) => {
      const joined = eventName === "live:participant:joined"
      const payload = parseParticipantPresence(raw, joined)
      if (!payload || scope.accountId === null) return

      const eventIds = findCachedEventIdsForLiveSession(client, scope, payload.sessionId)
      // Participant events are valid only while this session is still live in this account's cache.
      const activeEventIds = eventIds.filter((eventId) => {
        const state = client.getQueryData<EventLiveSessionState>(
          eventKeys.liveSession(scope.accountId!, scope.sessionGeneration, eventId),
        )
        return state?.session.id === payload.sessionId && state.session.status === "live"
      })
      if (activeEventIds.length === 0) return

      // The guide supplies no event id/sequence. An inverse transition clears the prior tuple for
      // this user so a legitimate leave-and-rejoin at the same count is not suppressed forever.
      const inverseName = joined ? "live:participant:left" : "live:participant:joined"
      const inversePrefix = `participant:${inverseName}:${payload.sessionId}:${payload.userId}:`
      for (const key of seen) if (key.startsWith(inversePrefix)) seen.delete(key)

      const dedupeKey = `participant:${eventName}:${payload.sessionId}:${payload.userId}:${payload.participantCount}`
      if (!remember(dedupeKey)) return

      applyAuthoritativeParticipantCount(
        client, scope, activeEventIds, payload.sessionId, payload.participantCount, joined ? "joined" : "left",
      )
      void Promise.all([
        ...activeEventIds.map((eventId) =>
          client.invalidateQueries({
            queryKey: eventKeys.liveSession(scope.accountId!, scope.sessionGeneration, eventId),
            exact: true,
          }),
        ),
        invalidateLiveParticipantQueries(client, scope, payload.sessionId),
      ])
    })

  const offStarted = attachSessionEvent("live:session:started")
  const offEnded = attachSessionEvent("live:session:ended")
  const offCancelled = attachSessionEvent("live:session:cancelled")
  const offParticipantJoined = attachParticipantEvent("live:participant:joined")
  const offParticipantLeft = attachParticipantEvent("live:participant:left")

  return () => {
    offAvailable()
    offStarted()
    offEnded()
    offCancelled()
    offParticipantJoined()
    offParticipantLeft()
    seen.clear()
  }
}
