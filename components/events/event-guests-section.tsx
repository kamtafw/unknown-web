"use client"

import { useEventGuests } from "@/hooks/events/use-event-guests"
import type { EventGuest } from "@/types/events/api"
import { Loader2, Lock, Search, ShieldAlert, Users, WifiOff } from "lucide-react"
import { Avatar } from "radix-ui"
import { useId, useMemo, useState } from "react"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"
import { RemoveGuestDialog } from "./remove-guest-dialog"

/** the contextual 403 text; the backend's own wording is never shown */
export const GUEST_LIST_FORBIDDEN = "Only the host and guests can see the guest list."

/** loaded rows whose name or username contains the term, case-insensitively, in their order */
function filterGuests(guests: EventGuest[], term: string): EventGuest[] {
	const needle = term.trim().toLowerCase()
	if (!needle) return guests
	return guests.filter(
		(g) => g.name.toLowerCase().includes(needle) || g.username.toLowerCase().includes(needle),
	)
}

function GuestRow({ guest, eventId, canRemove }: { guest: EventGuest; eventId: string; canRemove: boolean }) {
	const initial = guest.name.trim().charAt(0).toUpperCase() || "?"
	return (
		<li className="flex items-center gap-3">
			<Avatar.Root className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
				{guest.photo && <Avatar.Image src={guest.photo} alt="" className="size-full object-cover" />}
				<Avatar.Fallback aria-hidden>{initial}</Avatar.Fallback>
			</Avatar.Root>
			<span className="min-w-0 flex-1">
				<span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
					<span className="break-words text-[13px] font-semibold text-foreground">{guest.name}</span>
					{guest.role === "host" && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
							Host
						</span>
					)}
				</span>
				{guest.username && guest.username !== guest.name && (
					<span className="block break-all text-[12px] text-muted-foreground">@{guest.username}</span>
				)}
			</span>
			{canRemove && <RemoveGuestDialog eventId={eventId} guest={guest} />}
		</li>
	)
}

function Skeleton() {
	return (
		<div aria-busy="true" aria-label="Loading guests" className="flex animate-pulse flex-col gap-4">
			{[0, 1, 2, 3].map((i) => (
				<div key={i} className="flex items-center gap-3">
					<div className="size-9 shrink-0 rounded-full bg-muted" />
					<div className="h-3 w-1/3 rounded bg-muted" />
				</div>
			))}
		</div>
	)
}

/**
 * The "Guests" section of a full event: a read-only, paginated guest list (P3-07). Shows name,
 * `@username`, a `Host` badge for role `host` and an avatar with an initial fallback. RSVP
 * status, join date, contact details and online status are neither fetched into view nor shown
 * (A-17). "Search guest" filters only the rows loaded so far; it never makes a request, and while
 * more pages exist that is said plainly and Load more stays available. A host also sees a Remove action per row (P3-08A; `isHost` only shows it, the server decides). There is no add control (later task). Mounted only for a full event's active section.
 */
export function EventGuestsSection({ eventId, isHost = false }: { eventId: string; isHost?: boolean }) {
	const { guests, hasLoaded, isInitialLoading, error, phase, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
		useEventGuests(eventId)
	const [term, setTerm] = useState("")
	const searchId = useId()
	const searching = term.trim() !== ""
	const visible = useMemo(() => filterGuests(guests, term), [guests, term])

	if (isInitialLoading) return <Skeleton />

	if (!hasLoaded) {
		if (error === "forbidden") {
			return <StateMessage icon={<Lock size={22} aria-hidden />} title={GUEST_LIST_FORBIDDEN} />
		}
		if (error === "not_found") {
			return (
				<StateMessage
					tone="alert"
					icon={<ShieldAlert size={22} aria-hidden />}
					title="The guest list isn't available"
					description="This event may have been deleted, or its guest list can't be found."
				/>
			)
		}
		if (error === "unauthorized") {
			return (
				<StateMessage
					tone="alert"
					icon={<ShieldAlert size={22} aria-hidden />}
					title="Your session has expired"
					description="Sign in again to see the guest list."
				/>
			)
		}
		return (
			<StateMessage
				tone="alert"
				icon={<WifiOff size={22} aria-hidden />}
				title="Couldn't load the guest list"
				description="Check your connection and try again."
			>
				<RetryButton onClick={() => void refetch()} />
			</StateMessage>
		)
	}

	if (guests.length === 0 && !hasNextPage) {
		return (
			<StateMessage
				icon={<Users size={22} aria-hidden />}
				title="No guests yet"
				description="People who join this event will appear here."
			/>
		)
	}

	const failure =
		error && phase === "next-page"
			? error === "forbidden"
				? { title: GUEST_LIST_FORBIDDEN, description: "Showing the guests loaded earlier." }
				: { title: "Couldn't load more guests", description: "Showing the guests loaded earlier." }
			: null

	return (
		<section aria-labelledby="guests-heading" className="flex flex-col gap-4">
			<h2 id="guests-heading" className="text-[13px] font-bold text-foreground">
				Guests
			</h2>

			<div className="relative">
				<label htmlFor={searchId} className="sr-only">
					Search guest
				</label>
				<Search size={14} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
				<input
					id={searchId}
					type="search"
					value={term}
					onChange={(e) => setTerm(e.target.value)}
					placeholder="Search guest"
					autoComplete="off"
					className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				/>
			</div>

			{searching && hasNextPage && (
				<p role="status" className="text-[12px] text-muted-foreground">
					Searching loaded guests. Load more to search further.
				</p>
			)}

			{failure && (
				<div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[12.5px]">
					<p className="font-semibold text-foreground">{failure.title}</p>
					<p className="text-muted-foreground">{failure.description}</p>
				</div>
			)}

			{visible.length > 0 ? (
				<ul aria-label="Event guests" className="flex flex-col gap-3.5">
					{visible.map((guest) => (
						<GuestRow key={guest.userId} guest={guest} eventId={eventId} canRemove={isHost} />
					))}
				</ul>
			) : (
				searching && (
					<p role="status" className="py-6 text-center text-[13px] text-muted-foreground">
						{hasNextPage ? "No loaded guests match your search." : "No guests match your search."}
					</p>
				)
			)}

			{hasNextPage && (
				<button
					type="button"
					onClick={() => void fetchNextPage()}
					disabled={isFetchingNextPage}
					className={`${secondaryButton} self-center`}
				>
					{isFetchingNextPage && <Loader2 size={13} aria-hidden className="animate-spin" />}
					{isFetchingNextPage ? "Loading…" : phase === "next-page" ? "Try again" : "Load more"}
				</button>
			)}
		</section>
	)
}
