import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { FullUser } from "@/types/socials/api"
import * as Avatar from "@radix-ui/react-avatar"
import { useState } from "react"
import { FollowButton } from "../shared/follow-button"

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

function getInitials(first: string | null, last: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function UserRow({ user, index }: { user: FullUser; index: number }) {
	const [followed, setFollowed] = useState(false)
	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()
	const colorCls = AVATAR_COLORS[index % AVATAR_COLORS.length]
	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username

	const handleFollow = () => {
		if (followed) return
		setFollowed(true)
		followUser.mutate(user.pkid, {
			onError: () => setFollowed(false),
		})
	}

	const handleUnfollow = () => {
		if (!followed) return
		setFollowed(false)
		unfollowUser.mutate(user.pkid, {
			onError: () => setFollowed(true),
		})
	}

	return (
		<div className="flex items-center gap-3 py-3">
			<Avatar.Root
				className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 ${colorCls}`}
			>
				<Avatar.Image
					src={user.profile_photo}
					alt={displayName}
					className="w-full h-full object-cover"
				/>
				<Avatar.Fallback
					className={`w-full h-full flex items-center justify-center text-xs sm:text-sm font-bold ${colorCls}`}
				>
					{getInitials(user.first_name, user.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>

			<div className="flex-1 min-w-0">
				<p className="text-sm font-semibold text-foreground truncate leading-tight">
					{displayName}
				</p>
				<p className="text-xs text-muted-foreground truncate">@{user.username}</p>
			</div>

			<FollowButton
				isFollowed={followed}
				onClick={followed ? handleUnfollow : handleFollow}
				className="px-3 sm:px-4 py-1.5 h-auto"
			/>
		</div>
	)
}

function SkeletonRow() {
	return (
		<div className="flex items-center gap-3 py-3 animate-pulse">
			<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-muted shrink-0" />
			<div className="flex-1 space-y-1.5">
				<div className="h-3 bg-muted rounded-full w-2/5" />
				<div className="h-3 bg-muted rounded-full w-1/4" />
			</div>
			<div className="w-16 h-7 bg-muted rounded-full" />
		</div>
	)
}

interface FriendSuggestionsProps {
	users: FullUser[]
	isLoading?: boolean
	onContinue: () => void
}

export function FriendSuggestions({
	users,
	isLoading = false,
	onContinue,
}: FriendSuggestionsProps) {
	return (
		<div className="flex justify-center pt-10 sm:pt-15 px-4 pb-10">
			<div className="w-full max-w-md">
				<h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Friends suggestion</h1>
				<p className="text-[13px] sm:text-sm text-muted-foreground mb-5 sm:mb-6">
					Follow some people to personalise your feed
				</p>

				<div className="flex flex-col divide-y divide-border">
					{isLoading ? (
						Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
					) : users.length === 0 ? (
						<p className="text-sm text-muted-foreground py-10 text-center">
							No suggestions right now — you&apos;re all caught up!
						</p>
					) : (
						users.map((user, i) => <UserRow key={user.id} user={user} index={i} />)
					)}
				</div>

				<button
					onClick={onContinue}
					className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-7 sm:mt-8 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
				>
					Continue to your feed
				</button>
				{users.length > 0 && (
					<p className="text-xs text-muted-foreground text-center mt-3">
						You can always find more people to follow from your feed
					</p>
				)}
			</div>
		</div>
	)
}
