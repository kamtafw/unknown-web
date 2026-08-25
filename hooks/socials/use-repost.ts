import { showMutationErrorToast } from "@/lib/api-error"
import { socialsApi } from "@/lib/socials/api"
import {
	findEngagementEntityAnywhere,
	patchEngagementEverywhere,
	SocialContentPatch,
} from "@/lib/socials/content-engagement"
import { PENDING_REPOST_ID_PREFIX, toStandaloneContent } from "@/lib/socials/content-resolvers"
import { contentKeys, FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/api"
import { RepostPayload, SocialContent, SocialContentUser } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"

function fullUserToContentUser(user: FullUser): SocialContentUser {
	return {
		id: user.id,
		pkid: user.pkid,
		first_name: user.first_name ?? "",
		last_name: user.last_name ?? "",
		username: user.username,
		profile_photo: user.profile_photo ?? null,
	}
}

function prependToFeed(old: FeedCache | undefined, post: SocialContent): FeedCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page, i) => (i === 0 ? { ...page, posts: [post, ...page.posts] } : page)),
	}
}

/** remove a post by id (used to evict the temp post before the real one arrives) */
function removeFromFeed(old: FeedCache | undefined, id: string): FeedCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({ ...page, posts: page.posts.filter((p) => p.id !== id) })),
	}
}

/** Building the optimistic repost card is far simpler than before —
 * `original` is now the exact same SocialContent shape as `originalPost`,
 * so it's nested directly instead of hand-picking a subset of fields into
 * a separate OriginalPost shape (migration doc §6/§12). */
function buildOptimisticPost(
	payload: RepostPayload,
	originalPost: SocialContent,
	user: FullUser,
): SocialContent {
	const now = new Date().toISOString()

	return {
		id: `temp-${crypto.randomUUID()}`,
		kind: "post",
		post_id: null,
		parent_id: null,
		user: fullUserToContentUser(user),
		message: payload.content ?? "",
		media: [],
		location: payload.location
			? {
					latitude: Number(payload.location.latitude),
					longitude: Number(payload.location.longitude),
					address: "",
				}
			: null,
		hashtags: payload.hashtags ?? [],
		metrics: { likes: 0, replies: 0, reposts: 0, reactions: 0, shares: 0, bookmarks: 0, views: 0 },
		viewer: { liked: false, reposted: false, bookmarked: false, shared: false },
		permissions: {
			visibility: payload.who_can_see ?? "EVERYONE",
			reply_policy: payload.who_can_reply ?? "EVERYONE",
			can_view: true,
			can_reply: true,
		},
		flags: { pinned: false, repost: true, shared: false },
		original: originalPost,
		my_repost_id: null,
		created_at: now,
		updated_at: now,
	}
}

export function useRepost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: RepostPayload) => socialsApi.repost(payload),

		onMutate: async (payload) => {
			await Promise.all(feedKeys.engagement().map((key) => qc.cancelQueries({ queryKey: key })))
			await qc.cancelQueries({ queryKey: contentKeys.details() })

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				following: qc.getQueryData<FeedCache>(feedKeys.following()),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks()),
				tempId: null as string | null,
			}

			// 1. bump reposts count wherever the original appears — feed cards,
			// nested inside bare reposts, or its own open detail page
			const current = findEngagementEntityAnywhere(qc, payload.original_post)
			const prevRepostCount = current?.metrics.reposts ?? 0
			const prevReposted = current?.viewer.reposted ?? false
			const prevMyRepostId = current?.my_repost_id ?? null
			const isUnquoted = !payload.content?.trim()

			const patch: SocialContentPatch = {
				metrics: { reposts: prevRepostCount + 1 },
				viewer: { reposted: true },
			}
			if (isUnquoted) patch.my_repost_id = `${PENDING_REPOST_ID_PREFIX}${Date.now()}`
			patchEngagementEverywhere(qc, payload.original_post, patch)

			// 2. prepend a fake repost card to the For You feed
			const user = useAuthStore.getState().user
			const originalPost = current ? toStandaloneContent(current) : undefined

			if (user && originalPost) {
				const optimistic = buildOptimisticPost(payload, originalPost, user)
				snapshots.tempId = optimistic.id
				qc.setQueryData<FeedCache>(feedKeys.forYou(), (old) => prependToFeed(old, optimistic))
			}

			return {
				...snapshots,
				revert: {
					id: payload.original_post,
					repostCount: prevRepostCount,
					reposted: prevReposted,
					myRepostId: prevMyRepostId,
				},
			}
		},

		onError: (error, _vars, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou(), ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following(), ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks(), ctx.bookmarks)
			if (ctx?.revert) {
				patchEngagementEverywhere(qc, ctx.revert.id, {
					metrics: { reposts: ctx.revert.repostCount },
					viewer: { reposted: ctx.revert.reposted },
					my_repost_id: ctx.revert.myRepostId,
				})
			}
			showMutationErrorToast(error, "Failed to repost. Please try again.")
		},

		onSuccess: (data, vars, ctx) => {
			// remove optimistic post then invalidate to bring the real post from
			// the server at its correct position
			if (ctx.tempId) {
				qc.setQueryData<FeedCache>(feedKeys.forYou(), (old) => removeFromFeed(old, ctx.tempId!))
			}

			if (!vars.content?.trim()) {
				// `repost_id` is the flat, contract-documented field — the previous
				// `original_post.reposts?.[0]?.id` path assumed an unverified nested
				// shape and threw when `original_post` wasn't present, silently
				// aborting this handler before invalidateQueries below ever ran.
				const realId = data.data.repost_id
				if (realId != null) {
					patchEngagementEverywhere(qc, vars.original_post, {
						my_repost_id: realId,
						viewer: { reposted: true },
					})
				}
			}
			qc.invalidateQueries({ queryKey: feedKeys.forYou() })
		},
	})
}

// NOTE: repost-undo is NOT a separate hook here — the pre-migration
// ActionBar reused useDeletePost (deleting a repost IS deleting the Post
// object it created) rather than a dedicated undo hook. Confirmed by
// reading the actual call site before adding one; see use-post-actions.ts's
// useDeletePost, which already accepts an `originalPost` param for exactly
// this case.
