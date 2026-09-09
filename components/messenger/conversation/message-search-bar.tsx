"use client"

import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useRef } from "react"

interface MessageSearchBarProps {
	value: string
	onChangeText: (text: string) => void
	onSubmit: () => void
	onClose: () => void
	onPrev: () => void
	onNext: () => void
	resultCount: number
	activeIndex: number
}

/** Web port of mobile's ConversationSearchBar. Scoped to already-loaded
 * messages — see use-message-search.ts for why. Skips mobile's
 * calendar-search icon: unwired there too, not porting a dead stub. */
export function MessageSearchBar({
	value,
	onChangeText,
	onSubmit,
	onClose,
	onPrev,
	onNext,
	resultCount,
	activeIndex,
}: MessageSearchBarProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const hasResults = resultCount > 0

	return (
		<div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-background shrink-0">
			<button onClick={onClose} title="Close search" className="text-muted-foreground shrink-0">
				<ArrowLeft size={20} />
			</button>

			<div className="flex flex-1 items-center gap-2 rounded-full bg-muted px-3 py-1.5">
				<input
					ref={inputRef}
					value={value}
					onChange={(e) => onChangeText(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault()
							if (e.shiftKey) onPrev()
							else if (hasResults) onNext()
							else onSubmit()
						} else if (e.key === "Escape") {
							onClose()
						}
					}}
					placeholder="Search in conversation"
					className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
				/>
				{value.trim() && (
					<span className="shrink-0 text-xs text-muted-foreground">
						{hasResults ? `${activeIndex + 1}/${resultCount}` : "No results"}
					</span>
				)}
			</div>

			<button
				onClick={onPrev}
				disabled={!hasResults}
				title="Previous result"
				className="text-muted-foreground shrink-0 disabled:opacity-30"
			>
				<ChevronUp size={20} />
			</button>
			<button
				onClick={onNext}
				disabled={!hasResults}
				title="Next result"
				className="text-muted-foreground shrink-0 disabled:opacity-30"
			>
				<ChevronDown size={20} />
			</button>
		</div>
	)
}
