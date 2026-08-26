"use client"

import { MessageList } from "@/components/messenger/conversation/message-list"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { useGroupHistory } from "@/hooks/messenger/use-group-history"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import { GroupConversationHeader } from "./group-conversation-header"

interface GroupConversationViewProps {
	groupId: number
}

const notReady = () => toast.info("Coming in a later milestone")

/**
 * Read-only for this M3 slice: history rendering only, reusing M1/M2's
 * MessageList/MessageBubble unchanged (via groupMessageToMessage — see
 * hooks/messenger/use-group-history.ts). Sending, the permission-aware
 * composer, pin/forward/delete, and the socket live-update path are the
 * next M3 slice — deliberately not wired here, per the M3 sequencing
 * decision (types/read-path first).
 */
export function GroupConversationView({ groupId }: GroupConversationViewProps) {
	const currentUser = useAuthStore((s) => s.user)
	const { data: group } = useGroupDetail(groupId)
	const { messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useGroupHistory(groupId)

	return (
		<div className="flex-1 flex flex-col h-full min-w-0">
			<GroupConversationHeader group={group ?? null} />
			<MessageList
				messages={messages}
				currentUserUuid={currentUser?.id ?? ""}
				isLoading={isLoading}
				hasOlder={!!hasNextPage}
				isFetchingOlder={isFetchingNextPage}
				onLoadOlder={() => fetchNextPage()}
				remoteTyping={false}
				onRetry={notReady}
				onReply={notReady}
				onForward={notReady}
				onPin={notReady}
				onUnpin={notReady}
				onDelete={notReady}
			/>
			<div className="flex items-center justify-center px-4 py-3 border-t border-border bg-muted/30 shrink-0 text-sm text-muted-foreground">
				Sending is coming in a later milestone
			</div>
		</div>
	)
}
