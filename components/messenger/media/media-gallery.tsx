"use client"

import type { MediaAttachment } from "@/types/messenger"
import { FileText, Play } from "lucide-react"
import Image from "next/image"
import { useMediaViewer } from "./media-viewer-context"

type GalleryLayout = "two-stacked" | "two-side-by-side" | "three" | "four"

function MediaThumbnail({ item }: { item: MediaAttachment }) {
	if (item.type === "image") {
		return (
			<Image
				src={item.url}
				alt={item.caption || "Image"}
				width={280}
				height={280}
				className="block h-full w-full object-cover"
			/>
		)
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
						<Play size={18} fill="currentColor" className="ml-0.5" />
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-full w-full items-center gap-2 bg-muted p-3">
			<FileText size={20} className="shrink-0 opacity-70" />

			<span className="truncate text-sm">{item.fileName || item.caption || "Document"}</span>
		</div>
	)
}

function GalleryTile({
	item,
	index,
	remainingCount,
	onClick,
}: {
	item: MediaAttachment
	index: number
	remainingCount: number
	onClick: () => void
}) {
	const hasOverflow = index === 3 && remainingCount > 0

	return (
		<button
			type="button"
			onClick={onClick}
			className="
				group relative block min-h-0 min-w-0
				overflow-hidden rounded-lg
				bg-muted text-left
				focus-visible:outline-none
				focus-visible:ring-2
				focus-visible:ring-primary
			"
			aria-label={
				hasOverflow ? `Open media gallery, ${remainingCount} more items` : `Open ${item.type}`
			}
		>
			<MediaThumbnail item={item} />

			{hasOverflow && (
				<div className="absolute inset-0 flex items-center justify-center bg-black/45 transition-colors group-hover:bg-black/55">
					<span className="text-2xl font-semibold text-white">+{remainingCount}</span>
				</div>
			)}

			{!hasOverflow && (
				<div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
			)}
		</button>
	)
}

/**
 * There are currently no width/height values in MediaAttachment,
 * so layout selection cannot reliably distinguish landscape from
 * portrait media before rendering.
 *
 * Keep this deterministic for now. We can add aspect-ratio-aware
 * behavior later without changing the gallery API.
 */
function getGalleryLayout(media: MediaAttachment[]): GalleryLayout {
	if (media.length === 2) {
		return "two-side-by-side"
	}

	if (media.length === 3) {
		return "three"
	}

	return "four"
}

function TwoMediaGallery({
	media,
	onOpen,
}: {
	media: MediaAttachment[]
	onOpen: (index: number) => void
}) {
	return (
		<div className="grid w-full max-w-70 grid-cols-2 gap-1">
			{media.map((item, index) => (
				<div key={index} className="relative aspect-square min-w-0">
					<GalleryTile item={item} index={index} remainingCount={0} onClick={() => onOpen(index)} />
				</div>
			))}
		</div>
	)
}

function ThreeMediaGallery({
	media,
	onOpen,
}: {
	media: MediaAttachment[]
	onOpen: (index: number) => void
}) {
	return (
		<div className="grid w-full max-w-70 grid-cols-2 gap-1">
			<div className="relative row-span-2 aspect-[0.72] min-w-0">
				<GalleryTile item={media[0]} index={0} remainingCount={0} onClick={() => onOpen(0)} />
			</div>

			<div className="relative aspect-square min-w-0">
				<GalleryTile item={media[1]} index={1} remainingCount={0} onClick={() => onOpen(1)} />
			</div>

			<div className="relative aspect-square min-w-0">
				<GalleryTile item={media[2]} index={2} remainingCount={0} onClick={() => onOpen(2)} />
			</div>
		</div>
	)
}

