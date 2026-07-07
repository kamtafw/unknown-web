import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PostInteractionsState {
	mutedUserIds: number[]
	blockedUserIds: number[]
	followedUserIds: number[]
	notInterestedPostIds: string[]
	setMuted: (pkid: number, muted: boolean) => void
	setBlocked: (pkid: number, blocked: boolean) => void
	setFollowed: (pkid: number, followed: boolean) => void
	markNotInterested: (postId: string) => void
	unmarkNotInterested: (postId: string) => void
}

function toggleId(ids: number[], id: number, on: boolean): number[] {
	if (on) return ids.includes(id) ? ids : [...ids, id]
	return ids.filter((i) => i !== id)
}

/**
 * client-side relationship cache — Post/PostUser payloads don't carry
 * is_following / is_muted / is_blocked, so there's no server truth to read
 * the toggle labels from. This persists optimistic state locally until the
 * backend exposes those flags directly on the post payload.
 */
export const usePostInteractionsStore = create<PostInteractionsState>()(
	persist(
		(set) => ({
			mutedUserIds: [],
			blockedUserIds: [],
			followedUserIds: [],
			notInterestedPostIds: [],

			setMuted: (pkid, muted) =>
				set((s) => ({ mutedUserIds: toggleId(s.mutedUserIds, pkid, muted) })),
			setBlocked: (pkid, blocked) =>
				set((s) => ({ blockedUserIds: toggleId(s.blockedUserIds, pkid, blocked) })),
			setFollowed: (pkid, followed) =>
				set((s) => ({ followedUserIds: toggleId(s.followedUserIds, pkid, followed) })),
			markNotInterested: (postId) =>
				set((s) => ({
					notInterestedPostIds: s.notInterestedPostIds.includes(postId)
						? s.notInterestedPostIds
						: [...s.notInterestedPostIds, postId],
				})),
			unmarkNotInterested: (postId) =>
				set((s) => ({
					notInterestedPostIds: s.notInterestedPostIds.filter((id) => id !== postId),
				})),
		}),
		{ name: "post-interactions-store" },
	),
)
