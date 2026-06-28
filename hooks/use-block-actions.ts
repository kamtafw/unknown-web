import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { BlockedUsersResponse } from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const blockedUsersKey = ["users", "blocked"] as const

export function useBlockedUsers() {
	return useQuery({
		queryKey: blockedUsersKey,
		queryFn: userApi.getBlockedUsers,
		staleTime: 1000 * 60 * 2,
	})
}

export function useUnblockUsers() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (userIds: number[]) => userApi.unblockUsers(userIds),

		onSuccess: (data, userIds) => {
			if (!data.success) return

			qc.setQueryData<BlockedUsersResponse>(blockedUsersKey, (old) => {
				if (!old?.data?.results) return old
				const remaining = old.data.results.filter((u) => !userIds.includes(u.pkid))
				return {
					...old,
					data: {
						...old.data,
						count: remaining.length,
						results: remaining,
					},
				}
			})

			toast.success(data.message ?? `${userIds.length} user(s) unblocked`)
		},

		onError: (error) => {
			showMutationErrorToast(error, "Failed to unblock. Please try again.")
		},
	})
}
