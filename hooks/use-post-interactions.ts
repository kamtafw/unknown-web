import { socialApi, userApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
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

export function useNotInterested() {
	const markNotInterested = usePostInteractionsStore((s) => s.markNotInterested)
	const unmarkNotInterested = usePostInteractionsStore((s) => s.unmarkNotInterested)

	return useMutation({
		mutationFn: (postId: string) => socialApi.notInterested({ post: postId }),
		onMutate: (postId) => markNotInterested(postId),
		onError: (error, postId) => {
			unmarkNotInterested(postId)
			showMutationErrorToast(error, "Couldn't process that. Please try again.")
		},
	})
}

export function useRequestCommunityNote() {
	return useMutation({
		mutationFn: (payload: { post: string; reason?: string }) =>
			socialApi.requestCommunityNote(payload),
		onError: (error) => {
			showMutationErrorToast(error, "Couldn't submit your request. Please try again.")
		},
	})
}

export function useMuteUser() {
	const setMuted = usePostInteractionsStore((s) => s.setMuted)

	return useMutation({
		mutationFn: (pkid: number) => userApi.muteUser({ muted_user: pkid }),
		onMutate: (pkid) => setMuted(pkid, true),
		onSuccess: (data) => {
			if (data.success) toast.success("Account muted — you won't see their posts anymore.")
		},
		onError: (error, pkid) => {
			setMuted(pkid, false)
			showMutationErrorToast(error, "Failed to mute. Please try again.")
		},
	})
}

export function useUnmuteUser() {
	const setMuted = usePostInteractionsStore((s) => s.setMuted)

	return useMutation({
		mutationFn: (pkid: number) => userApi.unmuteUser(pkid),
		onMutate: (pkid) => setMuted(pkid, false),
		onSuccess: (data) => {
			if (data.success) toast.success("Account unmuted")
		},
		onError: (error, pkid) => {
			setMuted(pkid, true)
			showMutationErrorToast(error, "Failed to unmute. Please try again.")
		},
	})
}

export function useBlockUser() {
	const qc = useQueryClient()
	const setBlocked = usePostInteractionsStore((s) => s.setBlocked)

	return useMutation({
		mutationFn: (payload: { pkid: number; reason?: string }) =>
			userApi.blockUser({ blocked_user: payload.pkid, reason: payload.reason }),
		onMutate: ({ pkid }) => setBlocked(pkid, true),
		onSuccess: (data, { pkid }) => {
			if (!data.success) return
			removeUserPostsFromFeeds(qc, pkid)
			toast.success("Account blocked")
		},
		onError: (error, { pkid }) => {
			setBlocked(pkid, false)
			showMutationErrorToast(error, "Failed to block. Please try again.")
		},
	})
}
