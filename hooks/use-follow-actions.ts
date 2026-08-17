import { userApi } from "@/lib/api"
import {
	FollowerUser,
	Post,
	PostUser,
	SuggestionUser,
	UserProfileData,
	UserProfileResponse,
} from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"

import { userProfileKeys } from "./use-user-profile"
import { usersKeys } from "./use-users"
import { feedKeys } from "@/lib/socials/query-keys"

type FeedCache = InfiniteData<{ posts: Post[]; nextPage: string | null }>

type FollowersCache = InfiniteData<{ followers: FollowerUser[]; nextPage: string | null }>

type FriendsSuggestionCache = InfiniteData<{
	suggestions: SuggestionUser[]
	nextPage: string | null
}>

type AuthorFlagPatch = Partial<
	Pick<PostUser, "youFollowThisUser" | "youMutedThisUser" | "youBlockedThisUser">
>

/** patches original_post.user if it matches pkid — both OriginalPost and OriginalComment carry a PostUser */
function patchOriginalAuthor(
	original: Post["original_post"],
	pkid: number,
	patch: AuthorFlagPatch,
): Post["original_post"] {
	if (!original || original.user.pkid !== pkid) return original
	return { ...original, user: { ...original.user, ...patch } } as Post["original_post"]
}

function patchPostAuthor(post: Post, pkid: number, patch: AuthorFlagPatch): Post {
	const userMatches = post.user.pkid === pkid
	const patchedOriginal = patchOriginalAuthor(post.original_post, pkid, patch)

	if (!userMatches && patchedOriginal === post.original_post) return post

	const user = userMatches ? { ...post.user, ...patch } : post.user

	// ONLY_FOLLOWERS reply restriction is just youFollowThisUser under the hood —
	// recompute it the instant that flag changes instead of waiting on a refetch
	// to overwrite the stale server snapshot
	const viewer_permissions =
		userMatches &&
		post.viewer_permissions &&
		post.who_can_reply === "ONLY_FOLLOWERS" &&
		patch.youFollowThisUser !== undefined
			? { ...post.viewer_permissions, can_reply: patch.youFollowThisUser }
			: post.viewer_permissions

	return { ...post, user, original_post: patchedOriginal, viewer_permissions }
}

function authorFlagToProfilePatch(patch: AuthorFlagPatch): Partial<UserProfileData> {
	const out: Partial<UserProfileData> = {}
	if (patch.youFollowThisUser !== undefined) out.is_user_you_follow = patch.youFollowThisUser
	if (patch.youMutedThisUser !== undefined) out.is_muted = patch.youMutedThisUser
	if (patch.youBlockedThisUser !== undefined) out.is_blocked = patch.youBlockedThisUser
	return out
}

/**
 * patches the viewer's relationship flags (youFollowThisUser, youMutedThisUser,
 * youBlockedThisUser) wherever that author appears — every feed cache (including
 * nested original_post.user on quote-reposts), any open post-detail cache, and
 * the author's own ["users", "profile", pkid] cache; this is the single source of
 * truth: a follow/mute/block taken from a hover card, the post menu, the
 * featured-accounts panel, or the blocked-accounts panel all stay in sync
 * everywhere the author shows up — including their own profile page — with no
 * manual refresh required
 */
export function patchAuthorFlagInFeeds(
	qc: ReturnType<typeof useQueryClient>,
	pkid: number,
	patch: AuthorFlagPatch,
) {
	feedKeys.engagement().forEach((key) => {
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

	const profilePatch = authorFlagToProfilePatch(patch)
	if (Object.keys(profilePatch).length > 0) {
		qc.setQueryData<UserProfileResponse>(userProfileKeys.detail(pkid), (old) =>
			old?.data ? { ...old, data: { ...old.data, ...profilePatch } } : old,
		)
	}
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
	qc.invalidateQueries({ queryKey: feedKeys.following() })
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
			patchAuthorFlagInFeeds(qc, pkid, { youFollowThisUser: true })
		},

		onSettled: () => invalidateAllQueries(qc),
	})
}
