"use client"

import { useMyEvents } from "@/hooks/events/use-my-events"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { CalendarX2, SearchX, WifiOff } from "lucide-react"
import { useState } from "react"
import { EventGrid, EventGridSkeleton, RetryButton, SearchField, StateMessage } from "./event-list"

/**
 * Events the viewer hosts or has a guest record for, at any distance. Needs no location.
 * Includes past events and events the viewer has left (the guest record remains), so it
 * is not an "upcoming" or "currently joined" list.
 */
export function MyEventsList() {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const term = debouncedSearch.trim()
	const myEvents = useMyEvents(debouncedSearch)

	let body
	if (myEvents.isInitialLoading) {
		body = <EventGridSkeleton label={term ? "Searching your events…" : "Loading your events…"} />
	} else if (myEvents.isError) {
		body = (
			<StateMessage
				tone="alert"
				icon={<WifiOff size={24} aria-hidden />}
				title="We couldn't load your events"
				description="Something went wrong while fetching your events."
			>
				<RetryButton onClick={() => void myEvents.refetch()} />
			</StateMessage>
		)
	} else if (myEvents.events.length === 0) {
		body = term ? (
			<StateMessage
				icon={<SearchX size={24} aria-hidden />}
				title={`No events match “${term}”`}
				description="Search matches event names and tags. Try a different word."
			/>
		) : (
			<StateMessage
				icon={<CalendarX2 size={24} aria-hidden />}
				title="No events yet"
				description="Events you host or join will show up here, including past ones."
			/>
		)
	} else {
		body = (
			<EventGrid
				events={myEvents.events}
				hasNextPage={myEvents.hasNextPage}
				isFetchingNextPage={myEvents.isFetchingNextPage}
				onLoadMore={() => void myEvents.fetchNextPage()}
			/>
		)
	}

	return (
		<section aria-label="My events" className="flex flex-col gap-4">
			<SearchField
				value={search}
				onChange={setSearch}
				label="Search my events"
				placeholder="Search my events"
			/>
			{body}
		</section>
	)
}
