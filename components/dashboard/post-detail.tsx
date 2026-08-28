"use client"

import { useAddComment, usePrependContent } from "@/hooks/socials/use-comment"
import { useLikeComment, useRepostComment } from "@/hooks/socials/use-comment-actions"
import { useBookmarkPost, useDeletePost, useLikePost } from "@/hooks/socials/use-post-actions"
import {
	useContentDetail,
	useContentReplies,
	usePostComments,
	usePostDetail,
} from "@/hooks/socials/use-post-detail"
import { useRepost } from "@/hooks/socials/use-repost"
import { useMentionAutocomplete } from "@/hooks/use-mention-autocomplete"
import { useTimeAgo } from "@/hooks/use-time-ago"
import { socialsApi } from "@/lib/socials/api"
import { EMOJIS, extractHashtags } from "@/lib/socials/composer"
import { canReplyTo } from "@/lib/socials/content-permissions"
import { isSettledRepostId, resolveEngagementContent } from "@/lib/socials/content-resolvers"
import { cn, formatCount } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import {
	CreateCommentPayload,
	CreateReplyPayload,
	MediaItem,
	SocialContent,
} from "@/types/socials/api"
import dayjs from "dayjs"
import {
	ArrowLeft,
	Image as ImageIcon,
	Loader2,
	Lock,
	MapPin,
	RefreshCw,
	Smile,
	X,
} from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { forwardRef, useEffect, useRef, useState } from "react"
import { HighlightedTextarea } from "../shared/highlighted-textarea"
import { MentionAutocomplete } from "../shared/mention-autocomplete"
import { AuthorHoverCard } from "./author-hover-card"
import { CommentModal } from "./comment-modal"
import { Bookmark2, Comment as CommentIcon, Like } from "./icons"
import { MediaLightbox } from "./media-lightbox"
import {
	MediaGrid,
	mediaType,
	PostOptionsMenu,
	QuotedContentCard,
	renderText,
	RepostButton,
	ShareButton,
	StatsButton,
	UserAvatar,
} from "./post-card"
import { QuoteCommentModal } from "./quote-comment-modal"
import { QuotePostModal } from "./quote-post-modal"
import { ReplyModal } from "./reply-modal"
import { ReplyRestrictedNotice } from "./reply-restricted-notice"

// This file implements the focused-thread UX (decision #3,
// docs/social/social-content-migration-inspection.md S~10): instead of the
// old fixed three-tier Post → Comment → flat Replies structure (where a
// reply could never itself be replied to — ReplyRow had no reply
// affordance at all), a comment or reply can be "opened" into a focused
// view showing that content plus its own direct replies, at any depth.
// `focusStack` below holds the chain of ids drilled into so far;
// `focusStack[focusStack.length - 1]` is the currently-focused node.
// Replying while focused sends `parent_id = focusedContent.id` — never the
// root post's id — which is the one rule this whole rework exists to
// protect (migration doc §10's "never blur post_id vs parent_id").

