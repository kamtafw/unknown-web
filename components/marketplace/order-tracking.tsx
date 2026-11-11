"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { Check, Circle, Info, MapPin, PackageCheck, Phone, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { marketplaceApi } from "@/lib/marketplace/api"
import { fulfilmentSteps, orderKeys } from "@/lib/marketplace/orders"
import { cn } from "@/lib/utils"
import {
	dateLabel,
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Panel,
} from "./shared"
import { OrderProductImage, OrderStatusAction, OrderStatusBadge } from "./order-shared"
import { ShipmentTracking } from "./shipment-tracking"

export function OrderTracking({ id }: { id: number }) {
	const detail = useQuery({
		queryKey: orderKeys.detail(id),
		queryFn: () => marketplaceApi.order(id),
		enabled: Number.isInteger(id) && id > 0,
		retry: (count, error) => isAxiosError(error) && error.response?.status === 404 ? false : count < 1,
		staleTime: 30000,
	})
	if (!Number.isInteger(id) || id <= 0 || (isAxiosError(detail.error) && detail.error.response?.status === 404))
		return (
			<EmptyState
				title="Order not found"
				description="This order is unavailable or does not belong to your store."
				action={
					<Button asChild>
						<Link href="/market-vendor/orders">Back to orders</Link>
					</Button>
				}
			/>
		)
	if (detail.isPending) return <LoadingState />
	if (detail.isError) return <ErrorState error={detail.error} retry={() => detail.refetch()} />
	const order = detail.data
	const terminal = ["cancelled", "refunded", "partially_refunded"].includes(order.status)
	const address = order.shipping_address
	return (
		<>
			<PageHeading
				title={`Order #${order.id}`}
				description={`Placed ${dateLabel(order.created_at)} · ${order.items.reduce((total, item) => total + item.quantity, 0)} items`}
				back="/market-vendor/orders"
				backLabel="Back to orders"
				actions={
					<>
						<OrderStatusBadge status={order.status} />
						<OrderStatusAction order={order} className="h-10" />
					</>
				}
			/>
			<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<div className="space-y-6">
					<Panel>
						<div className="mb-6 flex items-center gap-3">
							<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
								<Truck size={21} />
							</div>
							<div>
								<h2 className="font-semibold">Order tracking</h2>
								<p className="mt-1 text-xs text-muted-foreground">
									Follow this order from checkout to delivery.
								</p>
							</div>
						</div>
						<div className="mb-6 flex items-start gap-2.5 rounded-xl bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
							<Info size={16} className="mt-0.5 shrink-0" />
							<p>
								{terminal
									? "This order is no longer in the standard fulfilment flow. Its current status is shown above."
									: "Tracking reflects updates recorded by your store. Add shipment details and checkpoints as the package moves towards delivery."}
							</p>
						</div>
						<ol>
							{fulfilmentSteps(order)
								.filter((step, index) => !terminal || index === 0)
								.map((step, index, steps) => (
									<li key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
										{index < steps.length - 1 && (
											<span
												className={cn(
													"absolute top-7 left-3.5 h-[calc(100%-24px)] w-px",
													step.completed ? "bg-emerald-500/30" : "bg-border",
												)}
											/>
										)}
										<div
											className={cn(
												"z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
												step.completed
													? "bg-emerald-500 text-white"
													: "bg-muted text-muted-foreground",
											)}
										>
											{step.completed ? (
												<Check size={15} strokeWidth={2.5} />
											) : (
												<Circle size={11} />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center justify-between gap-2">
												<h3
													className={cn(
														"text-sm font-medium",
														!step.completed && "text-muted-foreground",
													)}
												>
													{step.title}
												</h3>
												<span
													className={cn(
														"rounded-full px-2.5 py-1 text-[10px]",
														step.current
															? "bg-primary/10 text-primary"
															: step.completed
																? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
																: "bg-muted text-muted-foreground",
													)}
												>
													{step.current
														? "Current status"
														: step.completed
															? "Complete"
															: "Pending"}
												</span>
											</div>
											<p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
												{step.description}
											</p>
											<p className="mt-2 text-[11px] text-muted-foreground">
												{step.timestamp
													? `${dateLabel(step.timestamp)} · ${new Date(step.timestamp).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })} WAT`
													: step.completed
														? "Completion time not provided"
														: "Awaiting update"}
											</p>
										</div>
									</li>
								))}
						</ol>
						{order.status === "delivered" && (
							<div className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
								<PackageCheck size={17} />
								This order has been marked as delivered.
							</div>
						)}
					</Panel>
					<Panel>
						<h2 className="mb-5 font-semibold">Order items</h2>
						<div className="divide-y divide-border">
							{order.items.map((item, index) => (
								<div
									key={`${item.product}-${index}`}
									className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
								>
									<OrderProductImage item={item} className="size-20" />
									<div className="min-w-0 flex-1">
										<Link
											href={`/market-vendor/goods/${item.product}`}
											className="text-sm font-medium hover:text-primary"
										>
											{item.product_name}
										</Link>
										<p className="mt-1 text-xs text-muted-foreground">
											Quantity: {item.quantity} · {money(item.price)} each
										</p>
									</div>
									<p className="text-sm font-semibold">
										{money(Number(item.price) * item.quantity)}
									</p>
								</div>
							))}
						</div>
					</Panel>
				</div>
				<div className="space-y-6">
					<ShipmentTracking key={order.id} order={order} />
					<Panel>
						<div className="mb-5 flex items-center gap-2">
							<MapPin size={17} className="text-primary" />
							<h2 className="text-sm font-semibold">Delivery address</h2>
						</div>
						{address ? (
							<>
								<p className="text-sm font-medium">{address.full_name || "Customer"}</p>
								<p className="mt-2 whitespace-pre-line text-xs leading-6 text-muted-foreground">
									{[
										address.address_line,
										[address.city, address.state].filter(Boolean).join(", "),
										[address.country, address.postal_code].filter(Boolean).join(" "),
									]
										.filter(Boolean)
										.join("\n") || "Address not provided"}
								</p>
								{address.phone_number && (
									<p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
										<Phone size={13} />
										{address.phone_number}
									</p>
								)}
							</>
						) : (
							<p className="text-xs text-muted-foreground">No delivery address provided.</p>
						)}
					</Panel>
					<Panel>
						<h2 className="mb-5 text-sm font-semibold">Payment summary</h2>
						<dl className="space-y-4 text-xs">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Subtotal</dt>
								<dd>{money(order.subtotal)}</dd>
							</div>
							{Number(order.refunded_amount) > 0 && (
								<div className="flex justify-between gap-3">
									<dt className="text-muted-foreground">Refunded amount</dt>
									<dd className="text-destructive">{money(order.refunded_amount)}</dd>
								</div>
							)}
							<div className="flex justify-between gap-3 border-t border-border pt-4 text-sm font-semibold">
								<dt>Order total</dt>
								<dd>{money(order.total)}</dd>
							</div>
						</dl>
					</Panel>
					<div className="px-2">
						<p className="text-xs font-medium">Need a hand with this order?</p>
						<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
							Keep the order number handy when contacting support.
						</p>
						<Link
							href="/support"
							className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
						>
							Visit support →
						</Link>
					</div>
				</div>
			</div>
		</>
	)
}
