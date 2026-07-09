import { userApi } from "@/lib/api"
import { FollowerUser, Post, PostUser, SuggestionUser } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { feedKeys } from "./use-feed"
import { usersKeys } from "./use-users"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

type FollowersCache = InfiniteData<{ followers: FollowerUser[]; nextPage: string | null }>

type FriendsSuggestionCache = InfiniteData<{
	suggestions: SuggestionUser[]
	nextPage: string | null
}>

type AuthorFlagPatch = Partial<
	Pick<PostUser, "youFollowThisUser" | "youMutedThisUser" | "youBlockedThisUser">
>

function patchPostAuthor(post: Post, pkid: number, patch: AuthorFlagPatch): Post {
	if (post.user.pkid !== pkid) return post
	return { ...post, user: { ...post.user, ...patch } }
}

/**
 * patches the viewer's relationship flags (youFollowThisUser, youMutedThisUser,
 * youBlockedThisUser) directly on `post.user` wherever that author appears —
 * across every feed cache and any open post-detail cache; this is the single
 * source of truth for those flags; so a follow/mute/block action taken from a
 * hover card, the post menu, or the blocked-accounts panel all stay consistent
 * everywhere the author's posts are rendered.
 */
export function patchAuthorFlagInFeeds(
	qc: ReturnType<typeof useQueryClient>,
	pkid: number,
	patch: AuthorFlagPatch,
) {
	const feedKeys_ = [feedKeys.forYou, feedKeys.following, feedKeys.bookmarks]

	feedKeys_.forEach((key) => {
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.map((p) => patchPostAuthor(p, pkid, patch)),
				})),
			}
		})
	})

	qc.getQueriesData<Post>({ queryKey: ["post", "detail"] }).forEach(([key, cached]) => {
		if (cached && cached.user.pkid === pkid) {
			qc.setQueryData<Post>(key, (old) => (old ? patchPostAuthor(old, pkid, patch) : old))
		}
	})
}

export function removeUserFromSuggestionsCache(
	qc: ReturnType<typeof useQueryClient>,
	pkid: number,
) {
	qc.setQueryData<FriendsSuggestionCache>(usersKeys.friendSuggestions, (old) => {
		if (!old) return old
		return {
			...old,
			pages: old.pages.map((page) => ({
				...page,
				suggestions: page.suggestions.filter((s) => s.pkid !== pkid),
			})),
		}
	})
}

function patchFollowers(
	old: FollowersCache | undefined,
	pkid: number,
	patch: Partial<FollowerUser>,
): FollowersCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			posts: page.followers.map((f) => (f.pkid === pkid ? { ...f, ...patch } : f)),
		})),
	}
}

function invalidateAllQueries(qc: ReturnType<typeof useQueryClient>) {
	qc.invalidateQueries({ queryKey: usersKeys.followers })
	qc.invalidateQueries({ queryKey: usersKeys.followings })
	qc.invalidateQueries({ queryKey: feedKeys.following })
}

export function useFollowUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (pkid: number) => userApi.followUser({ followed_user: pkid }),
		onMutate: async (pkid) => {
			await qc.cancelQueries({ queryKey: usersKeys.followers })

			const followersPrev = qc.getQueryData<FollowersCache>(usersKeys.followers)

			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, pkid, { is_friends: true }),
			)
			patchAuthorFlagInFeeds(qc, pkid, { youFollowThisUser: true })

			return { followersPrev }
		},

		onError: (_err, pkid, ctx) => {
			if (ctx?.followersPrev)
				qc.setQueryData<FollowersCache>(usersKeys.followers, ctx.followersPrev)
			patchAuthorFlagInFeeds(qc, pkid, { youFollowThisUser: false })
		},

		onSettled: () => invalidateAllQueries(qc),
	})
}

export function useUnfollowUser() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: (pkid: number) => userApi.unfollowUser({ followed_user: pkid }),
		onMutate: async (pkid) => {
			await qc.cancelQueries({ queryKey: usersKeys.followers })

			const followersPrev = qc.getQueryData<FollowersCache>(usersKeys.followers)

			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, pkid, { is_friends: false }),
			)
			patchAuthorFlagInFeeds(qc, pkid, { youFollowThisUser: false })

			return { followersPrev }
		},

		onError: (_err, pkid, ctx) => {
			if (ctx?.followersPrev)
				qc.setQueryData<FollowersCache>(usersKeys.followers, ctx.followersPrev)
			patchAuthorFlagInFeeds(qc, pkid, { youFollowThisUser: false })
		},

		onSettled: () => invalidateAllQueries(qc),
	})
}
