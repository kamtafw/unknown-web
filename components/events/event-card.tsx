"use client"

import { formatDistance, formatEventSchedule } from "@/lib/events/format"
import { cn, getInitials } from "@/lib/utils"
import type { EventCard as EventCardData, EventRsvpStatus } from "@/types/events/api"
import { CalendarDays, Lock, MapPin, Radio } from "lucide-react"
import Image from "next/image"

const RSVP_LABEL: Record<EventRsvpStatus, string> = {
	going: "Going",
	interested: "Interested",
	not_going: "Not going",
}

function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
				className,
			)}
		>
			{children}
		</span>
	)
}

/**
 * Discovery / My Events card. Renders only whitelisted summary fields; nothing here
 * is evidence of access to the event's room or resources (details arrive in Pass 2,
 * which is why the card is not a link yet).
 *
 * Cover images use `unoptimized` because the event media host has not been verified
 * against next.config's allowed image hosts.
 */
export function EventCard({ event }: { event: EventCardData }) {
	const schedule = formatEventSchedule(event)
	const distance = formatDistance(event.distanceKm)
	const host = event.hosts[0]
	const tags = event.hashtags.slice(0, 3)

	return (
		<article
			aria-label={event.name}
			className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
		>
			<div className="relative aspect-video bg-muted">
				{event.coverImage ? (
					<Image
						src={event.coverImage}
						alt=""
						fill
						unoptimized
						sizes="(min-width: 1280px) 384px, (min-width: 640px) 50vw, 100vw"
						className="object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 text-primary/60">
						<CalendarDays size={36} aria-hidden />
					</div>
				)}

				<div className="absolute left-3 top-3 flex gap-1.5">
					{event.isLive && (
						<Chip className="bg-destructive text-destructive-foreground">
							<Radio size={11} aria-hidden /> Live
						</Chip>
					)}
				</div>
				{event.isLocked && (
					<Chip className="absolute right-3 top-3 bg-background/90 text-foreground backdrop-blur">
						<Lock size={11} aria-hidden /> Passcode
					</Chip>
				)}
			</div>

			<div className="flex flex-1 flex-col gap-2 p-4">
				<h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
					{event.name}
				</h3>

				{schedule && (
					<p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
						<CalendarDays size={13} className="shrink-0" aria-hidden />
						<span>{schedule}</span>
					</p>
				)}

				{(event.address || distance) && (
					<p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
						<MapPin size={13} className="shrink-0" aria-hidden />
						{event.address && <span className="truncate">{event.address}</span>}
						{distance && <span className="shrink-0 font-medium text-foreground">{distance}</span>}
					</p>
				)}

				{tags.length > 0 && (
					<ul className="flex flex-wrap gap-1.5" aria-label="Tags">
						{tags.map((tag) => (
							<li key={tag}>
								<Chip className="bg-accent text-primary">#{tag}</Chip>
							</li>
						))}
					</ul>
				)}

				<div className="mt-auto flex items-center justify-between gap-2 pt-2">
					{host ? (
						<div className="flex min-w-0 items-center gap-2">
							{host.photo ? (
								<Image
									src={host.photo}
									alt=""
									width={24}
									height={24}
									unoptimized
									className="size-6 shrink-0 rounded-full object-cover"
								/>
							) : (
								<span
									aria-hidden
									className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground"
								>
									{getInitials(host.name)}
								</span>
							)}
							<span className="truncate text-[12px] text-muted-foreground">
								Hosted by <span className="font-medium text-foreground">{host.name}</span>
							</span>
						</div>
					) : (
						<span />
					)}

					<div className="flex shrink-0 items-center gap-1.5">
						{event.privacy && event.privacy !== "public" && (
							<Chip className="bg-muted capitalize text-muted-foreground">{event.privacy}</Chip>
						)}
						{event.viewerRsvp && (
							<Chip className="bg-primary/10 text-primary">{RSVP_LABEL[event.viewerRsvp]}</Chip>
						)}
					</div>
				</div>
			</div>
		</article>
	)
}

export function EventCardSkeleton() {
	return (
		<div
			aria-hidden
			className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
		>
			<div className="aspect-video bg-muted" />
			<div className="space-y-3 p-4">
				<div className="h-4 w-4/5 rounded-full bg-muted" />
				<div className="h-3 w-3/5 rounded-full bg-muted" />
				<div className="h-3 w-2/5 rounded-full bg-muted" />
				<div className="flex items-center gap-2 pt-2">
					<div className="size-6 rounded-full bg-muted" />
					<div className="h-3 w-1/3 rounded-full bg-muted" />
				</div>
			</div>
		</div>
	)
}
