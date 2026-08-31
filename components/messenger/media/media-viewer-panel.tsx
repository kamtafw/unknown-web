"use client"

import type { MediaAttachment } from "@/types/messenger"
import { ArrowLeft, ArrowRight, Download, FileText, Play, X } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"
import { useMediaViewer } from "./media-viewer-context"

function ViewerMedia({ item }: { item: MediaAttachment }) {
	if (item.type === "image") {
		return (
			<div className="relative h-full w-full">
				<Image
					src={item.url}
					alt={item.caption || "Image"}
					fill
					priority
					sizes="(max-width: 1024px) 100vw, 45vw"
					className="object-contain"
				/>
			</div>
		)
	}

	if (item.type === "video") {
		return (
			<video
				src={item.url}
				controls
				autoPlay
				playsInline
				className="max-h-full max-w-full rounded-lg object-contain"
			/>
		)
	}

	if (item.type === "audio") {
		return (
			<div className="flex w-full max-w-md flex-col items-center gap-5">
				<div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
					<Play size={28} />
				</div>

				<audio src={item.url} controls className="w-full" />
			</div>
		)
	}

	return (
		<div className="flex max-w-md flex-col items-center gap-4 text-center">
			<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
				<FileText size={32} />
			</div>

			<p className="max-w-full truncate text-sm">{item.fileName || item.caption || "Document"}</p>

			<a
				href={item.url}
				target="_blank"
				rel="noreferrer"
				className="text-sm text-primary hover:underline"
			>
				Open document
			</a>
		</div>
	)
}

export function MediaViewerPanel() {
	const { viewer, closeMedia, next, previous, setIndex } = useMediaViewer()

	useEffect(() => {
		if (!viewer) return

		const handleKeyDown = (event: KeyboardEvent) => {
			switch (event.key) {
				case "Escape":
					closeMedia()
					break

				case "ArrowRight":
					next()
					break

				case "ArrowLeft":
					previous()
					break
			}
		}

		window.addEventListener("keydown", handleKeyDown)

		return () => {
			window.removeEventListener("keydown", handleKeyDown)
		}
	}, [viewer, closeMedia, next, previous])

	if (!viewer) return null

	const item = viewer.media[viewer.index]

	return (
		<aside
			className="
				flex h-full w-[min(42vw,520px)] min-w-[320px]
				shrink-0 flex-col
				border-l border-border
				bg-background
			"
			aria-label="Media viewer"
		>
			<header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
				<div className="min-w-0">
					<p className="truncate text-sm font-medium">
						{item.caption || item.fileName || (item.type === "video" ? "Video" : "Media")}
					</p>

					<p className="text-xs text-muted-foreground">
						{viewer.index + 1} / {viewer.media.length}
					</p>
				</div>

				<button
					type="button"
					onClick={closeMedia}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					aria-label="Close media viewer"
				>
					<X size={20} />
				</button>
			</header>

			<div className="relative min-h-0 flex-1 bg-black/5">
				<div className="absolute inset-0 flex items-center justify-center p-6">
					<ViewerMedia item={item} />
				</div>

				{viewer.media.length > 1 && (
					<>
						<button
							type="button"
							onClick={previous}
							className="
								absolute left-3 top-1/2
								flex h-10 w-10 -translate-y-1/2
								items-center justify-center
								rounded-full bg-background/90 shadow-sm
								backdrop-blur
								hover:bg-background
								focus-visible:outline-none
								focus-visible:ring-2
								focus-visible:ring-primary
							"
							aria-label="Previous media"
						>
							<ArrowLeft size={19} />
						</button>

						<button
							type="button"
							onClick={next}
							className="
								absolute right-3 top-1/2
								flex h-10 w-10 -translate-y-1/2
								items-center justify-center
								rounded-full bg-background/90 shadow-sm
								backdrop-blur
								hover:bg-background
								focus-visible:outline-none
								focus-visible:ring-2
								focus-visible:ring-primary
							"
							aria-label="Next media"
						>
							<ArrowRight size={19} />
						</button>
					</>
				)}
			</div>

			{item.caption && (
				<div className="shrink-0 border-t border-border px-4 py-3">
					<p className="whitespace-pre-wrap wrap-break-word text-sm">{item.caption}</p>
				</div>
			)}

			{item.type !== "audio" && (
				<div className="flex shrink-0 justify-end border-t border-border px-4 py-2">
					<a
						href={item.url}
						target="_blank"
						rel="noreferrer"
						className="flex h-9 items-center gap-2 rounded-md px-3 text-sm hover:bg-muted"
					>
						<Download size={16} />
						Open original
					</a>
				</div>
			)}

			{viewer.media.length > 1 && (
				<div className="flex shrink-0 gap-1 overflow-x-auto border-t border-border p-2">
					{viewer.media.map((mediaItem, index) => (
						<button
							key={index}
							type="button"
							onClick={() => setIndex(index)}
							className={`
								relative h-12 w-12 shrink-0 overflow-hidden rounded-md
								border-2
								${index === viewer.index ? "border-primary" : "border-transparent"}
							`}
							aria-label={`View media ${index + 1}`}
						>
							{mediaItem.type === "image" ? (
								<Image src={mediaItem.url} alt="" fill sizes="48px" className="object-cover" />
							) : mediaItem.type === "video" ? (
								<>
									<video
										src={mediaItem.url}
										muted
										preload="metadata"
										className="absolute inset-0 h-full w-full object-cover"
									/>
									<div className="absolute inset-0 flex items-center justify-center bg-black/20">
										<Play size={14} fill="currentColor" className="text-white" />
									</div>
								</>
							) : (
								<div className="flex h-full items-center justify-center bg-muted">
									<FileText size={16} />
								</div>
							)}
						</button>
					))}
				</div>
			)}
		</aside>
	)
}
