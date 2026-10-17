"use client"

import { cn } from "@/lib/utils"
import type { EventCard as EventCardData } from "@/types/events/api"
import { Loader2, RotateCcw, Search } from "lucide-react"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { EventCard, EventCardSkeleton } from "./event-card"

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"

export function EventGridSkeleton({ label }: { label: string }) {
	return (
		<div aria-busy="true">
			<p role="status" className="mb-3 text-[13px] text-muted-foreground">
				{label}
			</p>
			<div className={GRID}>
				{[0, 1, 2].map((i) => (
					<EventCardSkeleton key={i} />
				))}
			</div>
		</div>
	)
}

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
	/** "alert" is announced immediately; use it for failures */
	tone?: "status" | "alert"
}) {
	return (
		<div
			role={tone}
			className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center"
		>
			{icon && (
				<div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					{icon}
				</div>
			)}
			<h2 className="mb-1.5 text-[15px] font-bold leading-tight text-foreground">{title}</h2>
			{description && (
				<p className="max-w-sm text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>
			)}
			{children && <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">{children}</div>}
		</div>
	)
}

const BUTTON =
	"inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[12.5px] font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"

export const secondaryButton = cn(BUTTON, "border border-border text-foreground hover:bg-muted")
export const primaryButton = cn(BUTTON, "bg-primary text-primary-foreground hover:bg-primary/90")

export function RetryButton({ onClick, label = "Try again" }: { onClick: () => void; label?: string }) {
	return (
		<button type="button" onClick={onClick} className={primaryButton}>
			<RotateCcw size={12} aria-hidden />
			{label}
		</button>
	)
}

export function SearchField({
	value,
	onChange,
	label,
	placeholder,
}: {
	value: string
	onChange: (value: string) => void
	label: string
	placeholder: string
}) {
	return (
		<div className="relative w-full sm:max-w-sm">
			<Search
				size={14}
				aria-hidden
				className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
			/>
			<input
				type="search"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				aria-label={label}
				placeholder={placeholder}
				maxLength={100}
				className="h-10 w-full rounded-full border border-border bg-muted pl-9 pr-4 text-sm text-foreground outline-none caret-primary placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
			/>
		</div>
	)
}

/** Event cards with infinite scroll; a failed or slow next page never hides loaded cards. */
export function EventGrid({
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
	const { ref, inView } = useInView({ rootMargin: "300px", fallbackInView: false })

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) onLoadMore()
	}, [inView, hasNextPage, isFetchingNextPage, onLoadMore])

	return (
		<>
			<ul className={GRID}>
				{events.map((event) => (
					<li key={event.id} className="flex">
						<div className="w-full">
							<EventCard event={event} />
						</div>
					</li>
				))}
			</ul>
			<div ref={ref} className="h-1" />
			{isFetchingNextPage && (
				<div role="status" className="flex justify-center py-8">
					<Loader2 size={20} className="animate-spin text-primary" aria-label="Loading more events" />
				</div>
			)}
		</>
	)
}
