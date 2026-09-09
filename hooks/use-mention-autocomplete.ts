"use client"

import { getCaretCoordinates } from "@/lib/caret-position"
import { MentionUser } from "@/types/socials/api"
import { RefObject, useCallback, useEffect, useMemo, useState } from "react"
import { useDebouncedValue } from "./use-debounced-value"
import { useMentionSearch } from "./use-mention-search"

interface MentionMatch {
	query: string
	start: number
	end: number
}

interface CaretPixels {
	top: number
	left: number
	height: number
}

interface UseMentionAutocompleteArgs {
	value: string
	onChange: (value: string) => void
	textareaRef: RefObject<HTMLTextAreaElement | null>
	containerRef: RefObject<HTMLDivElement | null>
}

// an "@" that starts a mention: preceded by start-of-string, whitespace, or an
// opening paren, followed by 1–30 word chars with nothing else before the
// cursor — mirrors X's mention-boundary rules, skips mid-word @ (emails), and
// requires at least one character so a bare "@" never opens the popover
const MENTION_PATTERN = /(?:^|[\s(])@([a-zA-Z0-9_]{1,30})$/

export function useMentionAutocomplete({
	value,
	onChange,
	textareaRef,
	containerRef,
}: UseMentionAutocompleteArgs) {
	const [match, setMatch] = useState<MentionMatch | null>(null)
	const [caretPixels, setCaretPixels] = useState<CaretPixels | null>(null)
	const [selectedIndex, setSelectedIndex] = useState(0)

	const debouncedQuery = useDebouncedValue(match?.query ?? "", 200)
	const { data, isFetching } = useMentionSearch(debouncedQuery, !!match)
	const results = useMemo(() => data?.data.results ?? [], [data])

	const close = useCallback(() => {
		setMatch(null)
		setCaretPixels(null)
	}, [])

	const evaluate = useCallback(() => {
		const el = textareaRef.current
		const container = containerRef.current
		if (!el || !container) return

		const cursor = el.selectionStart ?? 0
		const found = value.slice(0, cursor).match(MENTION_PATTERN)

		if (!found) {
			setMatch(null)
			setCaretPixels(null)
			return
		}

		const query = found[1]
		const start = cursor - query.length - 1

		setMatch({ query, start, end: cursor })
		setSelectedIndex(0)

		const caret = getCaretCoordinates(el, start)
		setCaretPixels({
			top: el.offsetTop + caret.top - el.scrollTop + caret.height,
			left: el.offsetLeft + caret.left - el.scrollLeft,
			height: caret.height,
		})
	}, [value, textareaRef, containerRef])

	// re-detect whenever the text itself changes (typing, emoji insert, etc.)
	useEffect(() => {
		evaluate()
	}, [evaluate])

	const selectMention = useCallback(
		(user: MentionUser) => {
			if (!match) return
			const before = value.slice(0, match.start)
			const after = value.slice(match.end)
			const insertion = `@${user.username} `

			onChange(`${before}${insertion}${after}`)
			close()

			requestAnimationFrame(() => {
				const el = textareaRef.current
				if (!el) return
				const pos = before.length + insertion.length
				el.focus()
				el.setSelectionRange(pos, pos)
			})
		},
		[match, value, onChange, close, textareaRef],
	)

	/** wire into the textarea's onKeyDown — returns true if the key was consumed */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
			if (!match) return false

			if (e.key === "Escape") {
				close()
				return true
			}
			if (results.length === 0) return false

			if (e.key === "ArrowDown") {
				e.preventDefault()
				setSelectedIndex((i) => (i + 1) % results.length)
				return true
			}
			if (e.key === "ArrowUp") {
				e.preventDefault()
				setSelectedIndex((i) => (i - 1 + results.length) % results.length)
				return true
			}
			if (e.key === "Enter" || e.key === "Tab") {
				e.preventDefault()
				selectMention(results[selectedIndex])
				return true
			}
			return false
		},
		[match, results, selectedIndex, selectMention, close],
	)

	return {
		active: !!match,
		query: match?.query ?? "",
		results,
		isLoading: isFetching,
		selectedIndex,
		setSelectedIndex,
		caretPixels,
		/** wire into the textarea's onSelect — covers clicks & arrow-key cursor moves */
		handleSelect: evaluate,
		handleKeyDown,
		selectMention,
		close,
	}
}

export type MentionAutocompleteState = ReturnType<typeof useMentionAutocomplete>
