"use client"

import { useParentPreviews } from "@/hooks/socials/use-content-preview"
import {
	flattenProfileFeedPages,
	useUserLikedPosts,
	useUserMediaPosts,
	useUserPosts,
	useUserReplies,
} from "@/hooks/socials/use-profile-feed"
import { useMuteUser, useUnmuteUser } from "@/hooks/use-mute-actions"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useToggleFollow } from "@/hooks/users/use-follow-actions"
import { formatCount, getInitials } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { ExternalLink } from "@/types/api"
import { Post, SocialContent } from "@/types/socials/api"
import { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query"
import dayjs from "dayjs"
import {
	ArrowLeft,
	Calendar,
	Link2,
	Loader2,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	Pin,
	ShieldOff,
	UserX,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useRef, useState } from "react"
import { FollowButton } from "../shared/follow-button"
import { ActionDropdown } from "./action-dropdown"
import { BlockUserModal } from "./block-user-modal"
import { PostCard, renderText, UserAvatar } from "./post-card"

export function formatDob(dob: string, dob_visibility: "full" | "partial") {
	const format = dob_visibility === "partial" ? "D MMM" : "D MMM, YYYY"
	return dayjs(dob).format(format)
}

export function sortPinnedFirst(posts: Post[]): Post[] {
	const pinned = posts.filter((p) => p.flags.pinned)
	const rest = posts.filter((p) => !p.flags.pinned)
	return [...pinned, ...rest]
}

export interface NormalizedProfile {
	displayName: string
	initials: string
	username: string
	profilePhoto: string | null
	coverPhoto: string | null
	bio: string
	location: string
	dob: string
	dobVisibility: "full" | "partial"
	dateJoined: string
	externalLinks: ExternalLink[]
	followerCount: number
	followingCount: number
	connectionCount: number
}

export const PROFILE_TABS = ["Posts", "Replies", "Media", "Likes"] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]

export function StatBlock({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-1 flex-col">
			<span className="text-[15px] font-bold text-foreground">{formatCount(value)}</span>
			<span className="text-[13px] text-muted-foreground">{label}</span>
		</div>
	)
}

export function useSentinel(
	hasNextPage: boolean,
	isFetchingNextPage: boolean,
	fetchNextPage: () => void,
) {
	const sentinel = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = sentinel.current
		if (!el) return
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
			},
			{ rootMargin: "200px" },
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage])

	return sentinel
}

export function TabSkeleton() {
	return (
		<div className="animate-pulse">
			{[0, 1, 2].map((i) => (
				<div key={i} className="px-5 py-5 border-b border-border flex gap-3">
					<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
					<div className="flex-1 space-y-2">
						<div className="h-3 bg-muted rounded-full w-2/5" />
						<div className="h-3 bg-muted rounded-full w-full mt-3" />
						<div className="h-3 bg-muted rounded-full w-3/4" />
					</div>
				</div>
			))}
		</div>
	)
}

export function PostFeedTabPanel({
	query,
	emptyMessage,
	pinFirst = false,
}: {
	query: UseInfiniteQueryResult<InfiniteData<{ posts: Post[]; nextPage: string | null }>>
	emptyMessage: string
	pinFirst?: boolean
}) {
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = query
	const sentinel = useSentinel(!!hasNextPage, isFetchingNextPage, fetchNextPage)
	const flat = flattenProfileFeedPages(data?.pages)
	const posts = pinFirst ? sortPinnedFirst(flat) : flat

	if (isLoading) return <TabSkeleton />
	if (isError)
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">Failed to load.</p>
		)
	if (!posts.length)
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">{emptyMessage}</p>
		)

	return (
		<>
			{posts.map((post) => (
				<div key={post.id}>
					{pinFirst && post.flags.pinned && (
						<div className="flex items-center gap-2 px-5 pt-3 text-muted-foreground">
							<Pin size={13} />
							<span className="text-[12px] font-semibold">Pinned</span>
						</div>
					)}
					<PostCard post={post} />
				</div>
			))}
			<div ref={sentinel} className="h-1" />
			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<Loader2 size={18} className="animate-spin text-primary" />
				</div>
			)}
		</>
	)
}

