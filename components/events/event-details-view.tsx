"use client"

import { formatEventSchedule } from "@/lib/events/format"
import { EVENT_TABS, type EventTab } from "@/lib/events/selection"
import { cn } from "@/lib/utils"
import type { EventDetails, EventFullDetails, EventHost, EventPrivacy } from "@/types/events/api"
import { CalendarDays, Clock, EyeOff, Lock, MapPin, Pencil, Radio } from "lucide-react"
import Image from "next/image"
import { Tabs } from "radix-ui"
import { DeleteEventDialog } from "./delete-event-dialog"
import { EventCommentsSection } from "./event-comments-section"
import { EventGuestsSection } from "./event-guests-section"
import { EventJoinControl } from "./event-join-control"
import { EventLiveSessionStatus } from "./event-live-session-status"
import { EventLiveSessionControls } from "./event-live-session-controls"
import { secondaryButton } from "./event-list"
import { EventResourcesSection } from "./event-resources-section"
import { RsvpControl } from "./rsvp-control"

const PRIVACY_LABEL: Record<EventPrivacy, string> = {
	public: "Public",
	friends: "Friends",
	private: "Private",
}

function Chip({
	children,
	tone = "muted",
}: {
	children: React.ReactNode
	tone?: "muted" | "live"
}) {
	return (
		<span
			className={
				tone === "live"
					? "inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-destructive"
					: "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground"
			}
		>
			{children}
		</span>
	)
}

const TAB_LABEL: Record<EventTab, string> = {
	details: "Details",
	comments: "Comments",
	resources: "Links and docs",
	guests: "Guests",
}

function Cover({ src }: { src: string | null }) {
	return (
		<div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-muted">
			{src ? (
				// `unoptimized`: the media host is not verified against next.config yet (EV-005)
				<Image
					src={src}
					alt=""
					fill
					unoptimized
					sizes="(min-width: 1024px) 640px, 100vw"
					className="object-cover"
				/>
			) : (
				<div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5 text-primary/60">
					<CalendarDays size={36} aria-hidden />
				</div>
			)}
		</div>
	)
}

function HostRow({ host }: { host: EventHost }) {
	const initial = (host.name || host.username || "?").trim().charAt(0).toUpperCase()
	return (
		<li className="flex items-center gap-3">
			<span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
				{host.photo ? (
					<Image src={host.photo} alt="" fill unoptimized sizes="36px" className="object-cover" />
				) : (
					initial
				)}
			</span>
			<span className="min-w-0">
				<span className="block truncate text-[13px] font-semibold text-foreground">
					{host.name}
				</span>
				{host.username && (
					<span className="block truncate text-[12px] text-muted-foreground">@{host.username}</span>
				)}
			</span>
		</li>
	)
}

/**
 * One event, full or restricted preview. The two are different shapes, not one with blanks: a
 * preview never shows hosts, resources or host controls, and its missing fields are "not
 * disclosed", not "empty". The full shape carries links and documents only so a host can edit
 * them; this view does not display them.
 *
 * A full event has sections (Details, Comments, Links and docs, Guests), selected by `tab` and
 * held in the URL by the caller (A-16). Details, Links and docs (P3-04), Comments (P3-05, P3-06)
 * and Guests (P3-07, read-only) each have their own content, fetched only while that section is
 * active. A restricted preview has no sections and ignores `tab`, so a
 * link with `&tab=` cannot reach one. Live-session host controls are separate from event edit/delete controls. The backend remains authoritative for every lifecycle mutation.
 */
