"use client"

import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { useMuteUser, useUnmuteUser } from "@/hooks/use-mute-actions"
import { useUserProfile } from "@/hooks/use-user-profile"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { ExternalLink } from "@/types/api"
import dayjs from "dayjs"
import {
	ArrowLeft,
	Calendar,
	Link2,
	MapPin,
	MessageCircle,
	MoreHorizontal,
	ShieldOff,
	UserX,
	Wrench,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ReactNode, useState } from "react"
import { ActionDropdown } from "./action-dropdown"
import { BlockUserModal } from "./block-user-modal"

function getInitials(first?: string | null, last?: string | null) {
	return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "?"
}

function formatCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
	return String(n)
}

function formatDob(dob: string, dob_visibility: "full" | "partial") {
	const format = dob_visibility === "partial" ? "D MMM" : "D MMM, YYYY"
	return dayjs(dob).format(format)
}

interface NormalizedProfile {
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

const PROFILE_TABS = ["Posts", "Replies", "Media", "Likes"] as const
type ProfileTab = (typeof PROFILE_TABS)[number]

function StatBlock({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex flex-1 flex-col">
			<span className="text-[15px] font-bold text-foreground">{formatCount(value)}</span>
			<span className="text-[13px] text-muted-foreground">{label}</span>
		</div>
	)
}

function ComingSoonTab({ tab }: { tab: ProfileTab }) {
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-6">
			<div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
				<Wrench size={20} className="text-primary" />
			</div>
			<div>
				<p className="font-semibold text-foreground text-[14px]">{tab} coming soon</p>
				<p className="text-[12.5px] text-muted-foreground mt-1 max-w-56">
					This tab isn&apos;t wired up to real data yet.
				</p>
			</div>
		</div>
	)
}

function ProfileSkeleton() {
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

function ProfileShell({
	data,
	onBack,
	actions,
	badge,
	blocked,
	activeTab,
	onTabChange,
}: {
	data: NormalizedProfile
	onBack: () => void
	actions: ReactNode
	badge?: string
	blocked?: boolean
	activeTab: ProfileTab
	onTabChange: (tab: ProfileTab) => void
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
						<div className="flex border-t border-border sticky top-0 bg-card z-10">
							{PROFILE_TABS.map((tab) => (
								<button
									key={tab}
									onClick={() => onTabChange(tab)}
									className={cn(
										"flex-1 py-3.5 text-[13.5px] font-medium transition-colors relative",
										activeTab === tab
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{tab}
									{activeTab === tab && (
										<span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2.5px] w-10 rounded-full bg-primary" />
									)}
								</button>
							))}
						</div>
						<ComingSoonTab tab={activeTab} />
					</>
				)}
			</div>
		</div>
	)
}

export function UserProfileView({ pkid }: { pkid: number }) {
	const router = useRouter()
	const currentUser = useAuthStore((s) => s.user)
	const isOwnProfile = currentUser?.pkid === pkid

	const { data: userProfileData, isLoading, isError } = useUserProfile(pkid, !isOwnProfile)
	const profile = userProfileData?.data

	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()
	const muteUser = useMuteUser()
	const unmuteUser = useUnmuteUser()

	const [followOverride, setFollowOverride] = useState<boolean | null>(null)
	const [muteOverride, setMuteOverride] = useState<boolean | null>(null)
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
				actions={
					<button
						onClick={() =>
							router.push(
								`/settings?view=profile&returnTo=${encodeURIComponent(`/profile/${pkid}`)}`,
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

	const isFollowed = followOverride ?? profile.is_user_you_follow
	const isMuted = muteOverride ?? profile.is_muted

	const handleFollowToggle = () => {
		if (isFollowed) {
			setFollowOverride(false)
			unfollowUser.mutate(pkid, { onError: () => setFollowOverride(true) })
		} else {
			setFollowOverride(true)
			followUser.mutate(pkid, { onError: () => setFollowOverride(false) })
		}
	}

	const handleMuteToggle = () => {
		if (isMuted) {
			setMuteOverride(false)
			unmuteUser.mutate(pkid, { onError: () => setMuteOverride(true) })
		} else {
			setMuteOverride(true)
			muteUser.mutate(pkid, { onError: () => setMuteOverride(false) })
		}
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
		dob: profile.date_joined ?? "", // TODO: get DOB from backend and fix here
		dobVisibility: "partial",
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
				actions={
					profile.is_blocked ? null : (
						<div className="flex items-center gap-2">
							<button
								onClick={() => console.log("TODO: open DM with", pkid)}
								className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent transition-colors"
								title="Message"
							>
								<MessageCircle size={16} />
							</button>
							<button
								onClick={handleFollowToggle}
								disabled={followUser.isPending || unfollowUser.isPending}
								className={cn(
									"group h-9 px-5 rounded-full text-[13.5px] font-semibold transition-all active:scale-[0.97] disabled:opacity-60",
									isFollowed
										? "border border-border text-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/5"
										: "bg-foreground text-background hover:opacity-85",
								)}
							>
								<span className={isFollowed ? "group-hover:hidden" : ""}>
									{isFollowed ? "Following" : profile.is_following_you ? "Follow Back" : "Follow"}
								</span>
								{isFollowed && <span className="hidden group-hover:inline">Unfollow</span>}
							</button>
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
				pkid={pkid}
				username={profile.username}
				open={blockModalOpen}
				onOpenChange={setBlockModalOpen}
			/>
		</>
	)
}
