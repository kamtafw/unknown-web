"use client"

import { useState } from "react"
import { Repeat2, MoreHorizontal, MapPin } from "lucide-react"
import { Avatar } from "radix-ui"
import type { Post, OriginalPost } from "@/types/api"
import { Like, Comment, Repost, Share, Bookmark2, Stats } from "./icons"
import { useAuthStore } from "@/stores/auth-store"

function timeAgo(dateStr: string) {
	const diff = Date.now() - new Date(dateStr).getTime()
	const m = Math.floor(diff / 60_000)
	const h = Math.floor(diff / 3_600_000)
	const d = Math.floor(diff / 86_400_000)
	if (m < 1) return "just now"
	if (m < 60) return `${m} ${m === 1 ? "Minute" : "Minutes"} ago`
	if (h < 24) return `${h} ${h === 1 ? "Hour" : "Hours"} ago`
	if (d < 7) return `${d}d ago`
	return new Date(dateStr).toLocaleDateString()
}

function fmtCount(n: number) {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
	return String(n)
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
			<span key={i} className="text-[#8892C4] cursor-pointer hover:underline">
				{part}
			</span>
		) : (
			part
		),
	)
}

function UserAvatar({
	src,
	first,
	last,
	size = "md",
}: {
	src?: string
	first: string
	last: string
	size?: "sm" | "md"
}) {
	const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10"
	const txt = size === "sm" ? "text-[11px]" : "text-sm"
	return (
		<Avatar.Root className={`${dim} rounded-full overflow-hidden shrink-0`}>
			<Avatar.Image src={src} alt={`${first} ${last}`} className="w-full h-full object-cover" />
			<Avatar.Fallback
				className={`w-full h-full bg-[#8892C4] text-white ${txt} font-semibold flex items-center justify-center`}
			>
				{getInitials(first, last)}
			</Avatar.Fallback>
		</Avatar.Root>
	)
}

