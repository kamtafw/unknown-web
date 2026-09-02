"use client"

import { isOptimisticMessage } from "@/lib/messenger/optimistic"
import type { Message } from "@/types/messenger"
import { Forward, MoreVertical, Pin, PinOff, Reply, Trash2 } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"

const itemClass =
	"flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"

interface MessageActionMenuProps {
	message: Message
	isOwn: boolean
	align: "start" | "end"
	onReply: () => void
	onForward: () => void
	onPin: () => void
	onUnpin: () => void
	onDelete: () => void
}

export function MessageActionMenu({
	message,
	isOwn,
	align,
	onReply,
	onForward,
	onPin,
	onUnpin,
	onDelete,
}: MessageActionMenuProps) {
	const [open, setOpen] = useState(false)

	// No actions make sense on a message that hasn't been confirmed by the
	// server yet (still optimistic/sending) or that failed to send —
	// retry/nothing is handled by the bubble itself, not this menu.
	if (isOptimisticMessage(message)) return null

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>
				<button className="h-7 w-7 rounded-full flex items-center justify-center bg-background border border-border shadow-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0">
					<MoreVertical size={14} />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					align={align}
					sideOffset={4}
					collisionPadding={12}
					className="z-150 min-w-48 bg-popover border border-border rounded-2xl p-1.5 shadow-xl
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
				>
					<DropdownMenu.Item className={itemClass} onSelect={onReply}>
						<Reply size={16} /> Reply
					</DropdownMenu.Item>

					<DropdownMenu.Item className={itemClass} onSelect={onForward}>
						<Forward size={16} /> Forward
					</DropdownMenu.Item>

					{message.is_pinned ? (
						<DropdownMenu.Item className={itemClass} onSelect={onUnpin}>
							<PinOff size={16} /> Unpin
						</DropdownMenu.Item>
					) : (
						<DropdownMenu.Item className={itemClass} onSelect={onPin}>
							<Pin size={16} /> Pin
						</DropdownMenu.Item>
					)}

					{isOwn && (
						<>
							<DropdownMenu.Separator className="h-px bg-border -mx-1.5 my-1" />
							<DropdownMenu.Item className={itemClass + " text-destructive"} onSelect={onDelete}>
								<Trash2 size={16} /> Delete
							</DropdownMenu.Item>
						</>
					)}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
