import { OrderTracking } from "@/components/marketplace/order-tracking"
export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
	return <OrderTracking id={Number((await params).id)} />
}
