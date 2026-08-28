"use client"

import { useChatSocket } from "@/hooks/messenger/use-chat-socket"
import { useGroupRoomSubscription } from "@/hooks/messenger/use-group-rooms"
import { useGroupSocket } from "@/hooks/messenger/use-group-socket"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { Uuid } from "@/types/messenger"
import { useParams, usePathname } from "next/navigation"
import { ReactNode } from "react"
import { ChatListPanel } from "./chat-list/chat-list-panel"
import { GroupListPanel } from "./group-list/group-list-panel"

/**
 * Two-pane on desktop, single-pane on mobile — same shape for both the
 * direct-chat section and the Groups section (M3), just with a different
 * list panel. `useChatSocket` stays mounted for the whole /messenger tree
 * regardless of section, same as before — it's cheap and keeps 1:1 badge
 * counts fresh even while browsing Groups.
 */
export function MessengerShell({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const isGroupsSection = pathname.startsWith("/messenger/groups")

	const params = useParams<{ uuid?: string; id?: string }>()
	const activeUuid = (!isGroupsSection ? (params.uuid ?? null) : null) as Uuid | null
	const activeGroupId = isGroupsSection && params.id ? Number(params.id) : null
	const currentUserId = useAuthStore((s) => s.user?.id)

	const { typingUuids } = useChatSocket(activeUuid)
	useGroupRoomSubscription()
	useGroupSocket(activeGroupId, currentUserId)

	const isDetailOpen = isGroupsSection ? activeGroupId !== null : activeUuid !== null

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			<div className={cn(isDetailOpen ? "hidden sm:flex" : "flex", "min-h-0 shrink-0")}>
				{isGroupsSection ? (
					<GroupListPanel activeGroupId={activeGroupId} />
				) : (
					<ChatListPanel activeUuid={activeUuid} typingUuids={typingUuids} />
				)}
			</div>
			<div className="flex flex-1 min-h-0 min-w-0">{children}</div>
		</div>
	)
}
