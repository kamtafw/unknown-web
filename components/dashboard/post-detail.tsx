"use client"

import { useAddComment,usePrependComment } from "@/hooks/use-comment"
import { useBookmarkPost,useLikePost } from "@/hooks/use-post-actions"
import { useCommentReplies,usePostComments,usePostDetail } from "@/hooks/use-post-detail"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { socialApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import { AddCommentPayload,Comment,MediaItem,Post } from "@/types/api"
import dayjs from "dayjs"
import { ArrowLeft,Image as ImageIcon,Loader2,MapPin,RefreshCw,Smile,X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { forwardRef,useEffect,useRef,useState } from "react"
import { CommentModal } from "./comment-modal"
import { Bookmark2,Comment as CommentIcon,Like,Repost } from "./icons"
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
import { ReplyModal } from "./reply-modal"

const EMOJIS = [
	"😀",
	"😂",
	"😍",
	"🥺",
	"😊",
	"🔥",
	"👍",
	"❤️",
	"🎉",
	"✨",
	"😭",
	"🤣",
	"😎",
	"🙏",
	"💯",
	"🤔",
	"😅",
	"😤",
	"🥰",
	"😢",
	"💪",
	"👏",
	"🎊",
	"🌟",
	"😏",
	"🤩",
	"😳",
	"🫶",
	"💀",
	"😇",
]

function extractHashtags(str: string) {
	return (str.match(/#\w+/g) ?? []).map((h) => h.toLowerCase())
}

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
							<Image src={url} alt="" fill={true} objectFit="cover" />
						)}
					</div>
				)
			})}
		</div>
	)
}

