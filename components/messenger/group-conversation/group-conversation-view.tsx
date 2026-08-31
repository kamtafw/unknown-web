"use client"

import { MessageList, MessageListHandle } from "@/components/messenger/conversation/message-list"
import { useGroupDetail } from "@/hooks/messenger/use-group-detail"
import { messageToGroupMessage, useGroupHistory } from "@/hooks/messenger/use-group-history"
import { useGroupMembers } from "@/hooks/messenger/use-group-members"
import { useGroupMessageActions } from "@/hooks/messenger/use-group-message-actions"
import { useActiveGroupRoom } from "@/hooks/messenger/use-group-rooms"
import { useGroupTyping } from "@/hooks/messenger/use-group-typing"
import { PendingAttachment, usePendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { useMessageSearch } from "@/hooks/messenger/use-message-search"
import { useVotePoll } from "@/hooks/messenger/use-poll-actions"
import { useSendGroupMessage } from "@/hooks/messenger/use-send-group-message"
import { useVoiceRecorder } from "@/hooks/messenger/use-voice-recorder"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { groupApi } from "@/lib/messenger/group-api"
import { deriveGroupComposerState } from "@/lib/messenger/group-permissions"
import { groupKeys } from "@/lib/messenger/query-keys"
import { getDisplayName } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupListData, Message, Pkid, Uuid } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Composer } from "../conversation/composer"
import { ContactComposerDialog } from "../conversation/contact-composer-dialog"
import { DeleteMessageDialog } from "../conversation/delete-message-dialog"
import { ForwardDialog } from "../conversation/forward-dialog"
import { MediaComposerDialog } from "../conversation/media-composer-dialog"
import { MessageSearchBar } from "../conversation/message-search-bar"
import { PinnedMessageBanner } from "../conversation/pinned-message-banner"
import { PollResultsDialog } from "../conversation/poll-results-dialog"
import { ReactionsDialog } from "../conversation/reactions-dialog"
import { ScheduleComposeDialog } from "../schedule/schedule-compose-dialog"
import { CreatePollDialog } from "./create-poll-dialog"
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
	const { send, sendMedia, sendContact, sendLocation, sendVoice, retry } =
		useSendGroupMessage(groupId)
	const {
		attachments,
		addFiles,
		retryUpload,
		removeAttachment,
		reset: resetAttachments,
		readyToSend,
	} = usePendingAttachment("chat")
	const { deleteMessage, pinMessage, unpinMessage, forwardMessage, reactToMessage } =
		useGroupMessageActions(groupId)
	useActiveGroupRoom(groupId)
	const { members } = useGroupMembers(groupId)
	const vote = useVotePoll()
	const voiceRecorder = useVoiceRecorder()

	const [replyingTo, setReplyingTo] = useState<Message | null>(null)
	const [forwardTarget, setForwardTarget] = useState<Message | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
	const [createPollOpen, setCreatePollOpen] = useState(false)
	const [pollResultsMessageId, setPollResultsMessageId] = useState<number | null>(null)
	const [contactDialogOpen, setContactDialogOpen] = useState(false)
	const [reactionsDialogMessage, setReactionsDialogMessage] = useState<Message | null>(null)

	const [scheduleOpen, setScheduleOpen] = useState(false)
	const scheduleRecipients = group
		? [{ type: "group" as const, id: groupId, name: group.name, photo: group.icon_url || null }]
		: []

	const messageListRef = useRef<MessageListHandle>(null)
	const pinnedMessages = useMemo(() => messages.filter((m) => m.is_pinned), [messages])

	const search = useMessageSearch(messages, messageListRef)

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
		void send(content, replyingTo)
		setReplyingTo(null)
	}

	const handleSendMedia = (caption: string) => {
		const uploaded = attachments.filter((a) => a.uploadedUrl)
		if (uploaded.length === 0) return

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
		setReplyingTo(null)
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

	const handleFetchAllReactors = useCallback(async () => {
		if (!reactionsDialogMessage) return []
		const counts = reactionsDialogMessage.emoji_reaction_counts ?? []
		const entries: { pkid: string; name: string; avatarUrl?: string | null; emoji: string }[] = []
		for (const c of counts) {
			for (const pkid of c.actor_ids ?? []) {
				const member = members.find((m) => String(m.pkid) === pkid)
				entries.push({
					pkid,
					name: member ? getDisplayName(member) : `User #${pkid}`,
					avatarUrl: member?.profile_photo ?? null,
					emoji: c.emoji,
				})
			}
		}
		return entries
	}, [reactionsDialogMessage, members])

	const handleRemoveOwnReaction = (emoji: string) => {
		const msg = reactionsDialogMessage
		setReactionsDialogMessage(null)
		if (msg) void reactToMessage(messageToGroupMessage(msg, groupId), emoji)
	}

	const handleVote = (message: Message, optionIds: number[]) => {
		void vote(message.id, optionIds).then((ok) => {
			if (ok) queryClient.invalidateQueries({ queryKey: groupKeys.history(groupId) })
		})
	}

	return (
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
				<GroupConversationHeader group={group ?? null} onOpenSearch={search.open} />
			)}

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
				onReact={(m, emoji) => void reactToMessage(messageToGroupMessage(m, groupId), emoji)}
				onOpenReactionsDialog={setReactionsDialogMessage}
				onVote={handleVote}
				onViewPollResults={(m) => setPollResultsMessageId(m.id)}
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
					onCreatePoll={() => setCreatePollOpen(true)}
					onFilesPicked={addFiles}
					onAttachContact={() => setContactDialogOpen(true)}
					onAttachLocation={handleAttachLocation}
					onSchedule={() => setScheduleOpen(true)}
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
			<CreatePollDialog groupId={groupId} open={createPollOpen} onOpenChange={setCreatePollOpen} />
			<PollResultsDialog
				messageId={pollResultsMessageId}
				onOpenChange={() => setPollResultsMessageId(null)}
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
			<ScheduleComposeDialog
				open={scheduleOpen}
				onOpenChange={setScheduleOpen}
				recipients={scheduleRecipients}
			/>
			<ReactionsDialog
				open={!!reactionsDialogMessage}
				onOpenChange={(open) => !open && setReactionsDialogMessage(null)}
				currentUserPkid={String(currentUser?.pkid ?? "")}
				fetchReactors={handleFetchAllReactors}
				onRemoveOwnReaction={handleRemoveOwnReaction}
			/>
		</div>
	)
}
