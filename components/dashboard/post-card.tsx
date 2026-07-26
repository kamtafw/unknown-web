"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useUnblockUsers } from "@/hooks/use-block-actions"
import { useFollowUser, useUnfollowUser } from "@/hooks/use-follow-actions"
import { useMuteUser, useUnmuteUser } from "@/hooks/use-mute-actions"
import {
	useBookmarkPost,
	useDeletePost,
	useLikePost,
	useTogglePinnedPost,
} from "@/hooks/use-post-actions"
import { useNotInterested } from "@/hooks/use-post-interactions"
import { usePostStats } from "@/hooks/use-post-stats"
import { useRepost } from "@/hooks/use-repost"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { isOriginalComment, isSettledRepostPkid, resolveEngagementPost } from "@/lib/post-helpers"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { OriginalComment, OriginalPost, Post } from "@/types/api"
import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, MoreHorizontal, Users } from "lucide-react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { forwardRef, useState } from "react"
import {
	Block,
	ChangeReplier,
	ColorMessage,
	Connect,
	Mute,
	NotInterested,
	Pin,
	Quote,
	RequestNote,
	ScreenReader,
	Trash,
} from "../posts/icons"
import { ActionDropdown, ActionDropdownItem } from "./action-dropdown"
import { AuthorHoverCard } from "./author-hover-card"
import { BlockUserModal } from "./block-user-modal"
import { CommentModal } from "./comment-modal"
import { EditPostModal } from "./edit-post-modal"
import { Bookmark2, Comment, Like, Repost, Share, Stats } from "./icons"
import { MediaLightbox } from "./media-lightbox"
import { QuoteModal } from "./quote-modal"
import { ReadAloudModal } from "./read-aloud-modal"
import { RequestNoteModal } from "./request-note-modal"

export function formatCount(count: number) {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
	if (count >= 1_000) return `${(count / 1_000).toFixed(0)}k`
	return String(count)
}

export function shortAddress(address: string) {
	const parts = address
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
	return parts.slice(-3, -1).join(", ")
}

export function mediaType(url: string): "image" | "video" | "audio" {
	const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() ?? ""
	if (["mp4", "mov", "webm"].includes(ext)) return "video"
	if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio"
	return "image"
}

export function getInitials(first: string, last: string) {
	return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

export function renderText(text: string) {
	return text.split(/([@#]\w+)/g).map((part, i) =>
		/^[@#]/.test(part) ? (
			<span key={i} className="text-primary cursor-pointer hover:underline">
				{part}
			</span>
		) : (
			part
		),
	)
}

function normaliseCommentOriginal(original: OriginalPost | OriginalComment) {
	if (isOriginalComment(original)) {
		return {
			message: original.message,
			mediaUrls: original.uploaded_media,
			replyCount: original.replies.length,
		}
	}
	return {
		message: original.content_text,
		mediaUrls: original.post_media?.map((m) => m.external_url) ?? [],
		replyCount: 0,
	}
}

export const UserAvatar = forwardRef<
	HTMLSpanElement,
	{
		src?: string | null
		first: string
		last: string
		size?: "sm" | "md"
		className?: string
	}
>(function UserAvatar({ src, first, last, size = "md", className }, ref) {
	const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10"
	const txt = size === "sm" ? "text-[11px]" : "text-sm"
	return (
		<Avatar.Root
			ref={ref}
			className={cn(`${dim} rounded-full overflow-hidden shrink-0`, className)}
		>
			<Avatar.Image
				src={src ?? undefined}
				alt={`${first} ${last}`}
				className="w-full h-full object-cover"
			/>
			<Avatar.Fallback
				className={`w-full h-full bg-primary/45 text-primary-foreground ${txt} font-semibold flex items-center justify-center`}
			>
				{getInitials(first ?? "John", last ?? "Doe")}
			</Avatar.Fallback>
		</Avatar.Root>
	)
})

export function MediaGrid({ urls }: { urls: string[] }) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

	if (!urls.length) return null

	const types = urls.map((url) => mediaType(url))
	if (types.every((t) => t === "audio")) {
		return (
			<div className="mt-3 flex flex-col gap-2">
				{urls.map((url, i) => (
					<audio key={i} controls src={url} className="w-full" />
				))}
			</div>
		)
	}

	const visible = urls.slice(0, 4)
	const overflow = urls.length - 4
	const count = visible.length
	const imageUrls = urls.filter((url) => mediaType(url) === "image")

	return (
		<>
			<div
				className={`mt-3 rounded-2xl overflow-hidden grid gap-0.5 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`}
			>
				{visible.map((url, i) => {
					const type = mediaType(url)
					const isLast = i === count - 1 && overflow > 0
					const spanClass = count === 3 && i === 0 ? "row-span-2" : ""
					const aspectClass = count === 1 ? "aspect-video" : "aspect-square"
					return (
						<div
							key={i}
							className={`relative overflow-hidden bg-muted ${spanClass} ${aspectClass}`}
						>
							{type === "video" ? (
								<video src={url} controls className="w-full h-full object-cover" />
							) : type === "audio" ? (
								<div className="flex items-center justify-center h-full">
									<audio controls src={url} className="w-5/6" />
								</div>
							) : (
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation()
										setLightboxIndex(imageUrls.indexOf(url))
									}}
									className="block w-full h-full cursor-zoom-in"
								>
									<Image src={url} alt="" fill={true} className="object-cover" />
								</button>
							)}
							{isLast && (
								<div className="absolute inset-0 bg-black/45 flex items-center justify-center pointer-events-none">
									<span className="text-white text-2xl font-semibold">+{overflow}</span>
								</div>
							)}
						</div>
					)
				})}
			</div>
			{imageUrls.length > 0 && (
				<MediaLightbox
					urls={imageUrls}
					index={lightboxIndex ?? 0}
					open={lightboxIndex !== null}
					onOpenChange={(v) => !v && setLightboxIndex(null)}
				/>
			)}
		</>
	)
}

