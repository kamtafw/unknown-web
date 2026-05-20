"use client"

import { useState } from "react"
import { MoreHorizontal, MapPin } from "lucide-react"
import { Avatar } from "radix-ui"
import type { Post, OriginalPost, OriginalComment } from "@/types/api"
import { Like, Comment, Repost, Share, Bookmark2, Stats } from "./icons"
import { useAuthStore } from "@/stores/auth-store"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { useBookmarkPost, useLikePost } from "@/hooks/use-post-actions"

function formatCount(count: number) {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
	if (count >= 1_000) return `${(count / 1_000).toFixed(0)}k`
	return String(count)
}

function shortAddress(address: string) {
	const parts = address
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean)
	// e.g. "Jos, Plateau, Nigeria" → grab 2nd-to-last and last
	return parts.slice(-3, -1).join(", ")
}

function mediaType(url: string): "image" | "video" | "audio" {
	const ext = url.split(".").pop()?.split("?")[0]?.toLowerCase() ?? ""
	if (["mp4", "mov", "webm"].includes(ext)) return "video"
	if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return "audio"
	return "image"
}

function getInitials(first: string, last: string) {
	return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
}

function renderText(text: string) {
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

function isOriginalComment(
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

function UserAvatar({
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
				className={`w-full h-full bg-primary/45 text-accent ${txt} font-semibold flex items-center justify-center`}
			>
				{getInitials(first ?? "John", last ?? "Doe")}
			</Avatar.Fallback>
		</Avatar.Root>
	)
}

function MediaGrid({ urls }: { urls: string[] }) {
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
			className={`mt-3 rounded-2xl overflow-hidden grid gap-0.5 ${
				count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2"
			}`}
		>
			{visible.map((url, i) => {
				const type = mediaType(url)
				const isLast = i === count - 1 && overflow > 0
				const spanClass = count === 3 && i === 0 ? "row-span-2" : ""
				const aspectClass = count === 1 ? "aspect-video" : "aspect-square"
				return (
					<div
						key={i}
						className={`relative overflow-hidden bg-gray-200 ${spanClass} ${aspectClass}`}
					>
						{type === "video" ? (
							<video src={url} controls className="w-full h-full object-cover" />
						) : type === "audio" ? (
							<div className="flex items-center justify-center h-full">
								<audio controls src={url} className="w-5/6" />
							</div>
						) : (
							<img src={url} alt="" className="w-full h-full object-cover" />
						)}
						{isLast && (
							<div className="absolute inset-0 bg-black/45 flex items-center justify-center">
								<span className="text-accent text-2xl font-semibold">+{overflow}</span>
							</div>
						)}
					</div>
				)
			})}
		</div>
	)
}

function QuotedCommentCard({ comment }: { comment: OriginalComment }) {
	const { message, mediaUrls } = normaliseCommentOriginal(comment)
	const timeAgo = useTimeAgo(comment.created_at)
	const fullname =
		[comment.user.first_name, comment.user.last_name].filter(Boolean).join(" ") ||
		comment.user.username

	return (
		<div className="mt-3 border border-gray-200 rounded-xl p-3 bg-white">
			<div className="flex items-center gap-2 mb-2">
				<UserAvatar
					src={comment.user.profile_photo}
					first={comment.user.first_name}
					last={comment.user.last_name}
					size="sm"
				/>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-400 flex-wrap">
					<span className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
						{fullname}
					</span>
					<span className="text-gray-500">@{comment.user.username}</span>
					<span>•</span>
					<span>{timeAgo}</span>
				</div>
			</div>

			{!!message && (
				<p className="text-[13px] text-gray-700 leading-relaxed">{renderText(message)}</p>
			)}

			<MediaGrid urls={mediaUrls} />
		</div>
	)
}

function QuotedPostCard({ post }: { post: OriginalPost }) {
	const timeAgo = useTimeAgo(post.created_at)
	const mediaUrls = post.post_media?.map((m) => m.external_url) ?? []
	const fullname =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username

	return (
		<div className="mt-3 border border-gray-200 rounded-xl p-3 bg-white">
			<div className="flex items-center gap-2 mb-2">
				<UserAvatar
					src={post.user.profile_photo}
					first={post.user.first_name}
					last={post.user.last_name}
					size="sm"
				/>
				<div className="flex min-w-0 items-center gap-1.5 text-xs text-gray-400 flex-wrap">
					<span className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
						{fullname}
					</span>
					<span className="text-gray-500">@{post.user.username}</span>
					<span>•</span>
					<span>{timeAgo}</span>
				</div>
			</div>

			{!!post.content_text && (
				<p className="text-[13px] text-gray-700 leading-relaxed">{renderText(post.content_text)}</p>
			)}

			<MediaGrid urls={mediaUrls} />
		</div>
	)
}

function ActionBar({
	post,
	likes: initLikes,
	comments,
	reposts: initReposts,
	likedByMe,
	bookmarkedByMe,
	repostedByMe,
}: {
	post: Post
	likes: number
	comments: number
	reposts: number
	likedByMe: boolean
	bookmarkedByMe: boolean
	repostedByMe: boolean
}) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()

	const [bookmarked, setBookmarked] = useState(bookmarkedByMe)
	const [reposted, setReposted] = useState(repostedByMe)
	const [reposts, setReposts] = useState(initReposts)

	return (
		<div className="flex items-center mt-4 text-gray-400">
			<div className="flex flex-1 flex-row items-center gap-5">
				<button
					onClick={() => likePost.mutate(post.id)}
					disabled={likePost.isPending}
					className="flex flex-1 flex-row items-center gap-1.5 transition-colors hover:text-primary"
				>
					<Like color={post.liked_by_me ? "#6A88D1" : undefined} />
					<span className="text-sm tabular-nums font-medium">
						{formatCount(post.post_like_count)}
					</span>
				</button>

				<button className="flex flex-1 flex-row items-center gap-1.5 hover:text-primary transition-colors">
					<Comment />
					<span className="text-sm tabular-nums">{formatCount(comments)}</span>
				</button>

				<button
					onClick={() => {
						setReposted((v) => !v)
						setReposts((n) => (reposted ? n - 1 : n + 1))
					}}
					className="flex flex-1 flex-row items-center gap-1.5 transition-colors hover:text-green-500"
				>
					<Repost color={reposted ? "#6A88D1" : undefined} />
					<span className="text-sm tabular-nums">{formatCount(reposts)}</span>
				</button>

				<button className="flex flex-1 flex-row items-center hover:text-primary transition-colors">
					<Share />
				</button>
			</div>

			<div className="flex flex-row items-center gap-4 ml-auto">
				<button
					onClick={() => bookmarkPost.mutate(post.id)}
					disabled={bookmarkPost.isPending}
					className="flex items-center ml-auto transition-colors hover:text-primary"
				>
					<Bookmark2
						color={post.bookmarked_by_me ? "#6A88D1" : undefined}
						bookmarked={post.bookmarked_by_me}
					/>
				</button>

				<button className="flex flex-1 flex-row items-center hover:text-primary transition-colors">
					<Stats />
				</button>
			</div>
		</div>
	)
}

