import { showMutationErrorToast } from "@/lib/api-error"
import { socialsApi } from "@/lib/socials/api"
import {
	findEngagementEntityAnywhere,
	patchEngagementEverywhere,
} from "@/lib/socials/content-engagement"
import { feedKeys } from "@/lib/socials/query-keys"
import { RepostCommentPayload } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

// Migrated off the old comment-only findComment/patchCommentEverywhere
// (lib/comment-engagement.ts, removed) onto the unified
// findEngagementEntityAnywhere/patchEngagementEverywhere
// (lib/socials/content-engagement.ts) — same functions useLikePost/useRepost
// now use, since a comment or reply is no longer a structurally different
// object from a post. See docs/social/social-content-migration-inspection.md
// S~14/S~16 risk item 6.

export function useLikeComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (id: string) => socialsApi.likeComment({ comment: id }),

		onMutate: (id) => {
			const current = findEngagementEntityAnywhere(qc, id)
			const wasLiked = current?.viewer.liked ?? false
			const prevCount = current?.metrics.likes ?? 0

			patchEngagementEverywhere(qc, id, {
				viewer: { liked: !wasLiked },
				metrics: { likes: Math.max(0, prevCount + (wasLiked ? -1 : 1)) },
			})

			return { id, wasLiked, prevCount }
		},

		onError: (error, _id, ctx) => {
			if (ctx) {
				patchEngagementEverywhere(qc, ctx.id, {
					viewer: { liked: ctx.wasLiked },
					metrics: { likes: ctx.prevCount },
				})
			}
			showMutationErrorToast(error, "Failed to like comment. Please try again.")
		},
	})
}

export function useRepostComment() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: RepostCommentPayload) => socialsApi.repostComment(payload),

		onMutate: (payload) => {
			const current = findEngagementEntityAnywhere(qc, payload.original_comment)
			const prevCount = current?.metrics.reposts ?? 0
			const prevReposted = current?.viewer.reposted ?? false

			patchEngagementEverywhere(qc, payload.original_comment, {
				metrics: { reposts: prevCount + 1 },
				viewer: { reposted: true },
			})

			return { id: payload.original_comment, prevCount, prevReposted }
		},

		onSuccess: () => {
			// reposting a comment/reply creates a real feed-level SocialContent
			// (kind: "post", original.kind: "comment" | "reply"), so the For You
			// feed needs to pick it up. Note: reposting a reply specifically is
			// untested against a live backend — first real exercise of this path,
			// per migration doc §16 risk item 11.
			qc.invalidateQueries({ queryKey: feedKeys.forYou() })
		},

		onError: (error, _payload, ctx) => {
			if (ctx) {
				patchEngagementEverywhere(qc, ctx.id, {
					metrics: { reposts: ctx.prevCount },
					viewer: { reposted: ctx.prevReposted },
				})
			}
			showMutationErrorToast(error, "Failed to repost comment. Please try again.")
		},
	})
}