function FourMediaGallery({
	media,
	onOpen,
}: {
	media: MediaAttachment[]
	onOpen: (index: number) => void
}) {
	const visibleMedia = media.slice(0, 4)
	const remainingCount = Math.max(0, media.length - 4)

	return (
		<div className="grid w-full max-w-70 grid-cols-2 gap-1">
			{visibleMedia.map((item, index) => (
				<div key={index} className="relative aspect-square min-w-0">
					<GalleryTile
						item={item}
						index={index}
						remainingCount={remainingCount}
						onClick={() => onOpen(index)}
					/>
				</div>
			))}
		</div>
	)
}

function SingleMedia({ item, onOpen }: { item: MediaAttachment; onOpen: () => void }) {
	if (item.type === "audio") {
		return (
			<div className="flex flex-col gap-1">
				<audio src={item.url} controls className="max-w-70" />

				{item.caption && item.caption !== "Voice message" && (
					<p className="text-sm">{item.caption}</p>
				)}
			</div>
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
			<figure className="flex max-w-70 flex-col gap-1">
				<button
					type="button"
					onClick={onOpen}
					className="
						overflow-hidden rounded-lg
						focus-visible:outline-none
						focus-visible:ring-2
						focus-visible:ring-primary
					"
					aria-label="Open image"
				>
					<Image
						src={item.url}
						alt={item.caption || "Image"}
						width={280}
						height={280}
						className="block max-h-70 max-w-70 object-contain"
					/>
				</button>

				{item.caption && <figcaption className="text-sm">{item.caption}</figcaption>}
			</figure>
		)
	}

	return (
		<figure className="flex max-w-70 flex-col gap-1">
			<button
				type="button"
				onClick={onOpen}
				className="
					relative aspect-video w-70
					overflow-hidden rounded-lg
					focus-visible:outline-none
					focus-visible:ring-2
					focus-visible:ring-primary
				"
				aria-label="Open video"
			>
				<MediaThumbnail item={item} />
			</button>

			{item.caption && <figcaption className="text-sm">{item.caption}</figcaption>}
		</figure>
	)
}

export function MediaGallery({ media }: { media: MediaAttachment[] }) {
	const { openMedia } = useMediaViewer()

	if (!media.length) return null

	if (media.length === 1) {
		return <SingleMedia item={media[0]} onOpen={() => openMedia(media, 0)} />
	}

	/*
	 * For batches, only image/video items participate in the
	 * visual gallery. Audio/documents are not suitable gallery
	 * tiles.
	 */
	const visualMedia = media.filter((item) => item.type === "image" || item.type === "video")

	if (!visualMedia.length) {
		return (
			<div className="flex flex-col gap-2">
				{media.map((item, index) => (
					<SingleMedia key={index} item={item} onOpen={() => openMedia(media, index)} />
				))}
			</div>
		)
	}

	const layout = getGalleryLayout(visualMedia)

	const gallery = (() => {
		switch (layout) {
			case "two-side-by-side":
				return (
					<TwoMediaGallery
						media={visualMedia}
						onOpen={(index) => {
							const originalIndex = media.indexOf(visualMedia[index])

							openMedia(media, originalIndex >= 0 ? originalIndex : index)
						}}
					/>
				)

			case "three":
				return (
					<ThreeMediaGallery
						media={visualMedia}
						onOpen={(index) => {
							const originalIndex = media.indexOf(visualMedia[index])

							openMedia(media, originalIndex >= 0 ? originalIndex : index)
						}}
					/>
				)

			case "four":
				return (
					<FourMediaGallery
						media={visualMedia}
						onOpen={(index) => {
							const originalIndex = media.indexOf(visualMedia[index])

							openMedia(media, originalIndex >= 0 ? originalIndex : index)
						}}
					/>
				)

			default:
				return null
		}
	})()

	const caption = media.find((item) => item.caption)?.caption

	return (
		<div className="flex flex-col gap-1">
			{gallery}

			{caption && <p className="whitespace-pre-wrap wrap-break-word text-sm">{caption}</p>}
		</div>
	)
}
