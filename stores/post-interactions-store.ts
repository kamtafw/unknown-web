import { create } from "zustand"
import { persist } from "zustand/middleware"

type OverrideMap = Record<number, boolean>

interface PostInteractionsState {
	followedOverrides: OverrideMap
	mutedOverrides: OverrideMap
	blockedOverrides: OverrideMap
	notInterestedPostIds: string[]
	setFollowed: (pkid: number, followed: boolean) => void
	setMuted: (pkid: number, muted: boolean) => void
	setBlocked: (pkid: number, blocked: boolean) => void
	markNotInterested: (postId: string) => void
	unmarkNotInterested: (postId: string) => void
}

export const usePostInteractionsStore = create<PostInteractionsState>()(
	persist(
		(set) => ({
			followedOverrides: {},
			mutedOverrides: {},
			blockedOverrides: {},
			notInterestedPostIds: [],

			setFollowed: (pkid, followed) =>
				set((s) => ({ followedOverrides: { ...s.followedOverrides, [pkid]: followed } })),
			setMuted: (pkid, muted) =>
				set((s) => ({ mutedOverrides: { ...s.mutedOverrides, [pkid]: muted } })),
			setBlocked: (pkid, blocked) =>
				set((s) => ({ blockedOverrides: { ...s.blockedOverrides, [pkid]: blocked } })),

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
		{
			name: "post-interactions-store",
			partialize: (state) => ({ notInterestedPostIds: state.notInterestedPostIds }),
		},
	),
)
