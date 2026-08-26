"use client"

import { useChatListActions } from "@/hooks/messenger/use-chat-list-actions"
import { useFavoriteActions } from "@/hooks/messenger/use-favorites"
import { extractMessage } from "@/lib/api-error"
import { chatApi } from "@/lib/messenger/api"
import { toast } from "@/lib/toast"
import type { ChatListItem } from "@/types/messenger"
import {
	Archive,
	Ban,
	Bell,
	BellOff,
	CheckCheck,
	ListPlus,
	MoreVertical,
	Pin,
	PinOff,
	Star,
	Trash2,
	User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"

const itemClass =
	"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"

interface ChatListItemMenuProps {
	chat: ChatListItem
	isActive: boolean
	onAddToList: () => void
	onMarkedRead: () => void
}

export function ChatListItemMenu({
	chat,
	isActive,
	onAddToList,
	onMarkedRead,
}: ChatListItemMenuProps) {
	const [open, setOpen] = useState(false)
	const router = useRouter()
	const { pin, unpin, mute, unmute, block, archive, clearChat } = useChatListActions()
	const { addFavorite } = useFavoriteActions()

	const run = async (action: () => Promise<unknown>) => {
		try {
			await action()
		} catch (err) {
			toast.error(extractMessage(err, "That didn't go through — try again"))
		}
	}

	/** Archiving/clearing the conversation user is currently looking
	 * at removes the orw from list and takes out the conversation
	 * itself since it no longer has a corresponding list entry. It
	 * navigates back to the empty state when action targets the
	 * currently open chat. */
	const runAndCloseIfActive = async (action: () => Promise<unknown>) => {
		try {
			await action()
			if (isActive) router.push("/messenger")
		} catch (err) {
			toast.error(extractMessage(err, "That didn't go through — try again"))
		}
	}

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>
				<button
					onClick={(e) => e.preventDefault()}
					className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-opacity shrink-0"
				>
					<MoreVertical size={16} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align="end"
					sideOffset={4}
					collisionPadding={12}
					className="z-150 min-w-56 bg-popover border border-border rounded-2xl p-1.5 shadow-xl
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
				>
					<DropdownMenu.Item className={itemClass} onSelect={onMarkedRead}>
						<CheckCheck size={16} /> Mark as read
					</DropdownMenu.Item>

					{chat.is_pinned ? (
						<DropdownMenu.Item className={itemClass} onSelect={() => run(() => unpin(chat.id))}>
							<PinOff size={16} /> Unpin
						</DropdownMenu.Item>
					) : (
						<DropdownMenu.Item
							className={itemClass}
							onSelect={() => run(() => pin(chat.id, chat.pkid))}
						>
							<Pin size={16} /> Pin
						</DropdownMenu.Item>
					)}

					{chat.is_muted ? (
						<DropdownMenu.Item
							className={itemClass}
							onSelect={() => run(() => unmute(chat.id, chat.pkid))}
						>
							<Bell size={16} /> Unmute notifications
						</DropdownMenu.Item>
					) : (
						<DropdownMenu.Item
							className={itemClass}
							onSelect={() => run(() => mute(chat.id, chat.pkid))}
						>
							<BellOff size={16} /> Mute notifications
						</DropdownMenu.Item>
					)}

					<DropdownMenu.Item className={itemClass} onSelect={() => run(() => addFavorite(chat))}>
						<Star size={16} /> Add to favorites
					</DropdownMenu.Item>

					<DropdownMenu.Item className={itemClass} onSelect={onAddToList}>
						<ListPlus size={16} /> Add to list
					</DropdownMenu.Item>

					<DropdownMenu.Item
						className={itemClass}
						onSelect={() => toast.info("Contact profile is coming in a later milestone")}
					>
						<User size={16} /> View contact
					</DropdownMenu.Item>

					<DropdownMenu.Separator className="h-px bg-border -mx-1.5 my-1" />

					<DropdownMenu.Item
						className={itemClass}
						onSelect={() => runAndCloseIfActive(() => archive(chat.id, chat.pkid))}
					>
						<Archive size={16} /> Archive chat
					</DropdownMenu.Item>

					<DropdownMenu.Item
						className={itemClass}
						onSelect={() => runAndCloseIfActive(() => clearChat(chat.id, chat.pkid))}
					>
						<Trash2 size={16} /> Clear chat
					</DropdownMenu.Item>

					<DropdownMenu.Item
						className={itemClass + " text-destructive"}
						onSelect={() => run(() => block(chat.id, chat.pkid))}
					>
						<Ban size={16} /> Block contact
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}

/** Exported so ChatListPanel's "explicit mark-as-read" menu item reuses
 * the exact same call M1 already made automatic on opening a conversation
 * — no new endpoint, just exposing it directly per Jira's "Mark as Read"
 * menu item. */
export async function markChatRead(userUuid: string) {
	await chatApi.markSeen(userUuid)
}
