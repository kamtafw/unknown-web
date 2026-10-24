"use client"

import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { isEventId } from "@/lib/events/server"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery } from "@tanstack/react-query"

/** Resources are permission-gated by the backend; never request them for a restricted preview. */
export function useEventResources(eventId: string, enabled: boolean) {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const valid = isEventId(eventId)

	return useQuery({
		queryKey: eventKeys.resources(accountId, sessionGeneration, eventId),
		queryFn: ({ signal }) => eventsApi.getEventResources(eventId, signal),
		enabled: enabled && valid && accountId !== null,
		staleTime: 30_000,
		retry: (count, error) => {
			const status = (error as { response?: { status?: unknown } } | null)?.response?.status
			return status === 403 || status === 404 ? false : count < 1
		},
	})
}
