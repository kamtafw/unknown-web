"use client"

import { useChatHistory } from "@/hooks/messenger/use-chat-history"
import { PendingAttachment, usePendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { useMessageActions } from "@/hooks/messenger/use-message-actions"
import { useMessageSearch } from "@/hooks/messenger/use-message-search"
import { usePeerProfile } from "@/hooks/messenger/use-peer-profile"
import { useSendMessage } from "@/hooks/messenger/use-send-message"
import { useTyping } from "@/hooks/messenger/use-typing"
import { useVoiceRecorder } from "@/hooks/messenger/use-voice-recorder"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { derivePeerFromMessages, getDisplayName } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListItem, Message, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MediaViewerProvider } from "../media/media-viewer-context"
import { Composer } from "./composer"
import { ContactComposerDialog } from "./contact-composer-dialog"
import { ConversationHeader } from "./conversation-header"
import { DeleteMessageDialog } from "./delete-message-dialog"
import { ForwardDialog } from "./forward-dialog"
import { MediaComposerDialog } from "./media-composer-dialog"
import { MessageList, MessageListHandle } from "./message-list"
import { MessageSearchBar } from "./message-search-bar"
import { PinnedMessageBanner } from "./pinned-message-banner"
import { ReactionsDialog } from "./reactions-dialog"

interface ConversationViewProps {
	uuid: Uuid
	onOpenProfile: () => void
}

