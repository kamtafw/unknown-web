"use client"

import { extractMessage } from "@/lib/api-error"
import { scheduleApi } from "@/lib/messenger/api"
import { scheduleKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { CreateMessageSchedulePayload } from "@/types/messenger"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSchedules() {
	return useQuery({ queryKey: scheduleKeys.list(), queryFn: () => scheduleApi.list() })
}

export function useSchedule(scheduleId: number | null) {
	return useQuery({
		queryKey: scheduleKeys.detail(scheduleId ?? 0),
		queryFn: () => scheduleApi.get(scheduleId as number),
		enabled: !!scheduleId,
	})
}

export function useCreateSchedule() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: CreateMessageSchedulePayload) => scheduleApi.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list() })
			toast.success("Message scheduled")
		},
		onError: (err) => toast.error(extractMessage(err, "Couldn't schedule the message — try again")),
	})
}

export function useUpdateSchedule() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({
			scheduleId,
			payload,
		}: {
			scheduleId: number
			payload: Partial<CreateMessageSchedulePayload>
		}) => scheduleApi.update(scheduleId, payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.scheduleId) })
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list() })
			toast.success("Schedule updated")
		},
		onError: (err) => toast.error(extractMessage(err, "Couldn't update the schedule — try again")),
	})
}

export function useDeleteSchedule() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (scheduleId: number) => scheduleApi.delete(scheduleId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list() })
			toast.success("Schedule deleted")
		},
		onError: (err) => toast.error(extractMessage(err, "Couldn't delete the schedule — try again")),
	})
}
