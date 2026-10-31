"use client"

import { useEventsSocket } from "@/components/events/events-socket-provider"
import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"

/**
 * Persist event departure first. Only after the backend confirms success do we leave the
 * corresponding Events socket room and invalidate this account's event/session views.
 * The caller unmounts LiveKit media on the confirmed result; socket and media cleanup are
 * deliberately not treated as substitutes for the HTTP membership mutation.
 */
export function useLeaveEvent(eventId: string, sessionId: number | null) {
  const client = useQueryClient()
  const { manager } = useEventsSocket()
  const accountId = useAuthStore((s) => s.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
  const inFlight = useRef(false)

  const mutation = useMutation({
    mutationFn: () => eventsApi.leaveEvent(eventId),
    gcTime: 0,
  })

  async function leave(): Promise<boolean> {
    if (inFlight.current) return false
    inFlight.current = true
    try {
      await mutation.mutateAsync()
      mutation.reset()

      // This only exits the transient socket room. The HTTP leave above is the persistent action.
      if (sessionId !== null) {
        try {
          manager?.leaveRoom(sessionId)
        } catch {
          // A socket cleanup failure must not reverse a confirmed backend leave.
        }
      }

      if (accountId !== null) {
        const belongsToSession = (query: { queryKey: readonly unknown[] }) =>
          query.queryKey[2] === accountId && query.queryKey[3] === sessionGeneration
        await Promise.all([
          client.invalidateQueries({
            queryKey: eventKeys.detail(accountId, sessionGeneration, eventId),
            exact: true,
          }),
          client.invalidateQueries({
            queryKey: eventKeys.liveSession(accountId, sessionGeneration, eventId),
            exact: true,
          }),
          client.invalidateQueries({
            predicate: (query) =>
              belongsToSession(query) &&
              (query.queryKey[1] === "nearby" || query.queryKey[1] === "my-events"),
          }),
          client.invalidateQueries({
            predicate: (query) =>
              belongsToSession(query) &&
              query.queryKey[1] === "live-participants" &&
              query.queryKey[4] === sessionId,
          }),
        ])
      }
      return true
    } catch {
      return false
    } finally {
      inFlight.current = false
    }
  }

  const errorMessage = mutation.isError
    ? "We couldn't leave this event. Your membership has not been changed in the app. Please check your connection and try again."
    : null

  return { leave, isPending: mutation.isPending, errorMessage, clearError: mutation.reset }
}
