"use client"

import { extractMessage } from "@/lib/api-error"
import { statusKeys } from "@/lib/messenger/query-keys"
import { isStatusActive } from "@/lib/messenger/status"
import { statusApi } from "@/lib/messenger/status-api"
import { toast } from "@/lib/toast"
import type { CreateStatusPayload, StatusCollection, UpdateStatusPayload } from "@/types/messenger"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

/** Deliberately a single generous-limit fetch, not true infinite scroll —
 * status volumes per contact list are small. Swapping to useInfiniteQuery
 * later only touches this hook, not any consumer. */
export function useStatusFeed() {
	return useQuery({
		queryKey: statusKeys.feed(),
		queryFn: () => statusApi.list(1, 50),
		select: (data) => ({ ...data, results: data.results.filter(isStatusActive) }),
		staleTime: 30_000,
	})
}

export function useMyStatuses() {
	return useQuery({
		queryKey: statusKeys.mine(),
		queryFn: () => statusApi.mine(),
		select: (data) => ({ ...data, results: data.results.filter(isStatusActive) }),
		staleTime: 30_000,
	})
}

export function useUserStatuses(userPkid: number | undefined) {
	return useQuery({
		queryKey: statusKeys.byUser(userPkid ?? 0),
		queryFn: () => statusApi.byUser(userPkid as number),
		enabled: userPkid != null,
		select: (data) => ({ ...data, results: data.results.filter(isStatusActive) }),
	})
}

export function useStatusViewers(statusId: number | undefined, enabled = true) {
	return useQuery({
		queryKey: statusKeys.viewers(statusId ?? 0),
		queryFn: () => statusApi.viewers(statusId as number),
		enabled: statusId != null && enabled,
	})
}

export function useCreateStatus() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: CreateStatusPayload) => statusApi.create(payload),
		onSuccess: () => {
			toast.success("Status posted")
			queryClient.invalidateQueries({ queryKey: statusKeys.all })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to post status")),
	})
}

export function useUpdateStatus() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, payload }: { id: number; payload: UpdateStatusPayload }) =>
			statusApi.update(id, payload),
		onSuccess: () => {
			toast.success("Status updated")
			queryClient.invalidateQueries({ queryKey: statusKeys.all })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to update status")),
	})
}

/** Deliberately silent on error — a failed view-ack shouldn't interrupt
 * someone watching a status, matches mobile. */
export function useMarkStatusViewed() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (statusId: number) => statusApi.markViewed(statusId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: statusKeys.all }),
	})
}

export function useReshareStatus() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ statusId, durationHours = 24 }: { statusId: number; durationHours?: number }) =>
			statusApi.reshare(statusId, durationHours),
		onSuccess: () => {
			toast.success("Status reshared")
			queryClient.invalidateQueries({ queryKey: statusKeys.all })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to reshare status")),
	})
}

export function useDeleteStatus() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (statusId: number) => statusApi.delete(statusId),
		onMutate: async (statusId) => {
			await queryClient.cancelQueries({ queryKey: statusKeys.mine() })
			const prev = queryClient.getQueryData<StatusCollection>(statusKeys.mine())
			queryClient.setQueryData<StatusCollection>(statusKeys.mine(), (old) =>
				old ? { ...old, results: old.results.filter((s) => s.id !== statusId) } : old,
			)
			return { prev }
		},
		onError: (err, _id, ctx) => {
			if (ctx?.prev) queryClient.setQueryData(statusKeys.mine(), ctx.prev)
			toast.error(extractMessage(err, "Failed to delete status"))
		},
		onSuccess: () => toast.success("Status deleted"),
		onSettled: () => queryClient.invalidateQueries({ queryKey: statusKeys.all }),
	})
}
