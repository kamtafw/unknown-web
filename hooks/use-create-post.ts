import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { CreatePostPayload, FullUser, Post, PostUser } from "@/types/api"
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

function buildOptimisticPost(payload: CreatePostPayload, user: FullUser): Post {
	return {
		pkid: -Date.now(),
		id: `temp-${crypto.randomUUID()}`,
		user: fullUserToPostUser(user),
		content_text: payload.content_text ?? "",
		is_shared: payload.is_shared,
		is_repost: false,
		is_pinned: false,
		reposted_object_type: null,
		original_post: null,
		bookmarked_by_me: false,
		liked_by_me: false,
		reposted_by_me: false,
		who_can_see: payload.who_can_see,
		who_can_reply: payload.who_can_reply,
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
		post_media: payload.media_urls?.map((url) => ({ external_url: url })) ?? [],
		post_like_count: 0,
		post_comment_count: 0,
		repost_count: 0,
		post_hashtagged: payload.hashtags ?? [],
	}
}
export function useCreatePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: CreatePostPayload) => socialApi.createPost(payload),

		onMutate: async (payload) => {
			const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]
			await Promise.all(feedKeys_.map((k) => qc.cancelQueries({ queryKey: k })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou),
				tempId: null as string | null,
			}

			const user = useAuthStore.getState().user

			if (user) {
				const optimistic = buildOptimisticPost(payload, user)
				snapshots.tempId = optimistic.id
				qc.setQueryData<FeedCache>(feedKeys.forYou, (old) => prependToFeed(old, optimistic))
			}

			return snapshots
		},

		onSuccess: () => {
			qc.invalidateQueries({ queryKey: feedKeys.forYou })
		},
	})
}