export function ConversationView({ uuid, onOpenProfile }: ConversationViewProps) {
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

	const { send, sendMedia, sendContact, sendLocation, sendVoice, retry } = useSendMessage(
		uuid,
		(derivedPkid ?? 0) as Pkid,
	)
	const {
		attachments,
		addFiles,
		retryUpload,
		removeAttachment,
		reset: resetAttachments,
		readyToSend,
	} = usePendingAttachment("chat")

	const { forward, pinMessage, unpinMessage, deleteMessage, reactToMessage } = useMessageActions(
		uuid,
		(derivedPkid ?? 0) as Pkid,
	)

	const voiceRecorder = useVoiceRecorder()

	const [contactDialogOpen, setContactDialogOpen] = useState(false)
	const [replyingTo, setReplyingTo] = useState<Message | null>(null)
	const [forwardTarget, setForwardTarget] = useState<Message | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
	const [reactionsDialogMessage, setReactionsDialogMessage] = useState<Message | null>(null)

	const messageListRef = useRef<MessageListHandle>(null)

	const pinnedMessages = useMemo(
		() => messages.filter((m) => m.is_pinned && !m.is_deleted_for_all && !m.is_hidden_by_me),
		[messages],
	)

	const search = useMessageSearch(messages, messageListRef)

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
		void send(content, replyingTo)
	}

	const handleSendMedia = (caption: string) => {
		const uploaded = attachments.filter((a) => a.uploadedUrl)
		if (uploaded.length === 0) return
		// Same fallback rule as mobile's resolveAttachmentCaption: a shared
		// caption applies to every item; non-media types default to their own
		// filename when no caption was typed.
		const resolveCaption = (a: PendingAttachment) =>
			caption ||
			(a.type === "document" || a.type === "pdf" || a.type === "audio" ? a.file.name : "")

		void sendMedia(
			uploaded.map((a) => ({
				url: a.uploadedUrl as string,
				type: a.type,
				fileName: a.file.name,
				caption: resolveCaption(a),
			})),
			{ replyingTo, metadata: { media_file_names: uploaded.map((a) => a.file.name) } },
		)
		resetAttachments()
	}

	const handleAttachLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Location isn't available in this browser")
			return
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => void sendLocation(pos.coords.latitude, pos.coords.longitude),
			() => toast.error("Couldn't get your location — check browser permissions"),
		)
	}

	const handleVoiceSend = async () => {
		const result = await voiceRecorder.send()
		if (!result) return
		try {
			const uploadedUrl = await chatApi.uploadMedia(result.file, "voice")
			void sendVoice(uploadedUrl, result.file.name, result.duration)
		} catch {
			toast.error("Couldn't send the voice message — try again")
		}
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

	const handleJumpToMessage = (message: Message) => {
		const jumped = messageListRef.current?.scrollToMessage(message.id)
		if (!jumped) {
			toast.info("That message is further back — scroll up to load more history, then try again.")
		}
	}

	const handleFetchAllReactors = useCallback(async () => {
		if (!reactionsDialogMessage) return []
		const reactions = await chatApi.listMessageReactions(reactionsDialogMessage.id)
		return reactions.map((r) => ({
			pkid: String(r.user.pkid),
			name: getDisplayName(r.user),
			avatarUrl: r.user.profile_photo,
			emoji: r.emoji,
		}))
	}, [reactionsDialogMessage])

	const handleRemoveOwnReaction = (emoji: string) => {
		const msg = reactionsDialogMessage
		setReactionsDialogMessage(null)
		if (msg) void reactToMessage(msg, emoji)
	}

	return (
		<MediaViewerProvider>
			<div className="flex-1 flex flex-col h-full min-w-0">
				{search.isOpen ? (
					<MessageSearchBar
						value={search.query}
						onChangeText={search.onQueryChange}
						onSubmit={search.onSubmit}
						onClose={search.close}
						onPrev={search.onPrev}
						onNext={search.onNext}
						resultCount={search.resultCount}
						activeIndex={search.activeIndex}
					/>
				) : (
					<ConversationHeader
						peer={peer}
						peerUuid={uuid}
						peerPkid={derivedPkid != null ? (derivedPkid as Pkid) : null}
						onOpenProfile={onOpenProfile}
						onOpenSearch={search.open}
					/>
				)}

				<PinnedMessageBanner
					pinnedMessages={pinnedMessages}
					onJumpToMessage={handleJumpToMessage}
					onUnpin={(m) => void unpinMessage(m)}
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
					onPin={(m) => void pinMessage(m)}
					onUnpin={(m) => void unpinMessage(m)}
					onDelete={setDeleteTarget}
					onReact={(m, emoji) => void reactToMessage(m, emoji)}
					onOpenReactionsDialog={setReactionsDialogMessage}
				/>
				<Composer
					onSend={handleSend}
					onTypingChange={emitTyping}
					replyingTo={replyingTo}
					voice={{
						phase: voiceRecorder.phase,
						durationSecs: voiceRecorder.durationSecs,
						metering: voiceRecorder.metering,
						isPlaying: voiceRecorder.isPlaying,
						onStart: voiceRecorder.start,
						onPause: voiceRecorder.pause,
						onResume: voiceRecorder.resume,
						onDiscard: voiceRecorder.discard,
						onSend: () => void handleVoiceSend(),
						onPlayPreview: voiceRecorder.playPreview,
						onStopPreview: voiceRecorder.stopPreview,
					}}
					onCancelReply={() => setReplyingTo(null)}
					onFilesPicked={addFiles}
					onAttachContact={() => setContactDialogOpen(true)}
					onAttachLocation={handleAttachLocation}
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
				<MediaComposerDialog
					attachments={attachments}
					onRemove={removeAttachment}
					onRetry={retryUpload}
					onCancel={resetAttachments}
					onSend={handleSendMedia}
					canSend={readyToSend}
				/>
				<ContactComposerDialog
					open={contactDialogOpen}
					onOpenChange={setContactDialogOpen}
					onSend={(contact) => void sendContact(contact)}
				/>

				<ReactionsDialog
					open={!!reactionsDialogMessage}
					onOpenChange={(open) => !open && setReactionsDialogMessage(null)}
					currentUserPkid={String(currentUser?.pkid ?? "")}
					fetchReactors={handleFetchAllReactors}
					onRemoveOwnReaction={handleRemoveOwnReaction}
				/>
			</div>
		</MediaViewerProvider>
	)
}
