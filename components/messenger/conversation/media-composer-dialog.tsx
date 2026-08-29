"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { AlertCircle, Loader2, RotateCcw } from "lucide-react"
import { useState } from "react"

interface MediaComposerDialogProps {
	attachment: PendingAttachment | null
	onCancel: () => void
	onRetry: () => void
	onSend: (caption: string) => void
}

/** One shared dialog for image/video/audio-file attachments — mirrors
 * mobile's single media-caption composer (one caption box applied to the
 * whole send), confirmed via handleMediaSend. */
export function MediaComposerDialog({
	attachment,
	onCancel,
	onRetry,
	onSend,
}: MediaComposerDialogProps) {
	const [caption, setCaption] = useState("")
	if (!attachment) return null

	const handleSend = () => {
		onSend(caption.trim())
		setCaption("")
	}

	return (
		<Dialog open={!!attachment} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{attachment.type === "image"
							? "Send image"
							: attachment.type === "video"
								? "Send video"
								: "Send audio"}
					</DialogTitle>
				</DialogHeader>

				<div className="relative flex items-center justify-center rounded-lg bg-muted overflow-hidden max-h-80">
					{attachment.type === "image" && (
						// local blob preview — next/image doesn't handle blob: URLs
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={attachment.preview}
							alt="Preview"
							className="max-h-80 w-auto object-contain"
						/>
					)}
					{attachment.type === "video" && (
						<video src={attachment.preview} controls className="max-h-80 w-full" />
					)}
					{attachment.type === "audio" && (
						<audio src={attachment.preview} controls className="w-full m-4" />
					)}

					{attachment.uploading && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/60">
							<Loader2 size={24} className="animate-spin text-muted-foreground" />
						</div>
					)}
					{attachment.error && (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
							<AlertCircle size={22} className="text-destructive" />
							<button
								onClick={onRetry}
								className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
							>
								<RotateCcw size={14} /> Retry upload
							</button>
						</div>
					)}
				</div>

				<input
					value={caption}
					onChange={(e) => setCaption(e.target.value)}
					placeholder="Add a caption (optional)"
					className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none"
				/>

				<div className="flex gap-2">
					<button
						onClick={onCancel}
						className="flex-1 py-2.5 rounded-full text-sm font-medium border border-border hover:bg-accent transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSend}
						disabled={attachment.uploading || attachment.error || !attachment.uploadedUrl}
						className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
					>
						Send
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
