"use client"

import { eventsApi } from "@/lib/events/api"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
  EventLiveSessionState,
  LiveParticipant,
  LiveParticipantRole,
  LiveParticipantsPage,
} from "@/types/events/api"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

function statusOf(error: unknown): number | null {
  const status = (error as { response?: { status?: unknown } } | null)?.response?.status
  return typeof status === "number" ? status : null
}

/** Keep the first occurrence of each user and preserve backend page/order semantics. */
export function flattenLiveParticipantPages(
  pages: LiveParticipantsPage[] | undefined,
): LiveParticipant[] {
  const seen = new Set<number>()
  const out: LiveParticipant[] = []
  for (const page of pages ?? []) {
    for (const participant of page.participants) {
      const userId = participant.user.userId
      if (seen.has(userId)) continue
      seen.add(userId)
      out.push(participant)
    }
  }
  return out
}

/**
 * Canonical HTTP roster for one live session. The hook is disabled unless the caller has a
 * readable live-session state, the session is live, and the current account is known.
 *
 * Pages are fetched only when the backend's next link says another page exists. The role filter
 * and page size are query scope; page number is a pageParam. HTTP remains canonical: socket
 * participant events invalidate this query rather than inserting incomplete socket snapshots.
 */
export function useEventLiveParticipants(
  liveState: EventLiveSessionState | null,
  role: LiveParticipantRole | null = null,
  limit = EVENTS_PAGE_SIZE,
) {
  const accountId = useAuthStore((s) => s.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
  const sessionId = liveState?.session.id ?? null
  const enabled =
    accountId !== null &&
    sessionId !== null &&
    Number.isSafeInteger(sessionId) &&
    sessionId > 0 &&
    liveState?.session.status === "live"

  const query = useInfiniteQuery({
    queryKey: eventKeys.liveParticipants(accountId, sessionGeneration, sessionId ?? 0, limit, role),
    queryFn: ({ pageParam, signal }) =>
      eventsApi.getLiveParticipantsPage(
        { sessionId: sessionId!, page: pageParam, limit, role: role ?? undefined },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled,
    staleTime: 15_000,
    retry: (count, error) => {
      const status = statusOf(error)
      return status === 401 || status === 403 || status === 404 ? false : count < 1
    },
  })

  const pages = enabled ? query.data?.pages : undefined
  const participants = useMemo(() => flattenLiveParticipantPages(pages), [pages])
  const hasLoaded = pages !== undefined
  const error: EventErrorKind | null =
    enabled && query.isError ? describeEventError(query.error).kind : null
  const phase: "initial" | "next-page" | "refresh" | null = !error
    ? null
    : !hasLoaded
      ? "initial"
      : query.isFetchNextPageError
        ? "next-page"
        : "refresh"

  return {
    participants,
    hasLoaded,
    isInitialLoading: enabled && !hasLoaded && !query.isError,
    error,
    phase,
    hasNextPage: enabled && hasLoaded && query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isRefreshing: query.isRefetching && !query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  }
}
