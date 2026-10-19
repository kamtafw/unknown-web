"use client"

import { cn } from "@/lib/utils"
import type { EventCard as EventCardData } from "@/types/events/api"
import { Loader2, RotateCcw, Search } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { EventCard, EventCardSkeleton } from "./event-card"

/** Loading placeholder shaped like the list; `label` is announced, not shown (the design has no loading text). */
export function EventListSkeleton({ label }: { label: string }) {
	return (
		<div aria-busy="true">
			<p role="status" className="sr-only">
				{label}
			</p>
			<div className="flex flex-col">
				{[0, 1].map((i) => (
					<div key={i} className="mb-6 border-b border-muted pb-5 last:border-b-0">
						<EventCardSkeleton />
					</div>
				))}
			</div>
		</div>
	)
}

/**
 * Empty / error / location messages. Not designed (no export exists): these use the
 * app's established state pattern, flattened to sit inside the left pane.
 * "alert" is announced immediately and is used for failures.
 */
export function StateMessage({
	icon,
	title,
	description,
	children,
	tone = "status",
}: {
	icon?: ReactNode
	title: string
	description?: string
	children?: ReactNode
	tone?: "status" | "alert"
}) {
	return (
		<div role={tone} className="flex flex-col items-center px-2 py-10 text-center">
			{icon && (
				<div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					{icon}
				</div>
			)}
			<h2 className="mb-1.5 text-[15px] font-bold leading-tight text-foreground">{title}</h2>
			{description && (
				<p className="max-w-xs text-[12.5px] leading-relaxed text-muted-foreground">
					{description}
				</p>
			)}
			{children && (
				<div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{children}</div>
			)}
		</div>
	)
}

const BUTTON =
	"inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"

export const secondaryButton = cn(BUTTON, "border border-border text-foreground hover:bg-muted")
export const primaryButton = cn(BUTTON, "bg-primary text-primary-foreground hover:bg-primary/90")

export function RetryButton({
	onClick,
	label = "Try again",
}: {
	onClick: () => void
	label?: string
}) {
	return (
		<button type="button" onClick={onClick} className={primaryButton}>
			<RotateCcw size={12} aria-hidden />
			{label}
		</button>
	)
}

/** Search field per the design: white, 1px border, blue magnifier, "Search…" placeholder. */
export function SearchField({
	value,
	onChange,
	label,
	placeholder = "Search…",
	disabled = false,
}: {
	value: string
	onChange: (value: string) => void
	label: string
	placeholder?: string
	disabled?: boolean
}) {
	return (
		<div className="relative w-full">
			<Search
				size={20}
				aria-hidden
				className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary"
			/>
			<input
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={label}
				placeholder={placeholder}
				disabled={disabled}
				maxLength={100}
				className="h-[45px] w-full rounded-xl border border-border bg-card pl-[52px] pr-4 text-base text-foreground outline-none caret-primary placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
			/>
		</div>
	)
}

/**
 * Single-column event list with a divider between items and infinite scroll. The
 * scroll container is the pane, not the window, so the sentinel only loads more
 * once the user nears the end of the pane. A failed or slow next page never hides
 * the events already loaded.
 */
export function EventList({
	events,
	hasNextPage,
	isFetchingNextPage,
	onLoadMore,
}: {
	events: EventCardData[]
	hasNextPage: boolean
	isFetchingNextPage: boolean
	onLoadMore: () => void
}) {
	const { ref, inView } = useInView({ fallbackInView: false })

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) onLoadMore()
	}, [inView, hasNextPage, isFetchingNextPage, onLoadMore])

	return (
		<>
			<ul>
				{events.map((event) => (
					<li key={event.id} className="mb-6 border-b border-muted pb-5 last:mb-0 last:border-b-0">
						<EventCard event={event} />
					</li>
				))}
			</ul>
			<div ref={ref} className="h-8" />
			{isFetchingNextPage && (
				<div role="status" className="flex justify-center py-4">
					<Loader2
						size={20}
						className="animate-spin text-primary"
						aria-label="Loading more events"
					/>
				</div>
			)}
		</>
	)
}
