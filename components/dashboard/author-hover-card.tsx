"use client"

import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { useUserProfileHover } from "@/hooks/use-user-profile"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { PostUser } from "@/types/api"
import { Avatar, HoverCard } from "radix-ui"
import { type ReactNode, useState } from "react"

function getInitials(first?: string | null, last?: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function formatCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
	return String(n)
}

interface AuthorHoverCardProps {
	pkid: number
	fallback: Pick<PostUser, "username" | "first_name" | "last_name" | "profile_photo">
	children: ReactNode
}

export function AuthorHoverCard({ pkid, fallback, children }: AuthorHoverCardProps) {
	const currentUserPkid = useAuthStore((s) => s.user?.pkid)
	const isOwnProfile = pkid === currentUserPkid

	const [open, setOpen] = useState(false)
	const { data, isLoading } = useUserProfileHover(pkid, open)
	const profile = data?.data

	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()
	const [followOverride, setFollowOverride] = useState<boolean | null>(null)
	const isFollowed = followOverride ?? profile?.is_user_you_follow ?? false

	const displayName =
		[profile?.first_name ?? fallback.first_name, profile?.last_name ?? fallback.last_name]
			.filter(Boolean)
			.join(" ") || fallback.username
	const username = profile?.username ?? fallback.username
	const photo = profile?.profile_photo ?? fallback.profile_photo

	const handleFollowToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation()
		e.preventDefault()
		if (isFollowed) {
			setFollowOverride(false)
			unfollowUser.mutate(pkid, { onError: () => setFollowOverride(true) })
		} else {
			setFollowOverride(true)
			followUser.mutate(pkid, { onError: () => setFollowOverride(false) })
		}
	}

	return (
		<HoverCard.Root openDelay={450} closeDelay={150} open={open} onOpenChange={setOpen}>
			<HoverCard.Trigger asChild>
				<span className="inline-flex cursor-pointer">{children}</span>
			</HoverCard.Trigger>
			<HoverCard.Portal>
				<HoverCard.Content
					side="bottom"
					align="start"
					sideOffset={10}
					collisionPadding={12}
					onClick={(e) => e.stopPropagation()}
					className="
						z-100 w-80 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
						data-[side=bottom]:slide-in-from-top-1.5
						data-[side=top]:slide-in-from-bottom-1.5
					"
				>
					{isLoading && !profile ? (
						<div className="p-5">
							<div className="flex items-start justify-between animate-pulse">
								<div className="w-14 h-14 rounded-full bg-muted" />
								<div className="w-20 h-8 rounded-full bg-muted" />
							</div>
							<div className="mt-4 space-y-2 animate-pulse">
								<div className="h-3.5 w-28 bg-muted rounded-full" />
								<div className="h-3 w-20 bg-muted rounded-full" />
								<div className="h-3 w-full bg-muted rounded-full mt-3" />
								<div className="h-3 w-4/5 bg-muted rounded-full" />
							</div>
						</div>
					) : (
						<div className="p-5">
							{/* avatar + follow */}
							<div className="flex items-start justify-between mb-3">
								<Avatar.Root className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-card shrink-0">
									<Avatar.Image
										src={photo ?? undefined}
										alt={displayName}
										className="w-full h-full object-cover"
									/>
									<Avatar.Fallback className="w-full h-full bg-primary/40 text-primary-foreground text-lg font-semibold flex items-center justify-center">
										{getInitials(
											profile?.first_name ?? fallback.first_name,
											profile?.last_name ?? fallback.last_name,
										)}
									</Avatar.Fallback>
								</Avatar.Root>

								{profile && !profile.is_blocked && !isOwnProfile && (
									<button
										onClick={handleFollowToggle}
										disabled={followUser.isPending || unfollowUser.isPending}
										className={cn(
											"group shrink-0 h-8 px-4 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-60",
											isFollowed
												? "border border-border text-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/5"
												: "bg-foreground text-background hover:opacity-85",
										)}
									>
										<span className={isFollowed ? "group-hover:hidden" : ""}>
											{isFollowed ? "Following" : "Follow"}
										</span>
										{isFollowed && <span className="hidden group-hover:inline">Unfollow</span>}
									</button>
								)}
							</div>

							{/* name + handle */}
							<p className="font-bold text-foreground text-[15px] leading-tight">{displayName}</p>
							<div className="flex items-center gap-1.5 mt-0.5">
								<p className="text-[13px] text-muted-foreground">@{username}</p>
								{profile?.is_following_you && (
									<span className="text-[10.5px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded leading-none">
										Follows you
									</span>
								)}
							</div>

							{profile?.is_blocked ? (
								<p className="text-[12.5px] text-muted-foreground mt-3">
									You&apos;ve blocked this account.
								</p>
							) : (
								<div className="flex items-center gap-4 mt-3 pt-3">
									{[
										{ label: "Connections", value: profile?.connection_count ?? 0 },
										{ label: "Following", value: profile?.following_count ?? 0 },
										{ label: "Followers", value: profile?.follower_count ?? 0 },
									].map(({ label, value }) => (
										<div key={label} className="flex flex-1 flex-col">
											<span className="text-sm font-bold text-foreground">
												{formatCount(value)}
											</span>
											<span className="text-xs text-muted-foreground">{label}</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</HoverCard.Content>
			</HoverCard.Portal>
		</HoverCard.Root>
	)
}
