import { showMutationErrorToast } from "@/lib/api-error"
import { socialsApi } from "@/lib/socials/api"
import {
	findEngagementEntityAnywhere,
	patchEngagementEverywhere,
} from "@/lib/socials/content-engagement"
import { contentKeys } from "@/lib/socials/query-keys"
import { CreateCommentPayload, CreateReplyPayload, SocialContent } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * Increments (or decrements, with a negative delta) `metrics.replies`
 * wherever `parentId` is cached — feed cards, its own detail page, and any
 * open direct-children list it appears in. Works identically whether
 * `parentId` is a post (top-level comment count) or a comment/reply
 * (its own direct-reply count) — same field, same function, per the
 * canonical model. Replaces the old feed-only `incrementCommentCount`
 * walker now that `patchEngagementEverywhere` already covers every cache a
 * count could live in.
 */
export function adjustReplyCount(
	qc: ReturnType<typeof useQueryClient>,
	parentId: string,
	delta: number,
) {
	const current = findEngagementEntityAnywhere(qc, parentId)
	const prev = current?.metrics.replies ?? 0
	patchEngagementEverywhere(qc, parentId, { metrics: { replies: Math.max(0, prev + delta) } })
}

/**
 * Prepends newly-created content under its direct parent's children list
 * and bumps that parent's reply count everywhere it's cached. Replaces
 * both `usePrependComment` (post → top-level comment) and `usePrependReply`
 * (comment/reply → nested reply) — they wrote into the same cache-key
 * shape already, just under different call signatures. One function now
 * covers both, and any further depth, since `contentChildrenKeys.direct`
 * doesn't care what kind the parent is. See
 * docs/social/social-content-migration-inspection.md S~10/S~11.
 */
export function usePrependContent() {
	const qc = useQueryClient()

	return (parentId: string, content: SocialContent) => {
		qc.setQueriesData<{
			pages: { data: { results: SocialContent[] } }[]
			pageParams: unknown[]
		}>({ queryKey: contentKeys.child(parentId) }, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page, i) =>
					i === 0
						? { ...page, data: { ...page.data, results: [content, ...page.data.results] } }
						: page,
				),
			}
		})

		adjustReplyCount(qc, parentId, 1)
	}
}

/**
 * One mutation for both top-level comments and replies — the payload's
 * shape (`post_id` vs `parent_id`) is what determines role and which
 * underlying endpoint wrapper is called; both hit the same backend write
 * path (migration doc S~8/S~16). Cache writes (prepend + count) happen at
 * the call site via `usePrependContent`, not here, matching the
 * pre-migration pattern where `useAddComment` and `usePrependComment` were
 * already separate, composed by the caller.
 */
export function useAddComment() {
	return useMutation({
		mutationFn: (payload: CreateCommentPayload | CreateReplyPayload) =>
			"post_id" in payload ? socialsApi.addComment(payload) : socialsApi.addReply(payload),

		onError: (error) => {
			showMutationErrorToast(error, "You can't reply to this.")
		},
	})
}
