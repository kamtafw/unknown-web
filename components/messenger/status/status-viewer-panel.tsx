"use client"

import {
	useDeleteStatus,
	useMarkStatusViewed,
	useMyStatuses,
	useReshareStatus,
	useStatusFeed,
} from "@/hooks/messenger/use-status"
import {
	buildMyStatusEntry,
	groupStatusesByUser,
	type StatusListEntry,
} from "@/lib/messenger/status-grouping"
import { formatStatusTimestamp } from "@/lib/messenger/status-time"
import { getInitials } from "@/lib/messenger/user-display"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import { useStatusMuteStore } from "@/stores/status-mute.store"
import { useStatusViewedStore } from "@/stores/status-viewed-store"
import type { Pkid, StatusUser, Uuid } from "@/types/messenger"
import {
	Bell,
	BellOff,
	Eye,
	ImageOff,
	Loader2,
	MoreVertical,
	Repeat2,
	Trash2,
	X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, DropdownMenu } from "radix-ui"
import { useEffect, useMemo, useRef, useState } from "react"
import { StatusViewersSheet } from "./status-viewers-sheet"

const IMAGE_STORY_DURATION_MS = 5000

interface StatusViewerPanelProps {
	userId: string
}

/**
 * Inline detail panel — not a full-screen overlay anymore, mirrors
 * ConversationView/GroupConversationView's shape (right side of the
 * two-pane layout). Each entry is independently derived here from the
 * same cached feed/mine queries the list panel uses, rather than passed
 * down — matches the established pattern of routed detail views owning
 * their own data, and makes a hard refresh mid-viewing safe (it just
 * re-derives from current data, no special restore logic needed).
 *
 * Auto-advance chain (recent + viewed, muted excluded) is recomputed on
 * every hop rather than frozen at open time — a deliberate
 * simplification. A refresh mid-chain starts fresh from whatever's in
 * the URL; it won't restore your exact position in a long auto-play
 * sequence, which is an acceptable trade for the complexity avoided.
 * Own status never joins the cross-user chain — finishing it just closes.
 */
