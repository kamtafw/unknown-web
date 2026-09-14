"use client"

import { useChatSocket } from "@/hooks/messenger/use-chat-socket"
import { useGroupMembersSocket } from "@/hooks/messenger/use-group-members-socket"
import { useGroupMessageSocket } from "@/hooks/messenger/use-group-message-socket"
import { useGroupMetadataSocket } from "@/hooks/messenger/use-group-metadata-socket"
import { useGroupRoomSubscription } from "@/hooks/messenger/use-group-rooms"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { Uuid } from "@/types/messenger"
import { useParams, usePathname } from "next/navigation"
import { ReactNode } from "react"
import { ArchiveListPanel } from "./chat-list/archive-list-panel"
import { ChatListPanel } from "./chat-list/chat-list-panel"
import { GroupListPanel } from "./group-list/group-list-panel"
import { SchedulePanel } from "./schedule/schedule-panel"
import { StatusListPanel } from "./status/status-list-panel"

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
	const isStatusSection = pathname.startsWith("/messenger/status")
	const isArchiveSection = pathname.startsWith("/messenger/archive")
	const isScheduleSection = pathname.startsWith("/messenger/schedule")

	const params = useParams<{ uuid?: string; id?: string; userId?: string }>()
	const activeUuid = (
		!isGroupsSection && !isStatusSection && !isArchiveSection && !isScheduleSection
			? (params.uuid ?? null)
			: null
	) as Uuid | null
	const activeGroupId = isGroupsSection && params.id ? Number(params.id) : null
	const activeStatusEntryId = isStatusSection ? (params.userId ?? null) : null
	const currentUserId = useAuthStore((s) => s.user?.id)

	const { typingUuids } = useChatSocket(activeUuid)
	useGroupRoomSubscription()
	useGroupMessageSocket(activeGroupId, currentUserId)
	useGroupMembersSocket()
	useGroupMetadataSocket()

	const isDetailOpen = isGroupsSection
		? activeGroupId !== null
		: isStatusSection
			? activeStatusEntryId !== null
			: isArchiveSection || isScheduleSection
				? false
				: activeUuid !== null

	return (
		<div className="flex flex-1 min-h-0 overflow-hidden">
			<div className={cn(isDetailOpen ? "hidden sm:flex" : "flex", "min-h-0 shrink-0")}>
				{isGroupsSection ? (
					<GroupListPanel activeGroupId={activeGroupId} />
				) : isStatusSection ? (
					<StatusListPanel activeEntryId={activeStatusEntryId} />
				) : isArchiveSection ? (
					<ArchiveListPanel />
				) : isScheduleSection ? (
					<SchedulePanel />
				) : (
					<ChatListPanel activeUuid={activeUuid} typingUuids={typingUuids} />
				)}
			</div>
			<div className="flex flex-1 min-h-0 min-w-0">{children}</div>
		</div>
	)
}
