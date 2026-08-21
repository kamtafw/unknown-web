"use client"

import { usePinnedMessages } from "@/hooks/messenger/use-message-actions"
import type { Pkid, Uuid } from "@/types/messenger"
import { Pin } from "lucide-react"
import { useState } from "react"

interface PinnedMessageBannerProps {
	chatType: "user" | "group"
	peerPkid: Pkid
	peerUuid: Uuid
}

export function PinnedMessageBanner({ chatType, peerPkid, peerUuid }: PinnedMessageBannerProps) {
	const { data: pinned } = usePinnedMessages(chatType, peerPkid, peerUuid)
	const [index, setIndex] = useState(0)

	if (!pinned || pinned.length === 0) return null

	const currentIndex = index % pinned.length
	const current = pinned[currentIndex]

	return (
		<button
			onClick={() => setIndex((i) => i + 1)}
			title={pinned.length > 1 ? "Show next pinned message" : undefined}
			className="w-full flex items-center gap-2.5 px-4 py-2 border-b border-border bg-muted/40 hover:bg-muted/70 transition-colors text-left shrink-0"
		>
			<Pin size={14} className="text-primary shrink-0 rotate-45" />
			<div className="min-w-0 flex-1">
				<p className="text-xs font-medium text-primary">
					Pinned message{pinned.length > 1 ? ` (${currentIndex + 1} of ${pinned.length})` : ""}
				</p>
				<p className="text-xs text-muted-foreground truncate">{current.content || "Message"}</p>
			</div>
		</button>
	)
}
