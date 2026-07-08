import { userApi } from "@/lib/api"
import { extractNonFieldError } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { usePostInteractionsStore } from "@/stores/post-interactions-store"
import { Post } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"

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

export function useMuteUser() {
	const qc = useQueryClient()
	const setMuted = usePostInteractionsStore((s) => s.setMuted)

	return useMutation({
		mutationFn: (pkid: number) => userApi.muteUser({ muted_user: pkid }),
		onMutate: (pkid) => setMuted(pkid, true),
		onSuccess: (data, pkid) => {
			if (data.success) {
				removeUserPostsFromFeeds(qc, pkid)
				toast.success(data.message ?? "Account muted")
			} else {
				setMuted(pkid, false)
				toast.error(data.message ?? "Failed to mute. Please try again.")
			}
		},
		onError: (error, pkid) => {
			setMuted(pkid, false)
			toast.error(extractNonFieldError(error, "Failed to mute. Please try again."))
		},
	})
}

export function useUnmuteUser() {
	const setMuted = usePostInteractionsStore((s) => s.setMuted)

	return useMutation({
		mutationFn: (pkid: number) => userApi.unmuteUser({ muted_user: pkid }),
		onMutate: (pkid) => setMuted(pkid, false),
		onSuccess: (data, pkid) => {
			if (data.success) toast.success(data.message ?? "Account unmuted")
			else {
				setMuted(pkid, true)
				toast.error(data.message ?? "Failed to unmute. Please try again.")
			}
		},
		onError: (error, pkid) => {
			setMuted(pkid, true)
			toast.error(extractNonFieldError(error, "Failed to unmute. Please try again."))
		},
	})
}
