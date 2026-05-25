import { FullUser, Post, PostUser, RepostPayload } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"

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

function findPostInFeeds(qc: ReturnType<typeof useQueryClient>, id: string): Post | undefined {
	for (const key of [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]) {
		const hit = qc
			.getQueryData<FeedCache>(key)
			?.pages.flatMap((p) => p.posts)
			.find((p) => p.id === id)

		if (hit) return hit
	}
}

function patchRepostCount(
	old: FeedCache | undefined,
	id: string,
	delta: 1 | -1,
): FeedCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.posts.map((p) =>
				p.id === id
					? { ...p, repost_count: Math.max(0, p.repost_count + delta), reposted_by_me: delta > 0 }
					: p,
			),
		})),
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
		who_can_see: "EVERYONE",
		who_can_reply: payload.who_can_reply ?? "EVERYONE",
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		post_location: payload.location
			? [
					{
						pkid: 0,
						id: "",
						longitude: payload.location.longitude,
						latitude: payload.location.latitude,
						address: "",
						created_at: "",
					},
				]
			: [],
		post_media: [],
		post_like_count: 0,
		post_comment_count: 0,
		repost_count: 0,
		post_hashtagged: payload.hashtags ?? [],
		post_reaction: [],
		post_bookmarked: [],
		post_comment: [],
		post_liked: [],
		reposts: [],
	}
}

export function useRepost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: RepostPayload) => socialApi.repost(payload),

		onMutate: async (payload) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				following: qc.getQueryData<FeedCache>(feedKeys.following),
				bookmarks: qc.getQueryData<FeedCache>(feedKeys.bookmarks),
				tempId: null as string | null,
			}

			// 1. increment repost_count on the original post in all caches
			const patch = (old: FeedCache | undefined) => patchRepostCount(old, payload.original_post, 1)
			qc.setQueryData(feedKeys.forYou, patch)
			qc.setQueryData(feedKeys.following, patch)
			qc.setQueryData(feedKeys.bookmarks, patch)

			// 2. prepend a fake repost card to the For You feed
			const user = useAuthStore.getState().user
			const originalPost = findPostInFeeds(qc, payload.original_post)

			if (user && originalPost) {
				const optimistic = buildOptimisticPost(payload, originalPost, user)
				snapshots.tempId = optimistic.id
				qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => prependToFeed(old, optimistic))
			}

			return snapshots
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou, ctx.forYou)
			if (ctx?.following) qc.setQueryData<FeedCache>(feedKeys.following, ctx.following)
			if (ctx?.bookmarks) qc.setQueryData<FeedCache>(feedKeys.bookmarks, ctx.bookmarks)
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
