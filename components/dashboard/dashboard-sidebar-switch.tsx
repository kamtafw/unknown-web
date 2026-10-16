"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { EventsSidebar } from "@/components/events/events-sidebar"

export function DashboardSidebarSwitch() {
  const pathname = usePathname()
  return pathname === "/events" || pathname.startsWith("/events/")
    ? <EventsSidebar />
    : <Sidebar />
}
