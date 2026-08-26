import { userApi } from "@/lib/api"
import { contentKeys, FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { FollowerUser, SuggestionUser, UserProfileData, UserProfileResponse } from "@/types/api"
import { Post, PostUser, SocialContent } from "@/types/socials/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { userProfileKeys } from "./use-user-profile"
import { usersKeys } from "./use-users"

type FollowersCache = InfiniteData<{ followers: FollowerUser[]; nextPage: string | null }>

type FriendsSuggestionCache = InfiniteData<{
	suggestions: SuggestionUser[]
	nextPage: string | null
}>

type AuthorFlagPatch = Partial<
	Pick<PostUser, "youFollowThisUser" | "youMutedThisUser" | "youBlockedThisUser">
>

/** patches `original.user` if it matches pkid — `original` is the same
 * SocialContent shape as everything else, no more OriginalPost/
 * OriginalComment union to disambiguate */
function patchOriginalAuthor(
	original: SocialContent["original"],
	pkid: number,
	patch: AuthorFlagPatch,
): SocialContent["original"] {
	if (!original || original.user.pkid !== pkid) return original
	return { ...original, user: { ...original.user, ...patch } }
}

function patchPostAuthor(post: Post, pkid: number, patch: AuthorFlagPatch): Post {
	const userMatches = post.user.pkid === pkid
	const patchedOriginal = patchOriginalAuthor(post.original, pkid, patch)

	if (!userMatches && patchedOriginal === post.original) return post

	const user = userMatches ? { ...post.user, ...patch } : post.user

	// ONLY_FOLLOWERS reply restriction is just youFollowThisUser under the hood —
	// recompute it the instant that flag changes instead of waiting on a refetch
	// to overwrite the stale server snapshot
	const permissions =
		userMatches &&
		post.permissions.reply_policy === "ONLY_FOLLOWERS" &&
		patch.youFollowThisUser !== undefined
			? { ...post.permissions, can_reply: patch.youFollowThisUser }
			: post.permissions

	return { ...post, user, original: patchedOriginal, permissions }
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
 * the author's own ["users", "profile", id] cache; this is the single source of
 * truth: a follow/mute/block taken from a hover card, the post menu, the
 * featured-accounts panel, or the blocked-accounts panel all stay in sync
 * everywhere the author shows up — including their own profile page — with no
 * manual refresh required
 *
 * IDENTITY NOTE: this function only ever receives `pkid` — follow/mute/block
 * are separate, still-pkid-based endpoints, unaffected by the backend's
 * switch of getUserProfile to UUID. But the profile-detail cache it needs to
 * patch (`userProfileKeys.detail`) is now id-keyed. Rather than changing all
 * 5 mutation call sites (useFollowUser/useUnfollowUser/useMuteUser/
 * useUnmuteUser/useUnblockUsers) and every component that calls them to
 * thread an `id` through just for this one internal cache write, this
 * recovers the matching `id` opportunistically from whichever cache already
 * has it: a feed post by this author, an open content-detail entry by them,
 * or — most commonly, since this is exactly the case when someone clicks
 * follow/mute/block *from* a profile page — the profile-detail cache itself,
 * already populated with both pkid and id from its own fetch.
 *
 * LIMITATION: if none of those three are currently in cache (e.g. following
 * someone from friend-suggestions with zero other visibility into them this
 * session), the profile-detail cache patch is skipped — not wrong, just not
 * optimistic; it'll be correct on the next real fetch. Every other patch
 * (feeds, content-detail) still applies regardless, since those are pkid-
 * keyed and don't need this lookup at all.
 */
export function patchAuthorFlagInFeeds(
	qc: ReturnType<typeof useQueryClient>,
	pkid: number,
	patch: AuthorFlagPatch,
) {
	let matchedId: string | undefined

	feedKeys.engagement().forEach((key) => {
		qc.setQueryData<FeedCache>(key, (old) => {
			if (!old) return old
			return {
				...old,
				pages: old.pages.map((page) => ({
					...page,
					posts: page.posts.map((p) => {
						if (!matchedId && p.user.pkid === pkid) matchedId = p.user.id
						if (!matchedId && p.original && p.original.user.pkid === pkid) {
							matchedId = p.original.user.id
						}
						return patchPostAuthor(p, pkid, patch)
					}),
				})),
			}
		})
	})

	qc.getQueriesData<SocialContent>({ queryKey: contentKeys.all }).forEach(([key, cached]) => {
		if (cached && cached.user.pkid === pkid) {
			if (!matchedId) matchedId = cached.user.id
			qc.setQueryData<SocialContent>(key, (old) => (old ? patchPostAuthor(old, pkid, patch) : old))
		}
	})

	if (!matchedId) {
		qc.getQueriesData<UserProfileResponse>({ queryKey: ["users", "profile"] }).forEach(
			([, cached]) => {
				if (!matchedId && cached?.data?.pkid === pkid) matchedId = cached.data.id
			},
		)
	}

	const profilePatch = authorFlagToProfilePatch(patch)
	if (Object.keys(profilePatch).length > 0 && matchedId) {
		qc.setQueryData<UserProfileResponse>(userProfileKeys.detail(matchedId), (old) =>
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
