"use client"

import { MediaGallery } from "@/components/messenger/media/media-gallery"
import { isOptimisticMessage } from "@/lib/messenger/optimistic"
import { resolvePoll } from "@/lib/messenger/poll"
import { resolveMessagePreviewText } from "@/lib/messenger/preview"
import { getInitials } from "@/lib/messenger/user-display"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/messenger"
import {
	AlertCircle,
	BarChart3,
	Check,
	CheckCheck,
	Clock,
	Forward,
	Image as ImageIcon,
	MapPin,
	Mic,
	Phone,
	Share2,
	User,
} from "lucide-react"
import { forwardRef } from "react"
import { MessageActionMenu } from "./message-action-menu"
import { PollBubble } from "./poll-bubble"
import { ReactionPicker } from "./reaction-picker"
import { ReactionsRow } from "./reaction-row"
import { VoiceMessagePlayer } from "./voice-message-player"

interface MessageBubbleProps {
	message: Message
	isOwn: boolean
	showSender: boolean
	repliedMessage?: Message
	isHighlighted?: boolean
	sameSenderAsPrevious?: boolean
	resolveReplySenderName?: (senderId: string) => string
	onRetry?: (message: Message) => void
	onReply?: (message: Message) => void
	onForward?: (message: Message) => void
	onPin?: (message: Message) => void
	onUnpin?: (message: Message) => void
	onDelete?: (message: Message) => void
	onReact?: (message: Message, emoji: string) => void
	onOpenReactionsDialog?: (message: Message) => void
	onVote?: (message: Message, optionId: number) => void
	onViewPollResults?: (message: Message) => void
}

function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function StatusTick({ status }: { status: Message["status"] }) {
	switch (status) {
		case "queued":
		case "sending":
			return <Clock size={12} className="text-muted-foreground" />
		case "failed":
			return <AlertCircle size={12} className="text-destructive" />
		case "sent":
			return <Check size={12} className="text-muted-foreground" />
		case "delivered":
			return <CheckCheck size={12} className="text-muted-foreground" />
		case "read":
		case "seen":
			return <CheckCheck size={12} className="text-primary" />
		default:
			return null
	}
}

function FallbackContent({ icon: Icon, label }: { icon: typeof ImageIcon; label: string }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<Icon size={16} className="shrink-0 opacity-70" />
			<span className="truncate">{label}</span>
		</div>
	)
}

function LocationContent({ message }: { message: Message }) {
	const meta = message.metadata as { latitude?: number; longitude?: number } | null
	if (meta?.latitude == null || meta?.longitude == null)
		return <FallbackContent icon={MapPin} label="Location" />
	return (
		<a
			href={`https://www.google.com/maps?q=${meta.latitude},${meta.longitude}`}
			target="_blank"
			rel="noreferrer"
			className="flex items-center gap-2 text-sm text-primary hover:underline"
		>
			<MapPin size={16} className="shrink-0" /> View location
		</a>
	)
}

function ContactContent({ message }: { message: Message }) {
	const meta = message.metadata as { name?: string; phone_number?: string | null } | null
	const name = meta?.name || message.content || "Contact"
	return (
		<div className="flex items-center gap-2 text-sm">
			<User size={16} className="shrink-0 opacity-70" />
			<div className="min-w-0">
				<p className="font-medium truncate">{name}</p>
				{meta?.phone_number && (
					<p className="text-xs text-muted-foreground truncate">{meta.phone_number}</p>
				)}
			</div>
		</div>
	)
}

