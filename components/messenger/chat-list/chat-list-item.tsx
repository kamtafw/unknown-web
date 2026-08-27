"use client"

import { resolvePreviewFallbackLabel, resolvePreviewIcon } from "@/lib/messenger/preview"
import { chatKeys } from "@/lib/messenger/query-keys"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { ChatListItem as ChatListItemType, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
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
import { ChatListItemMenu, markChatRead } from "./chat-list-item-menu"

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
	bulkMode?: boolean
	selected?: boolean
	onToggleSelect?: (uuid: Uuid) => void
	onAddToList?: (chat: ChatListItemType) => void
}

export function ChatListItem({
	chat,
	isActive,
	isTyping,
	bulkMode,
	selected,
	onToggleSelect,
	onAddToList,
}: ChatListItemProps) {
	const queryClient = useQueryClient()
	const name = getDisplayName(chat)
	const PreviewIcon = resolvePreviewIcon(chat.last_message_type)
	const Icon = PreviewIcon ? PREVIEW_ICONS[PreviewIcon] : null
	const previewText =
		chat.last_message_preview ||
		(chat.last_message_type ? resolvePreviewFallbackLabel(chat.last_message_type) : "")

	const handleMarkedRead = async () => {
		try {
			await markChatRead(chat.id)
			queryClient.setQueriesData<{ users: ChatListItemType[]; metadata: unknown }>(
				{ queryKey: chatKeys.lists() },
				(old) =>
					old
						? {
								...old,
								users: old.users.map((u) => (u.id === chat.id ? { ...u, unread_count: 0 } : u)),
							}
						: old,
			)
			queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
		} catch {
			toast.error("Couldn't mark as read — try again")
		}
	}

	const rowContent = (
		<>
			{bulkMode && (
				<input
					type="checkbox"
					checked={!!selected}
					onChange={() => onToggleSelect?.(chat.id)}
					onClick={(e) => e.stopPropagation()}
					className="h-4 w-4 shrink-0 rounded border-border accent-primary"
				/>
			)}

			<Avatar.Root className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image src={chat.profile_photo} alt={name} className="h-full w-full object-cover" />
				<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
					{getInitials(chat.first_name, chat.last_name)}
				</Avatar.Fallback>
			</Avatar.Root>

			<div
				className={cn(
					"min-w-0 flex-1",
					!bulkMode && " transition-[padding-right] group-hover:pr-9 group-focus-within:pr-9",
				)}
			>
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-semibold text-sm truncate">{name}</span>

					<span className="text-xs text-muted-foreground shrink-0">
						{formatTimestamp(chat.last_message_time)}
					</span>
				</div>

				<div className="flex items-center gap-2 mt-0.5 min-w-0">
					{isTyping ? (
						<span className="text-sm italic text-primary truncate">Typing a message…</span>
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

					{chat.is_pinned && <Pin size={12} className="shrink-0 text-muted-foreground rotate-45" />}
				</div>
			</div>

			{!bulkMode && (
				<div
					className={cn(
						"absolute right-4 top-1/2 -translate-y-1/2",
						"opacity-0 pointer-events-none transition-opacity",
						"group-hover:opacity-100 group-hover:pointer-events-auto",
						"group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
					)}
				>
					<ChatListItemMenu
						chat={chat}
						isActive={isActive}
						onMarkedRead={handleMarkedRead}
						onAddToList={() => onAddToList?.(chat)}
					/>
				</div>
			)}
		</>
	)

	const rowClass = cn(
		"group relative flex items-center gap-3 px-4 py-3 transition-colors",
		isActive ? "bg-accent" : "hover:bg-accent/50",
	)

	if (bulkMode) {
		return (
			<div className={cn(rowClass, "cursor-pointer")} onClick={() => onToggleSelect?.(chat.id)}>
				{rowContent}
			</div>
		)
	}

	return (
		<Link href={`/messenger/${chat.id}`} className={rowClass}>
			{rowContent}
		</Link>
	)
}
