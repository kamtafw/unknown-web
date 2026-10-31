import type { QueryClient } from "@tanstack/react-query"
import type { EventsSocketManager } from "./socket-manager"
import { liveSessionKeys } from "./live-query-keys"
import { normalizeLiveSessionReaction } from "./live-normalize"
import type { LiveSessionReaction, LiveSessionRoomState } from "@/types/events/live"

export interface LiveSocketScope {
  accountId: number | null
  sessionGeneration: number | null
  sessionId: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function sessionPayload(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null
  if (typeof value.session_id === "number") return value
  return isRecord(value.data) ? value.data : null
}

export function parseLiveSessionId(value: unknown): number | null {
  const payload = sessionPayload(value)
  const id = payload?.session_id
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0 ? id : null
}

/** Applies only authoritative server counts. eventId deduplication is session-local. */
export function applyLiveSessionReaction(
  old: LiveSessionRoomState | undefined,
  reaction: LiveSessionReaction,
): LiveSessionRoomState {
  const current = old ?? { reactionCounts: {}, recentReactions: [] }
  const exists = current.recentReactions.some((item) => item.eventId === reaction.eventId)
  return {
    reactionCounts: { ...current.reactionCounts, [reaction.emoji]: reaction.emojiCount },
    recentReactions: exists
      ? current.recentReactions
      : [...current.recentReactions, reaction].slice(-30),
  }
}

/**
 * Session-scoped socket listeners. Comment payload contents are deliberately ignored:
 * mobile only relies on the session identifier and refetches the canonical HTTP page.
 */
export function attachLiveSessionSocketHandlers(
  manager: EventsSocketManager,
  client: QueryClient,
  scope: LiveSocketScope,
): () => void {
  if (scope.accountId === null || !Number.isSafeInteger(scope.sessionId) || scope.sessionId <= 0) {
    return () => {}
  }
  const key = liveSessionKeys.comments(
    scope.accountId, scope.sessionGeneration, scope.sessionId, 50,
  )
  const roomKey = liveSessionKeys.room(scope.accountId, scope.sessionGeneration, scope.sessionId)
  const seen = new Set<string>()

  const offComment = manager.on("live:comment", (raw: unknown) => {
    if (parseLiveSessionId(raw) !== scope.sessionId) return
    void client.invalidateQueries({ queryKey: key })
  })

  const offReaction = manager.on("live:reaction", (raw: unknown) => {
    const payload = sessionPayload(raw)
    if (!payload || payload.session_id !== scope.sessionId) return
    const reaction = normalizeLiveSessionReaction(payload.reaction)
    if (!reaction || seen.has(reaction.eventId)) return
    seen.add(reaction.eventId)
    if (seen.size > 300) seen.delete(seen.values().next().value as string)
    client.setQueryData<LiveSessionRoomState>(roomKey, (old) =>
      applyLiveSessionReaction(old, reaction),
    )
  })

  return () => {
    offComment()
    offReaction()
    seen.clear()
  }
}
