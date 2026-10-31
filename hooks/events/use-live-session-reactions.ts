"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { liveSessionApi } from "@/lib/events/live-api"
import { liveSessionKeys } from "@/lib/events/live-query-keys"
import { applyLiveSessionReaction } from "@/lib/events/live-socket-events"
import {
  LIVE_REACTION_EMOJIS,
  type LiveReactionEmoji,
  type LiveSessionRoomState,
  type LiveSessionReactionResult,
} from "@/types/events/live"

function validSessionId(value: number) {
  return Number.isSafeInteger(value) && value > 0
}

interface ReactionVariables {
  emoji: LiveReactionEmoji
  sessionId: number
  accountId: number
  sessionGeneration: number | null
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
  const mutation = useMutation<LiveSessionReactionResult, unknown, ReactionVariables>({
    mutationFn: ({ emoji, sessionId: targetSessionId }) =>
      liveSessionApi.postReaction(targetSessionId, { emoji }),
    onSuccess: (result, variables) => {
      if (result.sessionId !== variables.sessionId) return
      const targetKey = liveSessionKeys.room(
        variables.accountId, variables.sessionGeneration, variables.sessionId,
      )
      client.setQueryData<LiveSessionRoomState>(targetKey, (old) =>
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
      if (!enabled || accountId === null || !LIVE_REACTION_EMOJIS.includes(emoji) || mutation.isPending) return
      mutation.mutate({ emoji, sessionId, accountId, sessionGeneration })
    },
    isSending: mutation.isPending,
    error: mutation.isError
      ? (mutation.error as { response?: { status?: number } })?.response?.status === 429
        ? "You're reacting too quickly. Please wait a moment and try again."
        : "Your reaction could not be sent. Please try again."
      : null,
  }
}
