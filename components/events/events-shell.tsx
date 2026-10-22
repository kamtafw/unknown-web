"use client"

import { useEventSelection } from "@/hooks/events/use-event-selection"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { Suspense } from "react"
import { EventPane } from "./event-pane"
import { EventRoomPlaceholder } from "./event-room-placeholder"

/**
 * The two flat panes. The left pane is the page (list); the right pane is the event area. From
 * `lg` both are always visible. Below `lg` the right pane replaces the list while an event or the
 * create form is open (the design has no mobile layout: A-2, A-15).
 */
function Frame({ open, pane, children }: { open: boolean; pane: ReactNode; children: ReactNode }) {
	return (
		<div className="flex min-w-0 flex-1 overflow-hidden bg-card">
			<div
				className={cn(
					"min-h-0 w-full flex-col lg:flex lg:w-[399px] lg:shrink-0",
					open ? "hidden" : "flex",
				)}
			>
				{children}
			</div>
			{pane}
		</div>
	)
}

function SelectionAwareFrame({ children }: { children: ReactNode }) {
	const { selection } = useEventSelection()
	return (
		<Frame open={selection.mode !== "none"} pane={<EventPane />}>
			{children}
		</Frame>
	)
}

/**
 * `useSearchParams` needs a Suspense boundary in statically rendered routes. The fallback is the
 * same frame with nothing selected, so the list is server-rendered and never blank.
 */
export function EventsShell({ children }: { children: ReactNode }) {
	return (
		<Suspense
			fallback={
				<Frame open={false} pane={<EventRoomPlaceholder />}>
					{children}
				</Frame>
			}
		>
			<SelectionAwareFrame>{children}</SelectionAwareFrame>
		</Suspense>
	)
}
