"use client"

import { eventsApi } from "@/lib/events/api"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"

/** Admit the current viewer before live media credentials can be requested. */
export function useJoinEvent(eventId: string) {
  const client = useQueryClient()
  const accountId = useAuthStore((s) => s.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
  const inFlight = useRef(false)

  const mutation = useMutation({
    mutationFn: (passcode?: string) => eventsApi.joinEvent(eventId, passcode),
    gcTime: 0,
  })
  const { mutateAsync, reset } = mutation

  async function join(passcode?: string): Promise<number | null | false> {
    if (inFlight.current) return false
    if (passcode !== undefined && !/^\d{4}$/.test(passcode)) return false
    inFlight.current = true
    try {
      let sessionId = await mutateAsync(passcode)
      reset()
      if (sessionId === null) {
        try {
          sessionId = (await eventsApi.getEventLiveSession(eventId)).session.id
        } catch {
          // Admission may succeed while the attached-session read is briefly unavailable.
        }
      }
      if (accountId !== null) {
        const belongsToSession = (query: { queryKey: readonly unknown[] }) =>
          query.queryKey[2] === accountId && query.queryKey[3] === sessionGeneration
        await Promise.all([
          client.invalidateQueries({ queryKey: eventKeys.detail(accountId, sessionGeneration, eventId), exact: true }),
          client.invalidateQueries({ queryKey: eventKeys.liveSession(accountId, sessionGeneration, eventId), exact: true }),
          client.invalidateQueries({
            queryKey: eventKeys.guests(accountId, sessionGeneration, eventId, EVENTS_PAGE_SIZE),
            exact: true,
          }),
          client.invalidateQueries({
            predicate: (query) =>
              belongsToSession(query) &&
              (query.queryKey[1] === "nearby" || query.queryKey[1] === "my-events"),
          }),
        ])
      }
      return sessionId
    } catch {
      return false
    } finally {
      inFlight.current = false
    }
  }

  const errorMessage =
    mutation.isError
      ? (() => {
          const response = (mutation.error as { response?: { data?: { message?: unknown } } } | null)?.response
          const message = response?.data?.message
          if (typeof message === "string" && /passcode/i.test(message)) return "That passcode wasn't accepted. Check it and try again."
          if (typeof message === "string" && /not live|ended/i.test(message)) return "This event is no longer live."
          if (typeof message === "string" && /blocked/i.test(message)) return "You can't join this live session."
          return "We couldn't join this event. Please try again."
        })()
      : null

  return { join, isPending: mutation.isPending, errorMessage, clearError: reset }
}