export function QuotedCommentCard({ comment }: { comment: OriginalComment }) {
	const router = useRouter()
	const { message, mediaUrls } = normaliseCommentOriginal(comment)
	const timeAgo = useTimeAgo(comment.created_at)
	const fullname =
		[comment.user.first_name, comment.user.last_name].filter(Boolean).join(" ") ||
		comment.user.username

	return (
		<div
			onClick={() => router.push(`/posts/${comment.post}?comment=${comment.id}`)}
			className="mt-3 border border-border rounded-xl p-3 bg-muted/50 cursor-pointer hover:bg-accent/50 transition-colors"
		>
			<div className="flex items-center gap-2 mb-2">
				<AuthorHoverCard pkid={comment.user.pkid} fallback={comment.user}>
					<UserAvatar
						src={comment.user.profile_photo}
						first={comment.user.first_name}
						last={comment.user.last_name}
						size="sm"
					/>
				</AuthorHoverCard>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
					<AuthorHoverCard pkid={comment.user.pkid} fallback={comment.user}>
						<span className="text-[13px] font-semibold text-foreground truncate leading-tight">
							{fullname}
						</span>
					</AuthorHoverCard>
					<AuthorHoverCard pkid={comment.user.pkid} fallback={comment.user}>
						<span>@{comment.user.username}</span>
					</AuthorHoverCard>
					<span>•</span>
					<span>{timeAgo}</span>
				</div>
			</div>
			{!!message && (
				<p className="text-[13px] text-foreground leading-relaxed">{renderText(message)}</p>
			)}
			<MediaGrid urls={mediaUrls} />
		</div>
	)
}

export function QuotedPostCard({ post }: { post: OriginalPost }) {
	const router = useRouter()
	const timeAgo = useTimeAgo(post.created_at)
	const mediaUrls = post.post_media?.map((m) => m.external_url) ?? []
	const fullname =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username

	return (
		<div
			onClick={() => router.push(`/posts/${post.pkid}`)}
			className="mt-3 border border-border rounded-xl p-3 bg-muted/50 cursor-pointer hover:bg-accent/50 transition-colors"
		>
			<div className="flex items-center gap-2 mb-2">
				<AuthorHoverCard pkid={post.user.pkid} fallback={post.user}>
					<UserAvatar
						src={post.user.profile_photo}
						first={post.user.first_name}
						last={post.user.last_name}
						size="sm"
					/>
				</AuthorHoverCard>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
					<AuthorHoverCard pkid={post.user.pkid} fallback={post.user}>
						<span className="text-[13px] font-semibold text-foreground truncate leading-tight">
							{fullname}
						</span>
					</AuthorHoverCard>
					<AuthorHoverCard pkid={post.user.pkid} fallback={post.user}>
						<span>@{post.user.username}</span>
					</AuthorHoverCard>
					<span>•</span>
					<span>{timeAgo}</span>
				</div>
			</div>
			{!!post.content_text && (
				<p className="text-[13px] text-foreground leading-relaxed">
					{renderText(post.content_text)}
				</p>
			)}
			<MediaGrid urls={mediaUrls} />
		</div>
	)
}

