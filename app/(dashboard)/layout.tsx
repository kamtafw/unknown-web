import { FriendsSuggestion } from "@/components/dashboard/friend-suggestions"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-50/70">
			<TopBar />

			<div className="flex flex-1 min-h-0 gap-5 px-2 sm:px-4 lg:px-6 pt-3 sm:pt-5 overflow-hidden w-full mx-auto">
				<div className="hidden lg:block">
					<Sidebar />
				</div>

				<div className="flex-1 min-w-0 overflow-hidden">{children}</div>

				<div className="hidden lg:block">
					<FriendsSuggestion />
				</div>
			</div>

			<MobileNav />
		</div>
	)
}
