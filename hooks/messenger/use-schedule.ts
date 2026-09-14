"use client"

import { extractMessage } from "@/lib/api-error"
import { scheduleApi } from "@/lib/messenger/api"
import { scheduleKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { CreateSchedulePayload, ScheduleType, UpdateSchedulePayload } from "@/types/messenger"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSchedules(type: ScheduleType) {
	return useQuery({ queryKey: scheduleKeys.list(type), queryFn: () => scheduleApi.list(type) })
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
		mutationFn: (payload: CreateSchedulePayload) => scheduleApi.create(payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list(variables.schedule_type) })
			toast.success(
				variables.schedule_type === "reminder" ? "Reminder created" : "Message scheduled",
			)
		},
		onError: (err, variables) =>
			toast.error(
				extractMessage(
					err,
					variables.schedule_type === "reminder"
						? "Couldn't create the reminder — try again"
						: "Couldn't schedule the message — try again",
				),
			),
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
			type: ScheduleType
			payload: UpdateSchedulePayload
		}) => scheduleApi.update(scheduleId, payload),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.detail(variables.scheduleId) })
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list(variables.type) })
			toast.success(variables.type === "reminder" ? "Reminder updated" : "Schedule updated")
		},
		onError: (err) => toast.error(extractMessage(err, "Couldn't save your changes — try again")),
	})
}

/**
 * The backend describes this endpoint as cancelling the schedule (its own
 * doc: "Schedule cancelled."), not deleting a record — the toast and any
 * confirmation copy calling into this hook should talk about cancelling,
 * even though the HTTP verb is DELETE.
 */
export function useDeleteSchedule() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ scheduleId }: { scheduleId: number; type: ScheduleType }) =>
			scheduleApi.delete(scheduleId),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({ queryKey: scheduleKeys.list(variables.type) })
			toast.success(variables.type === "reminder" ? "Reminder cancelled" : "Schedule cancelled")
		},
		onError: (err) => toast.error(extractMessage(err, "Couldn't cancel — try again")),
	})
}
