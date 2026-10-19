"use client"

import { useAuthStore } from "@/stores/auth-store"
import { useEventsLocationStore } from "@/stores/events-location-store"
import type { LocationStatus } from "@/types/events/api"
import { useEffect } from "react"

/**
 * Discovery side: keeps the shared "last resolved location" label in step with the
 * browser location this screen holds.
 *  - ready → remember the label (needs a known account, so it can be scoped to it);
 *  - anything else (finding, denied, unavailable, timeout, unsupported) → forget it, so a
 *    revoked or refreshing location is never shown elsewhere as if it were current.
 * Unmounting leaves the label in place; that is the point of remembering it.
 */
export function useRememberLocation(status: LocationStatus, address: string | null): void {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const remember = useEventsLocationStore((s) => s.remember)
	const forget = useEventsLocationStore((s) => s.forget)

	useEffect(() => {
		if (status === "ready" && accountId !== null) {
			remember({ accountId, sessionGeneration, address })
		} else {
			forget()
		}
	}, [status, address, accountId, sessionGeneration, remember, forget])
}

/**
 * My events side: the remembered label for the signed-in account and session, or null.
 * Read-only — it never asks the browser for location and has no way to start a request.
 */
export function useLastLocation(): { address: string | null } | null {
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const last = useEventsLocationStore((s) => s.last)

	if (!last || accountId === null) return null
	if (last.accountId !== accountId || last.sessionGeneration !== sessionGeneration) return null
	return { address: last.address }
}