/**
 * Rich version: shows who the reply was responding to and what they said,
 * via `parentPreview` — a real SocialContent for the parent, batch-fetched
 * by RepliesTabPanel below (see hooks/socials/use-content-previews.ts),
 * not a bespoke type. Renders correctly with or without it: while it's
 * loading, or if the fetch fails, this falls back to the simplified
 * "Replied in a thread" version rather than blocking the reply itself.
 */
export function ReplyThreadCard({
	reply,
	parentPreview,
}: {
	reply: SocialContent
	parentPreview?: SocialContent
}) {
	const router = useRouter()
	const timeAgo = useTimeAgo(reply.created_at)
	const fullname =
		[reply.user.first_name, reply.user.last_name].filter(Boolean).join(" ") || reply.user.username

	if (!reply.message?.trim() && reply.media.length === 0) return null

	const parentName = parentPreview
		? [parentPreview.user.first_name, parentPreview.user.last_name].filter(Boolean).join(" ") ||
			parentPreview.user.username
		: null

	return (
		<button
			onClick={() => router.push(`/posts/${reply.post_id}?comment=${reply.id}`)}
			className="w-full text-left px-5 py-4 border-b border-border hover:bg-accent/30 transition-colors"
		>
			<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
				<MessageCircle size={12} />
				<span>Replied in a thread</span>
			</div>

			{/* Parent tier — only renders once the batched preview resolves.
			 * Absence isn't an error state, just "not loaded yet / unavailable". */}
			{parentPreview && (
				<div className="flex gap-3 mb-2 pb-2 border-b border-border/60">
					<div className="flex flex-col items-center shrink-0">
						<UserAvatar
							src={parentPreview.user.profile_photo}
							first={parentPreview.user.first_name}
							last={parentPreview.user.last_name}
							size="sm"
						/>
						<div className="w-0.5 bg-border flex-1 mt-1.5 min-h-3" />
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5 flex-wrap">
							<span className="font-semibold text-[13px] text-foreground">{parentName}</span>
							<span className="text-muted-foreground text-[12px]">
								@{parentPreview.user.username}
							</span>
						</div>
						{!!parentPreview.message?.trim() && (
							<p className="text-[13px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
								{renderText(parentPreview.message)}
							</p>
						)}
					</div>
				</div>
			)}

			<div className="flex gap-3">
				<UserAvatar
					src={reply.user.profile_photo}
					first={reply.user.first_name}
					last={reply.user.last_name}
				/>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5 flex-wrap">
						<span className="font-semibold text-sm text-foreground">{fullname}</span>
						<span className="text-muted-foreground text-[13px]">@{reply.user.username}</span>
						<span className="text-muted-foreground/70 text-xs">· {timeAgo}</span>
					</div>
					{!!reply.message?.trim() && (
						<p className="text-[13.5px] text-foreground/90 leading-relaxed mt-0.5">
							{renderText(reply.message)}
						</p>
					)}
					{reply.media[0] && (
						<div className="mt-2 rounded-xl overflow-hidden relative bg-muted aspect-video max-w-90">
							<Image src={reply.media[0]} alt="" fill className="object-cover" />
						</div>
					)}
				</div>
			</div>
		</button>
	)
}

