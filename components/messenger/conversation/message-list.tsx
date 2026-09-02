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
	onVote?: (message: Message, optionId: number) => void
	onViewPollResults?: (message: Message) => void
	resolveReplySenderName?: (senderId: string) => string
}

export interface MessageListHandle {
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
		resolveReplySenderName,
	},
	ref,
) {
	const messageNodeRefs = useRef<Map<number, HTMLDivElement>>(new Map())
	const [highlightedId, setHighlightedId] = useState<number | null>(null)

	const scrollRef = useRef<HTMLDivElement>(null)
	const topSentinelRef = useRef<HTMLDivElement>(null)

	const messageById = useMemo(
		() => new Map(messages.map((message) => [message.id, message])),
		[messages],
	)

	const dayGroups = useMemo(() => groupMessagesByDay(messages), [messages])

	useImperativeHandle(ref, () => ({
		scrollToMessage: (messageId) => {
			const node = messageNodeRefs.current.get(messageId)

			if (!node) return false

			node.scrollIntoView({
				behavior: "smooth",
				block: "center",
			})

			setHighlightedId(messageId)

			setTimeout(() => {
				setHighlightedId((current) => (current === messageId ? null : current))
			}, 1500)

			return true
		},
	}))

	useEffect(() => {
		const sentinel = topSentinelRef.current

		if (!sentinel || !hasOlder) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadOlder()
				}
			},
			{
				root: scrollRef.current,
				threshold: 0.1,
			},
		)

		observer.observe(sentinel)

		return () => observer.disconnect()
	}, [hasOlder, onLoadOlder])

	const lastMessageId = messages[messages.length - 1]?.id

	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		})
	}, [lastMessageId])

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center">
				<Loader2 className="size-5.5 animate-spin text-muted-foreground" />
			</div>
		)
	}

	if (messages.length === 0) {
		return (
			<div className="flex flex-1 items-center justify-center px-8 text-center">
				<p className="text-sm text-muted-foreground">
					No messages yet. Say hello to start the conversation.
				</p>
			</div>
		)
	}

	return (
		<div
			ref={scrollRef}
			className="messenger-wallpaper flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8"
		>
			<div ref={topSentinelRef} className="h-1" aria-hidden="true" />

			{isFetchingOlder && (
				<div className="flex justify-center py-2">
					<Loader2 className="size-4 animate-spin text-muted-foreground" />
				</div>
			)}

			<div className="mx-auto w-full max-w-5xl">
				{dayGroups.map((group) => (
					<div key={group.label}>
						<DateSeparator label={group.label} />

						<div className="space-y-0">
							{group.items.map((message, index) => {
								const previousMessage = group.items[index - 1]

								const sameSender = Boolean(
									previousMessage && previousMessage.sender.id === message.sender.id,
								)

								const repliedMessage = message.reply_to
									? messageById.get(message.reply_to.id)
									: undefined

								return (
									<MessageBubble
										key={message.id}
										message={message}
										isOwn={message.sender.id === currentUserUuid}
										showSender={!sameSender}
										sameSenderAsPrevious={sameSender}
										repliedMessage={repliedMessage}
										isHighlighted={highlightedId === message.id}
										ref={(node) => {
											if (node) {
												messageNodeRefs.current.set(message.id, node)
											} else {
												messageNodeRefs.current.delete(message.id)
											}
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
										resolveReplySenderName={resolveReplySenderName}
									/>
								)
							})}
						</div>
					</div>
				))}

				{remoteTyping && <TypingIndicator />}
			</div>
		</div>
	)
})
