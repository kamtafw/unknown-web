"use client"

import { useEventAddress } from "@/hooks/events/use-event-address"
import { useGeolocation } from "@/hooks/events/use-geolocation"
import { useNearbyEvents } from "@/hooks/events/use-nearby-events"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { NEARBY_RADIUS_KM } from "@/lib/events/constants"
import { CalendarX2, SearchX, WifiOff } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"
import { useState } from "react"
import {
	EventList,
	EventListSkeleton,
	RetryButton,
	StateMessage,
	secondaryButton,
} from "./event-list"
import { EventsPane } from "./events-pane"
import { LocationRow } from "./location-row"
import { LocationState } from "./location-state"

/**
 * Nearby-only discovery. The states are deliberately distinct:
 * finding location → location required/unavailable → loading → failed → empty → results.
 * No state ever substitutes a broader list: when location fails, discovery is empty.
 *
 * The location row appears here and not on My events: showing it there would mean
 * requesting browser location on a tab that does not need it (docs/events/EVENTS.md, EV-013).
 */
export function NearbyDiscovery() {
	const location = useGeolocation()
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)

	const address = useEventAddress(location.coordinates)
	const nearby = useNearbyEvents(location.coordinates, debouncedSearch)

	const searching = debouncedSearch.trim().length > 0

	let body: ReactNode
	if (location.status === "locating") {
		body = <EventListSkeleton label="Finding your location…" />
	} else if (location.status !== "ready") {
		body = (
			<LocationState
				status={location.status}
				permission={location.permission}
				onRetry={location.refresh}
			/>
		)
	} else if (nearby.isInitialLoading || nearby.isScanning) {
		body = (
			<EventListSkeleton
				label={searching ? "Searching nearby events…" : "Loading nearby events…"}
			/>
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
					Go to My events
				</Link>
			</StateMessage>
		)
	} else {
		body = (
			<>
				{searching && nearby.coverage === "partial" && (
					<p role="status" className="mb-4 text-[12.5px] text-muted-foreground">
						Showing matches from the nearby events loaded so far.
					</p>
				)}
				<EventList
					events={nearby.events}
					hasNextPage={nearby.hasNextPage}
					isFetchingNextPage={nearby.isFetchingNextPage}
					onLoadMore={() => void nearby.fetchNextPage()}
				/>
			</>
		)
	}

	return (
		<EventsPane
			label="Events near you"
			location={
				<LocationRow status={location.status} address={address} onRefresh={location.refresh} />
			}
			search={{
				value: search,
				onChange: setSearch,
				label: "Search nearby events",
				// nothing to search until a location has been resolved
				disabled: location.status !== "ready",
			}}
		>
			{body}
		</EventsPane>
	)
}
