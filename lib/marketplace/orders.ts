import type { OrderStatus, SellerOrder } from "@/types/marketplace"

export const orderKeys = {
	all: ["marketplace", "orders"] as const,
	detail: (id: number) => ["marketplace", "order", id] as const,
}
export const orderStatuses: Record<
	OrderStatus,
	{ label: string; color: string }
> = {
	pending: {
		label: "Awaiting payment",
		color: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
	},
	paid: { label: "To ship", color: "bg-primary/10 text-primary" },
	shipped: {
		label: "Shipped",
		color: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
	},
	delivered: {
		label: "Delivered",
		color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	},
	cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
	refunded: { label: "Refunded", color: "bg-destructive/10 text-destructive" },
	partially_refunded: {
		label: "Partially refunded",
		color: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
	},
}

export function nextOrderStatus(status: OrderStatus): "shipped" | null {
	return status === "paid" || status === "partially_refunded" ? "shipped" : null
}

export function orderMatches(order: SellerOrder, search: string) {
	const text = search.trim().replace(/^#/, "").toLowerCase()
	return (
		!text ||
		[
			String(order.id),
			order.shipping_address?.full_name || "",
			...order.items.map((item) => item.product_name),
		].some((value) => value.toLowerCase().includes(text))
	)
}

export function orderActivity(order: SellerOrder) {
	switch (order.status) {
		case "paid":
			return {
				title: `You have a new paid order #${order.id}`,
				description: "Payment is confirmed. Get this order ready to ship.",
				kind: "new",
			}
		case "shipped":
			return {
				title: `Order #${order.id} is on its way`,
				description:
					"This order is shipped and awaiting independent delivery verification.",
				kind: "shipped",
			}
		case "delivered":
			return {
				title: `Order #${order.id} has been delivered`,
				description:
					"This order is marked as delivered. View the order details and items.",
				kind: "delivered",
			}
		default:
			return {
				title: `Order #${order.id} · ${orderStatuses[order.status].label}`,
				description:
					order.status === "pending"
						? "Payment has not been confirmed yet. Wait for payment before shipping."
						: "View this order to see its current status and payment summary.",
				kind: "other",
			}
	}
}

export function fulfilmentSteps(order: SellerOrder) {
	const progress = order.delivery_verified_at
		? 3
		: order.status === "partially_refunded"
			? order.tracking_events?.some(
					(event) =>
						event.checkpoint === "collected" && event.status === "successful",
				)
				? 2
				: 1
			: ["pending", "paid", "shipped", "delivered"].indexOf(order.status)
	const timestamp = (checkpoint: string) =>
		order.tracking_events?.find(
			(event) =>
				event.checkpoint === checkpoint && event.status === "successful",
		)?.occurred_at || null
	return [
		{
			title: "Order created",
			description: "The order has been placed.",
			completed: true,
			current: progress === 0,
			timestamp: order.created_at,
		},
		{
			title: "Payment confirmed",
			description:
				progress >= 1
					? "Payment is confirmed and the order is ready to prepare."
					: "Awaiting payment confirmation before fulfilment.",
			completed: progress >= 1,
			current: progress === 1,
			timestamp: timestamp("paid"),
		},
		{
			title: "Package on the way",
			description:
				progress >= 2
					? "The seller has marked this order as shipped."
					: "Mark as shipped once the package has been handed over for delivery.",
			completed: progress >= 2,
			current: progress === 2,
			timestamp: timestamp("collected"),
		},
		{
			title: "Delivery successful",
			description:
				progress >= 3
					? "Delivery has been independently verified."
					: "AppsCombo verifies delivery before earnings become cashable.",
			completed: progress >= 3,
			current: progress === 3,
			timestamp: timestamp("delivered"),
		},
	]
}
