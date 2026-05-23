import { FriendsSuggestion } from "@/components/dashboard/friend-suggestions"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { ReactNode } from "react"

export default function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen flex flex-col overflow-hidden bg-gray-50/70">
			<TopBar />

			<div className="flex flex-1 min-h-0 gap-5 px-6 pt-5 overflow-hidden w-full mx-auto">
				<Sidebar />
				{children}
				<FriendsSuggestion />
			</div>
		</div>
	)
}
