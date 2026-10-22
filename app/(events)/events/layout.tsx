import { TopBar } from "@/components/dashboard/top-bar"
import { EventsShell } from "@/components/events/events-shell"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
import { ReactNode } from "react"

/**
 * Events layout (own route group, like Messenger — the Social <Sidebar/> does not belong
 * here). Two flat white panels on a faint page background, as in the design: the left
 * pane (399 px on desktop) is the page's own content — location, search, Events / My
 * events, list — and the right pane is the event area (details, restricted preview, create and
 * edit), driven by `?event=` / `&edit=1` / `?create=1` (see EventsShell). The shared TopBar is
 * used unchanged.
 */
export default function EventsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-muted/40">
			<DashboardAuthBootstrap />
			<TopBar />

			<main className="flex flex-1 min-h-0 overflow-hidden px-3 pt-4 pb-4 sm:px-6 lg:px-9 lg:pt-6 lg:pb-8">
				<EventsShell>{children}</EventsShell>
			</main>
		</div>
	)
}
