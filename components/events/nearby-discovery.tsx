"use client"

import { useEventAddress } from "@/hooks/events/use-event-address"
import { useGeolocation } from "@/hooks/events/use-geolocation"
import { useNearbyEvents } from "@/hooks/events/use-nearby-events"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { NEARBY_RADIUS_KM } from "@/lib/events/constants"
import { CalendarX2, MapPin, RefreshCw, SearchX, WifiOff } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
	EventGrid,
	EventGridSkeleton,
	RetryButton,
	SearchField,
	StateMessage,
	secondaryButton,
} from "./event-list"
import { LocationState } from "./location-state"

/**
 * Nearby-only discovery. The states are deliberately distinct:
 * finding location → location required/unavailable → loading → failed → empty → results.
 * No state ever substitutes a broader list: when location fails, discovery is empty.
 */
export function NearbyDiscovery() {
	const location = useGeolocation()
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)

	const address = useEventAddress(location.coordinates)
	const nearby = useNearbyEvents(location.coordinates, debouncedSearch)

	if (location.status === "locating") {
		return <EventGridSkeleton label="Finding your location…" />
	}

	if (location.status !== "ready") {
		return (
			<LocationState
				status={location.status}
				permission={location.permission}
				onRetry={location.refresh}
			/>
		)
	}

	const searching = debouncedSearch.trim().length > 0

	let body
	if (nearby.isInitialLoading || nearby.isScanning) {
		body = (
			<EventGridSkeleton label={searching ? "Searching nearby events…" : "Loading nearby events…"} />
		)
	} else if (nearby.isError) {
		body = (
			<StateMessage
				tone="alert"
				icon={<WifiOff size={24} aria-hidden />}
				title="We couldn't load nearby events"
				description="Something went wrong while fetching events near you."
			>
				<RetryButton onClick={() => void nearby.refetch()} />
			</StateMessage>
		)
	} else if (nearby.events.length === 0) {
		body = searching ? (
			<StateMessage
				icon={<SearchX size={24} aria-hidden />}
				title={
					nearby.coverage === "complete"
						? `No nearby events match “${debouncedSearch.trim()}”`
						: "No matches in the events loaded so far"
				}
				description={
					nearby.coverage === "complete"
						? "Try a different name, place or tag."
						: "Only some nearby events were searched. Load more to keep looking."
				}
			>
				{nearby.coverage !== "complete" && nearby.hasNextPage && (
					<RetryButton onClick={() => void nearby.fetchNextPage()} label="Load more events" />
				)}
			</StateMessage>
		) : (
			<StateMessage
				icon={<CalendarX2 size={24} aria-hidden />}
				title={`No events within ${NEARBY_RADIUS_KM} km right now`}
				description="Check back soon, or take a look at the events you host or have joined."
			>
				<Link href="/events/my-events" className={secondaryButton}>
					Go to My Events
				</Link>
			</StateMessage>
		)
	} else {
		body = (
			<>
				{searching && nearby.coverage === "partial" && (
					<p role="status" className="mb-3 text-[12.5px] text-muted-foreground">
						Showing matches from the nearby events loaded so far.
					</p>
				)}
				<EventGrid
					events={nearby.events}
					hasNextPage={nearby.hasNextPage}
					isFetchingNextPage={nearby.isFetchingNextPage}
					onLoadMore={() => void nearby.fetchNextPage()}
				/>
			</>
		)
	}

	return (
		<section aria-label="Events near you" className="flex flex-col gap-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<p className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground">
					<MapPin size={14} className="shrink-0 text-primary" aria-hidden />
					<span className="truncate">
						Within {NEARBY_RADIUS_KM} km of{" "}
						<span className="font-medium text-foreground">
							{address ?? "your current location"}
						</span>
					</span>
					<button
						type="button"
						onClick={location.refresh}
						aria-label="Refresh my location"
						className="ml-1 shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					>
						<RefreshCw size={13} aria-hidden />
					</button>
				</p>

				<SearchField
					value={search}
					onChange={setSearch}
					label="Search nearby events"
					placeholder="Search nearby events"
				/>
			</div>

			{body}
		</section>
	)
}