export function EventDetailsView({
	details,
	isHost,
	onEdit,
	onDeleted,
	tab = "details",
	onTabChange,
}: {
	details: EventDetails
	isHost: boolean
	onEdit: () => void
	onDeleted: () => void
	/** the active section of a full event; ignored for a preview */
	tab?: EventTab
	onTabChange?: (tab: EventTab) => void
}) {
	const full: EventFullDetails | null = details.kind === "full" ? details : null
	const schedule = formatEventSchedule(details)
	const liveBlocked = details.isLive || full?.liveSessionStatus === "live"

	// the Details section; a restricted preview shows only this, with no section list
	const detailsBody = (
		<>
			<dl className="flex flex-col gap-2.5 text-[13px]">
				{schedule && (
					<div className="flex items-start gap-2.5">
						<dt className="sr-only">When</dt>
						<dd className="flex items-start gap-2.5 text-foreground">
							<Clock size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
							<span>{schedule}</span>
						</dd>
					</div>
				)}
				{details.address && (
					<div className="flex items-start gap-2.5">
						<dt className="sr-only">Where</dt>
						<dd className="flex items-start gap-2.5 text-foreground">
							<MapPin size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
							<span>{details.address}</span>
						</dd>
					</div>
				)}
			</dl>

			{details.hashtags.length > 0 && (
				<ul aria-label="Tags" className="flex flex-wrap gap-2">
					{details.hashtags.map((tag) => (
						<li
							key={tag}
							className="rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary"
						>
							#{tag}
						</li>
					))}
				</ul>
			)}

			{details.isLive && (
				<p className="rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
					This event is live. Join to request access to live audio.
				</p>
			)}

			{full && <EventLiveSessionStatus details={full} />}
			{full && <EventLiveSessionControls details={full} isHost={isHost} />}

			{(details.isLive || full?.liveSessionStatus === "live") && !isHost && (
				<EventJoinControl eventId={details.id} isLocked={details.isLocked} />
			)}

			{full ? (
				full.hosts.length > 0 && (
					<section aria-labelledby="hosts-heading" className="flex flex-col gap-3">
						<h2 id="hosts-heading" className="text-[13px] font-bold text-foreground">
							Hosted by
						</h2>
						<ul className="flex flex-col gap-3">
							{full.hosts.map((host) => (
								<HostRow key={host.id || host.username} host={host} />
							))}
						</ul>
					</section>
				)
			) : (
				<div
					role="note"
					className="flex items-start gap-3 rounded-xl border border-border px-3.5 py-3"
				>
					<EyeOff size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
					<p className="text-[12.5px] leading-relaxed text-muted-foreground">
						Some details are hidden. Hosts and resources are only shown to people who have been
						admitted to this event. If it has a passcode, you&apos;ll be asked for it when you join.
					</p>
				</div>
			)}

			<RsvpControl eventId={details.id} details={details} />
		</>
	)

	return (
		<article
			aria-label={details.name}
			className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-8"
		>
			<Cover src={details.coverImage} />

			<header className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center gap-2">
					{details.isLive && (
						<Chip tone="live">
							<Radio size={12} aria-hidden />
							Live now
						</Chip>
					)}
					{details.isLocked && (
						<Chip>
							<Lock size={12} aria-hidden />
							Passcode
						</Chip>
					)}
					{details.privacy && <Chip>{PRIVACY_LABEL[details.privacy]}</Chip>}
				</div>
				<h1 className="text-xl font-bold leading-snug text-foreground">{details.name}</h1>

				{isHost && full && (
					<div className="flex flex-wrap items-start gap-2.5">
						<button type="button" onClick={onEdit} className={secondaryButton}>
							<Pencil size={13} aria-hidden />
							Edit
						</button>
						<DeleteEventDialog
							eventId={details.id}
							eventName={details.name}
							liveBlocked={liveBlocked}
							onDeleted={onDeleted}
						/>
					</div>
				)}
			</header>

			{full ? (
				<Tabs.Root
					value={tab}
					onValueChange={(next) => onTabChange?.(next as EventTab)}
					className="flex flex-col gap-5"
				>
					<Tabs.List
						aria-label="Event sections"
						className="flex gap-1 overflow-x-auto rounded-full bg-muted p-1.5"
					>
						{EVENT_TABS.map((value) => (
							<Tabs.Trigger
								key={value}
								value={value}
								className={cn(
									"flex h-7 flex-1 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 text-[12px] font-medium text-foreground/80 transition-colors",
									"hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
									"data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
								)}
							>
								{TAB_LABEL[value]}
							</Tabs.Trigger>
						))}
					</Tabs.List>

					{/* every panel exists so each tab's `aria-controls` resolves; only the active
					    one renders content, and Details stays mounted so RSVP state survives a switch */}
					{EVENT_TABS.map((value) => (
						<Tabs.Content
							key={value}
							value={value}
							forceMount
							hidden={tab !== value}
							className="flex flex-col gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary data-[state=inactive]:hidden"
						>
							{value === "details"
								? detailsBody
								: tab === value &&
									(value === "resources" ? (
										<EventResourcesSection eventId={details.id} isHost={isHost} onEdit={onEdit} />
									) : value === "comments" ? (
										<EventCommentsSection eventId={details.id} />
									) : (
										<EventGuestsSection eventId={details.id} isHost={isHost} />
									))}
						</Tabs.Content>
					))}
				</Tabs.Root>
			) : (
				detailsBody
			)}
		</article>
	)
}
