import { useAuthStore } from "@/stores/auth-store"
import { patchRelationship } from "@/lib/social-relationships"
import { showMutationErrorToast } from "@/lib/api-error"
import { userApi } from "@/lib/api"
import { contentKeys, FeedCache, feedKeys } from "@/lib/socials/query-keys"
import { FriendSuggestionsResponse, UserProfileData, UserProfileResponse } from "@/types/api"
import { Post, PostUser, SocialContent } from "@/types/socials/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userProfileKeys } from "./use-user-profile"
import { usersKeys } from "./use-users"

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

/** Patch cached author flags for the numeric mute/block endpoints.
 * Follow actions below use public UUIDs and patchRelationship instead. */
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
    id: string,
) {
    qc.setQueryData<FriendSuggestionsResponse>(usersKeys.friendSuggestions, (old) => old ? {
        ...old,
        data: { ...old.data, results: old.data.results.filter((user) => user.id !== id) },
    } : old)
}

function invalidateAllQueries(qc: ReturnType<typeof useQueryClient>) {
	qc.invalidateQueries({ queryKey: usersKeys.followers })
	qc.invalidateQueries({ queryKey: usersKeys.followings })
	qc.invalidateQueries({ queryKey: feedKeys.following() })
}

function useFollowMutation(following: boolean) {
	const qc = useQueryClient()
	const patch = (userId: string, state: boolean) => {
		qc.setQueriesData({ predicate: (query) =>
			["feed", "profile-feed", "content", "users", "mentions", "social-search", "social-alerts"].includes(String(query.queryKey[0])),
		}, (old) => patchRelationship(old, userId, state))
	}
	return useMutation({
		mutationKey: ["social-follow"],
		mutationFn: async (id: string) => {
			const response = await userApi.followUser({ followed_user: id })
			if (!response.success) throw new Error(response.message || "Could not update follow status")
			return response
		},
		onMutate: async (id) => {
			const generation = useAuthStore.getState().sessionGeneration
			await qc.cancelQueries({ predicate: (query) =>
				["users", "social-search", "social-alerts"].includes(String(query.queryKey[0])),
			})
			if (generation !== useAuthStore.getState().sessionGeneration) throw new Error("Account changed. Please try again.")
			patch(id, following)
			return { generation }
		},
		onSuccess: (response, id, context) => { if (context?.generation === useAuthStore.getState().sessionGeneration) patch(id, response.data.following) },
		onError: (error, id, context) => {
			if (context?.generation !== useAuthStore.getState().sessionGeneration) return
			patch(id, !following)
			showMutationErrorToast(error, "Could not update follow status. Please try again.")
		},
		onSettled: (_data, _error, _id, context) => { if (context?.generation === useAuthStore.getState().sessionGeneration) invalidateAllQueries(qc) },
	})
}

export function useFollowUser() { return useFollowMutation(true) }
export function useUnfollowUser() { return useFollowMutation(false) }
