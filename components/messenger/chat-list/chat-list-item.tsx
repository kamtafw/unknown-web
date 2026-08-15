"use client"

import { resolvePreviewFallbackLabel, resolvePreviewIcon } from "@/lib/messenger/preview"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { cn } from "@/lib/utils"
import type { ChatListItem as ChatListItemType } from "@/types/messenger"
import {
	BarChart3,
	FileText,
	Image as ImageIcon,
	MapPin,
	Mic,
	Phone,
	Pin,
	Share2,
	User,
	Video,
} from "lucide-react"
import Link from "next/link"
import { Avatar } from "radix-ui"

const PREVIEW_ICONS = {
	image: ImageIcon,
	video: Video,
	voice: Mic,
	document: FileText,
	location: MapPin,
	contact: User,
	poll: BarChart3,
	call: Phone,
	share: Share2,
} as const

function formatTimestamp(iso: string | null): string {
	if (!iso) return ""
	const date = new Date(iso)
	return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

interface ChatListItemProps {
	chat: ChatListItemType
	isActive: boolean
	isTyping?: boolean
}

export function ChatListItem({ chat, isActive, isTyping }: ChatListItemProps) {
	const name = getDisplayName(chat)
	const PreviewIcon = resolvePreviewIcon(chat.last_message_type)
	const Icon = PreviewIcon ? PREVIEW_ICONS[PreviewIcon] : null
	const previewText =
		chat.last_message_preview ||
		(chat.last_message_type ? resolvePreviewFallbackLabel(chat.last_message_type) : "")

	return (
		<Link
			href={`/messenger/${chat.id}`}
			className={cn(
				"flex items-center gap-3 px-4 py-3 transition-colors",
				isActive ? "bg-accent" : "hover:bg-accent/50",
			)}
		>
			<Avatar.Root className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image src={chat.profile_photo} alt={name} className="h-full w-full object-cover" />
				<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
					{getInitials(chat.first_name, chat.last_name)}
				</Avatar.Fallback>
				{/* No confirmed presence field on ChatListItem — not rendering a
				 * dot rather than inventing online/offline state. */}
			</Avatar.Root>

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-semibold text-sm truncate">{name}</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{formatTimestamp(chat.last_message_time)}
					</span>
				</div>
				<div className="flex items-center justify-between gap-2 mt-0.5">
					{isTyping ? (
						<span className="text-sm italic text-primary">Typing a message…</span>
					) : (
						<span className="flex items-center gap-1 min-w-0 text-sm text-muted-foreground">
							{Icon && <Icon size={13} className="shrink-0" />}
							<span className="truncate">{previewText}</span>
						</span>
					)}
					{chat.unread_count > 0 && (
						<span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold flex items-center justify-center">
							{chat.unread_count > 99 ? "99+" : chat.unread_count}
						</span>
					)}
					{/* Read-only reflection of real is_pinned data — not a pin
					 * control. Pinning as an action belongs to M2 (APPC-6/7). */}
					{chat.is_pinned && <Pin size={12} className="shrink-0 text-muted-foreground rotate-45" />}
				</div>
			</div>
		</Link>
	)
}
