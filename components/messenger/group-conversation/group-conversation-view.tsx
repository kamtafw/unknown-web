"use client"

import { MessageList } from "@/components/messenger/conversation/message-list"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { messageToGroupMessage, useGroupHistory } from "@/hooks/messenger/use-group-history"
import { useGroupMessageActions } from "@/hooks/messenger/use-group-message-actions"
import { useActiveGroupRoom } from "@/hooks/messenger/use-group-rooms"
import { useGroupTyping } from "@/hooks/messenger/use-group-typing"
import { useSendGroupMessage } from "@/hooks/messenger/use-send-group-message"
import { groupApi } from "@/lib/messenger/group-api"
import { deriveGroupComposerState } from "@/lib/messenger/group-permissions"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupListData, Message, Pkid } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Composer } from "../conversation/composer"
import { GroupConversationHeader } from "./group-conversation-header"

interface GroupConversationViewProps {
	groupId: number
}

const notReady = () => toast.info("Coming in a later milestone")

/**
 * Sending, typing, delete, and the permission-aware composer are wired
 * this slice. Forward/pin remain toast-stubs — see
 * use-group-message-actions.ts. Replies-as-threads (a separate screen,
 * not this inline composer) are still a later slice.
 */
export function GroupConversationView({ groupId }: GroupConversationViewProps) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const { data: group } = useGroupDetail(groupId)
	const { messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useGroupHistory(groupId)
	const { remoteTyping, emitTyping } = useGroupTyping(groupId)
	const { send, retry } = useSendGroupMessage(groupId)
	const { deleteMessage } = useGroupMessageActions(groupId)
	useActiveGroupRoom(groupId)

	const [replyingTo, setReplyingTo] = useState<Message | null>(null)

	const composerState =
		group && currentUser ? deriveGroupComposerState(group, currentUser.pkid as Pkid) : null

	useEffect(() => {
		if (document.visibilityState !== "visible") return
		void groupApi.markSeen(groupId).catch(() => undefined)

		queryClient.setQueriesData<InfiniteData<GroupListData>>(
			{ queryKey: groupKeys.lists() },
			(old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						groups: page.groups.map((g) => (g.id === groupId ? { ...g, unread_count: 0 } : g)),
					})),
				}
			},
		)
	}, [groupId, queryClient])

	const handleSend = (content: string) => {
		void send(content, replyingTo?.id)
		setReplyingTo(null)
	}

	const handleRetry = (message: Message) => {
		void retry(messageToGroupMessage(message, groupId))
	}

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
				remoteTyping={remoteTyping}
				onRetry={handleRetry}
				onReply={setReplyingTo}
				onForward={notReady}
				onPin={notReady}
				onUnpin={notReady}
				onDelete={(m) => void deleteMessage(messageToGroupMessage(m, groupId), "self")}
			/>
			{composerState?.canSend === false ? (
				<div className="flex items-center justify-center px-4 py-3 border-t border-border bg-muted/30 shrink-0 text-sm text-muted-foreground">
					{composerState.reason === "paused"
						? "This group is paused — no one can send messages right now"
						: "Only admins can send messages in this group"}
				</div>
			) : (
				<Composer
					onSend={handleSend}
					onTypingChange={emitTyping}
					replyingTo={replyingTo}
					onCancelReply={() => setReplyingTo(null)}
				/>
			)}
		</div>
	)
}
