"use client"

import { useGroupThreadReplies, useSendGroupThreadReply } from "@/hooks/messenger/use-group-thread"
import { PendingAttachment, usePendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { useVoiceRecorder } from "@/hooks/messenger/use-voice-recorder"
import { chatApi } from "@/lib/messenger/api"
import { deriveGroupComposerState } from "@/lib/messenger/group-permissions"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { Group, Message, Pkid } from "@/types/messenger"
import { AlertCircle, Loader2, X } from "lucide-react"
import { useState } from "react"
import { Composer } from "../conversation/composer"
import { ContactComposerDialog } from "../conversation/contact-composer-dialog"
import { MediaComposerDialog } from "../conversation/media-composer-dialog"
import { MessageBubble } from "../conversation/message-bubble"

interface ThreadPanelProps {
	groupId: number
	group: Group | null
	parentMessage: Message
	onClose: () => void
}

/**
 * Right-hand panel rendered by GroupConversationWorkspace, sibling to the
 * main conversation column — the main timeline stays visible/scrollable
 * while this is open. On narrow viewports the same component becomes a
 * full-width sheet (see the workspace's responsive wrapper).
 *
 * Deliberately does NOT reuse <MessageList/> for the reply list: that
 * component owns pagination (intersection-observer "load older"),
 * date-separator grouping, and an imperative scroll-to-highlight API, all
 * of which are main-conversation concerns this flat, un-paginated thread
 * doesn't have. What IS reused is the actual reusable primitive —
 * <MessageBubble/> — for both the parent and every reply, so rendering
 * (avatars, media, deleted/optimistic/failed states, timestamps) stays
 * identical to the main timeline's without a second implementation.
 *
 * Interactivity is intentionally narrower than the main timeline for
 * this first pass: only retry-on-failure is wired. Reply/forward/pin/
 * delete/react from *within* a thread are deferred, not silently
 * dropped — see the project's reply_to refactor report for why.
 */
export function ThreadPanel({ groupId, group, parentMessage, onClose }: ThreadPanelProps) {
	const currentUser = useAuthStore((s) => s.user)
	const { messages, isLoading, isError, refetch } = useGroupThreadReplies(
		groupId,
		parentMessage.id,
		"asc",
	)
	const { send, sendMedia, sendContact, sendLocation, sendVoice, retry } = useSendGroupThreadReply(
		groupId,
		parentMessage,
	)
	const {
		attachments,
		addFiles,
		retryUpload,
		removeAttachment,
		reset: resetAttachments,
		readyToSend,
	} = usePendingAttachment("chat")
	const voiceRecorder = useVoiceRecorder()
	const [contactDialogOpen, setContactDialogOpen] = useState(false)

	const composerState =
		group && currentUser ? deriveGroupComposerState(group, currentUser.pkid as Pkid) : null

	const handleSend = (content: string) => void send(content)

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
			{ metadata: { media_file_names: uploaded.map((a) => a.file.name) } },
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

	const currentUserUuid = currentUser?.id ?? ""

	return (
		<aside className="flex h-full w-full min-w-0 flex-col border-l bg-background sm:w-100">
			<div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
				<h2 className="text-base font-medium">Thread</h2>
				<button
					type="button"
					onClick={onClose}
					aria-label="Close thread"
					className="ml-auto rounded-full p-2 transition-colors hover:bg-accent"
				>
					<X size={20} strokeWidth={2} />
				</button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
				<MessageBubble
					message={parentMessage}
					isOwn={parentMessage.sender.id === currentUserUuid}
					showSender
					sameSenderAsPrevious={false}
				/>

				<div className="my-3 flex items-center gap-2 px-1">
					<div className="h-px flex-1 bg-border" />
					<span className="text-xs font-medium text-muted-foreground">
						{messages.length > 0
							? `${messages.length} ${messages.length === 1 ? "reply" : "replies"}`
							: "Replies"}
					</span>
					<div className="h-px flex-1 bg-border" />
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 size={20} className="animate-spin text-muted-foreground" />
					</div>
				) : isError ? (
					<div className="flex flex-col items-center gap-2 py-8 text-center">
						<AlertCircle size={20} className="text-destructive" />
						<p className="text-sm text-muted-foreground">Couldn&apos;t load replies.</p>
						<button
							onClick={() => refetch()}
							className="text-sm font-medium text-primary hover:underline"
						>
							Try again
						</button>
					</div>
				) : messages.length === 0 ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						No replies yet — be the first to reply.
					</p>
				) : (
					<div>
						{messages.map((message, index) => {
							const previous = messages[index - 1]
							const sameSenderAsPrevious = Boolean(
								previous && previous.sender.id === message.sender.id,
							)
							return (
								<MessageBubble
									key={message.id}
									message={message}
									isOwn={message.sender.id === currentUserUuid}
									showSender={!sameSenderAsPrevious}
									sameSenderAsPrevious={sameSenderAsPrevious}
									onRetry={retry}
								/>
							)
						})}
					</div>
				)}
			</div>

			{composerState?.canSend === false ? (
				<div className="flex items-center justify-center px-4 py-3 border-t border-border bg-muted/30 shrink-0 text-sm text-muted-foreground">
					{composerState.reason === "paused"
						? "This group is paused — no one can send messages right now"
						: "Only admins can send messages in this group"}
				</div>
			) : (
				<Composer
					onSend={handleSend}
					// No thread-scoped typing indicator exists yet — there's no
					// confirmed socket event for it (see the "what NOT to
					// implement yet" note on this refactor), so this is a
					// deliberate no-op rather than reusing the main
					// conversation's group-wide typing emitter, which would
					// misleadingly show "typing" for the whole group while
					// someone is only drafting a thread reply.
					onTypingChange={() => undefined}
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
					onFilesPicked={addFiles}
					onAttachContact={() => setContactDialogOpen(true)}
					onAttachLocation={handleAttachLocation}
				/>
			)}

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
		</aside>
	)
}
