import { FollowerUser, SuggestionUser } from "@/types/api"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "@/lib/api"
import { usersKeys } from "./use-users"
import { feedKeys } from "./use-feed"

type FollowersCache = InfiniteData<{ followers: FollowerUser[]; nextPage: string | null }>

type FriendsSuggestionCache = InfiniteData<{
	suggestions: SuggestionUser[]
	nextPage: string | null
}>

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

			const patch = { is_friends: true }

			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, pkid, patch),
			)

			return { followersPrev }
		},

		onError: (_err, _id, ctx) => {
			if (ctx?.followersPrev)
				qc.setQueryData<FollowersCache>(usersKeys.followers, ctx.followersPrev)
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

			const patch = { is_friends: false }

			qc.setQueryData<FollowersCache>(usersKeys.followers, (old) =>
				patchFollowers(old, pkid, patch),
			)

			return { followersPrev }
		},

		onError: (_err, _id, ctx) => {
			if (ctx?.followersPrev)
				qc.setQueryData<FollowersCache>(usersKeys.followers, ctx.followersPrev)
		},

		onSettled: () => invalidateAllQueries(qc),
	})
}
