import { userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { usePostInteractionsStore } from "@/stores/post-interactions-store"
import { BlockedUsersResponse, Post } from "@/types/api"
import { InfiniteData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"

export const blockedUsersKey = ["users", "blocked"] as const

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

function removeUserPostsFromFeeds(qc: ReturnType<typeof useQueryClient>, authorPkid: number) {
	const keys = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
	keys.forEach((key) =>
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.filter((p) => p.user.pkid !== authorPkid),
				})),
			}
		}),
	)
}

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

export function useBlockUser() {
	const qc = useQueryClient()
	const setBlocked = usePostInteractionsStore((s) => s.setBlocked)

	return useMutation({
		mutationFn: (pkid: number) => userApi.blockUser({ user_id: pkid }),
		onMutate: (pkid) => setBlocked(pkid, true),
		onSuccess: (data, pkid) => {
			if (!data.success) return
			removeUserPostsFromFeeds(qc, pkid)
			toast.success("Account blocked")
		},
		onError: (error, pkid) => {
			setBlocked(pkid, false)
			showMutationErrorToast(error, "Failed to block. Please try again.")
		},
	})
}
