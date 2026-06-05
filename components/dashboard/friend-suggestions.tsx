"use client"

import {
	removeUserFromSuggestionsCache,
	useFollowUser,
	useUnfollowUser,
} from "@/hooks/use-follow-actions"
import { useFriendSuggestions } from "@/hooks/use-users"
import { SuggestionUser } from "@/types/api"
import { useQueryClient } from "@tanstack/react-query"
import { Avatar, ScrollArea } from "radix-ui"
import { useEffect, useRef, useState } from "react"

function getInitials(first: string, last: string) {
	return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}
const AVATAR_COLORS = [
	"bg-violet-200 text-violet-700",
	"bg-blue-200 text-blue-700",
	"bg-amber-200 text-amber-700",
	"bg-green-200 text-green-700",
	"bg-pink-200 text-pink-700",
	"bg-teal-200 text-teal-700",
	"bg-orange-200 text-orange-700",
	"bg-indigo-200 text-indigo-700",
]

function Row({ user, index }: { user: SuggestionUser; index: number }) {
	const qc = useQueryClient()
	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()

	const [isFollowed, setIsFollowed] = useState(user.youFollowThisUser)
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current)
		},
		[],
	)

	const handleFollow = () => {
		if (isFollowed) return

		setIsFollowed(true)
		timerRef.current = setTimeout(() => removeUserFromSuggestionsCache(qc, user.pkid), 5_000)

		followUser.mutate(user.pkid, {
			onError: () => {
				setIsFollowed(user.youFollowThisUser)
				if (timerRef.current) {
					clearTimeout(timerRef.current)
					timerRef.current = null
				}
			},
		})
	}

	const handleUnfollow = () => {
		if (!isFollowed) return

		setIsFollowed(false)

		if (timerRef.current) {
			clearTimeout(timerRef.current)
			timerRef.current = null
		}

		unfollowUser.mutate(user.pkid, {
			onError: () => {
				setIsFollowed(user.youFollowThisUser)
			},
		})
	}

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const colorCls = AVATAR_COLORS[index % AVATAR_COLORS.length]

	return (
		<div className="flex items-center gap-3 py-2.5">
			<Avatar.Root className={`w-9 h-9 rounded-full overflow-hidden shrink-0 ${colorCls}`}>
				<Avatar.Image
					src={user?.profile_photo}
					alt={user ? `${user.first_name} ${user.last_name}` : "unknown"}
					className="w-full h-full object-cover"
				/>
				<Avatar.Fallback
					className={`w-full h-full flex items-center justify-center text-[13px] font-bold ${colorCls}`}
				>
					{user ? getInitials(user.first_name, user.last_name) : "?"}
				</Avatar.Fallback>
			</Avatar.Root>

			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-gray-900 truncate leading-tight">{displayName}</p>
				<p className="text-xs text-gray-500 truncate">@{user.username}</p>
			</div>

			<button
				onClick={isFollowed ? handleUnfollow : handleFollow}
				className={
					isFollowed
						? "text-xs font-semibold px-4 py-1.5 rounded-full border border-primary text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
						: "text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-white hover:bg-primary/80 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
				}
			>
				{isFollowed ? "Following" : user.followsYou ? "Follow Back" : "Follow"}
			</button>
		</div>
	)
}

function SkeletonRow() {
	return (
		<div className="flex items-center gap-3 py-2.5 animate-pulse">
			<div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
			<div className="flex-1 space-y-1.5">
				<div className="h-3 bg-gray-200 rounded-full w-3/4" />
				<div className="h-3 bg-gray-200 rounded-full w-1/2" />
			</div>
			<div className="w-16 h-7 bg-gray-200 rounded-full" />
		</div>
	)
}

export function FriendSuggestions() {
	const { data, isLoading } = useFriendSuggestions()
	const users = data?.data.results ?? []

	return (
		<aside className="w-md shrink-0 flex flex-col bg-white rounded-t-2xl overflow-hidden">
			<div className="px-4 pt-4 pb-3 shrink-0">
				<h2 className="font-bold text-gray-900 text-sm">Friend suggestions</h2>
			</div>

			<div className="mx-4 border-t border-gray-100 shrink-0" />

			<ScrollArea.Root className="flex-1 min-h-0 overflow-hidden">
				<ScrollArea.Viewport className="w-full h-full">
					<div className="flex flex-col px-3 py-1 divide-y divide-gray-50">
						{isLoading ? (
							[0, 1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
						) : users.length === 0 ? (
							<p className="text-sm text-gray-500 py-4 px-1">No suggestions right now.</p>
						) : (
							users.map((u, i) => <Row key={u.id} user={u} index={i} />)
						)}
					</div>
				</ScrollArea.Viewport>
				<ScrollArea.Scrollbar orientation="vertical" className="hidden" />
			</ScrollArea.Root>
		</aside>
	)
}