function ActionBar({
	post,
	comments,
	reposts,
	onQuoteClick,
	onCommentClick,
}: {
	post: Post
	comments: number
	reposts: number
	onQuoteClick: () => void
	onCommentClick: () => void
}) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()
	const isOwn = post.user.pkid === user?.pkid
	const repost = useRepost()
	const undoRepost = useDeletePost()

	const handleRepost = () => {
		if (post.my_repost_pkid == null) {
			repost.mutate({ is_repost: true, original_post: post.id })
			return
		}
		if (isSettledRepostPkid(post.my_repost_pkid)) {
			undoRepost.mutate({
				pkid: post.my_repost_pkid,
				originalPost: { id: post.id, wasBareRepost: true },
			})
		}
		// else: still settling from the create — ignore the click rather than
		// delete with a temp pkid
	}

	return (
		<div className="flex items-center mt-4 text-muted-foreground">
			<div className="flex flex-1 flex-row items-center gap-5">
				<button
					onClick={() => likePost.mutate(post.id)}
					className="flex flex-1 flex-row items-center gap-1.5 transition-colors hover:text-primary cursor-pointer"
				>
					<Like color={post.liked_by_me ? "#6A88D1" : undefined} />
					<span className="text-sm tabular-nums font-medium">
						{formatCount(post.post_like_count)}
					</span>
				</button>

				<button
					onClick={onCommentClick}
					className="flex flex-1 flex-row items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
				>
					<Comment />
					<span className="text-sm tabular-nums">{formatCount(comments)}</span>
				</button>

				<RepostButton
					reposted={post.my_repost_pkid != null}
					reposts={reposts}
					onRepost={handleRepost}
					onQuote={onQuoteClick}
				/>
				<ShareButton postId={post.id} />
			</div>

			<div className="flex flex-row items-center gap-4 ml-auto">
				<button
					onClick={() => bookmarkPost.mutate(post.id)}
					disabled={bookmarkPost.isPending}
					className="flex items-center ml-auto transition-colors hover:text-primary cursor-pointer"
				>
					<Bookmark2
						color={post.bookmarked_by_me ? "#6A88D1" : undefined}
						bookmarked={post.bookmarked_by_me}
					/>
				</button>
				{isOwn && (
					<StatsButton
						postId={post.id}
						hasVideo={post.post_media.some((m) => mediaType(m.external_url) === "video")}
					/>
				)}
			</div>
		</div>
	)
}

export function RepostButton({
	reposted,
	reposts,
	onRepost,
	onQuote,
	size,
}: {
	reposted: boolean
	reposts?: number
	onRepost: () => void
	onQuote: () => void
	size?: number
}) {
	return (
		<ActionDropdown
			trigger={
				<>
					<Repost color={reposted ? "#6A88D1" : undefined} size={size} />
					{reposts && <span className="text-sm tabular-nums">{formatCount(reposts)}</span>}
				</>
			}
			items={[
				{
					label: reposted ? "Undo repost" : "Repost",
					icon: <Repost size={20} color="currentColor" />,
					onSelect: onRepost,
				},
				{ label: "Quote", icon: <Quote size={20} color="currentColor" />, onSelect: onQuote },
			]}
			clsName="flex flex-1 flex-row items-center gap-1.5 rounded-full transition-colors cursor-pointer"
		/>
	)
}

export function ShareButton({ postId, size }: { postId: string; size?: number }) {
	return (
		<ActionDropdown
			trigger={<Share size={size} />}
			items={[
				{
					label: "Share to messenger",
					icon: <ColorMessage size={23} />,
					onSelect: () => console.log("TODO: share to messenger", postId),
				},
				{
					label: "Share to followers",
					icon: <Users size={18} className="shrink-0" />,
					onSelect: () => console.log("TODO: share to followers", postId),
				},
			]}
			clsName="flex flex-1 items-center rounded-full transition-colors cursor-pointer"
		/>
	)
}

