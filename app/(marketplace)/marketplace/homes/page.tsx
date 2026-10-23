import { BuyerMarketplace } from "@/components/marketplace/buyer-marketplace"
import { TopBar } from "@/components/dashboard/top-bar"
import { DashboardAuthBootstrap } from "@/providers/dashboard-auth-bootstrap"
export default function BuyerPage() {
	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<DashboardAuthBootstrap />
			<TopBar />
			<BuyerMarketplace />
		</div>
	)
}
