import { TopBar } from "@/components/dashboard/top-bar"
import { EventsHeader } from "@/components/events/events-header"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
import { ReactNode } from "react"

/**
 * Events has its own layout, like Messenger (D-004): the Social <Sidebar/> in
 * app/(dashboard)/layout.tsx does not belong here. Figma could not be read when
 * this was built, so the shell is an assumption: shared TopBar, a single centred
 * content column, and route-based Discover / My Events tabs.
 */
export default function EventsLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-background">
			<DashboardAuthBootstrap />
			<TopBar />

			<main className="flex-1 min-h-0 overflow-y-auto">
				<div className="mx-auto w-full max-w-6xl px-3 sm:px-6 py-4 sm:py-6">
					<EventsHeader />
					{children}
				</div>
			</main>
		</div>
	)
}
