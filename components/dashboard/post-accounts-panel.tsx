"use client"

import { useUnblockUsers } from "@/hooks/use-block-actions"
import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { usePostDetail } from "@/hooks/use-post-detail"
import { useUserProfileHover } from "@/hooks/use-user-profile"
import { resolveEngagementPost } from "@/lib/post-helpers"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { PostUser } from "@/types/api"
import { useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { getInitials } from "./post-card"

function formatCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
	return String(n)
}

function AccountCardSkeleton() {
	return (
		<div className="flex items-start gap-3 py-3.5 animate-pulse">
			<div className="w-11 h-11 rounded-full bg-muted shrink-0" />
			<div className="flex-1 space-y-2 pt-1">
				<div className="h-3.5 w-20 bg-muted rounded-full" />
				<div className="h-3 w-28 bg-muted rounded-full" />
				<div className="h-2.5 w-16 bg-muted rounded-full" />
			</div>
			<div className="h-7 w-16 bg-muted rounded-full shrink-0" />
		</div>
	)
}

function AccountCard({
	user,
	isSelf,
	nested,
}: {
	user: PostUser
	isSelf: boolean
	nested?: boolean
}) {
	const router = useRouter()
	// eager warming: fetch immediately (not gated behind hover) so clicking
	// through to the profile is instant, and so follow/block state here stays
	// in lockstep with the profile page via the shared ["users","profile",pkid] cache
	const { data, isLoading } = useUserProfileHover(user.pkid, true)
	const profile = data?.data

	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()
	const unblockUsers = useUnblockUsers()

	const isFollowed = profile?.is_user_you_follow ?? user.youFollowThisUser ?? false
	const isBlocked = profile?.is_blocked ?? user.youBlockedThisUser ?? false
	const followsYou = profile?.is_following_you ?? user.thisUserFollowsYou ?? false

	const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
	const busy = followUser.isPending || unfollowUser.isPending || unblockUsers.isPending

	const handleAction = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (isBlocked) unblockUsers.mutate([user.pkid])
		else if (isFollowed) unfollowUser.mutate(user.pkid)
		else followUser.mutate(user.pkid)
	}

	return (
		<div
			onClick={() => router.push(`/profile/${user.pkid}`)}
			className={cn(
				"group flex items-start gap-3 py-3.5 cursor-pointer",
				nested && "border-primary/15",
			)}
		>
			<Avatar.Root className="w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
				<Avatar.Image
					src={user.profile_photo ?? undefined}
					alt={displayName}
					className="w-full h-full object-cover"
				/>
				<Avatar.Fallback className="w-full h-full bg-primary/40 text-primary-foreground text-sm font-semibold flex items-center justify-center">
					{getInitials(user.first_name, user.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>

			<div className="flex-1 min-w-0">
				<p className="text-[13.5px] font-semibold text-foreground truncate leading-tight group-hover:underline underline-offset-2">
					{displayName}
				</p>
				<p className="text-xs text-muted-foreground truncate">@{user.username}</p>

				{isLoading ? (
					<div className="h-2.5 w-20 bg-muted rounded-full mt-1.5" />
				) : profile ? (
					<p className="text-[11px] text-muted-foreground mt-1 truncate">
						<span className="font-medium text-foreground">
							{formatCount(profile.follower_count)}
						</span>{" "}
						followers
						{followsYou && !isSelf && (
							<span className="text-muted-foreground/70"> · Follows you</span>
						)}
					</p>
				) : null}
			</div>

			{!isSelf && (
				<button
					onClick={handleAction}
					disabled={busy}
					className={cn(
						"shrink-0 text-[11.5px] font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 mt-0.5 cursor-pointer",
						isBlocked
							? "bg-destructive/10 text-destructive hover:bg-destructive/20"
							: isFollowed
								? "border border-primary text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/5"
								: "bg-primary text-primary-foreground hover:bg-primary/85",
					)}
				>
					<span className={!isBlocked && isFollowed ? "group-hover:hidden" : ""}>
						{isBlocked ? "Unblock" : isFollowed ? "Following" : "Follow"}
					</span>
					{!isBlocked && isFollowed && <span className="hidden group-hover:inline">Unfollow</span>}
				</button>
			)}
		</div>
	)
}

export function PostAccountsPanel({ pkid }: { pkid: number }) {
	const currentUserPkid = useAuthStore((s) => s.user?.pkid)
	const { data: rawPost, isLoading } = usePostDetail(pkid)
	const post = rawPost ? resolveEngagementPost(rawPost) : undefined

	if (isLoading && !post) {
		return (
			<aside className="w-md shrink-0 flex flex-col bg-card rounded-2xl overflow-hidden border border-border">
				<div className="px-4 pt-4 pb-1">
					<h2 className="font-bold text-foreground text-sm">Featured in this post</h2>
				</div>
				<div className="px-4">
					<AccountCardSkeleton />
				</div>
			</aside>
		)
	}

	if (!post) return null

	const original = post.original_post
	const showOriginal = !!original && original.user.pkid !== post.user.pkid

	return (
		<aside className="w-md shrink-0 flex flex-col bg-card rounded-2xl overflow-hidden border border-border">
			<div className="px-4 pt-4 pb-1">
				<h2 className="font-bold text-foreground text-sm">Featured in this post</h2>
			</div>
			<div className="px-4 pb-1 divide-y divide-border">
				<AccountCard user={post.user} isSelf={post.user.pkid === currentUserPkid} />
				{showOriginal && (
					<AccountCard
						user={original.user}
						isSelf={original.user.pkid === currentUserPkid}
						nested
					/>
				)}
			</div>
		</aside>
	)
}
