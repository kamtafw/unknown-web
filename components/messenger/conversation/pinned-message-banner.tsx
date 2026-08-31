"use client"

import type { Message } from "@/types/messenger"
import { ChevronRight, Pin, X } from "lucide-react"
import { useState } from "react"

interface PinnedMessageBannerProps {
	pinnedMessages: Message[]
	onJumpToMessage: (message: Message) => void
	onUnpin: (message: Message) => void
}

/** Ported from mobile's PinnedMessageBanner fallback logic — `content` is
 * empty for most non-text types, so `content || "Message"` (old web
 * behavior) always showed the generic label. */
function resolvePreviewText(message: Message): string {
	if (message.message_type === "text") {
		return message.content.replace(/\s+/g, " ").trim() || "Message"
	}
	if (message.message_type === "location") return "Location"
	if (message.message_type === "voice" || message.message_type === "audio") return "Voice message"
	if (message.media?.length) {
		return message.message_type.charAt(0).toUpperCase() + message.message_type.slice(1)
	}
	return message.content || message.message_type
}

export function PinnedMessageBanner({
	pinnedMessages,
	onJumpToMessage,
	onUnpin,
}: PinnedMessageBannerProps) {
	const [index, setIndex] = useState(0)

	if (pinnedMessages.length === 0) return null
	const currentIndex = index % pinnedMessages.length
	const current = pinnedMessages[currentIndex]
	const hasMultiple = pinnedMessages.length > 1

	return (
		<div className="w-full flex items-center gap-2.5 px-4 py-2 border-b border-border bg-muted/40 shrink-0">
			<Pin size={14} className="text-primary shrink-0 rotate-45" />

			<button onClick={() => onJumpToMessage(current)} className="flex-1 min-w-0 text-left">
				<p className="text-xs font-medium text-primary">
					Pinned message{hasMultiple ? ` (${currentIndex + 1} of ${pinnedMessages.length})` : ""}
				</p>
				<p className="text-xs text-muted-foreground truncate">{resolvePreviewText(current)}</p>
			</button>

			{hasMultiple && (
				<button
					onClick={() => setIndex((i) => i + 1)}
					title="Show next pinned message"
					className="shrink-0 p-1 rounded-full hover:bg-accent text-muted-foreground transition-colors"
				>
					<ChevronRight size={14} />
				</button>
			)}

			<button
				onClick={() => onUnpin(current)}
				title="Unpin message"
				className="shrink-0 p-1 rounded-full hover:bg-accent text-muted-foreground transition-colors"
			>
				<X size={14} />
			</button>
		</div>
	)
}