const CommentRow = forwardRef<HTMLDivElement, { comment: Comment; highlighted?: boolean }>(
	function CommentRow({ comment, highlighted }, ref) {
		const [replyOpen, setReplyOpen] = useState(false)
		const [repliesOpen, setRepliesOpen] = useState(false)
		const timeAgo = useTimeAgo(comment.created_at)
		const fullname =
			[comment.user.first_name, comment.user.last_name].filter(Boolean).join(" ") ||
			comment.user.username

		const hasContent = !!comment.message?.trim() || comment.uploaded_media.length > 0

		if (!hasContent) return null

		return (
			<div
				ref={ref}
				className={`px-5 py-4 border-b border-gray-100 transition-colors ${highlighted ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
			>
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
						<div className="flex items-center text-gray-400 mt-2.5 w-4/5">
							<button className="flex flex-1 flex-row items-center gap-1 transition-colors hover:text-primary cursor-pointer">
								<Like size={22} color={comment.liked_by_me ? "#6A88D1" : undefined} />
								<span className="text-sm tabular-nums font-medium">
									{formatCount(comment.like_count)}
								</span>
							</button>

							<button
								onClick={() => setReplyOpen(true)}
								className="flex flex-1 flex-row items-center gap-1 transition-colors hover:text-primary cursor-pointer"
							>
								<CommentIcon size={22} />
								<span className="text-sm tabular-nums font-medium">{comment.replies_count}</span>
							</button>

							<button className="flex flex-1 flex-row items-center gap-1 transition-colors hover:text-primary cursor-pointer">
								<Repost size={22} color={comment.reposted_by_me ? "#6A88D1" : undefined} />
								<span className="text-sm tabular-nums font-medium">
									{formatCount(comment.repost_count)}
								</span>
							</button>

							<ShareButton postId={comment.id} size={22} />
						</div>

						{comment.replies_count > 0 && (
							<button
								className="mt-1 flex-row items-center gap-1.5"
								onClick={() => setRepliesOpen(true)}
							>
								<span className="text-sm text-primary font-medium">
									{repliesOpen
										? "Hide replies"
										: `View ${comment.replies_count} ${comment.replies_count === 1 ? "reply" : "replies"}`}
								</span>
							</button>
						)}
					</div>
				</div>
				{/* Replies — indented with left border */}
				{repliesOpen && (
					<div className="ml-13 mt-1 border-l-2 border-gray-100 pl-3">
						<RepliesSection commentId={comment.id} />
					</div>
				)}

				<ReplyModal comment={comment} open={replyOpen} onOpenChange={setReplyOpen} />
			</div>
		)
	},
)

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

function CommentComposer({ post }: { post: Post }) {
	const user = useAuthStore((s) => s.user)
	const addComment = useAddComment()
	const prependComment = usePrependComment()

	const [text, setText] = useState("")
	const [focused, setFocused] = useState(false)
	const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
	const [showEmoji, setShowEmoji] = useState(false)
	const [location, setLocation] = useState<{ longitude: string; latitude: string } | null>(null)
	const [locationLabel, setLocationLabel] = useState<string | null>(null)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const containerRef = useRef<HTMLDivElement>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const uploadedUrls = mediaItems.flatMap((m) => m.urls ?? [])
	const anyUploading = mediaItems.some((m) => m.uploading)
	const hasContent = text.trim().length > 0 || uploadedUrls.length > 0
	const canSubmit = hasContent && !anyUploading

	const reset = () => {
		mediaItems.forEach((m) => URL.revokeObjectURL(m.preview))
		setText("")
		setMediaItems([])
		setShowEmoji(false)
		setLocation(null)
		setLocationLabel(null)
	}

	const uploadFile = async (id: string, file: File) => {
		setMediaItems((prev) =>
			prev.map((m) => (m.id === id ? { ...m, uploading: true, error: false } : m)),
		)
		try {
			const urls = await socialApi.uploadMedia(file)
			setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, urls, uploading: false } : m)))
		} catch {
			setMediaItems((prev) =>
				prev.map((m) => (m.id === id ? { ...m, uploading: false, error: true } : m)),
			)
		}
	}

	const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const remaining = 4 - mediaItems.length
		const files = Array.from(e.target.files ?? []).slice(0, remaining)

		files.forEach((file) => {
			const id = crypto.randomUUID()
			const preview = URL.createObjectURL(file)
			setMediaItems((prev) => [
				...prev,
				{ id, file, preview, urls: null, uploading: true, error: false },
			])
			uploadFile(id, file)
		})

		e.target.value = ""
	}

	const removeMedia = (id: string) => {
		setMediaItems((prev) => {
			const item = prev.find((m) => m.id === id)
			if (item) URL.revokeObjectURL(item.preview)
			return prev.filter((m) => m.id !== id)
		})
	}

	const handleEmojiClick = (emoji: string) => {
		const ta = textareaRef.current
		if (ta) {
			const start = ta.selectionStart ?? text.length
			const end = ta.selectionEnd ?? text.length
			const next = text.slice(0, start) + emoji + text.slice(end)
			setText(next)
			setTimeout(() => {
				ta.selectionStart = ta.selectionEnd = start + emoji.length
				ta.focus()
			}, 0)
		} else {
			setText((t) => t + emoji)
		}
		setShowEmoji(false)
	}

	const handleLocation = () => {
		if (!navigator.geolocation || locationLabel) {
			setLocation(null)
			setLocationLabel(null)
			return
		}
		setFetchingLocation(true)
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation({
					longitude: String(pos.coords.longitude),
					latitude: String(pos.coords.latitude),
				})
				setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
				setFetchingLocation(false)
			},
			() => setFetchingLocation(false),
		)
	}

	const handleSubmit = () => {
		if (!canSubmit) return
		const hashtags = extractHashtags(text)
		const payload: AddCommentPayload = {
			post: post.pkid,
			message: text.trim() || undefined,
			hashtags: hashtags.length ? hashtags : undefined,
			media_urls: uploadedUrls.length ? uploadedUrls : undefined,
			location: location ?? undefined,
		}
		addComment.mutate(payload, {
			onSuccess: (res) => {
				const newComment: Comment = {
					...res.data,
					like_count: res.data.like_count ?? 0,
					replies_count: res.data.replies_count ?? 0,
					repost_count: res.data.repost_count ?? 0,
					liked_by_me: res.data.liked_by_me ?? false,
					reposted_by_me: res.data.reposted_by_me ?? false,
				}
				prependComment(post.pkid, newComment)

				reset()
				setFocused(false)
			},
		})
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			handleSubmit()
		}
	}

	return (
		<div
			ref={containerRef}
			className="px-5 py-3 border-b border-gray-100"
			onBlur={() => {
				setTimeout(() => {
					if (!containerRef.current?.contains(document.activeElement) && !text.trim()) {
						setFocused(false)
					}
				}, 0)
			}}
		>
			{focused && (
				<p className="text-xs text-gray-400 mb-2">
					Replying to <span className="text-primary">@{post.user.username}</span>
				</p>
			)}

			<div className="flex gap-3">
				<UserAvatar
					src={user?.profile_photo}
					first={user?.first_name ?? ""}
					last={user?.last_name ?? ""}
				/>

				<div className="flex-1 min-w-0">
					<textarea
						ref={textareaRef}
						value={text}
						onChange={(e) => setText(e.target.value)}
						onFocus={() => setFocused(true)}
						onKeyDown={handleKeyDown}
						placeholder="Post your reply"
						rows={focused ? 2 : 1}
						className="w-full resize-none bg-transparent text-[13.5px] text-gray-800 placeholder:text-gray-400 outline-none leading-relaxed pt-0.5"
					/>

					{/* Media grid */}
					{mediaItems.length > 0 && (
						<div
							className={`mt-2 rounded-xl overflow-hidden grid gap-0.5 ${
								mediaItems.length === 1 ? "grid-cols-1" : "grid-cols-2"
							}`}
						>
							{mediaItems.map((item) => (
								<div
									key={item.id}
									className="relative bg-gray-100 aspect-video rounded-lg overflow-hidden"
								>
									{item.file.type.startsWith("video/") ? (
										<video src={item.preview} className="w-full h-full object-cover" />
									) : (
										<Image src={item.preview} alt="" fill={true} objectFit="cover" />
									)}
									{/* Uploading overlay */}
									{item.uploading && (
										<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
											<Loader2 size={22} className="animate-spin text-white" />
										</div>
									)}

									{/* Error overlay with retry */}
									{item.error && (
										<div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
											<span className="text-white text-[11px]">Upload failed</span>
											<button
												onClick={() => uploadFile(item.id, item.file)}
												className="flex items-center gap-1 text-white text-[11px] bg-white/20 hover:bg-white/30 rounded-full px-2.5 py-1 transition-colors"
											>
												<RefreshCw size={11} /> Retry
											</button>
										</div>
									)}

									{/* Remove (hidden while uploading) */}
									{!item.uploading && (
										<button
											onClick={() => removeMedia(item.id)}
											className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
										>
											<X size={12} />
										</button>
									)}
								</div>
							))}
						</div>
					)}

					{/* Location badge */}
					{locationLabel && (
						<div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
							<MapPin size={11} />
							{locationLabel}
							<button
								onClick={() => {
									setLocation(null)
									setLocationLabel(null)
								}}
								className="ml-0.5 hover:opacity-60"
							>
								<X size={10} />
							</button>
						</div>
					)}

					{/* Emoji picker */}
					{showEmoji && (
						<div className="mt-2 p-2 border border-gray-200 rounded-xl bg-white shadow-lg">
							<div className="grid grid-cols-10 gap-0.5">
								{EMOJIS.map((e) => (
									<button
										key={e}
										onClick={() => handleEmojiClick(e)}
										className="w-8 h-8 text-lg rounded hover:bg-gray-100 flex items-center justify-center transition-colors"
									>
										{e}
									</button>
								))}
							</div>
						</div>
					)}

					{focused && (
						<div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
							<div className="flex items-center gap-3 text-primary">
								{/* Media */}
								<button
									type="button"
									title="Add image"
									onClick={() => fileInputRef.current?.click()}
									className="p-2 rounded-full text-primary hover:bg-primary/10 transition-colors cursor-pointer disabled:opacity-40"
								>
									<ImageIcon size={18} />
								</button>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*,video/*"
									multiple
									className="hidden"
									onChange={handleMediaSelect}
								/>

								{/* Emoji */}
								<button
									type="button"
									title="Add emoji"
									onClick={() => setShowEmoji((v) => !v)}
									className={`p-2 rounded-full transition-colors cursor-pointer ${
										showEmoji ? "bg-primary/10 text-primary" : "text-primary hover:bg-primary/10"
									}`}
								>
									<Smile size={18} />
								</button>

								{/* Location */}
								<button
									type="button"
									title={locationLabel ? "Remove location" : "Add location"}
									onClick={handleLocation}
									disabled={fetchingLocation}
									className={`p-2 rounded-full transition-colors disabled:opacity-50 cursor-pointer${
										locationLabel
											? "bg-primary/10 text-primary"
											: "text-primary hover:bg-primary/10"
									}`}
								>
									<MapPin size={18} />
								</button>
							</div>

							<div className="flex items-center gap-3">
								{anyUploading && (
									<span className="text-xs text-gray-400 flex items-center gap-1.5">
										<Loader2 size={12} className="animate-spin" /> Uploading…
									</span>
								)}
								<button
									onClick={handleSubmit}
									disabled={!canSubmit || addComment.isPending}
									className="px-4 py-1.5 rounded-full bg-primary cursor-pointer text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/85 active:scale-[0.98] transition-all"
								>
									{addComment.isPending ? "Posting…" : "Reply"}
								</button>
							</div>
						</div>
					)}
				</div>

				{!focused && (
					<button
						type="button"
						onClick={() => {
							setFocused(true)
							setTimeout(() => textareaRef.current?.focus(), 0)
						}}
						className="shrink-0 self-start mt-0.5 px-4 py-1.5 cursor-pointer rounded-full border border-gray-200 text-gray-400 text-sm font-semibold"
					>
						Reply
					</button>
				)}
			</div>
		</div>
	)
}

function PostBody({ post, onCommentClick }: { post: Post; onCommentClick: () => void }) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()

	const isOwn = post.user.id === user?.id
	const mediaUrls = post.post_media.map((m) => m.external_url)
	const fullname =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username
	const address = post.post_location[0]?.address ?? ""
	const shortAddress = address.split(",").slice(-3, -1).join(", ")
	const fullDate = dayjs(post.created_at).format("h:mm A · MMM D, YYYY")

	return (
		<>
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
								<span className="text-gray-500">
									{post.post_like_count === 1 ? "Like" : "Likes"}
								</span>
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
							className="flex flex-1 flex-row items-center gap-1.5 p-3 rounded-full hover:primary transition-colors cursor-pointer"
						>
							<Like color={post.liked_by_me ? "#6A88D1" : undefined} size={22} />
						</button>
						<button
							onClick={onCommentClick}
							className="flex flex-1 items-center gap-1.5 p-3 rounded-full hover:primary transition-colors cursor-pointer"
						>
							<CommentIcon size={22} />
						</button>

						<RepostButton
							reposted={post.is_repost}
							onRepost={() => {}}
							onQuote={() => {}}
							size={22}
						/>

						<ShareButton postId={post.id} size={22} />
					</div>

					<div className="flex flex-row items-center gap-4 ml-auto">
						<button
							onClick={() => bookmarkPost.mutate(post.id)}
							className="flex items-center ml-auto p-3 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
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
		</>
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

export function PostDetailView({
	pkid,
	highlightCommentId,
}: {
	pkid: number
	highlightCommentId?: string
}) {
	const router = useRouter()
	const sentinel = useRef<HTMLDivElement>(null)
	const highlightRef = useRef<HTMLDivElement>(null)

	const [commentOpen, setCommentOpen] = useState(false)

	const { data: post, isLoading: postLoading, isError, isPlaceholderData } = usePostDetail(pkid)
	const {
		data: commentsData,
		isLoading: commentsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePostComments(post?.pkid)

	const comments = commentsData?.pages.flatMap((p) => p.data.results) ?? []

	// scroll to highlighted comment after first land
	useEffect(() => {
		if (!highlightCommentId || !highlightRef.current) return

		const id = setTimeout(() => {
			highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
		}, 400)
		return () => clearTimeout(id)
	}, [highlightCommentId, comments.length])

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
						<PostBody post={post} onCommentClick={() => setCommentOpen(true)} />

						<CommentModal post={post} open={commentOpen} onOpenChange={setCommentOpen} />

						<div className="border-b border-gray-100" />

						<CommentComposer post={post} />

						{/* Comments */}
						{(commentsLoading || isPlaceholderData) && !commentsData ? (
							[0, 1, 2].map((i) => <CommentSkeleton key={i} />)
						) : comments.length === 0 ? (
							<p className="px-5 py-12 text-center text-sm text-gray-400">No comments yet.</p>
						) : (
							<>
								{comments.map((comment) => (
									<CommentRow
										key={comment.pkid}
										comment={comment}
										highlighted={comment.id === highlightCommentId}
										ref={comment.id === highlightCommentId ? highlightRef : undefined}
									/>
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
