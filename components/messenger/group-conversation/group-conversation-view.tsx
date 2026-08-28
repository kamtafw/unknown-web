"use client"

import { MessageList, MessageListHandle } from "@/components/messenger/conversation/message-list"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { messageToGroupMessage, useGroupHistory } from "@/hooks/messenger/use-group-history"
import { useGroupMessageActions } from "@/hooks/messenger/use-group-message-actions"
import { useActiveGroupRoom } from "@/hooks/messenger/use-group-rooms"
import { useGroupTyping } from "@/hooks/messenger/use-group-typing"
import { useSendGroupMessage } from "@/hooks/messenger/use-send-group-message"
import { MessageDeleteType } from "@/lib/messenger/api"
import { groupApi } from "@/lib/messenger/group-api"
import { deriveGroupComposerState } from "@/lib/messenger/group-permissions"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupListData, Message, Pkid, Uuid } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useRef, useState } from "react"
import { Composer } from "../conversation/composer"
import { DeleteMessageDialog } from "../conversation/delete-message-dialog"
import { ForwardDialog } from "../conversation/forward-dialog"
import { PinnedMessageBanner } from "../conversation/pinned-message-banner"
import { GroupConversationHeader } from "./group-conversation-header"

interface GroupConversationViewProps {
	groupId: number
}

/**
 * Send/typing/delete/permission-aware composer were wired in the prior
 * slice. Forward/pin/unpin wired this slice — see
 * use-group-message-actions.ts for why no new HTTP surface was needed.
 * Pinned messages are derived from loaded history (not the dedicated
 * pinned endpoint) to stay consistent with the DM screen's confirmed
 * working pattern — the dedicated endpoint's behavior for chat_type=group
 * hasn't been independently verified on web yet, so this avoids resting
 * a real screen on an unverified contract for no benefit.
 * Replies-as-threads (separate screen) and reactions (no confirmed HTTP
 * contract yet) remain out of scope.
 */
export function GroupConversationView({ groupId }: GroupConversationViewProps) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const { data: group } = useGroupDetail(groupId)
	const { messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useGroupHistory(groupId)
	const { remoteTyping, emitTyping } = useGroupTyping(groupId)
	const { send, retry } = useSendGroupMessage(groupId)
	const { deleteMessage, pinMessage, unpinMessage, forwardMessage } =
		useGroupMessageActions(groupId)
	useActiveGroupRoom(groupId)

	const [replyingTo, setReplyingTo] = useState<Message | null>(null)
	const [forwardTarget, setForwardTarget] = useState<Message | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)

	const messageListRef = useRef<MessageListHandle>(null)
	const pinnedMessages = useMemo(() => messages.filter((m) => m.is_pinned), [messages])

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

	const handleForwardConfirm = (
		targets: { type: "user" | "group"; id: number }[],
		targetUuids: Uuid[],
	) => {
		if (!forwardTarget) return
		void forwardMessage(messageToGroupMessage(forwardTarget, groupId), targets, targetUuids)
	}

	const handleDeleteConfirm = (deleteType: MessageDeleteType) => {
		if (!deleteTarget) return
		void deleteMessage(messageToGroupMessage(deleteTarget, groupId), deleteType)
	}

	const handleJumpToMessage = (message: Message) => {
		const jumped = messageListRef.current?.scrollToMessage(message.id)
		if (!jumped) {
			toast.info("That message is further back — scroll up to load more history, then try again.")
		}
	}

	return (
		<div className="flex-1 flex flex-col h-full min-w-0">
			<GroupConversationHeader group={group ?? null} />
			<PinnedMessageBanner
				pinnedMessages={pinnedMessages}
				onJumpToMessage={handleJumpToMessage}
				onUnpin={(m) => void unpinMessage(messageToGroupMessage(m, groupId))}
			/>
			<MessageList
				ref={messageListRef}
				messages={messages}
				currentUserUuid={currentUser?.id ?? ""}
				isLoading={isLoading}
				hasOlder={!!hasNextPage}
				isFetchingOlder={isFetchingNextPage}
				onLoadOlder={() => fetchNextPage()}
				remoteTyping={remoteTyping}
				onRetry={handleRetry}
				onReply={setReplyingTo}
				onForward={setForwardTarget}
				onPin={(m) => void pinMessage(messageToGroupMessage(m, groupId))}
				onUnpin={(m) => void unpinMessage(messageToGroupMessage(m, groupId))}
				onDelete={setDeleteTarget}
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

			<ForwardDialog
				open={!!forwardTarget}
				onOpenChange={(open) => !open && setForwardTarget(null)}
				message={forwardTarget}
				onForward={handleForwardConfirm}
			/>
			<DeleteMessageDialog
				open={!!deleteTarget}
				onOpenChange={(open) => !open && setDeleteTarget(null)}
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	)
}
