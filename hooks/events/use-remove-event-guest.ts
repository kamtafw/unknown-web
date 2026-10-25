"use client"

import { eventsApi } from "@/lib/events/api"
import { refreshFromFirstPage } from "@/lib/events/cache"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { useAuthStore } from "@/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"

/**
 * True only for the backend's own 404 "Guest not found in this event." (guide §4.14). A 404 for an
 * absent event, or the BFF's own "Event not found.", is a different case and is not matched. The
 * match is on the message text because the guide documents no distinct code, so it is guide-derived
 * and not live-verified.
 */
export function isGuestNotFound(error: unknown): boolean {
	const response = (error as { response?: { status?: unknown; data?: unknown } } | null)?.response
	if (response?.status !== 404) return false
	const message = (response.data as { message?: unknown } | null)?.message
	return typeof message === "string" && /guest not found/i.test(message)
}

export type RemoveGuestResult = "removed" | "already_removed" | false

/**
 * Removes one guest record from an event (P3-08A, host only; the backend decides). The hook infers
 * nothing from role. A removed guest's comments in this event are deleted by the backend, so on
 * success page 1 of both the guests list and the comments thread is refetched for this account,
 * login session and event only. Nothing is removed by hand. A 404 "Guest not found" means the
 * guest is already gone: it is reported as `already_removed` and refreshes the same lists. A second
 * call while one is in flight is ignored. Removal does not disconnect anyone from live media.
 */
export function useRemoveEventGuest(eventId: string) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const inFlight = useRef(false)

	const mutation = useMutation({
		mutationFn: (userId: number) => eventsApi.removeEventGuest(eventId, userId),
		gcTime: 0,
	})
	const { mutateAsync, reset } = mutation

	function refresh() {
		void refreshFromFirstPage(client, accountId, sessionGeneration, eventId, ["guests", "comments"])
	}

	async function remove(userId: number): Promise<RemoveGuestResult> {
		if (!Number.isSafeInteger(userId) || userId < 1 || inFlight.current) return false
		inFlight.current = true
		try {
			await mutateAsync(userId)
			reset()
			refresh()
			return "removed"
		} catch (error) {
			if (isGuestNotFound(error)) {
				reset()
				refresh()
				return "already_removed"
			}
			return false
		} finally {
			inFlight.current = false
		}
	}

	const error: EventErrorKind | null = mutation.isError
		? describeEventError(mutation.error).kind
		: null

	return { remove, isPending: mutation.isPending, error, clearError: reset }
}
