"use client"

import { isOptimisticMessage } from "@/lib/messenger/optimistic"
import { resolvePoll } from "@/lib/messenger/poll"
import { cn } from "@/lib/utils"
import type { Message } from "@/types/messenger"
import {
	AlertCircle,
	BarChart3,
	Check,
	CheckCheck,
	Clock,
	FileText,
	Image as ImageIcon,
	MapPin,
	Mic,
	Phone,
	Share2,
	User,
	Video,
} from "lucide-react"
import Image from "next/image"
import { forwardRef } from "react"
import { MessageActionMenu } from "./message-action-menu"
import { PollBubble } from "./poll-bubble"
import { ReactionPicker } from "./reaction-picker"
import { ReactionsRow } from "./reaction-row"

interface MessageBubbleProps {
	message: Message
	isOwn: boolean
	showSender: boolean
	repliedMessage?: Message
	isHighlighted?: boolean
	onRetry?: (message: Message) => void
	onReply?: (message: Message) => void
	onForward?: (message: Message) => void
	onPin?: (message: Message) => void
	onUnpin?: (message: Message) => void
	onDelete?: (message: Message) => void
	onReact?: (message: Message, emoji: string) => void
	onViewReactors?: (message: Message, emoji: string) => Promise<string[]>
	onVote?: (message: Message, optionIds: number[]) => void
	onViewPollResults?: (message: Message) => void
}