function StatItem({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-[11px] text-muted-foreground">{label}</span>
			<span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
		</div>
	)
}

function StatsSkeleton({ count }: { count: number }) {
	return (
		<div className="grid grid-cols-2 gap-x-4 gap-y-3 animate-pulse">
			{Array.from({ length: count }).map((_, i) => (
				<div key={i} className="flex flex-col gap-1.5">
					<div className="h-2.5 w-14 bg-muted rounded-full" />
					<div className="h-3.5 w-8 bg-muted rounded-full" />
				</div>
			))}
		</div>
	)
}

export function StatsButton({
	postId,
	hasVideo = false,
	size,
}: {
	postId: string
	hasVideo?: boolean
	size?: number
}) {
	const [isOpen, setIsOpen] = useState(false)
	const { data: stats, isLoading } = usePostStats(postId, isOpen)

	const statItems = [
		{ label: "Views", value: stats?.total_views },
		...(hasVideo ? [{ label: "Watch time", value: stats?.watch_time }] : []),
		{ label: "Reactions", value: stats?.total_reactions },
		{ label: "Comments", value: stats?.total_comments },
		{ label: "Reposts", value: stats?.total_reposts },
		{ label: "Shares", value: stats?.total_shares },
		{ label: "Bookmarks", value: stats?.total_bookmarks },
	]

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label="View post activity"
					className="flex flex-1 flex-row items-center rounded-full transition-colors hover:text-primary cursor-pointer"
				>
					<Stats size={size} />
				</button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-60 p-4 rounded-2xl border border-border shadow-xl"
			>
				<h3 className="font-bold text-foreground text-[13px] mb-3">Post activity</h3>
				{isLoading || !stats ? (
					<StatsSkeleton count={statItems.length} />
				) : (
					<div className="grid grid-cols-2 gap-x-4 gap-y-3">
						{statItems.map((item) => (
							<StatItem key={item.label} label={item.label} value={item.value ?? "—"} />
						))}
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}

function DeletePostConfirmDialog({
	open,
	onClose,
	onConfirm,
	isPending,
}: {
	open: boolean
	onClose: () => void
	onConfirm: () => void
	isPending: boolean
}) {
	return (
		<Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-[calc(100%-2rem)] max-w-96 bg-card border border-border rounded-3xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<Dialog.Title className="font-bold text-foreground text-[15px] mb-1.5">
						Delete post?
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-muted-foreground leading-relaxed mb-6">
						This can&apos;t be undone. This post will be removed from your profile, the feed, and
						anyone else who has it bookmarked.
					</Dialog.Description>
					<div className="flex items-center justify-end gap-4">
						<Dialog.Close asChild>
							<button className="flex-1 text-sm font-semibold text-muted-foreground hover:opacity-70 transition-colors cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={onConfirm}
							disabled={isPending}
							className="flex-1 text-destructive text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
						>
							{isPending ? (
								<>
									<Loader2 size={12} className="animate-spin" /> Deleting…
								</>
							) : (
								"Delete"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export function PostOptionsMenu({
	post,
	currentUserId,
	feedItemId,
}: {
	post: Post
	currentUserId?: number
	feedItemId?: string
}) {
	const isOwn = post.user.pkid === currentUserId
	const pkid = post.user.pkid

	const router = useRouter()
	const pathname = usePathname()

	const [readAloudOpen, setReadAloudOpen] = useState(false)
	const [requestNoteOpen, setRequestNoteOpen] = useState(false)
	const [blockOpen, setBlockOpen] = useState(false)
	const [editOpen, setEditOpen] = useState(false)
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

	const bookmarkPost = useBookmarkPost()
	const followUser = useFollowUser()
	const unfollowUser = useUnfollowUser()
	const muteUser = useMuteUser()
	const unmuteUser = useUnmuteUser()
	const unblockUsers = useUnblockUsers()
	const notInterested = useNotInterested()
	const togglePinnedPost = useTogglePinnedPost()
	const deletePost = useDeletePost()

	const isFollowed = post.user.youFollowThisUser ?? false
	const isMuted = post.user.youMutedThisUser ?? false
	const isBlocked = post.user.youBlockedThisUser ?? false
	const followsYou = post.user.thisUserFollowsYou ?? false

	const handleFollowToggle = () => {
		if (isFollowed) unfollowUser.mutate(pkid)
		else followUser.mutate(pkid)
	}

	const handleMuteToggle = () => {
		if (isMuted) unmuteUser.mutate(pkid)
		else muteUser.mutate(pkid)
	}

	const handleUnblock = () => unblockUsers.mutate([pkid])

	const handleNotInterested = () => notInterested.mutate(feedItemId ?? post.id)

	const handleTogglePinned = () => togglePinnedPost.mutate(post.id)

	const handleDeleteConfirm = () => {
		const originalPost =
			post.is_repost && post.original_post && !isOriginalComment(post.original_post)
				? { id: post.original_post.id, wasBareRepost: !post.content_text?.trim() }
				: undefined
		deletePost.mutate(
			{ pkid: post.pkid, id: post.id, originalPost },
			{
				onSuccess: () => {
					setDeleteConfirmOpen(false)
					if (pathname.startsWith(`/posts/${post.pkid}`)) router.push("/home")
				},
			},
		)
	}

	const ownItems: ActionDropdownItem[] = [
		{
			label: "Edit post",
			icon: <Quote />,
			onSelect: () => setEditOpen(true),
		},
		{
			label: post.is_pinned ? "Unpin from profile" : "Pin to profile",
			icon: <Pin />,
			onSelect: handleTogglePinned,
		},
		{
			label: "Change who can reply",
			icon: <ChangeReplier />,
			onSelect: () => setEditOpen(true),
		},
		{
			label: "Delete post",
			icon: <Trash />,
			onSelect: () => setDeleteConfirmOpen(true),
			destructive: true,
		},
	]

	const otherItems: ActionDropdownItem[] = [
		{
			label: "Read post out loud",
			icon: <ScreenReader />,
			onSelect: () => setReadAloudOpen(true),
		},
		{
			label: "Not interested in this post",
			icon: <NotInterested />,
			onSelect: handleNotInterested,
		},
		{
			label: "Request community note",
			icon: <RequestNote />,
			onSelect: () => setRequestNoteOpen(true),
		},
		{
			label: post.bookmarked_by_me ? "Remove from saved" : "Add to saved",
			icon: (
				<Bookmark2
					size={20}
					color={post.bookmarked_by_me ? "#6A88D1" : undefined}
					bookmarked={post.bookmarked_by_me}
				/>
			),
			onSelect: () => bookmarkPost.mutate(post.id),
		},
		{
			label: isFollowed
				? `Unfollow @${post.user.username}`
				: followsYou
					? `Follow Back @${post.user.username}`
					: `Follow @${post.user.username}`,
			icon: <Connect />,
			onSelect: handleFollowToggle,
		},
		{
			label: isMuted ? `Unmute @${post.user.username}` : `Mute @${post.user.username}`,
			icon: <Mute />,
			onSelect: handleMuteToggle,
		},
		isBlocked
			? {
					label: unblockUsers.isPending ? "Unblocking…" : `Unblock @${post.user.username}`,
					icon: <Block />,
					onSelect: handleUnblock,
				}
			: {
					label: `Block @${post.user.username}`,
					icon: <Block />,
					onSelect: () => setBlockOpen(true),
					destructive: true,
				},
	]

	return (
		<>
			<ActionDropdown
				trigger={<MoreHorizontal size={18} />}
				items={isOwn ? ownItems : otherItems}
				clsName="text-muted-foreground hover:text-foreground shrink-0 p-1.5 rounded-full hover:bg-accent transition-colors focus:outline-none"
			/>

			<ReadAloudModal
				text={post.content_text ?? ""}
				open={readAloudOpen}
				onOpenChange={setReadAloudOpen}
			/>
			<RequestNoteModal postId={post.id} open={requestNoteOpen} onOpenChange={setRequestNoteOpen} />
			<BlockUserModal
				pkid={post.user.pkid}
				username={post.user.username}
				open={blockOpen}
				onOpenChange={setBlockOpen}
			/>

			{isOwn && (
				<>
					<EditPostModal post={post} open={editOpen} onOpenChange={setEditOpen} />
					<DeletePostConfirmDialog
						open={deleteConfirmOpen}
						onClose={() => setDeleteConfirmOpen(false)}
						onConfirm={handleDeleteConfirm}
						isPending={deletePost.isPending}
					/>
				</>
			)}
		</>
	)
}

export function PostCard({ post }: { post: Post }) {
	const router = useRouter()
	const user = useAuthStore((s) => s.user)

	const [commentOpen, setCommentOpen] = useState(false)
	const [quoteOpen, setQuoteOpen] = useState(false)

	const isCommentRepost = post.reposted_object_type === "Comment"
	const unquotedRepost = post.is_repost && !post.content_text?.trim()
	const isMyRepost = post.user.pkid === user?.pkid

	const engagementPost = resolveEngagementPost(post)
	const displayPost = unquotedRepost ? (post.original_post as OriginalPost)! : post
	const normalisedComment =
		isCommentRepost && post.original_post ? normaliseCommentOriginal(post.original_post) : null
	const displayText =
		unquotedRepost && isCommentRepost
			? (normalisedComment?.message ?? null)
			: (displayPost.content_text ?? null)
	const mediaUrls =
		normalisedComment && unquotedRepost
			? normalisedComment.mediaUrls
			: ((displayPost as Post).post_media.map((m) => m.external_url) ?? [])

	const fullname =
		[displayPost.user.first_name, displayPost.user.last_name].filter(Boolean).join(" ") ||
		displayPost.user.username
	const repostName =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username
	const timeAgo = useTimeAgo(displayPost.created_at)
	const address = !isCommentRepost ? (displayPost.post_location?.[0]?.address ?? "") : ""

	return (
		<article className="px-5 py-5 border-b border-border last:border-b-0">
			{unquotedRepost && (
				<div
					onClick={() => router.push(`/posts/${displayPost.pkid}`)}
					className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground font-medium cursor-pointer"
				>
					<Repost size={13} />
					{isMyRepost ? "You" : repostName} reposted
				</div>
			)}

			<div onClick={() => router.push(`/posts/${displayPost.pkid}`)} className="cursor-pointer">
				<div className="flex items-start gap-3">
					<AuthorHoverCard pkid={displayPost.user.pkid} fallback={displayPost.user}>
						<UserAvatar
							src={displayPost.user.profile_photo}
							first={displayPost.user.first_name}
							last={displayPost.user.last_name}
						/>
					</AuthorHoverCard>
					<div className="flex-1 min-w-0">
						<AuthorHoverCard pkid={displayPost.user.pkid} fallback={displayPost.user}>
							<span className="font-semibold text-sm text-foreground cursor-pointer hover:underline underline-offset-1">
								{fullname}
							</span>
						</AuthorHoverCard>{" "}
						<AuthorHoverCard pkid={displayPost.user.pkid} fallback={displayPost.user}>
							<span className="text-muted-foreground text-[13.5px]">
								@{displayPost.user.username}
							</span>
						</AuthorHoverCard>
						<div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground overflow-hidden whitespace-nowrap">
							<span className="shrink-0">{timeAgo}</span>
							{address && (
								<>
									<span className="shrink-0">•</span>
									<span className="truncate">{address}</span>
								</>
							)}
						</div>
					</div>

					<div onClick={(e) => e.stopPropagation()}>
						<PostOptionsMenu
							post={engagementPost}
							currentUserId={user?.pkid}
							feedItemId={post.id}
						/>
					</div>
				</div>

				<div className="mt-2.5">
					{!!displayText && (
						<p className="text-[13.5px] text-foreground leading-relaxed">
							{renderText(displayText)}
						</p>
					)}
					{mediaUrls.length > 0 && <MediaGrid urls={mediaUrls} />}
					{!unquotedRepost && post.original_post && (
						<div onClick={(e) => e.stopPropagation()}>
							{isOriginalComment(post.original_post) ? (
								<QuotedCommentCard comment={post.original_post} />
							) : (
								<QuotedPostCard post={post.original_post} />
							)}
						</div>
					)}
				</div>
			</div>

			<div onClick={(e) => e.stopPropagation()}>
				<ActionBar
					post={engagementPost}
					comments={engagementPost.post_comment_count}
					reposts={engagementPost.repost_count}
					onCommentClick={() => setCommentOpen(true)}
					onQuoteClick={() => setQuoteOpen(true)}
				/>
			</div>

			<CommentModal post={engagementPost} open={commentOpen} onOpenChange={setCommentOpen} />
			<QuoteModal post={engagementPost} open={quoteOpen} onOpenChange={setQuoteOpen} />
		</article>
	)
}
