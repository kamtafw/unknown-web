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
import { getInitials } from "@/lib/messenger/user-display"
import { useAuthStore } from "@/stores/auth-store"
import { useStatusMuteStore } from "@/stores/status-mute.store"
import type { Pkid, StatusUser, Uuid } from "@/types/messenger"
import { Bell, BellOff, MoreVertical, Repeat2, Trash2, X } from "lucide-react"
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

	const grouped = useMemo(
		() => groupStatusesByUser(feedData?.results ?? [], new Set(mutedPkids)),
		[feedData, mutedPkids],
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

	useEffect(() => {
		setIndex(0)
		setProgress(0)
	}, [userId])

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

	const story = entry?.stories[index]
	const isVideo = story?.status_type === "video"
	const mediaUrl = story?.media?.[0]?.url

	useEffect(() => {
		if (!story || isOwn || story.is_viewed || seenIdsRef.current.has(story.id)) return
		seenIdsRef.current.add(story.id)
		markViewed.mutate(story.id)
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
		}
	}

	useEffect(() => {
		if (!story || isVideo || paused) return
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [story?.id, isVideo, paused])

	useEffect(() => {
		const video = videoRef.current
		if (!isVideo || !video) return
		if (paused) video.pause()
		else void video.play()
	}, [isVideo, paused, story?.id])

	if (!entry || !story) {
		return (
			<div className="hidden sm:flex flex-1 items-center justify-center bg-muted/20">
				<p className="text-sm text-muted-foreground">Select a status to view</p>
			</div>
		)
	}

	return (
		<div className="flex-1 flex flex-col h-full min-w-0 bg-black">
			<div className="flex items-center gap-1 px-3 pt-3">
				{entry.stories.map((s, i) => (
					<div key={s.id} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
						<div
							className="h-full bg-white"
							style={{ width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }}
						/>
					</div>
				))}
			</div>

			<div className="flex items-center gap-2.5 px-3 py-2.5">
				<Avatar.Root className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center">
					<Avatar.Image
						src={entry.avatarUrl ?? undefined}
						alt={entry.name}
						className="h-full w-full object-cover"
					/>
					<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
						{getInitials(entry.user.first_name, entry.user.last_name)}
					</Avatar.Fallback>
				</Avatar.Root>
				<p className="min-w-0 flex-1 text-sm font-semibold text-white truncate">
					{isOwn ? "My Status" : entry.name}
				</p>

				{isOwn ? (
					<DropdownMenu.Root>
						<DropdownMenu.Trigger asChild>
							<button className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white">
								<MoreVertical size={18} />
							</button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Portal>
							<DropdownMenu.Content
								align="end"
								sideOffset={4}
								className="z-150 min-w-44 bg-popover border border-border rounded-2xl p-1.5 shadow-xl"
							>
								<DropdownMenu.Item
									className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm hover:bg-accent data-highlighted:bg-accent text-destructive"
									onSelect={() => setConfirmDelete(true)}
								>
									<Trash2 size={16} /> Delete status
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu.Portal>
					</DropdownMenu.Root>
				) : (
					<button
						onClick={() => (isMutedNow ? unmute(entry.user.pkid) : mute(entry.user.pkid))}
						className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white"
						title={isMutedNow ? "Unmute" : "Mute"}
					>
						{isMutedNow ? <Bell size={18} /> : <BellOff size={18} />}
					</button>
				)}
				<button
					onClick={() => router.replace("/messenger/status")}
					className="h-8 w-8 flex items-center justify-center text-white/80 hover:text-white"
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
				) : isVideo && mediaUrl ? (
					<video
						ref={videoRef}
						src={mediaUrl}
						className="max-h-full max-w-full"
						autoPlay
						playsInline
						onTimeUpdate={(e) => {
							const v = e.currentTarget
							if (v.duration) setProgress(v.currentTime / v.duration)
						}}
						onEnded={goNext}
					/>
				) : mediaUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img src={mediaUrl} alt="" className="max-h-full max-w-full object-contain" />
				) : null}

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

			<div className="flex items-center justify-between px-4 py-3">
				{isOwn ? (
					<button
						onClick={() => setViewersOpen(true)}
						className="text-sm text-white/80 hover:text-white"
					>
						{story.views_count ?? 0} view{story.views_count === 1 ? "" : "s"}
					</button>
				) : (
					<button
						onClick={() => reshareStatus.mutate({ statusId: story.id })}
						className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white"
					>
						<Repeat2 size={16} /> Share to my status
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