function MediaGrid({ media }: { media: { external_url: string }[] }) {
	if (!media.length) return null

	const types = media.map((m) => mediaType(m.external_url))
	if (types.every((t) => t === "audio")) {
		return (
			<div className="mt-3 flex flex-col gap-2">
				{media.map((m, i) => (
					<audio key={i} controls src={m.external_url} className="w-full" />
				))}
			</div>
		)
	}

	const visible = media.slice(0, 4)
	const overflow = media.length - 4
	const count = visible.length

	return (
		<div
			className={`mt-3 rounded-2xl overflow-hidden grid gap-0.5 ${
				count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-2"
			}`}
		>
			{visible.map((m, i) => {
				const type = mediaType(m.external_url)
				const isLast = i === count - 1 && overflow > 0
				const spanClass = count === 3 && i === 0 ? "row-span-2" : ""
				const aspectClass = count === 1 ? "aspect-video" : "aspect-square"
				return (
					<div
						key={i}
						className={`relative overflow-hidden bg-gray-200 ${spanClass} ${aspectClass}`}
					>
						{type === "video" ? (
							<video src={m.external_url} controls className="w-full h-full object-cover" />
						) : type === "audio" ? (
							<div className="flex items-center justify-center h-full">
								<audio controls src={m.external_url} className="w-5/6" />
							</div>
						) : (
							<img src={m.external_url} alt="" className="w-full h-full object-cover" />
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

// ─── Quoted / original post card ─────────────────────────────────────────────

function QuotedPost({ post }: { post: OriginalPost }) {
	const text = post.content_text ?? post.message ?? ""
	const loc = post.post_location?.[0]
	return (
		<div className="mt-3 border border-gray-200 rounded-xl p-3.5 bg-gray-50/60">
			<div className="flex items-center gap-2 mb-2">
				<UserAvatar
					src={post.user.profile_photo ?? undefined}
					first={post.user.first_name}
					last={post.user.last_name}
					size="sm"
				/>
				<div className="min-w-0">
					<p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
						{post.user.first_name} {post.user.last_name}
					</p>
					<p className="text-[11px] text-gray-500">@{post.user.username}</p>
				</div>
			</div>
			{text && <p className="text-[13px] text-gray-700 leading-relaxed">{renderText(text)}</p>}
			{loc && (
				<p className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
					<MapPin size={11} />
					{shortAddress(loc.address)}
				</p>
			)}
			{/* <MediaGrid media={post.post_media} /> */}
		</div>
	)
}

// ─── Action bar ──────────────────────────────────────────────────────────────

function ActionBar({
	likes: initLikes,
	comments,
	reposts: initReposts,
	likedByMe,
	bookmarkedByMe,
	repostedByMe,
}: {
	likes: number
	comments: number
	reposts: number
	likedByMe: boolean
	bookmarkedByMe: boolean
	repostedByMe: boolean
}) {
	const [liked, setLiked] = useState(likedByMe)
	const [bookmarked, setBookmarked] = useState(bookmarkedByMe)
	const [reposted, setReposted] = useState(repostedByMe)
	const [likes, setLikes] = useState(initLikes)
	const [reposts, setReposts] = useState(initReposts)

	return (
		<div className="flex items-center mt-4 text-gray-400">
			<div className="flex flex-1 flex-row items-center gap-5">
				<button
					onClick={() => {
						setLiked((v) => !v)
						setLikes((n) => (liked ? n - 1 : n + 1))
					}}
					className="flex flex-1 flex-row items-center gap-1.5 transition-colors hover:text-primary"
				>
					<Like color={liked ? "#8892C4" : undefined} />
					<span className="text-sm tabular-nums font-medium">{fmtCount(likes)}</span>
				</button>

				<button className="flex flex-1 flex-row items-center gap-1.5 hover:text-[#8892C4] transition-colors">
					<Comment />
					<span className="text-sm tabular-nums">{fmtCount(comments)}</span>
				</button>

				<button
					onClick={() => {
						setReposted((v) => !v)
						setReposts((n) => (reposted ? n - 1 : n + 1))
					}}
					className="flex flex-1 flex-row items-center gap-1.5 transition-colors hover:text-green-500"
				>
					<Repost color={reposted ? "#8892C4" : undefined} />
					<span className="text-sm tabular-nums">{fmtCount(reposts)}</span>
				</button>

				<button className="flex flex-1 flex-row items-center hover:text-[#8892C4] transition-colors">
					<Share />
				</button>
			</div>

			<div className="flex flex-row items-center gap-4 ml-auto">
				<button
					onClick={() => setBookmarked((v) => !v)}
					className="flex items-center ml-auto transition-colors hover:text-[#8892C4]"
				>
					<Bookmark2 color={bookmarked ? "#8892C4" : undefined} bookmarked={bookmarked} />
				</button>

				<button className="flex flex-1 flex-row items-center hover:text-[#8892C4] transition-colors">
					<Stats />
				</button>
			</div>
		</div>
	)
}

export function PostCard({ post }: { post: Post }) {
	const loc = post.post_location?.[0]
	const user = useAuthStore((s) => s.user)

	const unquotedRepost = post.is_repost && !post.content_text?.trim()
	const isMyRepost = post.user.pkid === user?.pkid

	const displayPost = unquotedRepost ? (post.original_post as OriginalPost)! : post

	const fullname =
		[displayPost.user.first_name, displayPost.user.last_name].filter(Boolean).join(" ") ||
		displayPost.user.username
	const repostName =
		[post.user.first_name, post.user.last_name].filter(Boolean).join(" ") || post.user.username

	return (
		<article className="px-5 py-5 border-b border-gray-100 last:border-b-0">
			{unquotedRepost && (
				<div className="flex items-center gap-1.5 mb-3 text-[12px] text-gray-400 font-medium">
					<Repost size={13} />
					{isMyRepost ? "You" : repostName} reposted
				</div>
			)}

			<div className="flex items-start gap-3">
				<UserAvatar
					src={post.user.profile_photo ?? undefined}
					first={post.user.first_name}
					last={post.user.last_name}
				/>
				<div className="flex-1 min-w-0">
					<span className="font-semibold text-[14px] text-gray-900">
						{post.user.first_name} {post.user.last_name}
					</span>{" "}
					<span className="text-gray-500 text-[13.5px]">@{post.user.username}</span>
					<div className="flex items-center gap-2 mt-0.5 text-[12px] text-gray-400 flex-wrap">
						<span>{timeAgo(post.created_at)}</span>
						{loc && (
							<>
								<span>•</span>
								<span className="flex items-center gap-0.5">
									<MapPin size={11} />
									{shortAddress(loc.address)}
								</span>
							</>
						)}
					</div>
				</div>
				<button className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
					<MoreHorizontal size={18} />
				</button>
			</div>

			<div className="mt-2.5">
				{post.content_text && (
					<p className="text-[13.5px] text-gray-800 leading-relaxed">
						{renderText(post.content_text)}
					</p>
				)}

				{post.is_repost && post.original_post && <QuotedPost post={post.original_post} />}

				{!post.is_repost && <MediaGrid media={post.post_media} />}

				<ActionBar
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
