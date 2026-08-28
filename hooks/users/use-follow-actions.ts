import { userApi } from "@/lib/api"
import { contentKeys, FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { FollowerUser, SuggestionUser, UserProfileData, UserProfileResponse } from "@/types/api"
import { Post, PostUser, SocialContent } from "@/types/socials/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { userProfileKeys } from "../use-user-profile"
import { usersKeys } from "../use-users"

type FollowersCache = InfiniteData<{ followers: FollowerUser[]; nextPage: string | null }>

type FriendsSuggestionCache = InfiniteData<{
	suggestions: SuggestionUser[]
	nextPage: string | null
}>

type AuthorFlagPatch = Partial<
	Pick<PostUser, "youFollowThisUser" | "youMutedThisUser" | "youBlockedThisUser">
>

/** patches `original.user` if it matches — `original` is the same
 * SocialContent shape as everything else, no more OriginalPost/
 * OriginalComment union to disambiguate */
function patchOriginalAuthor(
	original: SocialContent["original"],
	id: string,
	patch: AuthorFlagPatch,
): SocialContent["original"] {
	if (!original || original.user.id !== id) return original
	return { ...original, user: { ...original.user, ...patch } }
}

function patchPostAuthor(post: Post, id: string, patch: AuthorFlagPatch): Post {
	const userMatches = post.user.id === id
	const patchedOriginal = patchOriginalAuthor(post.original, id, patch)

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
 * Patches the viewer's relationship flags wherever that author appears —
 * every feed cache (including nested original_post.user on reposts), any
 * open content-detail cache, and the author's own cache.
 *
 * IDENTITY NOTE: this function only ever receives `id` (follow/unfollow, post-
 * unification), the profile-detail cache key IS that id — no recovery needed,
 * it's patched directly.
 */
export function patchAuthorFlagInFeeds(
	qc: ReturnType<typeof useQueryClient>,
	id: string,
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
						if (!matchedId && p.user.id === id) matchedId = p.user.id
						if (!matchedId && p.original && p.original.user.id === id) {
							matchedId = p.original.user.id
						}
						return patchPostAuthor(p, id, patch)
					}),
				})),
			}
		})
	})

	qc.getQueriesData<SocialContent>({ queryKey: contentKeys.all }).forEach(([key, cached]) => {
		if (cached && cached.user.id === id) {
			if (!matchedId) matchedId = cached.user.id
			qc.setQueryData<SocialContent>(key, (old) => (old ? patchPostAuthor(old, id, patch) : old))
		}
	})

	if (!matchedId) {
		qc.getQueriesData<UserProfileResponse>({ queryKey: ["users", "profile"] }).forEach(
			([, cached]) => {
				if (!matchedId && cached?.data?.id === id) matchedId = cached.data.id
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

export function removeUserFromSuggestionsCache(qc: ReturnType<typeof useQueryClient>, id: string) {
	qc.setQueryData<FriendsSuggestionCache>(usersKeys.friendSuggestions, (old) => {
		if (!old) return old
		return {
			...old,
			pages: old.pages.map((page) => ({
				...page,
				suggestions: page.suggestions.filter((s) => s.id !== id),
			})),
		}
	})
}

function patchFollowers(
	old: FollowersCache | undefined,
	id: string,
	patch: Partial<FollowerUser>,
): FollowersCache | undefined {
	if (!old) return old

	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			followers: page.followers.map((f) => (f.id === id ? { ...f, ...patch } : f)),
		})),
	}
}

function invalidateAllQueries(qc: ReturnType<typeof useQueryClient>) {
	qc.invalidateQueries({ queryKey: usersKeys.followers })
	qc.invalidateQueries({ queryKey: usersKeys.followings })
	qc.invalidateQueries({ queryKey: feedKeys.following() })
}

interface ToggleFollowVars {
	id: string
	wasFollowing: boolean
}

/**
 * Replaces useFollowUser/useUnfollowUser — the backend collapsed both into
 * one POST /users/follow that toggles state server-side (payload:
 * { followed_user: <uuid> }), which is also what eliminates the
 * "already follow this user" conflict class: there's no longer a way to
 * send a create-follow request against an already-followed relationship,
 * since the frontend never asserts direction, only which user.
 *
 * `wasFollowing` is threaded in from the caller (which already renders the
 * current state to decide the button label) rather than re-derived here,
 * so the optimistic flip direction is known before the request round-trips.
 * onSuccess then reconciles against the backend's actual `following` value
 * rather than trusting that optimistic guess — required now, since a toggle
 * response is the only authoritative source of the resulting state.
 */

export function useToggleFollow() {
	const qc = useQueryClient()

	return useMutation({
		mutationFn: ({ id }: ToggleFollowVars) => userApi.toggleFollow({ followed_user: id }),
		onMutate: async ({ id, wasFollowing }) => {
			await qc.cancelQueries({ queryKey: usersKeys.followers })

			const followersPrev = qc.getQueryData<FollowersCache>(usersKeys.followers)
			const nowFollowing = !wasFollowing

			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, id, { is_friends: nowFollowing }),
			)
			patchAuthorFlagInFeeds(qc, id, { youFollowThisUser: nowFollowing })

			return { followersPrev, wasFollowing }
		},

		onError: (_err, { id }, ctx) => {
			if (ctx?.followersPrev)
				qc.setQueryData<FollowersCache>(usersKeys.followers, ctx.followersPrev)
			if (ctx) patchAuthorFlagInFeeds(qc, id, { youFollowThisUser: ctx.wasFollowing })
		},

		onSuccess: (data, { id }) => {
			patchAuthorFlagInFeeds(qc, id, { youFollowThisUser: data.data.following })
			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, id, { is_friends: data.data.following }),
			)
		},

		onSettled: () => invalidateAllQueries(qc),
	})
}