function formatTime(iso: string): string {
	return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function StatusTick({ status }: { status: Message["status"] }) {
	switch (status) {
		case "queued":
		case "sending":
			return <Clock size={13} className="text-primary-foreground/70" />
		case "failed":
			return <AlertCircle size={13} className="text-destructive" />
		case "sent":
			return <Check size={13} className="text-primary-foreground/70" />
		case "delivered":
			return <CheckCheck size={13} className="text-primary-foreground/70" />
		case "read":
		case "seen":
			return <CheckCheck size={13} className="text-sky-300" />
		default:
			return null
	}
}

/**
 * Non-text types are rendered read-only — real history will contain them
 * regardless of whether M1 supports *sending* them (product decision 3).
 * Deliberately minimal (icon + label, or the real image) rather than
 * reimplementing mobile's full players/maps — that's a scope decision for
 * whichever milestone actually owns sending these types, not a gap here.
 */
function MessageContent({
	message,
	onVote,
	onViewPollResults,
}: {
	message: Message
	onVote?: (message: Message, optionIds: number[]) => void
	onViewPollResults?: (message: Message) => void
}) {
	if (message.deleted) {
		return <p className="text-sm italic opacity-60">This message was deleted</p>
	}

	// Generic "media" wraps image/video/audio/document — the real type
	// lives on the attachment, not message_type. Confirmed via mobile:
	// message_type is always "media" for anything sent through the
	// attachment picker, discriminated by `media[0].type`. Live voice
	// recordings stay their own top-level "voice" type.
	const attachment = message.media?.[0]
	const effectiveType =
		message.message_type === "media" && attachment ? attachment.type : message.message_type

	switch (effectiveType) {
		case "text":
			return <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.content}</p>

		case "image":
			return attachment?.url ? (
				<figure className="flex flex-col gap-1">
					<Image
						src={attachment.url}
						alt={attachment.caption || message.content || "Image"}
						width={280}
						height={280}
						className="rounded-lg max-w-70 max-h-70 object-cover"
					/>
					{attachment.caption && <figcaption className="text-sm">{attachment.caption}</figcaption>}
				</figure>
			) : (
				<FallbackContent icon={ImageIcon} label="Image" />
			)

		case "video":
			return attachment?.url ? (
				<figure className="flex flex-col gap-1">
					<video src={attachment.url} controls className="rounded-lg max-w-70 max-h-70" />
					{attachment.caption && <figcaption className="text-sm">{attachment.caption}</figcaption>}
				</figure>
			) : (
				<FallbackContent icon={Video} label={message.content || "Video"} />
			)

		case "audio":
		case "voice":
			return attachment?.url ? (
				<div className="flex flex-col gap-1">
					<audio src={attachment.url} controls className="max-w-70" />
					{attachment.caption && attachment.caption !== "Voice message" && (
						<p className="text-sm">{attachment.caption}</p>
					)}
				</div>
			) : (
				<FallbackContent icon={Mic} label="Voice message" />
			)

		case "pdf":
		case "document":
			return attachment?.url ? (
				<a
					href={attachment.url}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-2 text-sm underline"
				>
					<FileText size={16} className="shrink-0 opacity-70" />
					<span className="truncate">
						{attachment.caption || attachment.fileName || "Document"}
					</span>
				</a>
			) : (
				<FallbackContent icon={FileText} label={message.content || "Document"} />
			)

		case "location":
			return <LocationContent message={message} />
		case "contact":
			return <ContactContent message={message} />

		case "poll":
			return resolvePoll(message) ? (
				<PollBubble
					message={message}
					onVote={onVote ? (optionIds) => onVote(message, optionIds) : undefined}
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

function LocationContent({ message }: { message: Message }) {
	const meta = message.metadata as { latitude?: number; longitude?: number } | null
	if (meta?.latitude == null || meta?.longitude == null) {
		return <FallbackContent icon={MapPin} label="Location" />
	}
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

function FallbackContent({ icon: Icon, label }: { icon: typeof ImageIcon; label: string }) {
	return (
		<div className="flex items-center gap-2 text-sm">
			<Icon size={16} className="shrink-0 opacity-70" />
			<span className="truncate">{label}</span>
		</div>
	)
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(function MessageBubble(
	{
		message,
		isOwn,
		showSender,
		repliedMessage,
		isHighlighted,
		onRetry,
		onReply,
		onForward,
		onPin,
		onUnpin,
		onDelete,
		onReact,
		onViewReactors,
		onVote,
		onViewPollResults,
	},
	ref,
) {
	const failed = message.status === "failed"
	const pending = isOptimisticMessage(message) && !failed
	const showActions =
		!pending && !message.deleted && onReply && onForward && onPin && onUnpin && onDelete

	return (
		<div
			ref={ref}
			className={cn(
				"group flex flex-col mb-1",
				isOwn ? "items-end" : "items-start",
				isHighlighted && "bg-primary/10",
			)}
		>
			{showSender && !isOwn && (
				<span className="text-xs font-medium text-muted-foreground mb-0.5 px-1">
					{message.sender.first_name ?? message.sender.username}
				</span>
			)}

			<div className={cn("flex w-full items-end gap-1", isOwn ? "flex-row-reverse" : "flex-row")}>
				{showActions && (
					<MessageActionMenu
						message={message}
						isOwn={isOwn}
						align={isOwn ? "end" : "start"}
						onReply={() => onReply!(message)}
						onForward={() => onForward!(message)}
						onPin={() => onPin!(message)}
						onUnpin={() => onUnpin!(message)}
						onDelete={() => onDelete!(message)}
					/>
				)}

				<div
					className={cn(
						"w-fit max-w-[min(82%,520px)] sm:max-w-[min(75%,520px)]",
						"rounded-2xl px-3.5 py-2.5 min-w-0",
						isOwn
							? "bg-primary text-primary-foreground rounded-br-sm"
							: "bg-card border border-border rounded-bl-sm",
						pending && "opacity-60",
						failed && "border border-destructive",
					)}
				>
					{message.reply_to && !message.deleted && (
						<div
							className={cn(
								"mb-1.5 pl-2 border-l-2 rounded-sm text-xs opacity-80",
								isOwn ? "border-primary-foreground/40" : "border-primary/40",
							)}
						>
							<p className="font-medium">
								{repliedMessage
									? (repliedMessage.sender.first_name ?? repliedMessage.sender.username)
									: "Original message"}
							</p>
							<p className="truncate max-w-55">
								{(repliedMessage ? repliedMessage.content : message.reply_to.content) || "Message"}
							</p>
						</div>
					)}

					<MessageContent message={message} onVote={onVote} onViewPollResults={onViewPollResults} />
				</div>
			</div>

			{showActions && onReact && <ReactionPicker onReact={(emoji) => onReact!(message, emoji)} />}

			{onViewReactors && (
				<ReactionsRow
					reactions={message.emoji_reaction_counts}
					isOwn={isOwn}
					onFetchReactors={(emoji) => onViewReactors(message, emoji)}
				/>
			)}

			<div className="flex items-center gap-1 mt-0.5 px-1">
				<span className="text-[11px] text-muted-foreground">{formatTime(message.created_at)}</span>
				{isOwn && !message.deleted && <StatusTick status={message.status} />}
				{message.is_pinned && !message.deleted && (
					<span className="text-[11px] text-muted-foreground">· Pinned</span>
				)}
				{failed && onRetry && (
					<button
						onClick={() => onRetry(message)}
						className="text-[11px] text-destructive font-medium hover:underline"
					>
						Retry
					</button>
				)}
			</div>
		</div>
	)
})
