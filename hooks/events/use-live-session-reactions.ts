"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { liveSessionApi } from "@/lib/events/live-api"
import { liveSessionKeys } from "@/lib/events/live-query-keys"
import { applyLiveSessionReaction } from "@/lib/events/live-socket-events"
import { LIVE_REACTION_EMOJIS, type LiveReactionEmoji, type LiveSessionRoomState } from "@/types/events/live"

function validSessionId(value: number) {
  return Number.isSafeInteger(value) && value > 0
}

export function useLiveSessionReactions(sessionId: number) {
  const client = useQueryClient()
  const accountId = useAuthStore((state) => state.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((state) => state.sessionGeneration)
  const enabled = validSessionId(sessionId) && accountId !== null
  const queryKey = liveSessionKeys.room(accountId, sessionGeneration, sessionId)
  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<LiveSessionRoomState> => ({ reactionCounts: {}, recentReactions: [] }),
    enabled,
    initialData: { reactionCounts: {}, recentReactions: [] },
    staleTime: Infinity,
  })
  const mutation = useMutation({
    mutationFn: (emoji: LiveReactionEmoji) => liveSessionApi.postReaction(sessionId, { emoji }),
    onSuccess: (result) => {
      if (accountId === null || result.sessionId !== sessionId) return
      client.setQueryData<LiveSessionRoomState>(queryKey, (old) =>
        applyLiveSessionReaction(old, result.reaction),
      )
    },
    retry: (count, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status
      return status !== 401 && status !== 403 && status !== 404 && status !== 429 && count < 1
    },
  })
  return {
    reactionCounts: query.data.reactionCounts,
    recentReactions: query.data.recentReactions,
    sendReaction: (emoji: LiveReactionEmoji) => {
      if (!enabled || !LIVE_REACTION_EMOJIS.includes(emoji) || mutation.isPending) return
      mutation.mutate(emoji)
    },
    isSending: mutation.isPending,
    error: mutation.isError ? "Your reaction could not be sent. Please try again." : null,
  }
}
