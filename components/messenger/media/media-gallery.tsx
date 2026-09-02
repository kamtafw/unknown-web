"use client"

import { VoiceMessagePlayer } from "@/components/messenger/conversation/voice-message-player"
import { cn } from "@/lib/utils"
import type { MediaAttachment } from "@/types/messenger"
import { FileText, Play } from "lucide-react"
import Image from "next/image"

interface SenderContext {
	isOwn: boolean
	senderName: string
	senderInitials: string
	senderAvatarUrl?: string | null
}

function MediaThumbnail({ item }: { item: MediaAttachment }) {
	if (item.type === "image") {
		return <Image src={item.url} alt={item.caption || "Image"} fill className="object-cover" />
	}
	if (item.type === "video") {
		return (
			<div className="relative h-full w-full">
				<video
					src={item.url}
					preload="metadata"
					muted
					playsInline
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
						<Play size={17} fill="currentColor" className="ml-0.5" />
					</div>
				</div>
			</div>
		)
	}
	return (
		<div className="flex h-full w-full items-center gap-2 bg-muted p-3">
			<FileText size={18} className="shrink-0 opacity-70" />
			<span className="truncate text-xs">{item.fileName || item.caption || "Document"}</span>
		</div>
	)
}

function GalleryTile({
	item,
	overlayCount,
	onClick,
	className,
}: {
	item: MediaAttachment
	overlayCount?: number
	onClick: () => void
	className?: string
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"group relative block min-h-0 min-w-0 h-full w-full overflow-hidden rounded-xl bg-muted text-left focus-visible:outline-none",
				className,
			)}
			aria-label={
				overlayCount ? `Open media gallery, ${overlayCount} more items` : `Open ${item.type}`
			}
		>
			<MediaThumbnail item={item} />
			{overlayCount ? (
				<div className="absolute inset-0 flex items-center justify-center bg-black/45 transition-colors group-hover:bg-black/55">
					<span className="text-xl font-semibold text-white">+{overlayCount}</span>
				</div>
			) : (
				<div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
			)}
		</button>
	)
}

function TwoMediaGallery({
	media,
	onOpen,
}: {
	media: MediaAttachment[]
	onOpen: (i: number) => void
}) {
	return (
		<div className="grid grid-cols-2 gap-1 w-64">
			{media.map((item, i) => (
				<div key={i} className="relative aspect-square">
					<GalleryTile item={item} onClick={() => onOpen(i)} />
				</div>
			))}
		</div>
	)
}

/** 3+ images: one large tile left, up to 2 small tiles stacked right.
 * Overlay lands on the LAST visible tile — matching real WhatsApp
 * behavior rather than the reference mockup's literal badge placement,
 * which looks like placeholder content, not an intentional layout rule. */
function StackedMediaGallery({
	media,
	onOpen,
}: {
	media: MediaAttachment[]
	onOpen: (i: number) => void
}) {
	const visible = media.slice(0, 3)
	const remaining = media.length - 3
	return (
		<div className="grid grid-cols-2 grid-rows-2 gap-1 w-72 h-56">
			<div className="row-span-2">
				<GalleryTile item={visible[0]} onClick={() => onOpen(0)} className="h-full" />
			</div>
			{visible[1] && <GalleryTile item={visible[1]} onClick={() => onOpen(1)} />}
			{visible[2] && (
				<GalleryTile
					item={visible[2]}
					overlayCount={remaining > 0 ? remaining : undefined}
					onClick={() => onOpen(2)}
				/>
			)}
		</div>
	)
}

function SingleMediaItem({
	item,
	ctx,
	onOpen,
}: {
	item: MediaAttachment
	ctx: SenderContext
	onOpen: () => void
}) {
	if (item.type === "audio") {
		const title =
			item.caption && item.caption !== "Voice message" ? item.caption : item.fileName || "Audio"
		return (
			<VoiceMessagePlayer
				url={item.url}
				title={title}
				isOwn={ctx.isOwn}
				senderName={ctx.senderName}
				senderInitials={ctx.senderInitials}
				senderAvatarUrl={ctx.senderAvatarUrl}
			/>
		)
	}
	if (item.type === "pdf" || item.type === "document") {
		return (
			<a
				href={item.url}
				target="_blank"
				rel="noreferrer"
				className="flex max-w-70 items-center gap-2 text-sm underline"
			>
				<FileText size={16} className="shrink-0 opacity-70" />
				<span className="truncate">{item.caption || item.fileName || "Document"}</span>
			</a>
		)
	}
	if (item.type === "image") {
		return (
			<button
				type="button"
				onClick={onOpen}
				className="block overflow-hidden rounded-xl focus-visible:outline-none"
				aria-label="Open image"
			>
				<Image
					src={item.url}
					alt={item.caption || "Image"}
					width={280}
					height={280}
					className="max-h-70 max-w-70 object-contain"
				/>
			</button>
		)
	}
	return (
		<button
			type="button"
			onClick={onOpen}
			className="relative aspect-video w-70 overflow-hidden rounded-xl focus-visible:outline-none"
			aria-label="Open video"
		>
			<MediaThumbnail item={item} />
		</button>
	)
}

interface MediaGalleryProps {
	media: MediaAttachment[]
	isOwn: boolean
	senderName: string
	senderInitials: string
	senderAvatarUrl?: string | null
	onOpenViewer?: (media: MediaAttachment[], index: number) => void
}

export function MediaGallery({
	media,
	isOwn,
	senderName,
	senderInitials,
	senderAvatarUrl,
	onOpenViewer,
}: MediaGalleryProps) {
	if (!media.length) return null
	const ctx: SenderContext = { isOwn, senderName, senderInitials, senderAvatarUrl }
	const open = (index: number) => onOpenViewer?.(media, index)

	if (media.length === 1) {
		const caption =
			media[0].type !== "audio" && media[0].caption && media[0].caption !== "Voice message"
				? media[0].caption
				: null
		return (
			<div className="flex flex-col gap-1">
				<SingleMediaItem item={media[0]} ctx={ctx} onOpen={() => open(0)} />
				{caption && <p className="text-sm">{caption}</p>}
			</div>
		)
	}

	const visualMedia = media.filter((m) => m.type === "image" || m.type === "video")
	if (!visualMedia.length) {
		return (
			<div className="flex flex-col gap-2">
				{media.map((item, i) => (
					<SingleMediaItem key={i} item={item} ctx={ctx} onOpen={() => open(i)} />
				))}
			</div>
		)
	}

	const caption = media.find((m) => m.caption)?.caption
	const openVisual = (visualIndex: number) => {
		const original = media.indexOf(visualMedia[visualIndex])
		open(original >= 0 ? original : visualIndex)
	}

	return (
		<div className="flex flex-col gap-1.5">
			{visualMedia.length === 2 ? (
				<TwoMediaGallery media={visualMedia} onOpen={openVisual} />
			) : (
				<StackedMediaGallery media={visualMedia} onOpen={openVisual} />
			)}
			{caption && <p className="whitespace-pre-wrap wrap-break-word text-sm">{caption}</p>}
		</div>
	)
}