export function RepliesTabPanel({
	query,
}: {
	query: UseInfiniteQueryResult<InfiniteData<{ replies: SocialContent[]; nextPage: string | null }>>
}) {
	const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = query
	const sentinel = useSentinel(!!hasNextPage, isFetchingNextPage, fetchNextPage)
	const replies = data?.pages.flatMap((p) => p.replies) ?? []

	// batched, deduplicated, scoped to just the replies currently on screen —
	// see hooks/socials/use-content-previews.ts for why this doesn't become N+1
	const parentPreviews = useParentPreviews(replies.map((r) => r.parent_id))

	if (isLoading) return <TabSkeleton />
	if (isError)
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">Failed to load.</p>
		)
	if (!replies.length)
		return (
			<p className="px-5 py-16 text-center text-[13px] text-muted-foreground">No replies yet.</p>
		)

	return (
		<>
			{replies.map((reply) => (
				<ReplyThreadCard
					key={reply.id}
					reply={reply}
					parentPreview={reply.parent_id ? parentPreviews.get(reply.parent_id) : undefined}
				/>
			))}
			<div ref={sentinel} className="h-1" />
			{isFetchingNextPage && (
				<div className="flex justify-center py-6">
					<Loader2 size={18} className="animate-spin text-primary" />
				</div>
			)}
		</>
	)
}

export function ProfileTabsContent({ id, activeTab }: { id: string; activeTab: ProfileTab }) {
	const postsQuery = useUserPosts(id, activeTab === "Posts")
	const repliesQuery = useUserReplies(id, activeTab === "Replies")
	const mediaQuery = useUserMediaPosts(id, activeTab === "Media")
	const likesQuery = useUserLikedPosts(id, activeTab === "Likes")

	if (activeTab === "Posts")
		return <PostFeedTabPanel query={postsQuery} emptyMessage="No posts yet." pinFirst />
	if (activeTab === "Media")
		return <PostFeedTabPanel query={mediaQuery} emptyMessage="No media posts yet." />
	if (activeTab === "Likes")
		return <PostFeedTabPanel query={likesQuery} emptyMessage="No liked posts yet." />
	return <RepliesTabPanel query={repliesQuery} />
}

export function ProfileSkeleton() {
	return (
		<div className="flex-1 min-w-0 flex flex-col bg-card rounded-t-2xl border border-border overflow-hidden animate-pulse">
			<div className="h-44 sm:h-52 bg-muted shrink-0" />
			<div className="px-6 pt-16 pb-6 relative">
				<div className="absolute -top-12 left-6 w-24 h-24 rounded-full bg-muted border-4 border-card" />
				<div className="h-4 w-40 bg-muted rounded-full mb-2" />
				<div className="h-3 w-28 bg-muted rounded-full mb-5" />
				<div className="h-3 w-full bg-muted rounded-full mb-1.5" />
				<div className="h-3 w-2/3 bg-muted rounded-full" />
			</div>
		</div>
	)
}

