"use client"

import { useEffect } from "react"
import { useEventDetails } from "@/hooks/events/use-event-details"
import { useEventSelection } from "@/hooks/events/use-event-selection"
import type { EventFullDetails } from "@/types/events/api"
import { CalendarX2, ChevronLeft, LinkIcon, ShieldAlert, WifiOff, X } from "lucide-react"
import type { ReactNode } from "react"
import { EventDetailsView } from "./event-details-view"
import { EventForm } from "./event-form"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"
import { EventRoomPlaceholder } from "./event-room-placeholder"

/**
 * Right pane. What it shows comes from the URL (`useEventSelection`): nothing, the create form,
 * an event (full details or restricted preview) or its edit form. Below `lg` an open pane takes
 * the whole width (the list is hidden by `EventsShell`), so it carries its own way back.
 */
function PaneFrame({ onClose, children }: { onClose: () => void; children: ReactNode }) {
	return (
		<aside
			aria-label="Selected event"
			data-event-open="true"
			className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto border-l border-muted"
		>
			<div className="flex shrink-0 justify-start px-4 pt-4 sm:px-8 lg:justify-end">
				<button
					type="button"
					onClick={onClose}
					aria-label="Close event"
					className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
				>
					<ChevronLeft size={16} aria-hidden className="lg:hidden" />
					<span aria-hidden className="lg:hidden">
						Events
					</span>
					<X size={16} aria-hidden className="hidden lg:block" />
				</button>
			</div>
			{children}
		</aside>
	)
}

function PaneSkeleton() {
	return (
		<div aria-busy="true" className="mx-auto flex w-full max-w-3xl animate-pulse flex-col gap-5 px-4 py-6 sm:px-8">
			<p role="status" className="sr-only">
				Loading event…
			</p>
			<div className="aspect-[16/7] w-full rounded-xl bg-muted" />
			<div className="h-6 w-2/3 rounded-full bg-muted" />
			<div className="h-4 w-1/2 rounded-full bg-muted" />
			<div className="h-4 w-1/3 rounded-full bg-muted" />
		</div>
	)
}

function Centered({ children }: { children: ReactNode }) {
	return <div className="mx-auto w-full max-w-md px-4 py-6">{children}</div>
}

/** loading / unavailable / error states shared by the view and edit screens */
function useEventScreen(eventId: string) {
	const { selection, go, setTab } = useEventSelection()
	const loaded = useEventDetails(eventId)
	const close = () => go({ mode: "none" }, { replace: true })

	let blocker: ReactNode = null
	switch (loaded.status) {
		case "invalid":
			blocker = (
				<Centered>
					<StateMessage
						tone="alert"
						icon={<LinkIcon size={24} aria-hidden />}
						title="This event link isn't valid"
						description="The link may be incomplete or mistyped."
					>
						<button type="button" onClick={close} className={secondaryButton}>
							Back to events
						</button>
					</StateMessage>
				</Centered>
			)
			break
		case "unavailable":
			blocker = (
				<Centered>
					<StateMessage
						tone="alert"
						icon={<CalendarX2 size={24} aria-hidden />}
						title="This event isn't available"
						description="It may have been deleted, or you may not have access to it."
					>
						<button type="button" onClick={close} className={secondaryButton}>
							Back to events
						</button>
					</StateMessage>
				</Centered>
			)
			break
		case "error":
			blocker = (
				<Centered>
					<StateMessage
						tone="alert"
						icon={<WifiOff size={24} aria-hidden />}
						title="We couldn't load this event"
						description="Something went wrong while fetching it."
					>
						<RetryButton onClick={() => void loaded.refetch()} />
					</StateMessage>
				</Centered>
			)
			break
		case "loading":
		case "none":
			blocker = <PaneSkeleton />
			break
	}

	return { ...loaded, selection, go, setTab, close, blocker }
}

function EventView({ eventId }: { eventId: string }) {
	const { details, isHost, selection, go, setTab, close, blocker } = useEventScreen(eventId)

	useEffect(() => {
		if (details?.kind === "preview" && selection.mode === "view" && selection.tab !== "details") {
			go({ mode: "view", eventId, tab: "details" }, { replace: true })
		}
	}, [details, eventId, go, selection])

	return (
		<PaneFrame onClose={close}>
			{blocker ??
				(details && (
					<EventDetailsView
						key={details.id}
						details={details}
						isHost={isHost}
						onEdit={() => go({ mode: "edit", eventId })}
						onDeleted={close}
						tab={selection.mode === "view" ? selection.tab : "details"}
						onTabChange={setTab}
					/>
				))}
		</PaneFrame>
	)
}

function EventEdit({ eventId }: { eventId: string }) {
	const { details, isHost, go, close, blocker } = useEventScreen(eventId)
	const back = () => go({ mode: "view", eventId }, { replace: true })

	let body: ReactNode = blocker
	if (!body) {
		if (details?.kind === "full" && isHost) {
			const full: EventFullDetails = details
			body = <EventForm key={full.id} mode="edit" details={full} onDone={back} onCancel={back} />
		} else {
			body = (
				<Centered>
					<StateMessage
						tone="alert"
						icon={<ShieldAlert size={24} aria-hidden />}
						title="Only hosts can edit this event"
						description="You can view its details instead."
					>
						<button type="button" onClick={back} className={secondaryButton}>
							View event
						</button>
					</StateMessage>
				</Centered>
			)
		}
	}

	return <PaneFrame onClose={close}>{body}</PaneFrame>
}

export function EventPane() {
	const { selection, go } = useEventSelection()

	switch (selection.mode) {
		case "none":
			return <EventRoomPlaceholder />
		case "create":
			return (
				<PaneFrame onClose={() => go({ mode: "none" }, { replace: true })}>
					<EventForm
						mode="create"
						onDone={(id) =>
							go(id ? { mode: "view", eventId: id } : { mode: "none" }, { replace: true })
						}
						onCancel={() => go({ mode: "none" }, { replace: true })}
					/>
				</PaneFrame>
			)
		case "view":
			return <EventView key={selection.eventId} eventId={selection.eventId} />
		case "edit":
			return <EventEdit key={selection.eventId} eventId={selection.eventId} />
	}
}
