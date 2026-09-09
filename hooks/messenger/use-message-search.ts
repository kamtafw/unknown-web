"use client"

import type { MessageListHandle } from "@/components/messenger/conversation/message-list"
import type { Message } from "@/types/messenger"
import type { RefObject } from "react"
import { useCallback, useState } from "react"

/**
 * In-conversation "find in loaded messages" — client-side substring match
 * over whatever's currently in the history query cache. Mirrors mobile's
 * handleSearchSubmit in chat/[id].tsx and group-chat/[id].tsx exactly —
 * there's no backend message-search endpoint (confirmed: mobile's own
 * version does the identical in-memory filter). Scoped to the loaded
 * window only — older, not-yet-paginated messages won't match until
 * they're loaded, same limitation mobile has.
 */
export function useMessageSearch(
	messages: Message[],
	listRef: RefObject<MessageListHandle | null>,
) {
	const [isOpen, setIsOpen] = useState(false)
	const [query, setQuery] = useState("")
	const [resultIds, setResultIds] = useState<number[]>([])
	const [activeIndex, setActiveIndex] = useState(-1)

	const jumpTo = useCallback((id: number) => listRef.current?.scrollToMessage(id), [listRef])

	const reset = useCallback(() => {
		setQuery("")
		setResultIds([])
		setActiveIndex(-1)
	}, [])

	const open = useCallback(() => setIsOpen(true), [])
	const close = useCallback(() => {
		setIsOpen(false)
		reset()
	}, [reset])

	const onQueryChange = useCallback((text: string) => {
		setQuery(text)
		if (!text.trim()) {
			setResultIds([])
			setActiveIndex(-1)
		}
	}, [])

	const onSubmit = useCallback(() => {
		const trimmed = query.trim().toLowerCase()
		if (!trimmed) {
			reset()
			return
		}
		const ids = messages
			.filter(
				(m) =>
					(!m.is_deleted_for_all || !m.is_hidden_by_me) &&
					m.content?.toLowerCase().includes(trimmed),
			)
			.map((m) => m.id)
		setResultIds(ids)
		setActiveIndex(ids.length > 0 ? 0 : -1)
		if (ids.length > 0) jumpTo(ids[0])
	}, [query, messages, reset, jumpTo])

	const onPrev = useCallback(() => {
		if (resultIds.length === 0) return
		const next = activeIndex > 0 ? activeIndex - 1 : resultIds.length - 1
		setActiveIndex(next)
		jumpTo(resultIds[next])
	}, [resultIds, activeIndex, jumpTo])

	const onNext = useCallback(() => {
		if (resultIds.length === 0) return
		const next = activeIndex < resultIds.length - 1 ? activeIndex + 1 : 0
		setActiveIndex(next)
		jumpTo(resultIds[next])
	}, [resultIds, activeIndex, jumpTo])

	return {
		isOpen,
		open,
		close,
		query,
		onQueryChange,
		onSubmit,
		onPrev,
		onNext,
		resultCount: resultIds.length,
		activeIndex,
	}
}
