import { TopBar } from "@/components/dashboard/top-bar"
import { EventRoomPlaceholder } from "@/components/events/event-room-placeholder"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
import { ReactNode } from "react"

/**
 * Events layout (own route group, like Messenger — the Social <Sidebar/> does not belong
 * here). Two flat white panels on a faint page background, as in the design: the left
 * pane (399 px on desktop) is the page's own content — location, search, Events / My
 * events, list — and the right pane is the selected-event area, a placeholder for now.
 * Below `lg` only the left pane shows. The shared TopBar is used unchanged.
 */
export default function EventsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-muted/40">
			<DashboardAuthBootstrap />
			<TopBar />

			<main className="flex flex-1 min-h-0 overflow-hidden px-3 pt-4 pb-4 sm:px-6 lg:px-9 lg:pt-6 lg:pb-8">
				<div className="flex min-w-0 flex-1 overflow-hidden bg-card">
					<div className="flex min-h-0 w-full flex-col lg:w-[399px] lg:shrink-0">{children}</div>
					<EventRoomPlaceholder />
				</div>
			</main>
		</div>
	)
}