export function StatusViewerPanel({ userId }: StatusViewerPanelProps) {
	const router = useRouter()
	const currentUser = useAuthStore((s) => s.user)
	const isOwn = userId === "my"

	const { data: myData } = useMyStatuses()
	const { data: feedData } = useStatusFeed()
	const mutedPkids = useStatusMuteStore((s) => s.mutedPkids)

	const viewedIds = useStatusViewedStore((s) => s.viewedIds)
	const grouped = useMemo(
		() => groupStatusesByUser(feedData?.results ?? [], new Set(mutedPkids), new Set(viewedIds)),
		[feedData, mutedPkids, viewedIds],
	)
	const myEntry = useMemo(() => {
		const fallbackUser: StatusUser | undefined = currentUser
			? {
					id: currentUser.id as Uuid,
					pkid: currentUser.pkid as Pkid,
					username: currentUser.username,
					first_name: currentUser.first_name ?? "",
					last_name: currentUser.last_name ?? "",
					email: "",
					phone_number: "",
					profile_photo: currentUser.profile_photo ?? null,
				}
			: undefined
		return buildMyStatusEntry(myData?.results ?? [], fallbackUser)
	}, [myData, currentUser])

	// Lookup includes muted (so a muted entry is still directly viewable —
	// needed to unmute from inside the viewer). The auto-advance chain
	// deliberately excludes muted, so finishing muted content never spills
	// into someone else's feed.
	const allEntries = useMemo(
		() => [...grouped.recent, ...grouped.viewed, ...grouped.muted],
		[grouped],
	)
	const chain = useMemo(() => [...grouped.recent, ...grouped.viewed], [grouped])
	const entry: StatusListEntry | null = isOwn
		? myEntry
		: (allEntries.find((e) => e.id === userId) ?? null)

	const [index, setIndex] = useState(0)
	const [progress, setProgress] = useState(0)
	const [paused, setPaused] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const [viewersOpen, setViewersOpen] = useState(false)
	const [mediaLoaded, setMediaLoaded] = useState(false)
	const [mediaError, setMediaError] = useState(false)

	// Reset in-story position when the URL's userId changes. Done during
	// render (React's sanctioned "adjusting state when a prop changes"
	// pattern), not in a useEffect — an effect-based reset would still
	// let one render commit with the new entry but the old index first.
	// See the doc comment above for the exact symptom that caused.
	const [prevUserId, setPrevUserId] = useState(userId)
	if (userId !== prevUserId) {
		setPrevUserId(userId)
		setIndex(0)
		setProgress(0)
	}

	const videoRef = useRef<HTMLVideoElement>(null)
	const rafRef = useRef<number | null>(null)
	const startRef = useRef<number>(0)
	const seenIdsRef = useRef<Set<number>>(new Set())

	const markViewed = useMarkStatusViewed()
	const deleteStatus = useDeleteStatus()
	const reshareStatus = useReshareStatus()
	const mute = useStatusMuteStore((s) => s.mute)
	const unmute = useStatusMuteStore((s) => s.unmute)
	const isMutedNow = useStatusMuteStore((s) => s.isMuted(entry?.user.pkid ?? -1))

	// Defensive clamp — with the render-phase reset above this should
	// never actually be needed for a userId change, but it's a cheap
	// guard against `index` outliving a shorter stories array for any
	// other reason (e.g. a refetch that drops an expired story).
	const safeIndex = entry ? Math.min(index, Math.max(entry.stories.length - 1, 0)) : index
	const story = entry?.stories[safeIndex]
	const isVideo = story?.status_type === "video"
	const mediaUrl = story?.media?.[0]?.url
	const mediaCaption = story?.status_type !== "text" ? story?.media?.[0]?.caption : undefined

	// Per-story media readiness, reset whenever the story being shown
	// actually changes (manual nav, auto-advance, or a user-boundary
	// hop). Text stories have nothing to load, so they start "ready".
	const [prevStoryId, setPrevStoryId] = useState<number | null>(null)
	const currentStoryId = story?.id ?? null
	if (currentStoryId !== prevStoryId) {
		setPrevStoryId(currentStoryId)
		setMediaLoaded(story?.status_type === "text")
		setMediaError(false)
	}

	useEffect(() => {
		if (!story || isOwn) return
		const alreadyViewed = story.is_viewed || useStatusViewedStore.getState().isViewed(story.id)
		if (alreadyViewed || seenIdsRef.current.has(story.id)) return
		seenIdsRef.current.add(story.id)
		useStatusViewedStore.getState().markViewed(story.id)
		markViewed.mutate(story.id)
	}, [story?.id, isOwn])

	const advanceToNextEntry = () => {
		if (isOwn) {
			router.replace("/messenger/status")
			return
		}
		const currentChainIndex = chain.findIndex((e) => e.id === userId)
		if (currentChainIndex === -1) {
			// Directly-viewed muted entry — never chain into unrelated content.
			router.replace("/messenger/status")
			return
		}
		const next = chain[currentChainIndex + 1]
		router.replace(next ? `/messenger/status/${next.id}` : "/messenger/status")
	}

	const goNext = () => {
		if (!entry) return
		if (index < entry.stories.length - 1) {
			setIndex((i) => i + 1)
			setProgress(0)
		} else {
			advanceToNextEntry()
		}
	}
	const goPrev = () => {
		if (index > 0) {
			setIndex((i) => i - 1)
			setProgress(0)
			return
		}
		// At the first story — step back to the previous user in the same
		// chain used for forward auto-advance, mirroring goNext/
		// advanceToNextEntry's logic in reverse. "My Status" has no
		// predecessor, and an entry reached outside the chain (a muted
		// user opened directly from the list) has no defined "previous"
		// either — both cases just hold at the boundary, per spec.
		//
		// Deliberately lands on the previous user's FIRST story rather
		// than their last: the alternative needs the target index
		// communicated across the route change (query param, extra
		// state) purely to serve the "rewind to the end" feel, which
		// isn't worth the extra moving parts for what backward
		// navigation across users is mostly used for in practice —
		// getting back to someone, not landing on a specific story.
		if (isOwn) return
		const currentChainIndex = chain.findIndex((e) => e.id === userId)
		if (currentChainIndex <= 0) return
		router.replace(`/messenger/status/${chain[currentChainIndex - 1].id}`)
	}

	useEffect(() => {
		if (!story || isVideo || paused || !mediaLoaded || mediaError) return
		startRef.current = performance.now() - progress * IMAGE_STORY_DURATION_MS
		const tick = (now: number) => {
			const pct = Math.min(1, (now - startRef.current) / IMAGE_STORY_DURATION_MS)
			setProgress(pct)
			if (pct >= 1) return goNext()
			rafRef.current = requestAnimationFrame(tick)
		}
		rafRef.current = requestAnimationFrame(tick)
		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current)
		}
	}, [story?.id, isVideo, paused, mediaLoaded, mediaError])

	useEffect(() => {
		const video = videoRef.current
		if (!isVideo || !video) return
		if (paused) video.pause()
		else void video.play()
	}, [isVideo, paused, story?.id])

	// Desktop keyboard support — arrows to navigate, Escape to close.
	// goNext/goPrev are plain functions recreated every render (they close
	// over `index`/`entry`), so the handler reads them via refs rather
	// than putting them in the effect's deps — otherwise this would tear
	// down and re-add a global listener on every progress tick (~60/sec
	// during the image countdown) instead of just when the story or the
	// overlay-guard actually changes.
	const goNextRef = useRef(goNext)
	const goPrevRef = useRef(goPrev)
	useEffect(() => {
		goNextRef.current = goNext
		goPrevRef.current = goPrev
	})

	useEffect(() => {
		if (!story || confirmDelete || viewersOpen) return
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowRight") goNextRef.current()
			else if (e.key === "ArrowLeft") goPrevRef.current()
			else if (e.key === "Escape") router.replace("/messenger/status")
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [story?.id, confirmDelete, viewersOpen, router])

	if (!entry || !story) {
		return (
			<div className="hidden sm:flex flex-1 items-center justify-center bg-muted/20">
				<p className="text-sm text-muted-foreground">Select a status to view</p>
			</div>
		)
	}

	return (
		<div className="flex-1 flex flex-col h-full min-w-0 bg-black">
			<div
				className="flex items-center gap-1 px-3 pt-3"
				role="progressbar"
				aria-label={`Story ${safeIndex + 1} of ${entry.stories.length}`}
			>
				{entry.stories.map((s, i) => (
					<div key={s.id} className="h-0.75 flex-1 overflow-hidden rounded-full bg-white/25">
						<div
							className="h-full rounded-full bg-white"
							style={{
								width: `${i < safeIndex ? 100 : i === safeIndex ? progress * 100 : 0}%`,
								transition: i === safeIndex ? undefined : "width 150ms ease-out",
							}}
						/>
					</div>
				))}
			</div>

			<div className="flex items-center gap-3 px-4 py-3">
				<Avatar.Root className="h-9 w-9 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
					<Avatar.Image
						src={entry.avatarUrl ?? undefined}
						alt={entry.name}
						className="h-full w-full object-cover"
					/>
					<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
						{getInitials(entry.user.first_name, entry.user.last_name)}
					</Avatar.Fallback>
				</Avatar.Root>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold leading-tight text-white">
						{isOwn ? "My Status" : entry.name}
					</p>
					<p className="truncate text-xs leading-tight text-white/60">
						{formatStatusTimestamp(story.created_at)}
					</p>
				</div>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button
							aria-label="Status options"
							className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
						>
							<MoreVertical size={18} />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content
							align="end"
							sideOffset={4}
							className="z-150 min-w-44 bg-popover border border-border rounded-2xl p-1.5 shadow-xl"
						>
							{isOwn ? (
								<DropdownMenu.Item
									className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent text-destructive"
									onSelect={() => setConfirmDelete(true)}
								>
									<Trash2 size={16} /> Delete status
								</DropdownMenu.Item>
							) : (
								<DropdownMenu.Item
									className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent"
									onSelect={() => (isMutedNow ? unmute(entry.user.pkid) : mute(entry.user.pkid))}
								>
									{isMutedNow ? <Bell size={16} /> : <BellOff size={16} />}
									{isMutedNow ? "Unmute status" : "Mute status"}
								</DropdownMenu.Item>
							)}
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>

				<button
					onClick={() => router.replace("/messenger/status")}
					aria-label="Close status"
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
				>
					<X size={20} />
				</button>
			</div>

			<div
				className="relative flex-1 flex items-center justify-center select-none min-h-0"
				onMouseDown={() => setPaused(true)}
				onMouseUp={() => setPaused(false)}
				onTouchStart={() => setPaused(true)}
				onTouchEnd={() => setPaused(false)}
			>
				{story.status_type === "text" ? (
					<div
						className="w-full h-full flex items-center justify-center p-8"
						style={{ backgroundColor: story.background_color || "#333" }}
					>
						<p className="text-white text-2xl font-medium text-center wrap-break-word max-w-md">
							{story.content}
						</p>
					</div>
				) : mediaError || !mediaUrl ? (
					<div className="flex flex-col items-center gap-3 px-8 text-center text-white/70">
						<ImageOff size={28} />
						<p className="text-sm">This status couldn&apos;t be shown.</p>
						<button
							onClick={goNext}
							className="rounded-full border border-white/25 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
						>
							Skip
						</button>
					</div>
				) : isVideo ? (
					<video
						ref={videoRef}
						src={mediaUrl}
						className="max-h-full max-w-full"
						autoPlay
						playsInline
						onLoadedData={() => setMediaLoaded(true)}
						onError={() => setMediaError(true)}
						onTimeUpdate={(e) => {
							const v = e.currentTarget
							if (v.duration) setProgress(v.currentTime / v.duration)
						}}
						onEnded={goNext}
					/>
				) : (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={mediaUrl}
						alt=""
						className={cn(
							"max-h-full max-w-full object-contain transition-opacity duration-150 motion-reduce:transition-none",
							mediaLoaded ? "opacity-100" : "opacity-0",
						)}
						onLoad={() => setMediaLoaded(true)}
						onError={() => setMediaError(true)}
					/>
				)}

				{!mediaLoaded && !mediaError && story.status_type !== "text" && mediaUrl && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Loader2 size={24} className="animate-spin text-white/70 motion-reduce:animate-none" />
					</div>
				)}

				<button
					onClick={goPrev}
					className="absolute left-0 top-0 h-full w-1/3"
					aria-label="Previous"
				/>
				<button
					onClick={goNext}
					className="absolute right-0 top-0 h-full w-2/3"
					aria-label="Next"
				/>
			</div>

			<div className="flex flex-col gap-2 px-4 pb-3 pt-2">
				{mediaCaption && (
					<p className="text-sm leading-snug text-white/90 wrap-break-word">{mediaCaption}</p>
				)}
				{isOwn ? (
					<button
						onClick={() => setViewersOpen(true)}
						className="flex w-fit items-center gap-1.5 rounded-full py-1 text-sm text-white/70 transition-colors hover:text-white"
					>
						<Eye size={15} />
						{story.views_count ?? 0} view{story.views_count === 1 ? "" : "s"}
					</button>
				) : (
					<button
						onClick={() => reshareStatus.mutate({ statusId: story.id })}
						className="flex w-fit items-center gap-1.5 rounded-full py-1 text-sm text-white/70 transition-colors hover:text-white"
					>
						<Repeat2 size={15} /> Share to my status
					</button>
				)}
			</div>

			{confirmDelete && (
				<div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
					<div className="bg-card rounded-2xl p-5 w-full max-w-xs flex flex-col gap-3">
						<p className="text-sm font-medium">Delete this status?</p>
						<div className="flex gap-2">
							<button
								onClick={() => setConfirmDelete(false)}
								className="flex-1 py-2 rounded-full text-sm font-medium border border-border"
							>
								Cancel
							</button>
							<button
								onClick={() => {
									deleteStatus.mutate(story.id)
									setConfirmDelete(false)
									if (entry.stories.length <= 1) router.replace("/messenger/status")
									else goNext()
								}}
								className="flex-1 py-2 rounded-full text-sm font-medium bg-destructive text-white"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}

			{viewersOpen && (
				<StatusViewersSheet statusId={story.id} onClose={() => setViewersOpen(false)} />
			)}
		</div>
	)
}
