"use client"

import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { Coordinates } from "@/types/events/api"
import { useQuery } from "@tanstack/react-query"

/**
 * Optional display label ("near <address>") for the resolved location. It is purely cosmetic:
 * a failure returns `null` and never affects the coordinates or the nearby request.
 */
export function useEventAddress(coordinates: Coordinates | null): string | null {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const { data } = useQuery({
		queryKey: coordinates
			? eventKeys.address(accountId, sessionGeneration, coordinates)
			: ([...eventKeys.addressRoot(), "unresolved"] as const),
		queryFn: ({ signal }) => eventsApi.resolveAddress(coordinates!, signal),
		enabled: coordinates !== null && accountId !== null,
		staleTime: 30 * 60_000,
		retry: false,
	})

	return coordinates ? (data ?? null) : null
}
