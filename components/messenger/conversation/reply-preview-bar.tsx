"use client"

import type { Message } from "@/types/messenger"
import { Reply, X } from "lucide-react"

interface ReplyPreviewBarProps {
	message: Message
	onCancel: () => void
}

export function ReplyPreviewBar({ message, onCancel }: ReplyPreviewBarProps) {
	return (
		<div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-muted/50">
			<Reply size={15} className="text-primary shrink-0" />
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium text-primary">
					Replying to {message.sender.first_name ?? message.sender.username}
				</p>
				<p className="text-xs text-muted-foreground truncate">{message.content || "Message"}</p>
			</div>
			<button
				onClick={onCancel}
				className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
			>
				<X size={14} />
			</button>
		</div>
	)
}
