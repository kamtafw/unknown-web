import { showMutationErrorToast } from "@/lib/api-error"
import { socialsApi } from "@/lib/socials/api"
import { feedKeys } from "@/lib/socials/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import { FullUser } from "@/types/api"
import { CreatePostPayload, SocialContent, SocialContentUser } from "@/types/socials/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"

type FeedCache = InfiniteData<{ posts: SocialContent[]; nextPage: string | null }>

/** SocialContentUser doesn't carry email/phone_number — that's fine, they
 * were never part of the canonical author shape (migration doc S~2.7's note
 * on why pkid alone is preserved from the old PostUser). */
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

function buildOptimisticPost(payload: CreatePostPayload, user: FullUser): SocialContent {
	const now = new Date().toISOString()

	return {
		id: `temp-${crypto.randomUUID()}`,
		kind: "post",
		post_id: null,
		parent_id: null,
		user: fullUserToContentUser(user),
		message: payload.content ?? "",
		media: payload.media_urls ?? [],
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
			visibility: payload.who_can_see,
			reply_policy: payload.who_can_reply,
			can_view: true,
			can_reply: true,
		},
		flags: { pinned: false, repost: false, shared: false },
		original: null,
		my_repost_id: null,
		created_at: now,
		updated_at: now,
	}
}

export function useCreatePost() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (payload: CreatePostPayload) => socialsApi.createPost(payload),

		onMutate: async (payload) => {
			await Promise.all(feedKeys.engagement().map((key) => qc.cancelQueries({ queryKey: key })))

			const snapshots = {
				forYou: qc.getQueryData<FeedCache>(feedKeys.forYou()),
				tempId: null as string | null,
			}

			const user = useAuthStore.getState().user

			if (user) {
				const optimistic = buildOptimisticPost(payload, user)
				snapshots.tempId = optimistic.id
				qc.setQueryData<FeedCache>(feedKeys.forYou(), (old) => prependToFeed(old, optimistic))
			}

			return snapshots
		},

		onSuccess: () => {
			qc.invalidateQueries({ queryKey: feedKeys.forYou() })
		},

		// Pre-existing gap fixed while touching this file (flagged, not
		// silently introduced, in docs/social/social-content-migration-inspection.md
		// S~11): a failed optimistic post previously had no rollback and could
		// get stuck visible in the feed. Restoring the snapshot removes it.
		onError: (error, _payload, ctx) => {
			if (ctx?.forYou) qc.setQueryData<FeedCache>(feedKeys.forYou(), ctx.forYou)
			showMutationErrorToast(error, "Failed to create post. Please try again.")
		},
	})
}
