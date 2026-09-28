import { TopBar } from "@/components/dashboard/top-bar"
import { MediaViewerProvider } from "@/components/messenger/media/media-viewer-context"
import { MessengerE2eeBootstrap } from "@/components/messenger/messenger-e2ee-bootstrap"
import { MessengerE2eeRecoverySurface } from "@/components/messenger/messenger-e2ee-debug-panel"
import { MessengerFreshLoadGuard } from "@/components/messenger/messenger-fresh-load-guard"
import { MessengerShell } from "@/components/messenger/messenger-shell"
import { MessengerSocketBootstrap } from "@/components/messenger/messenger-socket-bootstrap"
import { MessengerRail } from "@/components/messenger/rail/messenger-rail"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
import { ReactNode } from "react"

/**
 * D-004: Messenger cannot live under app/(dashboard)/layout.tsx because
 * that layout unconditionally wraps children in the Social <Sidebar/>,
 * which the approved Messenger design doesn't have. Reuses <TopBar/> and
 * <DashboardAuthBootstrap/> directly (same current-user fetch, no
 * duplicate /api/users/me call) rather than rebuilding either.
 */
export default function MessengerLayout({ children }: { children: ReactNode }) {
	return (
		<MediaViewerProvider>
			<div className="h-screen flex flex-col overflow-hidden bg-background">
				<DashboardAuthBootstrap />
				<MessengerSocketBootstrap />
				<MessengerE2eeBootstrap />
				<MessengerE2eeRecoverySurface />
				<MessengerFreshLoadGuard />
				<TopBar />

				<div className="flex flex-1 min-h-0 overflow-hidden">
					<MessengerRail />
					<MessengerShell>{children}</MessengerShell>
				</div>
			</div>
		</MediaViewerProvider>
	)
}
