"use client"

import { useChatHistory } from "@/hooks/messenger/use-chat-history"
import { useMessageActions } from "@/hooks/messenger/use-message-actions"
import { usePeerProfile } from "@/hooks/messenger/use-peer-profile"
import { useSendMessage } from "@/hooks/messenger/use-send-message"
import { useTyping } from "@/hooks/messenger/use-typing"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { derivePeerFromMessages } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListItem, Message, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Composer } from "./composer"
import { ConversationHeader } from "./conversation-header"
import { DeleteMessageDialog } from "./delete-message-dialog"
import { ForwardDialog } from "./forward-dialog"
import { MessageList } from "./message-list"
import { PinnedMessageBanner } from "./pinned-message-banner"

interface ConversationViewProps {
	uuid: Uuid
}

export function ConversationView({ uuid }: ConversationViewProps) {
	const currentUser = useAuthStore((s) => s.user)
	const queryClient = useQueryClient()
	const peer = usePeerProfile(uuid)
	const { messages, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
		useChatHistory(uuid)
	const { remoteTyping, emitTyping } = useTyping(uuid)

	// Fixes "peer data disappears on refresh": if the list/primed cache
	// doesn't have this peer (fresh page load), rebuild their display info
	// from message history, which we're fetching anyway. Once derived,
	// prime the peer cache so it's there instantly on the next visit this
	// session too — not just a one-off recovery.
	const derivedPeer = peer ?? derivePeerFromMessages(messages, uuid)
	useEffect(() => {
		if (!peer && derivedPeer) {
			queryClient.setQueryData(chatKeys.peer(uuid), derivedPeer)
		}
	}, [peer, derivedPeer, queryClient, uuid])

	// peer.pkid is the primary source, but if this conversation already has
	// history we can also recover the PKID from any message's sender/
	// receiver record — covers the one real gap in usePeerProfile (a
	// refreshed, brand-new, not-yet-listed conversation with no primed
	// cache) for any conversation that actually has messages.
	const derivedPkid =
		peer?.pkid ??
		messages.find((m) => m.sender.id === uuid)?.sender.pkid ??
		messages.find((m) => m.receiver?.id === uuid)?.receiver?.pkid ??
		null

	const { send, retry } = useSendMessage(uuid, (derivedPkid ?? 0) as Pkid)
	const { forward, pinMessage, unpinMessage, deleteMessage } = useMessageActions(
		uuid,
		(derivedPkid ?? 0) as Pkid,
	)

	const [replyingTo, setReplyingTo] = useState<Message | null>(null)
	const [forwardTarget, setForwardTarget] = useState<Message | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)

	useEffect(() => {
		if (document.visibilityState !== "visible") return
		void chatApi.markSeen(uuid).catch(() => undefined)

		// Optimistically zero this row's badge and reduce the TopBar total
		// by whatever it was — don't have to wait for a refetch to reflect it.
		let clearedAmount = 0
		queryClient.setQueriesData<{ users: ChatListItem[]; metadata: { next: string | null } }>(
			{ queryKey: chatKeys.lists() },
			(old) => {
				if (!old) return old
				return {
					...old,
					users: old.users.map((u) => {
						if (u.id !== uuid) return u
						clearedAmount = u.unread_count
						return { ...u, unread_count: 0 }
					}),
				}
			},
		)
		if (clearedAmount > 0) {
			queryClient.setQueryData<number>(chatKeys.unreadCount(), (old) =>
				Math.max(0, (old ?? 0) - clearedAmount),
			)
		}
	}, [uuid, queryClient])

	const handleSend = (content: string) => {
		if (!derivedPkid) {
			toast.error("Can't send yet — open this conversation from the chat list or search.")
			return
		}
		void send(content, replyingTo?.id)
	}

	const handleRetry = (message: Message) => {
		void retry(message)
	}

	const handleForwardConfirm = (targets: { type: "user"; id: number }[], targetUuids: Uuid[]) => {
		if (!forwardTarget) return
		void forward(forwardTarget, targets, targetUuids)
	}

	const handleDeleteConfirm = (deleteType: MessageDeleteType) => {
		if (!deleteTarget) return
		void deleteMessage(deleteTarget, deleteType)
	}

	return (
		<div className="flex-1 flex flex-col h-full min-w-0">
			<ConversationHeader peer={derivedPeer} />
			<PinnedMessageBanner chatType="user" peerPkid={derivedPkid as Pkid} peerUuid={uuid} />
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
				onForward={setForwardTarget}
				onPin={(m) => void pinMessage(m)}
				onUnpin={(m) => void unpinMessage(m)}
				onDelete={setDeleteTarget}
			/>
			<Composer
				onSend={handleSend}
				onTypingChange={emitTyping}
				replyingTo={replyingTo}
				onCancelReply={() => setReplyingTo(null)}
			/>

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
