"use client"

import { useCommentReplies, usePostComments, usePostDetail } from "@/hooks/use-post-detail"
import { Comment, Post } from "@/types/api"
import { ArrowLeft, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
	formatCount,
	isOriginalComment,
	MediaGrid,
	mediaType,
	PostOptionsMenu,
	QuotedCommentCard,
	QuotedPostCard,
	renderText,
	RepostButton,
	ShareButton,
	StatsButton,
	UserAvatar,
} from "./post-card"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { Like, Comment as CommentIcon, Repost, Bookmark2 } from "./icons"
import { useLikePost, useBookmarkPost } from "@/hooks/use-post-actions"
import { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import { useAuthStore } from "@/stores/auth-store"

function CommentMediaGrid({ urls }: { urls: string[] }) {
	if (!urls.length) return null

	const isAllAudio = urls.every((u) => mediaType(u) === "audio")
	if (isAllAudio) {
		return (
			<div className="mt-2 flex flex-col gap-1.5">
				{urls.map((url, i) => (
					<audio key={i} controls src={url} className="w-full" />
				))}
			</div>
		)
	}

	return (
		<div
			className={`mt-2 rounded-xl overflow-hidden grid gap-0.5 ${
				urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
			}`}
		>
			{urls.slice(0, 4).map((url, i) => {
				const type = mediaType(url)
				return (
					<div key={i} className="relative overflow-hidden bg-gray-200 aspect-square">
						{type === "video" ? (
							<video src={url} controls className="w-full h-full object-cover" />
						) : type === "audio" ? (
							<div className="flex items-center justify-center h-full">
								<audio controls src={url} className="w-5/6" />
							</div>
						) : (
							<img src={url} alt="" className="w-full h-full object-cover" />
						)}
					</div>
				)
			})}
		</div>
	)
}

function CommentRow({ comment }: { comment: Comment }) {
	const [repliesOpen, setRepliesOpen] = useState(false)
	const timeAgo = useTimeAgo(comment.created_at)
	const fullname =
		[comment.user.first_name, comment.user.last_name].filter(Boolean).join(" ") ||
		comment.user.username

	const hasContent = !!comment.message?.trim() || comment.uploaded_media.length > 0

	if (!hasContent) return null

	return (
		<div className="px-5 py-4 border-b border-gray-100">
			<div className="flex gap-3">
				{/* Avatar + optional thread line */}
				<div className="flex flex-col items-center shrink-0">
					<UserAvatar
						src={comment.user.profile_photo}
						first={comment.user.first_name}
						last={comment.user.last_name}
					/>
					{repliesOpen && comment.replies_count > 0 && (
						<div className="w-0.5 bg-gray-200 flex-1 mt-1.5 min-h-4" />
					)}
				</div>

				<div className="flex-1 min-w-0">
					{/* Header */}
					<div className="flex items-center gap-1.5 flex-wrap">
						<span className="font-semibold text-sm text-gray-900 leading-tight">{fullname}</span>
						<span className="text-gray-500 text-[13px]">@{comment.user.username}</span>
						<span className="text-gray-400 text-xs">· {timeAgo}</span>
					</div>

					{/* Message */}
					{comment.message?.trim() && (
						<p className="text-[13.5px] text-gray-800 leading-relaxed mt-0.5">
							{renderText(comment.message)}
						</p>
					)}

					{/* Media */}
					<CommentMediaGrid urls={comment.uploaded_media} />

					{/* Actions */}
					<div className="flex items-center gap-5 mt-2.5">
						<button className="flex items-center gap-1 text-gray-400 transition-colors">
							<Like size={20} color={comment.liked_by_me ? "#6A88D1" : undefined} />
							{comment.like_count > 0 && (
								<span className="text-xs">{formatCount(comment.like_count)}</span>
							)}
						</button>

						{comment.replies_count > 0 && (
							<button
								onClick={() => setRepliesOpen((v) => !v)}
								className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors"
							>
								<CommentIcon size={16} />
								<span className="text-xs">{comment.replies_count}</span>
								{repliesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
							</button>
						)}

						{comment.repost_count > 0 && (
							<span className="flex items-center gap-1 text-gray-400">
								<Repost size={16} color={comment.reposted_by_me ? "#6A88D1" : undefined} />
								<span className="text-xs">{formatCount(comment.repost_count)}</span>
							</span>
						)}

						{comment.repost_count > 0 && (
							<span className="flex items-center gap-1 text-gray-400">
								<Repost size={16} color={comment.reposted_by_me ? "#6A88D1" : undefined} />
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Replies — indented with left border */}
			{repliesOpen && (
				<div className="ml-13 mt-1 border-l-2 border-gray-100 pl-3">
					<RepliesSection commentId={comment.id} />
				</div>
			)}
		</div>
	)
}

function ReplyRow({ reply }: { reply: Comment }) {
	const timeAgo = useTimeAgo(reply.created_at)
	const fullname =
		[reply.user.first_name, reply.user.last_name].filter(Boolean).join(" ") || reply.user.username

	if (!reply.message?.trim() && !reply.uploaded_media.length) return null

	return (
		<div className="flex gap-2.5 py-2.5">
			<UserAvatar
				src={reply.user.profile_photo}
				first={reply.user.first_name}
				last={reply.user.last_name}
				size="sm"
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-1.5 flex-wrap">
					<span className="font-semibold text-[13px] text-gray-900 leading-tight">{fullname}</span>
					<span className="text-gray-500 text-[12px]">@{reply.user.username}</span>
					<span className="text-gray-400 text-[12px]">· {timeAgo}</span>
				</div>
				{reply.message?.trim() && (
					<p className="text-[13px] text-gray-800 leading-relaxed mt-0.5">
						{renderText(reply.message)}
					</p>
				)}
				<CommentMediaGrid urls={reply.uploaded_media} />
				<div className="flex items-center gap-4 mt-1.5">
					<button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
						<Like size={14} color={reply.liked_by_me ? "#ef4444" : undefined} />
						{reply.like_count > 0 && (
							<span className="text-[11px]">{formatCount(reply.like_count)}</span>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

function RepliesSection({ commentId }: { commentId: string }) {
	const { data, isLoading } = useCommentReplies(commentId, true)
	const replies = data?.data.results ?? []

	if (isLoading) {
		return (
			<div className="py-2 space-y-2">
				{[0, 1].map((i) => (
					<div key={i} className="flex gap-2 animate-pulse">
						<div className="w-7 h-7 rounded-full bg-gray-200 shrink-0" />
						<div className="flex-1 space-y-1.5 pt-1">
							<div className="h-2.5 bg-gray-200 rounded-full w-1/3" />
							<div className="h-2.5 bg-gray-200 rounded-full w-2/3" />
						</div>
					</div>
				))}
			</div>
		)
	}

	return (
		<div className="divide-y divide-gray-50">
			{replies.map((reply) => (
				<ReplyRow key={reply.pkid} reply={reply} />
			))}
		</div>
	)
}

function PostBody({ post }: { post: Post }) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()

	const isOwn = post.user.id === post.user.id
	const mediaUrls = post.post_media.map((m) => m.external_url)
	const fullname =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username
	const address = post.post_location[0]?.address ?? ""
	const shortAddress = address.split(",").slice(-3, -1).join(", ")
	const fullDate = dayjs(post.created_at).format("h:mm A · MMM D, YYYY")

	return (
		<div className="px-5">
			<div className="flex items-start gap-3 pt-5 pb-2">
				<UserAvatar
					src={post.user.profile_photo}
					first={post.user.first_name}
					last={post.user.last_name}
				/>
				<div className="flex-1 min-w-0">
					<p className="font-bold text-[15px] text-gray-900 leading-tight">{fullname}</p>
					<p className="text-gray-500 text-sm">@{post.user.username}</p>
				</div>

				<div onClick={(e) => e.stopPropagation()}>
					<PostOptionsMenu post={post} currentUserId={post.user?.pkid} />
				</div>
			</div>

			<div>
				{!!post.content_text && (
					<p className="text-gray-800 leading-relaxed">{renderText(post.content_text)}</p>
				)}

				{mediaUrls.length > 0 && <MediaGrid urls={mediaUrls} />}

				{post.original_post &&
					(isOriginalComment(post.original_post) ? (
						<QuotedCommentCard comment={post.original_post} />
					) : (
						<QuotedPostCard post={post.original_post} />
					))}
			</div>

			{/* Timestamp */}
			<div className="pt-3 text-[13px] text-gray-400">
				{fullDate}
				{shortAddress && <> · {shortAddress}</>}
			</div>

			{/* Engagement stats */}
			{(post.repost_count > 0 || post.post_like_count > 0 || post.post_comment_count > 0) && (
				<div className="py-3 border-b border-gray-100 flex items-center gap-5 text-sm">
					{post.repost_count > 0 && (
						<span>
							<strong className="text-gray-900">{formatCount(post.repost_count)}</strong>{" "}
							<span className="text-gray-500">
								{post.repost_count === 1 ? "Repost" : "Reposts"}
							</span>
						</span>
					)}
					{post.post_like_count > 0 && (
						<span>
							<strong className="text-gray-900">{formatCount(post.post_like_count)}</strong>{" "}
							<span className="text-gray-500">{post.post_like_count === 1 ? "Like" : "Likes"}</span>
						</span>
					)}
					{post.post_comment_count > 0 && (
						<span>
							<strong className="text-gray-900">{formatCount(post.post_comment_count)}</strong>{" "}
							<span className="text-gray-500">
								{post.post_comment_count === 1 ? "Comment" : "Comments"}
							</span>
						</span>
					)}
				</div>
			)}

			{/* Action bar */}
			<div className="py-1 flex items-center">
				<div className="flex flex-1 flex-row items-center gap-5">
					<button
						onClick={() => likePost.mutate(post.id)}
						disabled={likePost.isPending}
						className="flex flex-1 flex-row items-center gap-1.5 p-3 rounded-full hover:primary transition-colors"
					>
						<Like color={post.liked_by_me ? "#6A88D1" : undefined} size={22} />
					</button>
					<button className="flex flex-1 items-center gap-1.5 p-3 rounded-full hover:primary transition-colors">
						<CommentIcon size={22} />
					</button>

					<RepostButton reposted={post.is_repost} postId={post.id} onToggle={() => {}} size={22} />

					<ShareButton postId={post.id} size={22} />
				</div>

				<div className="flex flex-row items-center gap-4 ml-auto">
					<button
						onClick={() => bookmarkPost.mutate(post.id)}
						disabled={bookmarkPost.isPending}
						className="flex items-center ml-auto p-3 rounded-full hover:bg-blue-50 transition-colors"
					>
						<Bookmark2
							size={22}
							color={post.bookmarked_by_me ? "#6A88D1" : undefined}
							bookmarked={post.bookmarked_by_me}
						/>
					</button>

					{isOwn && <StatsButton postId={post.id} size={22} />}
				</div>
			</div>
		</div>
	)
}

function CommentSkeleton() {
	return (
		<div className="flex gap-3 px-5 py-4 border-b border-gray-100 animate-pulse">
			<div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
			<div className="flex-1 space-y-2 pt-1">
				<div className="h-3 bg-gray-200 rounded-full w-2/5" />
				<div className="h-3 bg-gray-200 rounded-full w-4/5" />
				<div className="h-3 bg-gray-200 rounded-full w-3/5" />
			</div>
		</div>
	)
}

function PostSkeleton() {
	return (
		<div className="px-5 pt-5 pb-3 animate-pulse border-b border-gray-100">
			<div className="flex gap-3 mb-4">
				<div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
				<div className="flex-1 space-y-2 pt-1">
					<div className="h-3 bg-gray-200 rounded-full w-1/3" />
					<div className="h-3 bg-gray-200 rounded-full w-1/4" />
				</div>
			</div>
			<div className="space-y-2">
				<div className="h-4 bg-gray-200 rounded-full w-full" />
				<div className="h-4 bg-gray-200 rounded-full w-5/6" />
				<div className="h-4 bg-gray-200 rounded-full w-3/4" />
			</div>
			<div className="mt-3 h-48 bg-gray-200 rounded-2xl" />
		</div>
	)
}

export function PostDetailView({ pkid }: { pkid: number }) {
	const router = useRouter()
	const sentinel = useRef<HTMLDivElement>(null)

	const { data: post, isLoading: postLoading, isError, isPlaceholderData } = usePostDetail(pkid)
	const {
		data: commentsData,
		isLoading: commentsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePostComments(post?.pkid)

	const comments = commentsData?.pages.flatMap((p) => p.data.results) ?? []

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

	const handleBack = () => {
		if (window.history.length > 1) router.back()
		else router.push("/home")
	}

	return (
		<div className="flex-1 min-w-0 flex flex-col bg-white rounded-t-2xl border border-gray-100 min-h-0 overflow-hidden">
			{/* Sticky header */}
			<div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
				<button
					onClick={handleBack}
					className="p-2 rounded-full hover:bg-gray-100 transition-colors"
				>
					<ArrowLeft size={18} className="text-gray-700" />
				</button>
				<span className="font-bold text-[17px] text-gray-900">Post</span>
			</div>

			{/* Scrollable body */}
			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
				{postLoading && !post ? (
					<>
						<PostSkeleton />
						{[0, 1, 2].map((i) => (
							<CommentSkeleton key={i} />
						))}
					</>
				) : isError ? (
					<p className="px-5 py-16 text-center text-sm text-gray-500">Failed to load post.</p>
				) : post ? (
					<>
						<PostBody post={post} />

						<div className="border-b border-gray-100" />

						{/* Comments */}
						{(commentsLoading || isPlaceholderData) && !commentsData ? (
							[0, 1, 2].map((i) => <CommentSkeleton key={i} />)
						) : comments.length === 0 ? (
							<p className="px-5 py-12 text-center text-sm text-gray-400">No comments yet.</p>
						) : (
							<>
								{comments.map((comment) => (
									<CommentRow key={comment.pkid} comment={comment} />
								))}
								<div ref={sentinel} className="h-1" />
								{isFetchingNextPage && (
									<div className="flex justify-center py-6">
										<Loader2 size={18} className="animate-spin text-primary" />
									</div>
								)}
								{!hasNextPage && comments.length > 0 && (
									<p className="text-center text-[11px] text-gray-400 py-8">•</p>
								)}
							</>
						)}
					</>
				) : null}
			</div>
		</div>
	)
}
