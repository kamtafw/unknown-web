"use client"

import { eventsApi } from "@/lib/events/api"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import type { EventResources } from "@/types/events/api"
import { useQuery } from "@tanstack/react-query"

function statusOf(error: unknown): number | null {
	const status = (error as { response?: { status?: unknown } } | null)?.response?.status
	return typeof status === "number" ? status : null
}

/**
 * Links and documents of one FULL event (P3-04). Cache entries are scoped by account, login
 * session and event, like every other Events query. The caller mounts this only for a full
 * event's Links and docs section, so a restricted preview, or a `tab=resources` link to one,
 * never reaches it; an invalid id makes no request either.
 *
 * `errorKind` is derived from the request error so the section can word 403 and 404 for itself
 * (EV-033) instead of showing the backend's reused live-session text.
 */
export function useEventResources(eventId: string) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const valid = isEventId(eventId)

	const query = useQuery({
		queryKey: eventKeys.resources(accountId, sessionGeneration, eventId),
		queryFn: ({ signal }) => eventsApi.getEventResources(eventId, signal),
		enabled: valid && accountId !== null,
		staleTime: 30_000,
		// a refusal or a missing event will not change on retry
		retry: (count, error) => {
			const status = statusOf(error)
			return status === 401 || status === 403 || status === 404 ? false : count < 1
		},
	})

	const resources: EventResources | null = valid ? (query.data ?? null) : null
	const errorKind: EventErrorKind | null =
		valid && !resources && query.isError ? describeEventError(query.error).kind : null

	return {
		resources,
		errorKind,
		isLoading: valid && !resources && !query.isError,
		isRefetching: query.isRefetching,
		refetch: query.refetch,
	}
}
