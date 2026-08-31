"use client"

import { isOptimisticMessage } from "@/lib/messenger/optimistic"
import { resolvePoll } from "@/lib/messenger/poll"
import { cn } from "@/lib/utils"
import type { MediaAttachment, Message } from "@/types/messenger"
import {
	AlertCircle,
	BarChart3,
	Check,
	CheckCheck,
	Clock,
	FileText,
	Forward,
	Image as ImageIcon,
	MapPin,
	Phone,
	Share2,
	User,
} from "lucide-react"
import Image from "next/image"
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
	onRetry?: (message: Message) => void
	onReply?: (message: Message) => void
	onForward?: (message: Message) => void
	onPin?: (message: Message) => void
	onUnpin?: (message: Message) => void
	onDelete?: (message: Message) => void
	onReact?: (message: Message, emoji: string) => void
	onOpenReactionsDialog?: (message: Message) => void
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

/** A single item renders exactly as before; 2+ items render as a grid.
 * Caption is shown once, not per-tile — mobile applies the same caption
 * string to every item in a batch, so duplicating it under each tile
 * would just repeat identical text. */
export function MediaGallery2({ media }: { media: MediaAttachment[] }) {
	if (media.length === 1) return <SingleMediaItem item={media[0]} />

	const caption = media.find((m) => m.caption)?.caption
	return (
		<div className="flex flex-col gap-1">
			<div
				className={cn(
					"grid gap-1 max-w-70",
					media.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
				)}
			>
				{media.map((item, i) => (
					<GalleryTile key={i} item={item} />
				))}
			</div>
			{caption && <p className="text-sm">{caption}</p>}
		</div>
	)
}

function GalleryTile({ item }: { item: MediaAttachment }) {
	if (item.type === "image") {
		return (
			<div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
				<Image src={item.url} alt={item.caption || "Image"} fill className="object-cover" />
			</div>
		)
	}
	if (item.type === "video") {
		return (
			<video src={item.url} controls className="aspect-square w-full rounded-lg object-cover" />
		)
	}
	if (item.type === "audio") {
		return <audio src={item.url} controls className="col-span-full w-full" />
	}
	return (
		<a
			href={item.url}
			target="_blank"
			rel="noreferrer"
			className="col-span-full flex items-center gap-2 text-sm underline"
		>
			<FileText size={16} className="shrink-0 opacity-70" />
			<span className="truncate">{item.caption || item.fileName || "Document"}</span>
		</a>
	)
}

function SingleMediaItem({ item }: { item: MediaAttachment }) {
	switch (item.type) {
		case "image":
			return (
				<figure className="flex flex-col gap-1">
					<Image
						src={item.url}
						alt={item.caption || "Image"}
						width={280}
						height={280}
						className="rounded-lg max-w-70 max-h-70 object-cover"
					/>
					{item.caption && <figcaption className="text-sm">{item.caption}</figcaption>}
				</figure>
			)
		case "video":
			return (
				<figure className="flex flex-col gap-1">
					<video src={item.url} controls className="rounded-lg max-w-70 max-h-70" />
					{item.caption && <figcaption className="text-sm">{item.caption}</figcaption>}
				</figure>
			)
		case "audio":
			return (
				<div className="flex flex-col gap-1">
					<audio src={item.url} controls className="max-w-70" />
					{item.caption && item.caption !== "Voice message" && (
						<p className="text-sm">{item.caption}</p>
					)}
				</div>
			)
		default:
			return (
				<a
					href={item.url}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-2 text-sm underline"
				>
					<FileText size={16} className="shrink-0 opacity-70" />
					<span className="truncate">{item.caption || item.fileName || "Document"}</span>
				</a>
			)
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
						"rounded-2xl py-2.5 min-w-0 overflow-hidden",
						isOwn
							? "bg-primary text-primary-foreground rounded-br-sm"
							: "bg-card border border-border rounded-bl-sm",
						pending && "opacity-60",
						failed && "border border-destructive",
					)}
				>
					{forwarded && !deleted && (
						<div className="flex align-top px-3.5 pb-1 gap-0.5 text-xs text-zinc-500 italic">
							<Forward size={16} />
							<p className="">Forwarded</p>
						</div>
					)}

					{message.reply_to && !deleted && (
						<div
							className={cn(
								"mx-3.5 mb-1.5 pl-2 border-l-2 rounded-sm text-xs opacity-80",
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

					<div className={cn(message.message_type === "media" ? "px-1" : "px-3.5")}>
						<MessageContent
							message={message}
							onVote={onVote}
							onViewPollResults={onViewPollResults}
						/>
					</div>
				</div>
			</div>

			{showActions && onReact && <ReactionPicker onReact={(emoji) => onReact!(message, emoji)} />}

			{onOpenReactionsDialog && (
				<ReactionsRow
					reactions={message.emoji_reaction_counts}
					isOwn={isOwn}
					onOpenDialog={() => onOpenReactionsDialog(message)}
				/>
			)}

			<div className="flex items-center gap-1 mt-0.5 px-1">
				<span className="text-[11px] text-muted-foreground">{formatTime(message.created_at)}</span>
				{isOwn && !deleted && <StatusTick status={message.status} />}
				{message.is_pinned && !deleted && (
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
