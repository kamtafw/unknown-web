"use client"

import { useBookmarkPost, useLikePost } from "@/hooks/use-post-actions"
import { usePostStats } from "@/hooks/use-post-stats"
import { useRepost } from "@/hooks/use-repost"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { useAuthStore } from "@/stores/auth-store"
import type { OriginalComment, OriginalPost, Post } from "@/types/api"
import { MoreHorizontal, Users } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { useState } from "react"
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
import { CommentModal } from "./comment-modal"
import { Bookmark2, Comment, Like, Repost, Share, Stats } from "./icons"
import { QuoteModal } from "./quote-modal"

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

export function isOriginalComment(
	obj: OriginalPost | OriginalComment | null | undefined,
): obj is OriginalComment {
	return !!obj && "message" in obj
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

export function UserAvatar({
	src,
	first,
	last,
	size = "md",
}: {
	src?: string | null
	first: string
	last: string
	size?: "sm" | "md"
}) {
	const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10"
	const txt = size === "sm" ? "text-[11px]" : "text-sm"
	return (
		<Avatar.Root className={`${dim} rounded-full overflow-hidden shrink-0`}>
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
}

export function MediaGrid({ urls }: { urls: string[] }) {
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

	return (
		<div
			className={`mt-3 rounded-2xl overflow-hidden grid gap-0.5 ${count === 1 ? "grid-cols-1" : "grid-cols-2"}`}
		>
			{visible.map((url, i) => {
				const type = mediaType(url)
				const isLast = i === count - 1 && overflow > 0
				const spanClass = count === 3 && i === 0 ? "row-span-2" : ""
				const aspectClass = count === 1 ? "aspect-video" : "aspect-square"
				return (
					<div key={i} className={`relative overflow-hidden bg-muted ${spanClass} ${aspectClass}`}>
						{type === "video" ? (
							<video src={url} controls className="w-full h-full object-cover" />
						) : type === "audio" ? (
							<div className="flex items-center justify-center h-full">
								<audio controls src={url} className="w-5/6" />
							</div>
						) : (
							<Image src={url} alt="" fill={true} className="object-cover" />
						)}
						{isLast && (
							<div className="absolute inset-0 bg-black/45 flex items-center justify-center">
								<span className="text-white text-2xl font-semibold">+{overflow}</span>
							</div>
						)}
					</div>
				)
			})}
		</div>
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
				<UserAvatar
					src={comment.user.profile_photo}
					first={comment.user.first_name}
					last={comment.user.last_name}
					size="sm"
				/>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
					<span className="text-[13px] font-semibold text-foreground truncate leading-tight">
						{fullname}
					</span>
					<span>@{comment.user.username}</span>
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
				<UserAvatar
					src={post.user.profile_photo}
					first={post.user.first_name}
					last={post.user.last_name}
					size="sm"
				/>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
					<span className="text-[13px] font-semibold text-foreground truncate leading-tight">
						{fullname}
					</span>
					<span>@{post.user.username}</span>
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
	reposts: initReposts,
	repostedByMe,
	onQuoteClick,
	onCommentClick,
}: {
	post: Post
	comments: number
	reposts: number
	repostedByMe: boolean
	onQuoteClick: () => void
	onCommentClick: () => void
}) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()
	const isOwn = post.user.pkid === user?.pkid
	const repost = useRepost()
	const [reposted, setReposted] = useState(repostedByMe)
	const [reposts, setReposts] = useState(initReposts)

	const handleRepost = () => {
		setReposted((v) => !v)
		setReposts((n) => (reposted ? n - 1 : n + 1))
		if (!reposted) repost.mutate({ is_repost: true, original_post: post.id })
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
					reposted={reposted}
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
				{isOwn && <StatsButton postId={post.id} />}
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

export function StatsButton({ postId, size }: { postId: string; size?: number }) {
	const [isOpen, setIsOpen] = useState(false)
	const { data, isLoading } = usePostStats(postId, isOpen)

	const statItems: ActionDropdownItem[] = [
		{
			label: "Views",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_views : "?"}
				</span>
			),
		},
		{
			label: "Watch time",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.watch_time : "?"}
				</span>
			),
		},
		{
			label: "Reactions",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_reactions : "?"}
				</span>
			),
		},
		{
			label: "Comments",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_comments : "?"}
				</span>
			),
		},
		{
			label: "Reposts",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_reposts : "?"}
				</span>
			),
		},
		{
			label: "Shares",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_shares : "?"}
				</span>
			),
		},
		{
			label: "Bookmarks",
			icon: (
				<span className="text-sm font-semibold text-foreground">
					{data && !isLoading ? data.total_bookmarks : "?"}
				</span>
			),
		},
	]

	return (
		<ActionDropdown
			trigger={<Stats size={size} />}
			items={statItems}
			onOpenChange={(open) => {
				if (open) setIsOpen(true)
			}}
			clsName="flex flex-1 flex-row items-center rounded-full transition-colors cursor-pointer"
		/>
	)
}