function CommentMediaGrid({ urls }: { urls: string[] }) {
	const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

	const visible = urls.slice(0, 4)
	const imageUrls = urls.filter((url) => mediaType(url) === "image")

	return (
		<>
			<div
				className={`mt-2 rounded-xl overflow-hidden grid gap-0.5 ${visible.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
			>
				{visible.map((url, i) => {
					const type = mediaType(url)
					return (
						<div key={i} className="relative overflow-hidden bg-muted aspect-square">
							{type === "video" ? (
								<video src={url} controls className="w-full h-full object-cover" />
							) : type === "audio" ? (
								<div className="flex items-center justify-center h-full">
									<audio controls src={url} className="w-5/6" />
								</div>
							) : (
								<button
									type="button"
									onClick={() => setLightboxIndex(imageUrls.indexOf(url))}
									className="block w-full h-full cursor-zoom-in"
								>
									<Image src={url} alt="" fill={true} className="object-cover" />
								</button>
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

function CommentLikeButton({
	content,
	size = 22,
	alwaysShowCount = true,
	className,
}: {
	content: SocialContent
	size?: number
	alwaysShowCount?: boolean
	className?: string
}) {
	const likeComment = useLikeComment()
	const showCount = alwaysShowCount || content.metrics.likes > 0

	return (
		<button
			onClick={() => likeComment.mutate(content.id)}
			className={cn(
				"flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer",
				className,
			)}
		>
			<Like size={size} color={content.viewer.liked ? "#6A88D1" : undefined} />
			{showCount && (
				<span
					className={size >= 22 ? "text-sm tabular-nums font-medium" : "text-[11px] tabular-nums"}
				>
					{formatCount(content.metrics.likes)}
				</span>
			)}
		</button>
	)
}

function CommentRepostButton({ content }: { content: SocialContent }) {
	const repostComment = useRepostComment()
	const [quoteOpen, setQuoteOpen] = useState(false)

	const handleRepost = () => {
		if (content.viewer.reposted) return
		repostComment.mutate({ is_repost: true, original_comment: content.id })
	}

	return (
		<>
			<RepostButton
				reposted={content.viewer.reposted}
				reposts={content.metrics.reposts}
				onRepost={handleRepost}
				onQuote={() => setQuoteOpen(true)}
				size={22}
			/>
			<QuoteCommentModal comment={content} open={quoteOpen} onOpenChange={setQuoteOpen} />
		</>
	)
}

/**
 * Replaces both the old CommentRow (top-level, had a reply affordance) and
 * ReplyRow (nested, had NO reply affordance — the core of the depth-1
 * limitation). A comment and a reply are structurally identical
 * SocialContent now, so one component renders either, at any depth.
 * "View N replies" opens a focused thread on this node rather than
 * expanding inline — see the file-level note above.
 */
const ThreadContentRow = forwardRef<
	HTMLDivElement,
	{
		content: SocialContent
		rootPost: SocialContent
		highlighted?: boolean
		onOpenThread: (content: SocialContent) => void
	}
>(function ThreadContentRow({ content, rootPost, highlighted, onOpenThread }, ref) {
	const [replyOpen, setReplyOpen] = useState(false)
	const timeAgo = useTimeAgo(content.created_at)
	const canReply = canReplyTo(rootPost)
	const fullname =
		[content.user.first_name, content.user.last_name].filter(Boolean).join(" ") ||
		content.user.username

	const hasContent = !!content.message?.trim() || content.media.length > 0

	if (!hasContent) return null

	return (
		<div
			ref={ref}
			className={`px-5 py-4 border-b border-border transition-colors animate-in fade-in slide-in-from-bottom-1 duration-300 ${highlighted ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
		>
			<div className="flex gap-3">
				<div className="flex flex-col items-center shrink-0">
					<AuthorHoverCard id={content.user.id} fallback={content.user}>
						<UserAvatar
							src={content.user.profile_photo}
							first={content.user.first_name}
							last={content.user.last_name}
						/>
					</AuthorHoverCard>
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5 flex-wrap">
						<AuthorHoverCard id={content.user.id} fallback={content.user}>
							<span className="font-semibold text-sm text-foreground cursor-pointer hover:underline underline-offset-1">
								{fullname}
							</span>
						</AuthorHoverCard>
						<AuthorHoverCard id={content.user.id} fallback={content.user}>
							<span className="text-muted-foreground text-[13px]">@{content.user.username}</span>
						</AuthorHoverCard>
						<span className="text-muted-foreground/70 text-xs">· {timeAgo}</span>
					</div>

					{content.message?.trim() && (
						<p className="text-[13.5px] text-foreground/90 leading-relaxed mt-0.5">
							{renderText(content.message)}
						</p>
					)}

					<CommentMediaGrid urls={content.media} />

					<div className="flex items-center text-muted-foreground mt-2.5 w-4/5">
						<CommentLikeButton content={content} className="flex-1" />

						<button
							onClick={() => setReplyOpen(true)}
							aria-label={canReply ? "Reply" : "Reply restricted"}
							className="flex flex-1 flex-row items-center gap-1 transition-colors hover:text-primary cursor-pointer"
						>
							<span className="relative inline-flex">
								<CommentIcon size={22} />
								{!canReply && (
									<span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-card ring-1 ring-border flex items-center justify-center">
										<Lock size={7.5} className="text-muted-foreground" strokeWidth={3} />
									</span>
								)}
							</span>
							<span className="text-sm tabular-nums font-medium">{content.metrics.replies}</span>
						</button>

						<CommentRepostButton content={content} />

						<ShareButton postId={content.id} size={22} />
					</div>

					{content.metrics.replies > 0 && (
						<button
							className="mt-1 flex-row items-center gap-1.5"
							onClick={() => onOpenThread(content)}
						>
							<span className="text-sm text-primary font-medium">
								View {content.metrics.replies} {content.metrics.replies === 1 ? "reply" : "replies"}
							</span>
						</button>
					)}
				</div>
			</div>

			<ReplyModal parent={content} post={rootPost} open={replyOpen} onOpenChange={setReplyOpen} />
		</div>
	)
})

/**
 * One reply composer, reused both under the root post (top-level comment,
 * `target.kind === "post"`) and at the top of a focused thread (reply to
 * whatever's focused, which may itself be a reply). `target` decides
 * post_id vs parent_id — never guessed from context, always the id of the
 * thing actually being replied to.
 */
function ContentComposer({ target, rootPost }: { target: SocialContent; rootPost: SocialContent }) {
	const user = useAuthStore((s) => s.user)
	const addComment = useAddComment()
	const prependContent = usePrependContent()

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
	const mentionContainerRef = useRef<HTMLDivElement>(null)
	const mention = useMentionAutocomplete({
		value: text,
		onChange: setText,
		textareaRef,
		containerRef: mentionContainerRef,
	})

	const uploadedUrls = mediaItems.flatMap((m) => m.urls ?? [])
	const anyUploading = mediaItems.some((m) => m.uploading)
	const hasContent = text.trim().length > 0 || uploadedUrls.length > 0
	const canSubmit = hasContent && !anyUploading

	const canReply = canReplyTo(rootPost)

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
			const urls = await socialsApi.uploadMedia(file)
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

		// the one branch that matters in this whole component: post_id for a
		// top-level comment, parent_id for a reply — decided by target.kind,
		// never assumed
		const payload: CreateCommentPayload | CreateReplyPayload =
			target.kind === "post"
				? {
						post_id: target.id,
						content: text.trim(),
						hashtags: hashtags.length ? hashtags : undefined,
						medial_urls: uploadedUrls.length ? uploadedUrls : undefined,
						location: location ?? undefined,
					}
				: {
						parent_id: target.id,
						content: text.trim(),
						hashtags: hashtags.length ? hashtags : undefined,
						medial_urls: uploadedUrls.length ? uploadedUrls : undefined,
						location: location ?? undefined,
					}

		addComment.mutate(payload, {
			onSuccess: (res) => {
				if (!res.success) return
				prependContent(target.id, res.data)

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

	if (!canReply) {
		return (
			<div className="px-5 py-4 border-b border-border">
				<ReplyRestrictedNotice
					whoCanReply={rootPost.permissions.reply_policy}
					username={rootPost.user.username}
				/>
			</div>
		)
	}

	return (
		<div
			ref={containerRef}
			className="px-5 py-3 border-b border-border"
			onBlur={() => {
				setTimeout(() => {
					if (!containerRef.current?.contains(document.activeElement) && !text.trim()) {
						setFocused(false)
					}
				}, 0)
			}}
		>
			{focused && (
				<p className="text-xs text-muted-foreground mb-2">
					Replying to <span className="text-primary">@{target.user.username}</span>
				</p>
			)}

			<div className="flex gap-3">
				<UserAvatar
					src={user?.profile_photo}
					first={user?.first_name ?? ""}
					last={user?.last_name ?? ""}
				/>

				<div className="flex-1 min-w-0">
					<div ref={mentionContainerRef} className="relative mb-3">
						<HighlightedTextarea
							ref={textareaRef}
							value={text}
							onChange={setText}
							onSelect={mention.handleSelect}
							onFocus={() => setFocused(true)}
							onKeyDown={(e) => {
								if (mention.handleKeyDown(e)) return
								handleKeyDown(e)
							}}
							placeholder="Post your reply"
							rows={focused ? 2 : 1}
							className="w-full resize-none bg-transparent text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none leading-relaxed pt-0.5"
						/>
						<MentionAutocomplete mention={mention} />
					</div>

					{mediaItems.length > 0 && (
						<div
							className={`mt-2 rounded-xl overflow-hidden grid gap-0.5 ${
								mediaItems.length === 1 ? "grid-cols-1" : "grid-cols-2"
							}`}
						>
							{mediaItems.map((item) => (
								<div
									key={item.id}
									className="relative bg-muted aspect-video rounded-lg overflow-hidden"
								>
									{item.file.type.startsWith("video/") ? (
										<video src={item.preview} className="w-full h-full object-cover" />
									) : (
										<Image src={item.preview} alt="" fill={true} objectFit="cover" />
									)}
									{item.uploading && (
										<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
											<Loader2 size={22} className="animate-spin text-white" />
										</div>
									)}
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

					{showEmoji && (
						<div className="mt-2 p-2 border border-border rounded-xl bg-popover shadow-lg">
							<div className="grid grid-cols-10 gap-0.5">
								{EMOJIS.map((e) => (
									<button
										key={e}
										onClick={() => handleEmojiClick(e)}
										className="w-8 h-8 text-lg rounded hover:bg-accent flex items-center justify-center transition-colors"
									>
										{e}
									</button>
								))}
							</div>
						</div>
					)}

					{focused && (
						<div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
							<div className="flex items-center gap-3 text-primary">
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
									<span className="text-xs text-muted-foreground flex items-center gap-1.5">
										<Loader2 size={12} className="animate-spin" /> Uploading…
									</span>
								)}
								<button
									onClick={handleSubmit}
									disabled={!canSubmit || addComment.isPending}
									className="px-4 py-1.5 rounded-full bg-primary cursor-pointer text-primary-foreground text-sm font-semibold disabled:opacity-40 hover:bg-primary/85 active:scale-[0.98] transition-all"
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
						className="shrink-0 self-start mt-0.5 px-4 py-1.5 cursor-pointer rounded-full border border-border text-muted-foreground text-sm font-semibold"
					>
						Reply
					</button>
				)}
			</div>
		</div>
	)
}

function PostBody({ post, onCommentClick }: { post: SocialContent; onCommentClick: () => void }) {
	const user = useAuthStore((s) => s.user)
	const likePost = useLikePost()
	const bookmarkPost = useBookmarkPost()
	const repost = useRepost()
	// undo-repost reuses useDeletePost — see post-card.tsx's ActionBar for
	// the same pattern and the note on why there's no separate undo hook
	const undoRepost = useDeletePost()

	const [quoteOpen, setQuoteOpen] = useState(false)

	const isOwn = post.user.id === user?.id
	const canReply = canReplyTo(post)
	const fullname =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username
	const address = post.location?.address ?? ""
	const shortAddress = address.split(",").slice(-3, -1).join(", ")
	const fullDate = dayjs(post.created_at).format("h:mm A · MMM D, YYYY")

	const handleRepost = () => {
		if (post.viewer.reposted) {
			repost.mutate({ is_repost: true, original_post: post.id })
			return
		}
		if (post.viewer.repost_id && isSettledRepostId(post.viewer.repost_id)) {
			undoRepost.mutate({
				id: post.viewer.repost_id,
				originalPost: { id: post.id, wasBareRepost: true },
			})
			return
		}
	}

	return (
		<>
			<div className="px-5 animate-in fade-in duration-300">
				<div className="flex gap-3 pt-5 pb-2">
					<AuthorHoverCard id={post.user.id} fallback={post.user}>
						<UserAvatar
							src={post.user.profile_photo}
							first={post.user.first_name}
							last={post.user.last_name}
							className="cursor-pointer"
						/>
					</AuthorHoverCard>
					<div className="flex flex-col min-w-0">
						<AuthorHoverCard id={post.user.id} fallback={post.user}>
							<p className="font-bold text-[15px] text-foreground leading-tight cursor-pointer hover:underline underline-offset-2 w-fit">
								{fullname}
							</p>
						</AuthorHoverCard>
						<AuthorHoverCard id={post.user.id} fallback={post.user}>
							<p className="text-muted-foreground text-sm">@{post.user.username}</p>
						</AuthorHoverCard>
					</div>

					<div onClick={(e) => e.stopPropagation()} className="ml-auto flex">
						<PostOptionsMenu post={post} currentUserId={user?.id} />
					</div>
				</div>

				<div>
					{!!post.message && (
						<p className="text-foreground/90 leading-relaxed">{renderText(post.message)}</p>
					)}

					{post.media.length > 0 && <MediaGrid urls={post.media} />}

					{post.original && <QuotedContentCard content={post.original} />}
				</div>

				<div className="pt-3 text-[13px] text-muted-foreground">
					{fullDate}
					{shortAddress && <> · {shortAddress}</>}
				</div>

				{(post.metrics.reposts > 0 || post.metrics.likes > 0 || post.metrics.replies > 0) && (
					<div className="py-3 border-b border-border flex items-center gap-5 text-sm">
						{post.metrics.reposts > 0 && (
							<span>
								<strong className="text-foreground">{formatCount(post.metrics.reposts)}</strong>{" "}
								<span className="text-muted-foreground">
									{post.metrics.reposts === 1 ? "Repost" : "Reposts"}
								</span>
							</span>
						)}
						{post.metrics.likes > 0 && (
							<span>
								<strong className="text-foreground">{formatCount(post.metrics.likes)}</strong>{" "}
								<span className="text-muted-foreground">
									{post.metrics.likes === 1 ? "Like" : "Likes"}
								</span>
							</span>
						)}
						{post.metrics.replies > 0 && (
							<span>
								<strong className="text-foreground">{formatCount(post.metrics.replies)}</strong>{" "}
								<span className="text-muted-foreground">
									{post.metrics.replies === 1 ? "Comment" : "Comments"}
								</span>
							</span>
						)}
					</div>
				)}

				<div className="py-1 flex items-center">
					<div className="flex flex-1 flex-row items-center gap-5">
						<button
							onClick={() => likePost.mutate(post.id)}
							className="flex flex-1 flex-row items-center gap-1.5 p-3 rounded-full hover:bg-accent transition-colors cursor-pointer"
						>
							<Like color={post.viewer.liked ? "#6A88D1" : undefined} size={22} />
						</button>

						<button
							onClick={onCommentClick}
							aria-label={canReply ? "Comment" : "Comments restricted"}
							className="flex flex-1 items-center gap-1.5 p-3 rounded-full hover:bg-accent transition-colors cursor-pointer"
						>
							<span className="relative inline-flex">
								<CommentIcon size={22} />
								{!canReply && (
									<span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-card ring-1 ring-border flex items-center justify-center">
										<Lock size={7.5} className="text-muted-foreground" strokeWidth={3} />
									</span>
								)}
							</span>
						</button>

						<RepostButton
							reposted={post.viewer.reposted}
							onRepost={handleRepost}
							onQuote={() => setQuoteOpen(true)}
							size={22}
						/>

						<ShareButton postId={post.id} size={22} />
					</div>

					<div className="flex flex-row items-center gap-4 ml-auto">
						<button
							onClick={() => bookmarkPost.mutate(post.id)}
							className="flex items-center ml-auto p-3 rounded-full hover:bg-primary/10 transition-colors cursor-pointer"
						>
							<Bookmark2
								size={22}
								color={post.viewer.bookmarked ? "#6A88D1" : undefined}
								bookmarked={post.viewer.bookmarked}
							/>
						</button>

						{isOwn && (
							<StatsButton
								postId={post.id}
								size={22}
								hasVideo={post.media.some((url) => mediaType(url) === "video")}
							/>
						)}
					</div>
				</div>
			</div>
			<QuotePostModal post={post} open={quoteOpen} onOpenChange={setQuoteOpen} />
		</>
	)
}

/**
 * The focused-thread view — shown whenever focusStack is non-empty. Fetches
 * the focused node's own detail (closes the migration doc §8 GAP: a
 * comment/reply previously had no way to be fetched as its own standalone
 * object) plus its direct replies, and renders exactly the same shape
 * whether the focused node is a top-level comment or a reply three levels
 * deep — that uniformity is the point of the focused-thread model.
 */
function ThreadFocusPanel({
	focusedId,
	rootPost,
	onOpenThread,
	highlightCommentId,
}: {
	focusedId: string
	rootPost: SocialContent
	onOpenThread: (content: SocialContent) => void
	highlightCommentId?: string
}) {
	const sentinel = useRef<HTMLDivElement>(null)
	const { data: focused, isLoading: focusedLoading } = useContentDetail(focusedId)
	const {
		data: repliesData,
		isLoading: repliesLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useContentReplies(focusedId)

	const replies = repliesData?.pages.flatMap((p) => p.data.results) ?? []

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

	if (focusedLoading || !focused) {
		return (
			<>
				<CommentSkeleton />
				{[0, 1].map((i) => (
					<CommentSkeleton key={i} />
				))}
			</>
		)
	}

	const fullname =
		[focused.user.first_name, focused.user.last_name].filter(Boolean).join(" ") ||
		focused.user.username

	return (
		<>
			{/* the focused node's own header — same content, presented like the
			 * root post's header rather than a list row, since it's now the
			 * subject of this view */}
			<div className="px-5 py-4 border-b border-border">
				<div className="flex gap-3">
					<AuthorHoverCard id={focused.user.id} fallback={focused.user}>
						<UserAvatar
							src={focused.user.profile_photo}
							first={focused.user.first_name}
							last={focused.user.last_name}
						/>
					</AuthorHoverCard>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-1.5 flex-wrap">
							<span className="font-semibold text-sm text-foreground">{fullname}</span>
							<span className="text-muted-foreground text-[13px]">@{focused.user.username}</span>
						</div>
						{focused.message?.trim() && (
							<p className="text-[13.5px] text-foreground/90 leading-relaxed mt-0.5">
								{renderText(focused.message)}
							</p>
						)}
						<CommentMediaGrid urls={focused.media} />
						<div className="flex items-center text-muted-foreground mt-2.5 w-4/5">
							<CommentLikeButton content={focused} className="flex-1" />
							<CommentRepostButton content={focused} />
							<ShareButton postId={focused.id} size={22} />
						</div>
					</div>
				</div>
			</div>

			<ContentComposer target={focused} rootPost={rootPost} />

			{repliesLoading && !repliesData ? (
				[0, 1].map((i) => <CommentSkeleton key={i} />)
			) : replies.length === 0 ? (
				<p className="px-5 py-12 text-center text-sm text-muted-foreground/70">No replies yet.</p>
			) : (
				<>
					{replies.map((reply) => (
						<ThreadContentRow
							key={reply.id}
							content={reply}
							rootPost={rootPost}
							highlighted={reply.id === highlightCommentId}
							onOpenThread={onOpenThread}
						/>
					))}
					<div ref={sentinel} className="h-1" />
					{isFetchingNextPage && (
						<div className="flex justify-center py-6">
							<Loader2 size={18} className="animate-spin text-primary" />
						</div>
					)}
				</>
			)}
		</>
	)
}

function CommentSkeleton() {
	return (
		<div className="flex gap-3 px-5 py-4 border-b border-border animate-pulse">
			<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
			<div className="flex-1 space-y-2 pt-1">
				<div className="h-3 bg-muted rounded-full w-2/5" />
				<div className="h-3 bg-muted rounded-full w-4/5" />
				<div className="h-3 bg-muted rounded-full w-3/5" />
			</div>
		</div>
	)
}

function PostSkeleton() {
	return (
		<div className="px-5 pt-5 pb-3 animate-pulse border-b border-border">
			<div className="flex gap-3 mb-4">
				<div className="w-10 h-10 rounded-full bg-muted shrink-0" />
				<div className="flex-1 space-y-2 pt-1">
					<div className="h-3 bg-muted rounded-full w-1/3" />
					<div className="h-3 bg-muted rounded-full w-1/4" />
				</div>
			</div>
			<div className="space-y-2">
				<div className="h-4 bg-muted rounded-full w-full" />
				<div className="h-4 bg-muted rounded-full w-5/6" />
				<div className="h-4 bg-muted rounded-full w-3/4" />
			</div>
			<div className="mt-3 h-48 bg-muted rounded-2xl" />
		</div>
	)
}

export function PostDetailView({
	id,
	highlightCommentId,
}: {
	id: string
	highlightCommentId?: string
}) {
	const router = useRouter()
	const sentinel = useRef<HTMLDivElement>(null)
	const highlightRef = useRef<HTMLDivElement>(null)

	const [commentOpen, setCommentOpen] = useState(false)
	// chain of ids drilled into — see file-level note at the top for why
	const [focusStack, setFocusStack] = useState<SocialContent[]>([])
	const focused = focusStack[focusStack.length - 1]

	const {
		data: rawPost,
		isLoading: postLoading,
		isError,
		isPlaceholderData,
		refetch,
	} = usePostDetail(id)
	const post = rawPost ? resolveEngagementContent(rawPost) : rawPost
	const {
		data: commentsData,
		isLoading: commentsLoading,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = usePostComments(post?.id)

	const comments = commentsData?.pages.flatMap((p) => p.data.results) ?? []

	// NOTE: deep-linking (?comment=) only auto-scrolls when the target is a
	// top-level comment, matching the pre-migration behavior. A ?comment=
	// pointing at a reply nested inside a thread isn't auto-focused — doing
	// that correctly would mean walking the parent_id chain via
	// useContentDetail before rendering, which is more than this rework was
	// asked to solve. Flagging rather than silently leaving it half-working.
	useEffect(() => {
		if (!highlightCommentId || !highlightRef.current || focused) return

		const timeoutId = setTimeout(() => {
			highlightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
		}, 400)
		return () => clearTimeout(timeoutId)
	}, [highlightCommentId, comments.length, focused])

	useEffect(() => {
		const el = sentinel.current
		if (!el || focused) return
		const obs = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
			},
			{ rootMargin: "200px" },
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [fetchNextPage, hasNextPage, isFetchingNextPage, focused])

	const handleBack = () => {
		if (focusStack.length > 0) {
			setFocusStack((stack) => stack.slice(0, -1))
			return
		}
		if (window.history.length > 1) router.back()
		else router.push("/home")
	}

	const headerTitle = !focused ? "Post" : focused.kind === "comment" ? "Comment" : "Reply"

	return (
		<div className="flex-1 min-w-0 flex flex-col bg-card rounded-t-2xl border border-border min-h-0 overflow-hidden">
			<div className="flex items-center gap-4 px-4 py-3 border-b border-border shrink-0 bg-card">
				<button onClick={handleBack} className="p-2 rounded-full hover:bg-accent transition-colors">
					<ArrowLeft size={18} className="text-foreground" />
				</button>
				<span className="font-bold text-[17px] text-foreground">{headerTitle}</span>
			</div>

			<div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
				{postLoading && !post ? (
					<>
						<PostSkeleton />
						{[0, 1, 2].map((i) => (
							<CommentSkeleton key={i} />
						))}
					</>
				) : isError ? (
					<div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
						<p className="text-sm text-muted-foreground">Failed to load post.</p>
						<button
							onClick={() => refetch()}
							className="text-[13px] font-semibold text-primary hover:underline"
						>
							Try again
						</button>
					</div>
				) : post && focused ? (
					<ThreadFocusPanel
						key={focused.id}
						focusedId={focused.id}
						rootPost={post}
						highlightCommentId={highlightCommentId}
						onOpenThread={(content) => setFocusStack((stack) => [...stack, content])}
					/>
				) : post ? (
					<>
						<PostBody post={post} onCommentClick={() => setCommentOpen(true)} />

						<CommentModal post={post} open={commentOpen} onOpenChange={setCommentOpen} />

						<div className="border-b border-border" />

						<ContentComposer target={post} rootPost={post} />

						{(commentsLoading || isPlaceholderData) && !commentsData ? (
							[0, 1, 2].map((i) => <CommentSkeleton key={i} />)
						) : comments.length === 0 ? (
							<p className="px-5 py-12 text-center text-sm text-muted-foreground/70">
								No comments yet.
							</p>
						) : (
							<>
								{comments.map((comment) => (
									<ThreadContentRow
										key={comment.id}
										content={comment}
										rootPost={post}
										highlighted={comment.id === highlightCommentId}
										ref={comment.id === highlightCommentId ? highlightRef : undefined}
										onOpenThread={(content) => setFocusStack((stack) => [...stack, content])}
									/>
								))}
								<div ref={sentinel} className="h-1" />
								{isFetchingNextPage && (
									<div className="flex justify-center py-6">
										<Loader2 size={18} className="animate-spin text-primary" />
									</div>
								)}
								{!hasNextPage && comments.length > 0 && (
									<p className="text-center text-[11px] text-muted-foreground/50 py-8">•</p>
								)}
							</>
						)}
					</>
				) : null}
			</div>
		</div>
	)
}
