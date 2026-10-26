"use client"

import { eventsApi } from "@/lib/events/api"
import { invalidateEventSubResources, removeEventSubResources } from "@/lib/events/cache"
import { describeEventError } from "@/lib/events/errors"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventDetails, EventSubmission } from "@/types/events/api"
import { type QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

/** nearby and My events both list events, so every successful write refreshes the ones on screen */
function invalidateLists(client: QueryClient) {
	void client.invalidateQueries({ queryKey: eventKeys.nearbyRoot() })
	void client.invalidateQueries({ queryKey: eventKeys.myEventsRoot() })
}

export interface WriteVariables {
	submission: EventSubmission
	/** upload progress 0..1 (multipart only) */
	onProgress?: (fraction: number) => void
}

/**
 * A mounted mutation observer keeps its last variables, and `gcTime: 0` only collects a mutation
 * nobody observes. The variables of the write mutations can hold a passcode and the files being
 * uploaded, so a finished success is reset straight away: nothing sensitive stays in the mutation
 * cache after a save. A failed write keeps its variables only while the form is open for a retry;
 * they are dropped on the next attempt or when the form unmounts. Passcodes are also never placed
 * in a URL or in browser storage.
 */
function useScrubAfterSuccess(mutation: { isSuccess: boolean; reset: () => void }) {
	const { isSuccess, reset } = mutation
	useEffect(() => {
		if (isSuccess) reset()
	}, [isSuccess, reset])
}

export function useCreateEvent() {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const mutation = useMutation({
		mutationFn: ({ submission, onProgress }: WriteVariables) =>
			eventsApi.createEvent(submission, { onProgress }),
		gcTime: 0,
		onSuccess: (created) => {
			if (created) {
				client.setQueryData<EventDetails>(
					eventKeys.detail(accountId, sessionGeneration, created.id),
					created,
				)
			}
			invalidateLists(client)
		},
	})
	useScrubAfterSuccess(mutation)
	return mutation
}

export function useUpdateEvent(eventId: string) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const mutation = useMutation({
		mutationFn: ({ submission, onProgress }: WriteVariables) =>
			eventsApi.updateEvent(eventId, submission, { onProgress }),
		gcTime: 0,
		onSuccess: (updated) => {
			const key = eventKeys.detail(accountId, sessionGeneration, eventId)
			if (updated) client.setQueryData<EventDetails>(key, updated)
			// an unreadable 200 leaves the cache stale, so ask the server instead of guessing
			else void client.invalidateQueries({ queryKey: key })
			// links and documents are written only through this form, so the section must refetch
			void invalidateEventSubResources(client, accountId, sessionGeneration, eventId, ["resources"])
			invalidateLists(client)
		},
	})
	useScrubAfterSuccess(mutation)
	return mutation
}

/**
 * Deleting also drops the event's cached details and RSVP and refreshes the lists. A 404 means
 * it is already gone, so that cleanup runs for it too.
 */
export function useDeleteEvent(eventId: string) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)

	const forget = () => {
		client.removeQueries({ queryKey: eventKeys.detail(accountId, sessionGeneration, eventId) })
		client.removeQueries({ queryKey: eventKeys.rsvp(accountId, sessionGeneration, eventId) })
		removeEventSubResources(client, accountId, sessionGeneration, eventId)
		invalidateLists(client)
	}

	return useMutation({
		mutationFn: () => eventsApi.deleteEvent(eventId),
		gcTime: 0,
		onSuccess: forget,
		onError: (error) => {
			if (describeEventError(error).kind === "not_found") forget()
		},
	})
}
