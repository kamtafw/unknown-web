"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { EventsSidebar } from "@/components/events/events-sidebar"
import { usePathname } from "next/navigation"

export function DashboardSidebarSwitch() {
	const pathname = usePathname()
	return pathname === "/events" || pathname.startsWith("/events/") ? <EventsSidebar /> : <Sidebar />
}
