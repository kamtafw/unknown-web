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
	Forward,
	Image as ImageIcon,
	MapPin,
	Phone,
	Share2,
	User,
} from "lucide-react"
import { forwardRef } from "react"
import { MediaGallery } from "../media/media-gallery"
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
	sameSenderAsPrevious?: boolean
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
	onVote?: (message: Message, optionId: number) => void
	onViewPollResults?: (message: Message) => void
}) {
	console.log("message_type:", message.message_type)
	if (message.is_hidden_by_me) return null

	if (message.is_deleted_for_all) {
		return <p className="text-sm italic opacity-60">This message was deleted</p>
	}

	if (message.message_type === "media") {
		return message.media && message.media.length > 0 ? (
			<MediaGallery media={message.media} />
		) : (
			<FallbackContent icon={ImageIcon} label={message.content || "Media"} />
		)
	}

	switch (message.message_type) {
		case "text":
			return <p className="whitespace-pre-wrap wrap-break-word text-sm">{message.content}</p>

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
		sameSenderAsPrevious,
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

	if (message.is_hidden_by_me) return null

	return (
		<div
			ref={ref}
			className={cn(
				"group relative flex w-full",
				isOwn ? "justify-end" : "justify-start",
				isHighlighted && "rounded-xl bg-primary/5 px-1 py-1 -mx-1",
				sameSenderAsPrevious ? "mb-1" : "mb-3",
			)}
		>
			<div
				className={cn(
					"relative flex min-w-0 max-w-[92%] items-end",
					"sm:max-w-[82%] lg:max-w-[72%]",
					isOwn ? "flex-row-reverse" : "flex-row",
					!isOwn && "gap-2",
				)}
			>
				<div className="relative min-w-0">
					{showActions && (
						<div
							className={cn(
								"absolute top-1/2 z-20 -translate-y-1/2",
								"opacity-0 transition-opacity group-hover:opacity-100",
								isOwn ? "-left-10" : "-right-10",
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
						</div>
					)}

					{/* Bubble Container */}
					<div
						className={cn(
							"relative min-w-0 overflow-visible",
							"px-3.5 py-2.5",
							"shadow-[0_1px_2px_rgba(0,0,0,0.05)]",

							isOwn
								? [
										"bg-primary/30 text-foreground",
										sameSenderAsPrevious ? "rounded-[14px]" : "rounded-[14px] rounded-tr-lg",
									]
								: [
										"bg-accent/30 text-foreground",
										sameSenderAsPrevious ? "rounded-[14px]" : "rounded-[14px] rounded-tl-lg",
									],

							pending && "opacity-60",
							failed && "border border-destructive",
						)}
					>
						{/* Pure Geometric Tail (Using absolute element matching background colors) */}
						{!sameSenderAsPrevious && (
							<div
								aria-hidden="true"
								style={{
									clipPath: isOwn
										? "polygon(0 0, 0 100%, 100% 0)"
										: "polygon(0 0, 100% 100%, 100% 0)",
								}}
								className={cn(
									"absolute top-0 w-2 h-2.5",
									isOwn
										? "left-full bg-primary/30"
										: "right-full bg-accent/30 drop-shadow-[0_1px_1px_rgba(0,0,0,0.03)]",
								)}
							/>
						)}

						{/* Sender name */}
						{showSender && !isOwn && (
							<p className="mb-1 text-[12px] font-semibold leading-4 text-primary">
								{message.sender.first_name ?? message.sender.username}
							</p>
						)}

						{/* Forwarded */}
						{forwarded && !deleted && (
							<div
								className={cn(
									"mb-1 flex items-center gap-1 text-[11px] italic",
									isOwn ? "text-primary/70" : "text-muted-foreground",
								)}
							>
								<Forward className="size-3" />
								<span>Forwarded</span>
							</div>
						)}

						{/* Reply preview */}
						{message.reply_to && !deleted && (
							<div
								className={cn(
									"mb-2 overflow-hidden rounded-md border-l-[3px] px-2.5 py-1.5",
									isOwn ? "border-primary bg-white/40" : "border-primary/70 bg-muted/70",
								)}
							>
								<p className="mb-0.5 text-[11px] font-semibold text-primary">
									{repliedMessage
										? (repliedMessage.sender.first_name ?? repliedMessage.sender.username)
										: "Original message"}
								</p>

								<p className="truncate text-xs text-foreground/70">
									{(repliedMessage ? repliedMessage.content : message.reply_to.content) ||
										"Message"}
								</p>
							</div>
						)}

						{/* Content */}
						<div className={cn(message.message_type === "media" && "-mx-3.5 -my-2.5")}>
							<MessageContent
								message={message}
								onVote={onVote}
								onViewPollResults={onViewPollResults}
							/>
						</div>

						{/* Timestamp / status */}
						{!deleted && (
							<div className={cn("mt-1 flex items-center justify-end gap-1 select-none")}>
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
						)}
					</div>

					{/* Reactions */}
					{onOpenReactionsDialog && (
						<div className={cn("absolute z-10 -bottom-4", isOwn ? "right-2" : "left-2")}>
							<ReactionsRow
								reactions={message.emoji_reaction_counts}
								isOwn={isOwn}
								onOpenDialog={() => onOpenReactionsDialog(message)}
							/>
						</div>
					)}

					{/* Reaction picker */}
					{showActions && onReact && (
						<div className={cn("absolute top-full z-20 pt-1", isOwn ? "right-0" : "left-0")}>
							<ReactionPicker onReact={(emoji: string) => onReact!(message, emoji)} />
						</div>
					)}
				</div>
			</div>
		</div>
	)
})
