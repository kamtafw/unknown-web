"use client"

import type { ReactNode } from "react"
import { SearchField } from "./event-list"
import { EventsTabs } from "./events-tabs"

/**
 * Left pane shared by Events and My events: optional location row, one search field,
 * the Events / My events control, then the list, which scrolls inside the pane while
 * the header stays put (design: 24 px padding, 351 px content in a 399 px pane).
 *
 * The search field belongs to the page that renders the pane, because the two tabs
 * search differently (nearby = local filter, My events = server search).
 */
export function EventsPane({
	label,
	location,
	floatingAction,
	search,
	children,
}: {
	label: string
	location?: ReactNode
	floatingAction?: ReactNode
	search: {
		value: string
		onChange: (value: string) => void
		label: string
		disabled?: boolean
	}
	children: ReactNode
}) {
	return (
		<section aria-label={label} className="relative flex min-h-0 flex-1 flex-col">
			<div className="flex shrink-0 flex-col gap-4 px-4 pt-5 sm:px-6 sm:pt-6">
				{location}
				<SearchField
					value={search.value}
					onChange={search.onChange}
					label={search.label}
					disabled={search.disabled}
				/>
				<EventsTabs />
			</div>
			{/* 26 px from the control to the first image, as measured in the design export */}
			<div className="mt-6.5 min-h-0 flex-1 overflow-y-auto px-4 pb-6 sm:px-6">{children}</div>
			{floatingAction}
		</section>
	)
}
