"use client"

import { formatListDate } from "@/lib/events/format"
import type { EventCard as EventCardData } from "@/types/events/api"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import Image from "next/image"

/** cover ratio taken from the design export (352 × 132) */
const COVER = "relative aspect-[352/132] overflow-hidden rounded-xl bg-muted"

/**
 * Solid padlock as drawn in the design (slate shackle, orange body, white keyhole).
 * The design's icon file was not exported, so this is a redraw from the screenshot;
 * the colours are sampled from it and are fixed on purpose: the badge sits on a
 * photo, so it must not change with the theme.
 */
function LockGlyph() {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
			<path
				d="M8 10.5V8a4 4 0 0 1 8 0v2.5"
				stroke="#33395B"
				strokeWidth="2.2"
				strokeLinecap="round"
			/>
			<rect x="4.5" y="10" width="15" height="11.5" rx="3.5" fill="#FD8650" />
			<circle cx="12" cy="14.6" r="1.6" fill="#fff" />
			<rect x="11.3" y="15" width="1.4" height="3.2" rx="0.7" fill="#fff" />
		</svg>
	)
}

/**
 * Event list item, image-first and borderless as in the design: cover with a lock
 * chip for passcode events, title, address, then either "LIVE NOW!" or the date/time.
 *
 * Deliberately NOT shown (not in the design, or not safe to show yet): distance,
 * hashtags, host, privacy/RSVP chips, and the attendee avatar stack. The stack
 * needs a backend contract: the list payload's `guests` includes offline guests,
 * so it is neither read nor represented in `EventCardData` (docs/events/EVENTS.md, EV-011).
 *
 * Not a link yet: opening an event is Pass 2. Cover images use `unoptimized`
 * because the media host has not been verified against next.config's allowed hosts.
 */
export function EventCard({ event }: { event: EventCardData }) {
	const when = formatListDate(event)

	return (
		<article aria-label={event.name} className="flex flex-col">
			<div className={COVER}>
				{event.coverImage ? (
					<Image
						src={event.coverImage}
						alt=""
						fill
						unoptimized
						sizes="(min-width: 1024px) 351px, 100vw"
						className="object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 text-primary/60">
						<CalendarDays size={32} aria-hidden />
					</div>
				)}

				{event.isLocked && (
					<span
						role="img"
						aria-label="Passcode required"
						className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full bg-white/90 sm:right-6"
					>
						<LockGlyph />
					</span>
				)}
			</div>

			<h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-foreground">
				{event.name}
			</h3>

			<div className="mt-2 flex items-center justify-between gap-3 text-[12px]">
				{event.address ? (
					<p className="flex min-w-0 items-center gap-1.5 font-semibold text-foreground">
						<MapPin
							size={14}
							className="shrink-0 fill-primary text-primary [&_circle]:fill-card"
							aria-hidden
						/>
						<span className="truncate">{event.address}</span>
					</p>
				) : (
					<span />
				)}

				{event.isLive ? (
					// the design draws this row's icon in the same blue as the date row; only the text is red
					<p className="flex shrink-0 items-center gap-1.5 font-semibold uppercase text-destructive">
						<Clock size={13} className="text-primary" aria-hidden />
						Live now!
					</p>
				) : (
					when && (
						<time
							dateTime={event.startDate}
							className="flex shrink-0 items-center gap-1.5 text-muted-foreground"
						>
							<Clock size={13} className="text-primary" aria-hidden />
							<span>
								<span className="font-semibold text-foreground">{when.day}</span>
								{when.time && ` ${when.time}`}
							</span>
						</time>
					)
				)}
			</div>
		</article>
	)
}

export function EventCardSkeleton() {
	return (
		<div aria-hidden className="animate-pulse">
			<div className={COVER} />
			<div className="mt-3 h-4 w-3/5 rounded-full bg-muted" />
			<div className="mt-3 flex items-center justify-between gap-3">
				<div className="h-3 w-2/5 rounded-full bg-muted" />
				<div className="h-3 w-1/4 rounded-full bg-muted" />
			</div>
		</div>
	)
}
