"use client"

import { useChatSocket } from "@/hooks/messenger/use-chat-socket"
import { cn } from "@/lib/utils"
import type { Uuid } from "@/types/messenger"
import { useParams } from "next/navigation"
import { ReactNode } from "react"
import { ChatListPanel } from "./chat-list/chat-list-panel"

/**
 * Two-pane on desktop (`sm:` and up), single-pane on mobile: the list
 * hides once a conversation is open, matching the reference design's
 * desktop screenshots and the standard mobile chat pattern (M1 UI/UX
 * finding — responsive strategy).
 */
export function MessengerShell({ children }: { children: ReactNode }) {
	const params = useParams<{ uuid?: string }>()
	const activeUuid = (params.uuid ?? null) as Uuid | null
	const { typingUuids } = useChatSocket(activeUuid)

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			<div className={cn(activeUuid ? "hidden sm:flex" : "flex", "min-h-0")}>
				<ChatListPanel activeUuid={activeUuid} typingUuids={typingUuids} />
			</div>
			<div className="flex flex-1 min-h-0 min-w-0">{children}</div>
		</div>
	)
}
