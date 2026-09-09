"use client"

import { renderText } from "@/components/dashboard/post-card"
import { cn } from "@/lib/utils"
import { forwardRef, TextareaHTMLAttributes, useRef } from "react"

interface HighlightedTextareaProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
	value: string
	onChange: (value: string) => void
}

/**
 * Drop-in replacement for a plain <textarea> that highlights @mentions and
 * #hashtags as you type. An inert overlay renders the same text with
 * highlighted spans directly on top of a fully transparent-text textarea —
 * typing, selection, and the caret all hit the real textarea underneath
 * (overlay is pointer-events-none), so behavior is indistinguishable from a
 * native textarea. Reuses `renderText` so composer-time styling matches how
 * the post renders after publishing.
 *
 * Must be rendered inside a `position: relative` ancestor — same wrapper the
 * mention-autocomplete anchor already requires — since the overlay positions
 * itself with `inset-0` against that ancestor. No margin utilities in
 * `className`: an absolutely positioned overlay honors margin as an offset,
 * which would desync it from the textarea. Put spacing on the wrapper div.
 */
export const HighlightedTextarea = forwardRef<HTMLTextAreaElement, HighlightedTextareaProps>(
	function HighlightedTextarea({ value, onChange, className, onScroll, ...props }, ref) {
		const overlayRef = useRef<HTMLDivElement>(null)

		const syncScroll = (el: HTMLTextAreaElement) => {
			if (!overlayRef.current) return
			overlayRef.current.scrollTop = el.scrollTop
			overlayRef.current.scrollLeft = el.scrollLeft
		}

		return (
			<>
				<div
					ref={overlayRef}
					aria-hidden="true"
					className={cn(
						"absolute inset-0 overflow-hidden whitespace-pre-wrap wrap-break-word pointer-events-none",
						className,
					)}
				>
					{renderText(value)}
					{/* preserves a trailing blank line so overlay height tracks the textarea */}
					{value.endsWith("\n") && "\u200b"}
				</div>
				<textarea
					{...props}
					ref={(node) => {
						if (typeof ref === "function") ref(node)
						else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
						if (node) syncScroll(node)
					}}
					value={value}
					onChange={(e) => {
						onChange(e.target.value)
						syncScroll(e.target)
					}}
					onScroll={(e) => {
						syncScroll(e.currentTarget)
						onScroll?.(e)
					}}
					className={cn(className, "bg-transparent text-transparent caret-foreground")}
				/>
			</>
		)
	},
)