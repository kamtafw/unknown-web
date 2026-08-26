import { userApi } from "@/lib/api"
import { extractNonFieldError } from "@/lib/api-error"
import { FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { toast } from "@/lib/toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { patchAuthorFlagInFeeds } from "./use-follow-actions"

function removeUserPostsFromFeeds(qc: ReturnType<typeof useQueryClient>, authorPkid: number) {
	feedKeys.engagement().forEach((key) =>
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

	return useMutation({
		mutationFn: (pkid: number) => userApi.muteUser({ muted_user: pkid }),
		onMutate: (pkid) => patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: true }),
		onSuccess: (data, pkid) => {
			if (data.success) {
				removeUserPostsFromFeeds(qc, pkid)
				toast.success(data.message ?? "Account muted")
			} else {
				patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: false })
				toast.error(data.message ?? "Failed to mute. Please try again.")
			}
		},
		onError: (error, pkid) => {
			patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: false })
			toast.error(extractNonFieldError(error, "Failed to mute. Please try again."))
		},
	})
}

export function useUnmuteUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (pkid: number) => userApi.unmuteUser({ muted_user: pkid }),
		onMutate: (pkid) => patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: false }),
		onSuccess: (data, pkid) => {
			if (data.success) {
				toast.success(data.message ?? "Account unmuted")
			} else {
				patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: true })
				toast.error(data.message ?? "Failed to unmute. Please try again.")
			}
		},
		onError: (error, pkid) => {
			patchAuthorFlagInFeeds(qc, pkid, { youMutedThisUser: true })
			toast.error(extractNonFieldError(error, "Failed to unmute. Please try again."))
		},
	})
}
