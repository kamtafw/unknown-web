"use client"

import { eventsApi } from "@/lib/events/api"
import { refreshCommentsFromFirstPage } from "@/lib/events/cache"
import { describeEventError, type EventErrorKind } from "@/lib/events/errors"
import { normalizeCommentMessage } from "@/lib/events/validation"
import { useAuthStore } from "@/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"

/**
 * Posts a comment to one event (P3-06). The backend decides who may post (D-3): this hook infers
 * nothing from host or guest status, and a rejection is returned for the caller to show.
 *
 * The 201 carries no id, author or time (A-20), so nothing is inserted optimistically: on success
 * page 1 of this event's thread is refetched and the comment arrives through the read path.
 * `post` resolves true only after the server accepted it, and the caller clears its text only
 * then. A second call while one is in flight is ignored (also within the same render tick).
 */
export function usePostEventComment(eventId: string) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const inFlight = useRef(false)

	const mutation = useMutation({
		mutationFn: (message: string) => eventsApi.postEventComment(eventId, message),
		gcTime: 0,
		onSuccess: () => {
			// not awaited: the composer is free again at once and the thread shows its own refresh
			void refreshCommentsFromFirstPage(client, accountId, sessionGeneration, eventId)
		},
	})
	const { mutateAsync, reset } = mutation

	async function post(raw: string): Promise<boolean> {
		const message = normalizeCommentMessage(raw)
		if (message === null || inFlight.current) return false
		inFlight.current = true
		try {
			await mutateAsync(message)
			// the text lives in the caller; drop the copy the mutation cache holds
			reset()
			return true
		} catch {
			return false
		} finally {
			inFlight.current = false
		}
	}

	const error: EventErrorKind | null = mutation.isError ? describeEventError(mutation.error).kind : null

	return { post, isPending: mutation.isPending, error, clearError: reset }
}
