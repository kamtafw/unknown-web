"use client"

import { isOptimisticMessage } from "@/lib/messenger/optimistic"
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
function MessageContent({ message }: { message: Message }) {
	if (message.deleted) {
		return <p className="text-sm italic opacity-60">This message was deleted</p>
	}

	switch (message.message_type) {
		case "text":
			return <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.content}</p>

		case "image":
		case "media":
			return message.media?.[0]?.url ? (
				<Image
					src={message.media[0].url}
					alt={message.content || "Image"}
					className="rounded-lg max-w-70 max-h-70 object-cover"
				/>
			) : (
				<FallbackContent icon={ImageIcon} label="Image" />
			)

		case "video":
			return <FallbackContent icon={Video} label={message.content || "Video"} />
		case "audio":
		case "voice":
			return <FallbackContent icon={Mic} label="Voice message" />
		case "document":
			return <FallbackContent icon={FileText} label={message.content || "Document"} />
		case "location":
			return <FallbackContent icon={MapPin} label="Location" />
		case "contact":
			return <FallbackContent icon={User} label={message.content || "Contact"} />
		case "poll":
			return <FallbackContent icon={BarChart3} label={message.content || "Poll"} />
		case "call":
			return <FallbackContent icon={Phone} label={message.content || "Call"} />
		case "share":
			return <FallbackContent icon={Share2} label="Shared post" />
		default:
			return <p className="text-sm italic opacity-70">Unsupported message</p>
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

			<div
				className={cn("flex items-end gap-1 max-w-[85%]", isOwn ? "flex-row-reverse" : "flex-row")}
			>
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
						"rounded-2xl px-3.5 py-2.5 min-w-0",
						isOwn
							? "bg-primary text-primary-foreground rounded-br-sm"
							: "bg-card border border-border rounded-bl-sm",
						pending && "opacity-60",
						failed && "border border-destructive",
					)}
				>
					{repliedMessage && !message.deleted && (
						<div
							className={cn(
								"mb-1.5 pl-2 border-l-2 rounded-sm text-xs opacity-80",
								isOwn ? "border-primary-foreground/40" : "border-primary/40",
							)}
						>
							<p className="font-medium">
								{repliedMessage.sender.first_name ?? repliedMessage.sender.username}
							</p>
							<p className="truncate max-w-55">{repliedMessage.content || "Message"}</p>
						</div>
					)}

					<MessageContent message={message} />
				</div>
			</div>

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
