"use client"

import { groupMessagesByDay } from "@/lib/messenger/date-separators"
import type { Message } from "@/types/messenger"
import { Loader2 } from "lucide-react"
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { DateSeparator } from "./date-separator"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"

interface MessageListProps {
	messages: Message[]
	currentUserUuid: string
	isLoading: boolean
	hasOlder: boolean
	isFetchingOlder: boolean
	onLoadOlder: () => void
	remoteTyping: boolean
	onRetry: (message: Message) => void
	onReply: (message: Message) => void
	onForward: (message: Message) => void
	onPin: (message: Message) => void
	onUnpin: (message: Message) => void
	onDelete: (message: Message) => void
	onReact?: (message: Message, emoji: string) => void
	onOpenReactionsDialog?: (message: Message) => void
	onVote?: (message: Message, optionIds: number[]) => void
	onViewPollResults?: (message: Message) => void
}

export interface MessageListHandle {
	/** Returns false and no-ops if the message isn't in the currently loaded
	 * window — see MESSENGER.md known limitations; no auto-pagination in M2. */
	scrollToMessage: (messageId: number) => boolean
}

export const MessageList = forwardRef<MessageListHandle, MessageListProps>(function MessageList(
	{
		messages,
		currentUserUuid,
		isLoading,
		hasOlder,
		isFetchingOlder,
		onLoadOlder,
		remoteTyping,
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
	const messageNodeRefs = useRef<Map<number, HTMLDivElement>>(new Map())
	const [highlightedId, setHighlightedId] = useState<number | null>(null)
	const scrollRef = useRef<HTMLDivElement>(null)
	const topSentinelRef = useRef<HTMLDivElement>(null)
	const messageById = useMemo(() => new Map(messages.map((m) => [m.id, m])), [messages])
	const dayGroups = useMemo(() => groupMessagesByDay(messages), [messages])

	useImperativeHandle(ref, () => ({
		scrollToMessage: (messageId) => {
			const node = messageNodeRefs.current.get(messageId)
			if (!node) return false
			node.scrollIntoView({ behavior: "smooth", block: "center" })
			setHighlightedId(messageId)
			setTimeout(
				() => setHighlightedId((current) => (current === messageId ? null : current)),
				1500,
			)
			return true
		},
	}))

	// Load older messages when the top sentinel scrolls into view.
	useEffect(() => {
		const sentinel = topSentinelRef.current
		if (!sentinel || !hasOlder) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) onLoadOlder()
			},
			{ root: scrollRef.current, threshold: 0.1 },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [hasOlder, onLoadOlder])

	// Simplified for M1: always follow the bottom on new messages. A user
	// scrolled up reading older history getting pulled back down on a new
	// incoming message is a known trade-off, not an oversight — proper
	// "stay put unless already near bottom" scroll anchoring is a
	// reasonable hardening item, not core M1 scope.
	const lastMessageId = messages[messages.length - 1]?.id
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
	}, [lastMessageId])

	if (isLoading) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<Loader2 size={22} className="animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center px-8 text-center">
				<p className="text-sm text-muted-foreground">
					No messages yet. Say hello to start the conversation.
				</p>
			</div>
		)
	}

	return (
		<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
			<div ref={topSentinelRef} className="h-1" />
			{isFetchingOlder && (
				<div className="flex justify-center py-2">
					<Loader2 size={16} className="animate-spin text-muted-foreground" />
				</div>
			)}

			{dayGroups.map((group) => (
				<div key={group.label}>
					<DateSeparator label={group.label} />
					{group.items.map((message, i) => {
						const prev = group.items[i - 1]
						const showSender = !prev || prev.sender.id !== message.sender.id
						const repliedMessage = message.reply_to
							? messageById.get(message.reply_to.id)
							: undefined
						return (
							<MessageBubble
								key={message.id}
								message={message}
								isOwn={message.sender.id === currentUserUuid}
								showSender={showSender}
								repliedMessage={repliedMessage}
								isHighlighted={highlightedId === message.id}
								ref={(node: HTMLDivElement | null) => {
									if (node) messageNodeRefs.current.set(message.id, node)
									else messageNodeRefs.current.delete(message.id)
								}}
								onRetry={onRetry}
								onReply={onReply}
								onForward={onForward}
								onPin={onPin}
								onUnpin={onUnpin}
								onDelete={onDelete}
								onReact={onReact}
								onOpenReactionsDialog={onOpenReactionsDialog}
								onVote={onVote}
								onViewPollResults={onViewPollResults}
							/>
						)
					})}
				</div>
			))}

			{remoteTyping && <TypingIndicator />}
		</div>
	)
})