export function PostOptionsMenu({ post, currentUserId }: { post: Post; currentUserId?: number }) {
	const isOwn = post.user.pkid === currentUserId

	const ownItems: ActionDropdownItem[] = [
		{
			label: "Edit post",
			icon: <Quote />,
			onSelect: () => console.log("TODO: edit post", post.id),
		},
		{
			label: post.is_pinned ? "Unpin from profile" : "Pin to profile",
			icon: <Pin />,
			onSelect: () => console.log("TODO: pin post", post.id),
		},
		{
			label: "Change who can reply",
			icon: <ChangeReplier />,
			onSelect: () => console.log("TODO: change replier", post.id),
		},
		{
			label: "Delete post",
			icon: <Trash />,
			onSelect: () => console.log("TODO: delete post", post.id),
			destructive: true,
		},
	]

	const otherItems: ActionDropdownItem[] = [
		{
			label: "Read post out loud",
			icon: <ScreenReader />,
			onSelect: () => console.log("TODO: read post", post.id),
		},
		{
			label: "Request community note",
			icon: <RequestNote />,
			onSelect: () => console.log("TODO: request note", post.id),
		},
		{
			label: "Not interested in this post",
			icon: <NotInterested />,
			onSelect: () => console.log("TODO: not interested", post.id),
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
			onSelect: () => console.log("TODO: save post", post.id),
		},
		{
			label: `Follow @${post.user.username}`,
			icon: <Connect />,
			onSelect: () => console.log("TODO: follow", post.user.username),
		},
		{
			label: `Mute @${post.user.username}`,
			icon: <Mute />,
			onSelect: () => console.log("TODO: mute", post.user.username),
		},
		{
			label: `Block @${post.user.username}`,
			icon: <Block />,
			onSelect: () => console.log("TODO: block", post.user.username),
			destructive: true,
		},
		{
			label: "Request community note",
			icon: <RequestNote />,
			onSelect: () => console.log("TODO: community note", post.id),
		},
	]

	return (
		<ActionDropdown
			trigger={<MoreHorizontal size={18} />}
			items={isOwn ? ownItems : otherItems}
			clsName="text-muted-foreground hover:text-foreground shrink-0 p-1.5 rounded-full hover:bg-accent transition-colors focus:outline-none"
		/>
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
					<UserAvatar
						src={displayPost.user.profile_photo}
						first={displayPost.user.first_name}
						last={displayPost.user.last_name}
					/>
					<div className="flex-1 min-w-0">
						<span className="font-semibold text-sm text-foreground">{fullname}</span>{" "}
						<span className="text-muted-foreground text-[13.5px]">
							@{displayPost.user.username}
						</span>
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
						<PostOptionsMenu post={post} currentUserId={user?.pkid} />
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
					post={post}
					comments={post.post_comment_count}
					reposts={post.repost_count}
					repostedByMe={post.reposted_by_me}
					onCommentClick={() => setCommentOpen(true)}
					onQuoteClick={() => setQuoteOpen(true)}
				/>
			</div>

			<CommentModal post={post} open={commentOpen} onOpenChange={setCommentOpen} />
			<QuoteModal post={post} open={quoteOpen} onOpenChange={setQuoteOpen} />
		</article>
	)
}
