import { socialApi } from "@/lib/api"
import { showMutationErrorToast } from "@/lib/api-error"
import { findEngagementEntityAnywhere, patchEngagementEverywhere } from "@/lib/post-engagement"
import { toStandalonePost } from "@/lib/post-helpers"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser, Post, PostUser, RepostPayload } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

function fullUserToPostUser(user: FullUser): PostUser {
	return {
		pkid: user.pkid,
		id: user.id,
		first_name: user.first_name ?? "",
		last_name: user.last_name ?? "",
		email: user.email,
		username: user.username,
		phone_number: user.phone_number,
		profile_photo: user.profile_photo ?? null,
	}
}

function prependToFeed(old: FeedCache | undefined, post: Post): FeedCache | undefined {
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

function removeRepostCardFromFeeds(qc: ReturnType<typeof useQueryClient>, repostPkid: number) {
	const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
	feedKeys_.forEach((key) => {
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.filter((p) => p.pkid !== repostPkid),
				})),
			}
		})
	})
}

function buildOptimisticPost(payload: RepostPayload, originalPost: Post, user: FullUser): Post {
	return {
		pkid: -Date.now(),
		id: `temp-${crypto.randomUUID()}`,
		user: fullUserToPostUser(user),
		content_text: payload.content_text ?? "",
		is_shared: null,
		is_repost: true,
		is_pinned: null,
		reposted_object_type: "Post",
		original_post: {
			id: originalPost.id,
			pkid: originalPost.pkid,
			content_text: originalPost.content_text,
			user: originalPost.user,
			post_location: originalPost.post_location,
			post_media: originalPost.post_media,
			post_hashtagged: originalPost.post_hashtagged,
			created_at: originalPost.created_at,
		},
		bookmarked_by_me: false,
		liked_by_me: false,
		reposted_by_me: false,
		my_repost_pkid: null,
		who_can_see: "EVERYONE",
		who_can_reply: payload.who_can_reply ?? "EVERYONE",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		post_location: payload.location
			? [
					{
						longitude: payload.location.longitude,
						latitude: payload.location.latitude,
						address: "",
					},
				]
			: [],
		post_media: [],
		post_like_count: 0,
		post_comment_count: 0,
		repost_count: 0,
		post_hashtagged: payload.hashtags ?? [],
	}
}

export function useRepost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: RepostPayload) => socialApi.repost(payload),

		onMutate: async (payload) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))
			await qc.cancelQueries({ queryKey: ["post", "detail"] })

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
				tempId: null as string | null,
			}

			// 1. bump repost_count wherever the original appears — feed cards,
			// nested inside bare reposts, or its own open detail page
			const current = findEngagementEntityAnywhere(qc, { id: payload.original_post })
			const prevRepostCount = current?.repost_count ?? 0
			const prevRepostedByMe = current?.reposted_by_me ?? false

			patchEngagementEverywhere(qc, payload.original_post, {
				repost_count: prevRepostCount + 1,
				reposted_by_me: true,
			})

			// 2. prepend a fake repost card to the For You feed
			const user = useAuthStore.getState().user
			const originalPost = current ? toStandalonePost(current) : undefined

			if (user && originalPost) {
				const optimistic = buildOptimisticPost(payload, originalPost, user)
				snapshots.tempId = optimistic.id
				qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => prependToFeed(old, optimistic))
			}

			return {
				...snapshots,
				revert: {
					id: payload.original_post,
					repostCount: prevRepostCount,
					repostedByMe: prevRepostedByMe,
				},
			}
		},

		onError: (error, _vars, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following, ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarks)
			if (ctx?.revert) {
				patchEngagementEverywhere(qc, ctx.revert.id, {
					repost_count: ctx.revert.repostCount,
					reposted_by_me: ctx.revert.repostedByMe,
				})
			}
			showMutationErrorToast(error, "Failed to repost. Please try again.")
		},

		onSuccess: (_data, _vars, ctx) => {
			// remove optimistic post the invalidate to bring post from server at correct position
			if (ctx.tempId) {
				qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => removeFromFeed(old, ctx.tempId!))
			}
			qc.invalidateQueries({ queryKey: feedKeys.forYou })
		},
	})
}

interface UndoRepostVars {
	originalPostId: string
	repostPkid: number
}

export function useUndoRepost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ repostPkid }: UndoRepostVars) => socialApi.deletePost(repostPkid),

		onMutate: async ({ originalPostId, repostPkid }) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
			}

			const current = findEngagementEntityAnywhere(qc, { id: originalPostId })
			const prevRepostCount = current?.repost_count ?? 0

			patchEngagementEverywhere(qc, originalPostId, {
				repost_count: Math.max(0, prevRepostCount - 1),
				reposted_by_me: false,
				my_repost_pkid: null,
			})

			removeRepostCardFromFeeds(qc, repostPkid)

			return {
				...snapshots,
				revert: { id: originalPostId, repostCount: prevRepostCount, repostPkid },
			}
		},

		onSuccess: () => {
			toast.success("Repost undone")
		},

		onError: (error, _vars, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following, ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarks)
			if (ctx?.revert) {
				patchEngagementEverywhere(qc, ctx.revert.id, {
					repost_count: ctx.revert.repostCount,
					reposted_by_me: true,
					my_repost_pkid: ctx.revert.repostPkid,
				})
			}
			showMutationErrorToast(error, "Failed to undo repost. Please try again.")
		},
	})
}
