"use client"

import { eventsApi } from "@/lib/events/api"
import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRef } from "react"

export type LiveSessionLifecycleAction = "create" | "start" | "end"

function safeErrorMessage(error: unknown, action: LiveSessionLifecycleAction): string {
	const response = (error as { response?: { data?: { message?: unknown; code?: unknown } } } | null)
		?.response
	const code = response?.data?.code
	const message = response?.data?.message
	if (code === "media_service_unavailable" || code === "media_provisioning") {
		return "The live media service is unavailable. The session was not started."
	}
	if (typeof message === "string" && /only event hosts|host authorization/i.test(message)) {
		return "Only an event host can manage this live session."
	}
	if (action === "create") return "We couldn't create the live session. Please try again."
	if (action === "end") return "We couldn't end the live session. Check its status and try again."
	return "We couldn't start the live session. Check its status and try again."
}

/**
 * Host-only lifecycle mutations. The backend is authoritative for role and transition validity.
 * We never optimistically change event/session state, and we invalidate only the current account's
 * event detail, live-session read and list entries after a confirmed success.
 */
export function useEventLiveSessionControls(eventId: string) {
	const client = useQueryClient()
	const accountId = useAuthStore((s) => s.user?.pkid ?? null)
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const inFlight = useRef(false)

	const mutation = useMutation({
		mutationFn: async (action: LiveSessionLifecycleAction) => {
			if (action === "create") return eventsApi.createEventLiveSession(eventId)
			if (action === "start") return eventsApi.startEventLiveSession(eventId)
			return eventsApi.endEventLiveSession(eventId)
		},
		gcTime: 0,
		onSuccess: async () => {
			if (accountId === null) return
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
			])
		},
	})

	async function run(action: LiveSessionLifecycleAction): Promise<boolean> {
		if (inFlight.current) return false
		inFlight.current = true
		try {
			await mutation.mutateAsync(action)
			mutation.reset()
			return true
		} catch {
			return false
		} finally {
			inFlight.current = false
		}
	}

	return {
		create: () => run("create"),
		start: () => run("start"),
		end: () => run("end"),
		isPending: mutation.isPending,
		errorMessage: mutation.isError
			? safeErrorMessage(mutation.error, mutation.variables ?? "create")
			: null,
		clearError: mutation.reset,
	}
}
