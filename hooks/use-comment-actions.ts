import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { findComment, patchCommentEverywhere } from "@/lib/comment-engagement"
import { RepostCommentPayload } from "@/types/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"

export function useLikeComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialApi.likeComment({ comment: id }),

		onMutate: (id) => {
			const current = findComment(qc, id)
			const wasLiked = current?.liked_by_me ?? false
			const prevCount = current?.like_count ?? 0

			patchCommentEverywhere(qc, id, {
				liked_by_me: !wasLiked,
				like_count: Math.max(0, prevCount + (wasLiked ? -1 : 1)),
			})

			return { id, wasLiked, prevCount }
		},

		onError: (error, _id, ctx) => {
			if (ctx) {
				patchCommentEverywhere(qc, ctx.id, { liked_by_me: ctx.wasLiked, like_count: ctx.prevCount })
			}
			showMutationErrorToast(error, "Failed to like comment. Please try again.")
		},
	})
}

export function useRepostComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: RepostCommentPayload) => socialApi.repostComment(payload),

		onMutate: (payload) => {
			const current = findComment(qc, payload.original_comment)
			const prevCount = current?.repost_count ?? 0
			const prevReposted = current?.reposted_by_me ?? false

			patchCommentEverywhere(qc, payload.original_comment, {
				repost_count: prevCount + 1,
				reposted_by_me: true,
			})

			return { id: payload.original_comment, prevCount, prevReposted }
		},

		onSuccess: () => {
			// a comment repost creates a real feed Post (reposted_object_type: "Comment"),
			// so the For You feed needs to pick it up
			qc.invalidateQueries({ queryKey: feedKeys.forYou })
		},

		onError: (error, _payload, ctx) => {
			if (ctx) {
				patchCommentEverywhere(qc, ctx.id, {
					repost_count: ctx.prevCount,
					reposted_by_me: ctx.prevReposted,
				})
			}
			showMutationErrorToast(error, "Failed to repost comment. Please try again.")
		},
	})
}