function MessageContent({
	message,
	isOwn,
	onVote,
	onViewPollResults,
}: {
	message: Message
	isOwn: boolean
	onVote?: (message: Message, optionId: number) => void
	onViewPollResults?: (message: Message) => void
}) {
	if (message.is_hidden_by_me) return null
	if (message.is_deleted_for_all)
		return <p className="text-sm italic opacity-60">This message was deleted</p>

	const senderName = message.sender.first_name ?? message.sender.username
	const senderInitials = getInitials(message.sender.first_name, message.sender.last_name)
	const senderAvatarUrl = message.sender.profile_photo

	if (message.message_type === "media") {
		return message.media && message.media.length > 0 ? (
			<MediaGallery
				media={message.media}
				isOwn={isOwn}
				senderName={senderName}
				senderInitials={senderInitials}
				senderAvatarUrl={senderAvatarUrl}
			/>
		) : (
			<FallbackContent icon={ImageIcon} label={message.content || "Media"} />
		)
	}

	switch (message.message_type) {
		case "text":
			return <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.content}</p>

		case "voice": {
			const attachment = message.media?.[0]
			return attachment?.url ? (
				<VoiceMessagePlayer
					url={attachment.url}
					title="Voice message"
					isOwn={isOwn}
					senderName={senderName}
					senderInitials={senderInitials}
					senderAvatarUrl={senderAvatarUrl}
				/>
			) : (
				<FallbackContent icon={Mic} label="Voice message" />
			)
		}

		case "location":
			return <LocationContent message={message} />
		case "contact":
			return <ContactContent message={message} />

		case "poll":
			return resolvePoll(message) ? (
				<PollBubble
					message={message}
					onVote={onVote ? (optionId) => onVote(message, optionId) : undefined}
					onViewResults={onViewPollResults ? () => onViewPollResults(message) : undefined}
				/>
			) : (
				<FallbackContent icon={BarChart3} label={message.content || "Poll"} />
			)

		case "call":
			return <FallbackContent icon={Phone} label={message.content || "Call"} />
		case "share":
			return <FallbackContent icon={Share2} label="Shared post" />
		default:
			return <p className="text-sm italic opacity-70">Unsupported message</p>
	}
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble(
	{
		message,
		isOwn,
		showSender,
		repliedMessage,
		isHighlighted,
		sameSenderAsPrevious,
		resolveReplySenderName,
		onRetry,
		onReply,
		onForward,
		onPin,
		onUnpin,
		onDelete,
		onReact,
		onOpenReactionsDialog,
		onVote,
		onViewPollResults,
	},
	ref,
) {
	const forwarded = Boolean(message.forwarded_from)
	const failed = message.status === "failed"
	const deleted = message.is_deleted_for_all || message.is_hidden_by_me
	const pending = isOptimisticMessage(message) && !failed
	const showActions = !pending && !deleted && onReply && onForward && onPin && onUnpin && onDelete
	const isFirstInGroup = !sameSenderAsPrevious

	if (message.is_hidden_by_me) return null

	const replySenderLabel = message.reply_to
		? repliedMessage
			? (repliedMessage.sender.first_name ?? repliedMessage.sender.username)
			: (resolveReplySenderName?.(message.reply_to.sender_id) ?? "Unknown")
		: null
	const replyContentLabel = message.reply_to
		? resolveMessagePreviewText(repliedMessage ?? message.reply_to)
		: null

	return (
		<div
			ref={ref}
			className={cn(
				"group flex w-full",
				isOwn ? "justify-end" : "justify-start",
				isHighlighted && "rounded-xl bg-primary/5 -mx-1 px-1 py-1",
				sameSenderAsPrevious ? "mb-1" : "mb-3",
			)}
		>
			<div
				className="min-w-0 flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]"
				style={{ alignItems: isOwn ? "flex-end" : "flex-start" }}
			>
				<div className="relative min-w-0">
					{showActions && (
						<div
							className={cn(
								"absolute top-1/2 z-20 -translate-y-1/2 flex items-center gap-0.5",
								"opacity-0 transition-opacity group-hover:opacity-100",
								isOwn ? "-left-16" : "-right-16",
							)}
						>
							<MessageActionMenu
								message={message}
								isOwn={isOwn}
								align={isOwn ? "end" : "start"}
								onReply={() => onReply?.(message)}
								onForward={() => onForward?.(message)}
								onPin={() => onPin?.(message)}
								onUnpin={() => onUnpin?.(message)}
								onDelete={() => onDelete?.(message)}
							/>
							{onReact && <ReactionPicker onReact={(emoji) => onReact(message, emoji)} />}
						</div>
					)}

					<div
						className={cn(
							"rounded-2xl px-3.5 py-2.5 shadow-sm min-w-0",
							isOwn ? "bg-primary/12" : "bg-card border border-border/60",
							// Subtle tipped corner on the outer edge — only the first
							// bubble in a consecutive run from the same sender, matching
							// WhatsApp/Messenger convention. Not applied to every bubble.
							isFirstInGroup && (isOwn ? "rounded-tr-md" : "rounded-tl-md"),
							pending && "opacity-60",
							failed && "border border-destructive",
						)}
					>
						{showSender && !isOwn && (
							<p className="mb-1 text-[12px] font-semibold leading-4 text-primary">
								{message.sender.first_name ?? message.sender.username}
							</p>
						)}

						{forwarded && !deleted && (
							<div className="mb-1.5 flex items-center gap-1 text-[11px] italic text-muted-foreground">
								<Forward className="size-3" />
								<span>Forwarded</span>
							</div>
						)}

						{message.reply_to && !deleted && (
							<div
								className={cn(
									"mb-2 rounded-lg border-l-4 px-2.5 py-1.5 shadow-sm",
									isOwn ? "bg-background/50 border-primary" : "bg-muted border-primary/70",
								)}
							>
								<p className="mb-0.5 text-[11px] font-semibold text-primary">{replySenderLabel}</p>
								<p className="truncate text-xs text-foreground/70">{replyContentLabel}</p>
							</div>
						)}

						<MessageContent
							message={message}
							isOwn={isOwn}
							onVote={onVote}
							onViewPollResults={onViewPollResults}
						/>

						{onOpenReactionsDialog && (
							<ReactionsRow
								reactions={message.emoji_reaction_counts}
								isOwn={isOwn}
								onOpenDialog={() => onOpenReactionsDialog(message)}
							/>
						)}
					</div>
				</div>

				<div className="mt-1 flex items-center gap-1 px-1 select-none">
					<span className="text-[10px] leading-3 text-muted-foreground">
						{formatTime(message.created_at)}
					</span>
					{isOwn && <StatusTick status={message.status} />}
					{message.is_pinned && (
						<>
							<span className="text-[10px] text-muted-foreground">·</span>
							<span className="text-[10px] text-muted-foreground">Pinned</span>
						</>
					)}
					{failed && onRetry && (
						<button
							type="button"
							onClick={() => onRetry(message)}
							className="ml-1 text-[10px] font-medium text-destructive hover:underline"
						>
							Retry
						</button>
					)}
				</div>
			</div>
		</div>
	)
})
