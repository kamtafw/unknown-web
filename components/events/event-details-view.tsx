"use client"

import { formatEventSchedule } from "@/lib/events/format"
import type { EventTab } from "@/lib/events/selection"
import type { EventDetails, EventFullDetails, EventHost, EventPrivacy, EventResources } from "@/types/events/api"
import { CalendarDays, Clock, EyeOff, Lock, MapPin, Pencil, Radio } from "lucide-react"
import Image from "next/image"
import { DeleteEventDialog } from "./delete-event-dialog"
import { secondaryButton } from "./event-list"
import { RsvpControl } from "./rsvp-control"
import { EventResourcesSection } from "./event-resources-section"

const PRIVACY_LABEL: Record<EventPrivacy, string> = {
	public: "Public",
	friends: "Friends",
	private: "Private",
}

function Chip({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "live" }) {
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

function Cover({ src }: { src: string | null }) {
	return (
		<div className="relative aspect-[16/7] w-full overflow-hidden rounded-xl bg-muted">
			{src ? (
				// `unoptimized`: the media host is not verified against next.config yet (EV-005)
				<Image src={src} alt="" fill unoptimized sizes="(min-width: 1024px) 640px, 100vw" className="object-cover" />
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
				<span className="block truncate text-[13px] font-semibold text-foreground">{host.name}</span>
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
 * disclosed", not "empty". Links and documents are read through the
 * permission-gated resources query; the full details fields remain the source for the existing
 * host edit form.
 *
 * Joining, guests and comments are later passes, so a live event only gets a "Live now" mark
 * and a note. Full-access section navigation is URL-backed; comments and guests remain placeholders.
 * Host controls are shown by a UUID match and the server stays authoritative.
 */
export function EventDetailsView({
	details,
	isHost,
	onEdit,
	onDeleted,
	tab = "details",
	onTabChange = () => {},
	resourcesState,
}: {
	details: EventDetails
	isHost: boolean
	onEdit: () => void
	onDeleted: () => void
	tab?: EventTab
	onTabChange?: (tab: EventTab) => void
	resourcesState?: {
		data: EventResources | undefined
		isLoading: boolean
		isError: boolean
		error: unknown
		onRetry: () => void
	}
}) {
	const full: EventFullDetails | null = details.kind === "full" ? details : null
	const schedule = formatEventSchedule(details)
	const liveBlocked = details.isLive || full?.liveSessionStatus === "live"
	const activeTab: EventTab = full ? tab : "details"
	const tabLabels: Record<EventTab, string> = {
		details: "Details",
		comments: "Comments",
		resources: "Links and docs",
		guests: "Guests",
	}
	const tabs: EventTab[] = ["details", "comments", "resources", "guests"]

	return (
		<article aria-label={details.name} className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-8">
			<Cover src={details.coverImage} />

			{full && (
				<div role="tablist" aria-label="Event sections" className="flex flex-wrap gap-1 border-b border-border" onKeyDown={(event) => {
					if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return
					event.preventDefault()
					const currentIndex = tabs.indexOf(activeTab)
					const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (currentIndex + (event.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length
					const nextTab = tabs[nextIndex] ?? "details"
					document.getElementById(`event-tab-${nextTab}`)?.focus()
					onTabChange(nextTab)
				}}>
					{tabs.map((item) => (
						<button key={item} id={`event-tab-${item}`} type="button" role="tab"
							aria-selected={activeTab === item} aria-controls={`event-panel-${item}`}
							tabIndex={activeTab === item ? 0 : -1} onClick={() => onTabChange(item)}
							className={`border-b-2 px-3 py-3 text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${activeTab === item ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
							{tabLabels[item]}
						</button>
					))}
				</div>
			)}

			{full && activeTab !== "details" ? (
				<section id={`event-panel-${activeTab}`} role="tabpanel" aria-labelledby={`event-tab-${activeTab}`} className="min-h-40 py-4">
					{activeTab === "resources" && resourcesState ? (
						<>
							<h2 className="text-base font-bold text-foreground">{tabLabels[activeTab]}</h2>
							<EventResourcesSection
								resources={resourcesState.data}
								isLoading={resourcesState.isLoading}
								isError={resourcesState.isError}
								error={resourcesState.error}
								isHost={isHost}
								onEdit={onEdit}
								onRetry={resourcesState.onRetry}
							/>
						</>
					) : (
						<>
							<h2 className="text-base font-bold text-foreground">{tabLabels[activeTab]}</h2>
							<p className="mt-2 text-sm text-muted-foreground">This section will be available in a later step.</p>
						</>
					)}
				</section>
			) : (
			<section id="event-panel-details" role={full ? "tabpanel" : undefined} aria-labelledby={full ? "event-tab-details" : undefined} className="flex flex-col gap-5">
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
						<li key={tag} className="rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary">
							#{tag}
						</li>
					))}
				</ul>
			)}

			{details.isLive && (
				<p className="rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
					This event is live. Joining live events isn&apos;t available in the web app yet.
				</p>
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
				<div role="note" className="flex items-start gap-3 rounded-xl border border-border px-3.5 py-3">
					<EyeOff size={16} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
					<p className="text-[12.5px] leading-relaxed text-muted-foreground">
						Some details are hidden. Hosts and resources are only shown to people who have been
						admitted to this event. If it has a passcode, you&apos;ll be asked for it when you join.
					</p>
				</div>
			)}

			<RsvpControl eventId={details.id} details={details} />
			</section>
			)}
		</article>
	)
}
