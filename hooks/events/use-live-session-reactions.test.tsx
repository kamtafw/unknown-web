import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { liveSessionKeys } from "@/lib/events/live-query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { LiveSessionReactionResult } from "@/types/events/live"
import { useLiveSessionReactions } from "./use-live-session-reactions"

const postReaction = vi.fn()
vi.mock("@/lib/events/live-api", () => ({
  liveSessionApi: {
    postReaction: (...args: unknown[]) => postReaction(...args),
  },
}))
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)
const result: LiveSessionReactionResult = {
  sessionId: 12,
  reaction: {
    eventId: "r-1", emoji: "❤️", emojiCount: 5, createdAt: "2026-10-31T10:00:00Z",
    user: { id: "u1", pkid: 1, firstName: "A", lastName: "B", username: "ab", photo: null },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  client.clear()
  useAuthStore.setState({ user: { pkid: 7 } as never, sessionGeneration: 2 })
})

describe("useLiveSessionReactions", () => {
  it("posts an allowed reaction and stores the canonical server count", async () => {
    postReaction.mockResolvedValue(result)
    const { result: hook } = renderHook(() => useLiveSessionReactions(12), { wrapper })
    act(() => hook.current.sendReaction("❤️"))
    await waitFor(() => expect(postReaction).toHaveBeenCalledWith(12, { emoji: "❤️" }))
    await waitFor(() => expect(hook.current.reactionCounts["❤️"]).toBe(5))
    expect(client.getQueryData(liveSessionKeys.room(7, 2, 12))).toMatchObject({
      reactionCounts: { "❤️": 5 },
    })
  })

  it("does not request for an invalid session or absent account", () => {
    const { result: invalid } = renderHook(() => useLiveSessionReactions(0), { wrapper })
    act(() => invalid.current.sendReaction("👍"))
    useAuthStore.setState({ user: null })
    const { result: anonymous } = renderHook(() => useLiveSessionReactions(12), { wrapper })
    act(() => anonymous.current.sendReaction("👍"))
    expect(postReaction).not.toHaveBeenCalled()
  })
})
