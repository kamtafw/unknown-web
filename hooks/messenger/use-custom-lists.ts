"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useCustomLists() {
	return useQuery({
		queryKey: chatKeys.customLists(),
		queryFn: () => chatApi.listCustomLists(),
		staleTime: 60_000,
	})
}

export function useCreateCustomList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ name, userPkids }: { name: string; userPkids?: number[] }) =>
			chatApi.createCustomList(name, userPkids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: chatKeys.customLists() })
		},
		onError: () => toast.error("Couldn't create the list — try again"),
	})
}

export function useAddToCustomList() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ listId, userPkids }: { listId: number; userPkids: number[] }) =>
			chatApi.addToCustomList(listId, userPkids),
		onSuccess: (_data, { listId }) => {
			queryClient.invalidateQueries({ queryKey: chatKeys.customListMembers(listId) })
		},
		onError: () => toast.error("Couldn't add to the list — try again"),
	})
}