export function ProfileShell({
	data,
	onBack,
	actions,
	badge,
	blocked,
	activeTab,
	onTabChange,
	tabContent,
}: {
	data: NormalizedProfile
	onBack: () => void
	actions: ReactNode
	badge?: string
	blocked?: boolean
	activeTab: ProfileTab
	onTabChange: (tab: ProfileTab) => void
	tabContent: ReactNode
}) {
	return (
		<div className="flex-1 min-w-0 flex flex-col bg-card rounded-t-2xl border border-border min-h-0 overflow-hidden">
			<div className="flex items-center gap-4 px-4 py-3 border-b border-border shrink-0">
				<button onClick={onBack} className="p-2 rounded-full hover:bg-accent transition-colors">
					<ArrowLeft size={18} className="text-foreground" />
				</button>
				<p className="font-bold text-[15px] text-foreground leading-tight truncate">
					{data.displayName}
				</p>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="relative h-44 sm:h-52 w-full bg-linear-to-br from-primary/25 via-primary/10 to-primary/5 overflow-hidden">
					{data.coverPhoto && (
						<Image src={data.coverPhoto} alt="Cover" fill className="object-cover" />
					)}
				</div>

				<div className="px-6 pb-4 relative">
					<div className="absolute -top-12 left-6">
						<div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-primary/20 shadow-md relative">
							{data.profilePhoto ? (
								<Image
									src={data.profilePhoto}
									alt={data.displayName}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
									{data.initials}
								</div>
							)}
						</div>
					</div>

					<div className="flex justify-end pt-4 pb-8 min-h-9">{actions}</div>

					<h1 className="text-[19px] font-bold text-foreground leading-tight">
						{data.displayName}
					</h1>
					<div className="flex items-center gap-2 mt-0.5">
						<p className="text-[13.5px] text-muted-foreground">@{data.username}</p>
						{badge && (
							<span className="text-[10.5px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded leading-none">
								{badge}
							</span>
						)}
					</div>

					{blocked ? (
						<p className="text-[13px] text-muted-foreground mt-4">
							You&apos;ve blocked @{data.username}. They can&apos;t see your posts or contact you.
						</p>
					) : (
						<>
							<div className="flex items-center gap-6 mt-3">
								<StatBlock label="Connections" value={data.connectionCount} />
								<StatBlock label="Following" value={data.followingCount} />
								<StatBlock label="Followers" value={data.followerCount} />
							</div>

							{data.bio && (
								<p className="text-[13.5px] text-foreground/90 leading-relaxed mt-3">{data.bio}</p>
							)}

							<div className="flex items-center gap-6 flex-wrap mt-3 text-[12.5px] text-muted-foreground">
								{data.location && (
									<div className="flex items-center gap-1.5">
										<MapPin size={13} />
										<span className="text-foreground font-medium">{data.location}</span>
									</div>
								)}
								<div className="flex items-center gap-1.5">
									<Calendar size={13} />
									<span className="text-foreground font-medium">
										Joined {dayjs(data.dateJoined).format("MMMM YYYY")}
									</span>
								</div>

								{data.dob && (
									<div className="flex items-center gap-1.5">
										<MapPin size={13} />
										<span className="text-foreground font-medium">
											Born {formatDob(data.dob, data.dobVisibility)}
										</span>
									</div>
								)}

								{data.externalLinks[0] && (
									<div className="flex items-center gap-1.5 flex-wrap">
										<Link2 size={13} />
										<a
											href={data.externalLinks[0].url}
											target="_blank"
											rel="noopener noreferrer"
											className="text-primary font-medium truncate hover:underline"
										>
											{data.externalLinks[0].label || data.externalLinks[0].url}
										</a>
									</div>
								)}
							</div>
						</>
					)}
				</div>

				{!blocked && (
					<>
						<div className="flex border-y border-border sticky top-0 bg-card z-10">
							{PROFILE_TABS.map((tab) => (
								<button
									key={tab}
									onClick={() => onTabChange(tab)}
									className={`flex-1 py-3.5 text-[13.5px] font-medium transition-colors relative ${
										activeTab === tab
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									{tab}
									{activeTab === tab && (
										<span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-10 rounded-full bg-primary" />
									)}
								</button>
							))}
						</div>
						{tabContent}
					</>
				)}
			</div>
		</div>
	)
}

export function UserProfileView({ id }: { id: string }) {
	const router = useRouter()
	const currentUser = useAuthStore((s) => s.user)
	const isOwnProfile = currentUser?.id === id

	const { data: userProfileData, isLoading, isError } = useUserProfile(id, !isOwnProfile)
	const profile = userProfileData?.data

	const toggleFollow = useToggleFollow()
	const muteUser = useMuteUser()
	const unmuteUser = useUnmuteUser()

	const [blockModalOpen, setBlockModalOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<ProfileTab>("Posts")

	const handleBack = () => {
		if (window.history.length > 1) router.back()
		else router.push("/home")
	}

	if (isOwnProfile && currentUser) {
		const data: NormalizedProfile = {
			displayName:
				[currentUser.first_name, currentUser.last_name].filter(Boolean).join(" ") ||
				currentUser.username,
			initials: getInitials(currentUser.first_name, currentUser.last_name),
			username: currentUser.username,
			profilePhoto: currentUser.profile_photo || null,
			coverPhoto: currentUser.cover_photo || null,
			bio: currentUser.profile?.about_me ?? "",
			location: [currentUser.state, currentUser.country].filter(Boolean).join(", "),
			dob: currentUser.dob ?? "",
			dobVisibility: currentUser.dob_visibility ?? "partial",
			dateJoined: currentUser.date_joined,
			externalLinks: currentUser.external_links ?? [],
			followerCount: currentUser.follower_count,
			followingCount: currentUser.following_count,
			connectionCount: currentUser.connection_count,
		}

		return (
			<ProfileShell
				data={data}
				onBack={handleBack}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				tabContent={<ProfileTabsContent id={currentUser.id} activeTab={activeTab} />}
				actions={
					<button
						onClick={() =>
							router.push(
								`/settings?view=profile&returnTo=${encodeURIComponent(`/profile/${currentUser.id}`)}`,
							)
						}
						className="h-9 px-5 rounded-full border border-border text-[13.5px] font-semibold text-foreground hover:bg-accent transition-colors"
					>
						Edit profile
					</button>
				}
			/>
		)
	}

	if (isLoading) return <ProfileSkeleton />

	if (isError || !profile) {
		return (
			<div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 bg-card rounded-t-2xl border border-border">
				<p className="text-sm text-muted-foreground">Couldn&apos;t load this profile.</p>
				<button
					onClick={handleBack}
					className="text-[13px] font-semibold text-primary hover:underline"
				>
					Go back
				</button>
			</div>
		)
	}

	const isFollowed = profile.is_user_you_follow
	const isMuted = profile.is_muted

	const handleToggleFollow = () => toggleFollow.mutate({ id: profile.id, wasFollowing: isFollowed })

	const handleMuteToggle = () => {
		if (isMuted) unmuteUser.mutate(profile.pkid)
		else muteUser.mutate(profile.pkid)
	}

	const data: NormalizedProfile = {
		displayName:
			[profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username,
		initials: getInitials(profile.first_name, profile.last_name),
		username: profile.username,
		profilePhoto: profile.profile_photo,
		coverPhoto: profile.cover_photo,
		bio: profile.profile?.about_me ?? "",
		location: [profile.state, profile.country].filter(Boolean).join(", "),
		dob: profile.dob,
		dobVisibility: profile.dob_visibility,
		dateJoined: profile.date_joined,
		externalLinks: profile.external_links ?? [],
		followerCount: profile.follower_count,
		followingCount: profile.following_count,
		connectionCount: profile.connection_count,
	}

	return (
		<>
			<ProfileShell
				data={data}
				onBack={handleBack}
				badge={profile.is_following_you ? "Follows you" : undefined}
				blocked={profile.is_blocked}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				tabContent={<ProfileTabsContent id={profile.id} activeTab={activeTab} />}
				actions={
					profile.is_blocked ? null : (
						<div className="flex items-center gap-2">
							<button
								onClick={() => console.log("TODO: open DM with", profile.pkid)}
								className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
								title="Message"
							>
								<MessageCircle size={16} />
							</button>

							<FollowButton
								isFollowed={isFollowed}
								followsYou={profile.is_following_you}
								onClick={handleToggleFollow}
								disabled={toggleFollow.isPending}
								className="h-9 px-5 text-[13.5px]"
							/>

							<ActionDropdown
								trigger={<MoreHorizontal size={18} />}
								clsName="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
								items={[
									{
										label: isMuted ? `Unmute @${profile.username}` : `Mute @${profile.username}`,
										icon: <ShieldOff size={16} />,
										onSelect: handleMuteToggle,
									},
									{
										label: `Block @${profile.username}`,
										icon: <UserX size={16} />,
										onSelect: () => setBlockModalOpen(true),
										destructive: true,
									},
								]}
							/>
						</div>
					)
				}
			/>
			<BlockUserModal
				pkid={profile.pkid}
				username={profile.username}
				open={blockModalOpen}
				onOpenChange={setBlockModalOpen}
			/>
		</>
	)
}
