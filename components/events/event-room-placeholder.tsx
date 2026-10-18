import { CalendarDays } from "lucide-react"

/**
 * Right pane of the two-pane layout. In the design it holds the selected event's room
 * (host header, hero, comments, actions); that belongs to later phases, so for now it
 * is a neutral placeholder. Cards are not selectable yet, so nothing here reacts to the list.
 * Hidden below `lg`, where the list takes the full width (no mobile design was supplied).
 */
export function EventRoomPlaceholder() {
	return (
		<aside
			aria-label="Selected event"
			className="hidden min-w-0 flex-1 items-center justify-center border-l border-muted p-8 lg:flex"
		>
			<div className="flex max-w-xs flex-col items-center text-center">
				<div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<CalendarDays size={24} aria-hidden />
				</div>
				<h2 className="mb-1.5 text-[15px] font-bold leading-tight text-foreground">
					No event selected
				</h2>
				<p className="text-[12.5px] leading-relaxed text-muted-foreground">
					Event details will appear here.
				</p>
			</div>
		</aside>
	)
}
