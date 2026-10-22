"use client"

import { useEventSelection } from "@/hooks/events/use-event-selection"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { ReactNode } from "react"

/**
 * Makes a list item open its event in the right pane (`?event=<uuid>`). It is a plain link, so it
 * works with keyboard, middle-click and "copy link address"; the selected item is marked with
 * `aria-current`. Other query parameters are kept and nothing secret is ever put in the URL.
 */
export function EventLink({ eventId, children }: { eventId: string; children: ReactNode }) {
	const { selection, hrefFor } = useEventSelection()
	const selected =
		(selection.mode === "view" || selection.mode === "edit") && selection.eventId === eventId

	return (
		<Link
			href={hrefFor({ mode: "view", eventId })}
			scroll={false}
			aria-current={selected ? "true" : undefined}
			className={cn(
				"block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary",
				selected && "ring-1 ring-primary/40",
			)}
		>
			{children}
		</Link>
	)
}