export function PostCard({ post }: { post: Post }) {
	const user = useAuthStore((s) => s.user)

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
		<article className="px-5 py-5 border-b border-gray-100 last:border-b-0">
			{unquotedRepost && (
				<div className="flex items-center gap-1.5 mb-3 text-xs text-gray-400 font-medium">
					<Repost size={13} />
					{isMyRepost ? "You" : repostName} reposted
				</div>
			)}

			<div className="flex items-start gap-3">
				<UserAvatar
					src={displayPost.user.profile_photo}
					first={displayPost.user.first_name}
					last={displayPost.user.last_name}
				/>
				<div className="flex-1 min-w-0">
					<span className="font-semibold text-sm text-gray-900">{fullname}</span>{" "}
					<span className="text-gray-500 text-[13.5px]">@{displayPost.user.username}</span>
					<div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400 overflow-hidden whitespace-nowrap">
						<span className="shrink-0">{timeAgo}</span>
						{address && (
							<>
								<span className="shrink-0">•</span>
								<span className="truncate">{address}</span>
							</>
						)}
					</div>
				</div>
				<button className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
					<MoreHorizontal size={18} />
				</button>
			</div>

			<div className="mt-2.5">
				{!!displayText && (
					<p className="text-[13.5px] text-gray-800 leading-relaxed">{renderText(displayText)}</p>
				)}

				{mediaUrls.length > 0 && <MediaGrid urls={mediaUrls} />}

				{!unquotedRepost && post.original_post && (
					<div>
						{isOriginalComment(post.original_post) ? (
							<QuotedCommentCard comment={post.original_post} />
						) : (
							<QuotedPostCard post={post.original_post} />
						)}
					</div>
				)}

				<ActionBar
					post={post}
					likes={post.post_like_count}
					comments={post.post_comment_count}
					reposts={post.repost_count}
					likedByMe={post.liked_by_me}
					bookmarkedByMe={post.bookmarked_by_me}
					repostedByMe={post.reposted_by_me}
				/>
			</div>
		</article>
	)
}
