import { TopBar } from "@/components/dashboard/top-bar"
import { SellerShell } from "@/components/marketplace/seller-shell"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Seller marketplace" }

export default function SellerLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<DashboardAuthBootstrap />
			<TopBar />
			<SellerShell>{children}</SellerShell>
		</div>
	)
}
