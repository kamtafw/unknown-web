"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { PendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { cn } from "@/lib/utils"
import { AlertCircle, Loader2, RotateCcw, X } from "lucide-react"
import { useState } from "react"

interface MediaComposerDialogProps {
	attachments: PendingAttachment[]
	onRemove: (id: string) => void
	onRetry: (id: string) => void
	onCancel: () => void
	onSend: (caption: string) => void
	canSend: boolean
}

/** One caption box for the whole batch — mirrors mobile's
 * handleMediaSend, which applies a single caption uniformly to every
 * item in the batch, not per-item captions. */
export function MediaComposerDialog({
	attachments,
	onRemove,
	onRetry,
	onCancel,
	onSend,
	canSend,
}: MediaComposerDialogProps) {
	const [caption, setCaption] = useState("")
	if (attachments.length === 0) return null

	const handleSend = () => {
		onSend(caption.trim())
		setCaption("")
	}

	return (
		<Dialog open={attachments.length > 0} onOpenChange={(open) => !open && onCancel()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{attachments.length === 1 ? "Send attachment" : `Send ${attachments.length} items`}
					</DialogTitle>
				</DialogHeader>

				<div
					className={cn(
						"grid gap-2 max-h-80 overflow-y-auto",
						attachments.length === 1 ? "grid-cols-1" : "grid-cols-3",
					)}
				>
					{attachments.map((a) => (
						<div key={a.id} className="relative aspect-square rounded-lg bg-muted overflow-hidden">
							{a.type === "image" && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={a.preview} alt="Preview" className="h-full w-full object-cover" />
							)}
							{a.type === "video" && (
								<video src={a.preview} className="h-full w-full object-cover" />
							)}
							{(a.type === "audio" || a.type === "document" || a.type === "pdf") && (
								<div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
									{a.file.name}
								</div>
							)}

							{a.uploading && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/60">
									<Loader2 size={18} className="animate-spin text-muted-foreground" />
								</div>
							)}
							{a.error && (
								<button
									onClick={() => onRetry(a.id)}
									className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/80"
								>
									<AlertCircle size={18} className="text-destructive" />
									<span className="flex items-center gap-1 text-[11px] font-medium text-primary">
										<RotateCcw size={11} /> Retry
									</span>
								</button>
							)}

							<button
								onClick={() => onRemove(a.id)}
								className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 flex items-center justify-center hover:bg-background transition-colors"
							>
								<X size={12} />
							</button>
						</div>
					))}
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
						disabled={!canSend}
						className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
					>
						Send{attachments.length > 1 ? ` (${attachments.length})` : ""}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
