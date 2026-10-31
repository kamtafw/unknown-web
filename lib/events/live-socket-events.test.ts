import { QueryClient } from "@tanstack/react-query"
import { describe, expect, it, vi } from "vitest"
import { liveSessionKeys } from "./live-query-keys"
import {
  applyLiveSessionReaction,
  attachLiveSessionSocketHandlers,
  parseLiveSessionId,
} from "./live-socket-events"
import type { LiveSessionReaction } from "@/types/events/live"

function reaction(overrides: Partial<LiveSessionReaction> = {}): LiveSessionReaction {
  return {
    eventId: "evt-1",
    emoji: "🔥",
    emojiCount: 4,
    createdAt: "2026-10-31T10:00:00Z",
    user: { id: "u1", pkid: 1, firstName: "Test", lastName: "User", username: "test", photo: null },
    ...overrides,
  }
}

function managerHarness() {
  const handlers = new Map<string, (payload: unknown) => void>()
  const manager = {
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      handlers.set(event, handler)
      return () => handlers.delete(event)
    }),
  }
  return { manager, handlers }
}

describe("live session socket events", () => {
  it("accepts the mobile session-id aliases from root or data envelopes", () => {
    expect(parseLiveSessionId({ session_id: 12 })).toBe(12)
    expect(parseLiveSessionId({ data: { session_id: 13 } })).toBe(13)
    expect(parseLiveSessionId({ sessionId: "14" })).toBe(14)
    expect(parseLiveSessionId({ room_id: 15 })).toBe(15)
    expect(parseLiveSessionId({ session_id: "not-a-number" })).toBeNull()
    expect(parseLiveSessionId({ session_id: 0 })).toBeNull()
    expect(parseLiveSessionId({})).toBeNull()
  })

  it("uses the server reaction count and deduplicates event ids", () => {
    const first = applyLiveSessionReaction(undefined, reaction({ emojiCount: 4 }))
    const second = applyLiveSessionReaction(first, reaction({ emojiCount: 4 }))
    const updated = applyLiveSessionReaction(second, reaction({ eventId: "evt-2", emojiCount: 6 }))
    expect(first.reactionCounts["🔥"]).toBe(4)
    expect(second.recentReactions).toHaveLength(1)
    expect(updated.reactionCounts["🔥"]).toBe(6)
    expect(updated.recentReactions.map((item) => item.eventId)).toEqual(["evt-1", "evt-2"])
  })

  it("invalidates comments only for the active session and applies valid reactions only for that session", () => {
    const client = new QueryClient()
    const scope = { accountId: 7, sessionGeneration: 2, sessionId: 12 }
    const key = liveSessionKeys.comments(7, 2, 12, 50)
    client.setQueryData(key, { pages: [], pageParams: [] })
    const { manager, handlers } = managerHarness()
    const off = attachLiveSessionSocketHandlers(manager as never, client, scope)

    handlers.get("live:comment")?.({ session_id: 99 })
    expect(client.getQueryState(key)?.isInvalidated).toBe(false)
    handlers.get("live:comment")?.({ data: { session_id: 12 } })
    expect(client.getQueryState(key)?.isInvalidated).toBe(true)

    const payload = {
      session_id: 12,
      reaction: {
        event_id: "r-1",
        emoji: "👏",
        emoji_count: 3,
        user: { id: "u1", pkid: 1, first_name: "Test", last_name: "User", username: "test" },
        created_at: "2026-10-31T10:00:00Z",
      },
    }
    handlers.get("live:reaction")?.({ ...payload, session_id: 99 })
    expect(client.getQueryData(liveSessionKeys.room(7, 2, 12))).toBeUndefined()
    handlers.get("live:reaction")?.(payload)
    handlers.get("live:reaction")?.(payload)
    const room = client.getQueryData<{
      reactionCounts: Record<string, number>
      recentReactions: unknown[]
    }>(liveSessionKeys.room(7, 2, 12))
    expect(room?.reactionCounts["👏"]).toBe(3)
    expect(room?.recentReactions).toHaveLength(1)

    off()
    expect(handlers.size).toBe(0)
    client.clear()
  })
})
