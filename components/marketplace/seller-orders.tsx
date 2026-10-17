"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, PackageCheck, RefreshCw, Search, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { marketplaceApi } from "@/lib/marketplace/api"
import { orderKeys, orderMatches } from "@/lib/marketplace/orders"
import { cn } from "@/lib/utils"
import {
	dateLabel,
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Pagination,
	Panel,
} from "./shared"
import { OrderProductImage, OrderStatusAction, OrderStatusBadge } from "./order-shared"

const tabs = [
	{ id: "paid", label: "To ship" },
	{ id: "shipped", label: "Shipped" },
	{ id: "delivered", label: "Delivered" },
	{ id: "all", label: "All orders" },
] as const
type Tab = (typeof tabs)[number]["id"]
const pageSize = 8

export function SellerOrders() {
	const [tab, setTab] = useState<Tab>("shipped")
	const [search, setSearch] = useState("")
	const [page, setPage] = useState(1)
	const orders = useQuery({
		queryKey: orderKeys.all,
		queryFn: marketplaceApi.orders,
		staleTime: 30000,
	})
	if (orders.isPending) return <LoadingState />
	if (orders.isError) return <ErrorState error={orders.error} retry={() => orders.refetch()} />
	const all = orders.data
	const filtered = all.filter(
		(order) => (tab === "all" || order.status === tab) && orderMatches(order, search),
	)
	const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
	const currentPage = Math.min(page, totalPages)
	const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	return (
		<>
			<PageHeading
				title="Orders"
				description="From your store to their doorstep. Keep every order moving."
				actions={
					<Button
						variant="outline"
						className="rounded-full"
						disabled={orders.isFetching}
						onClick={() => orders.refetch()}
					>
						<RefreshCw size={15} className={orders.isFetching ? "animate-spin" : ""} />
						Refresh
					</Button>
				}
			/>
			<div className="mb-7 grid gap-4 sm:grid-cols-3">
				{[
					{ label: "Ready to ship", status: "paid", icon: ShoppingBag },
					{ label: "On the way", status: "shipped", icon: Truck },
					{ label: "Delivered", status: "delivered", icon: PackageCheck },
				].map(({ label, status, icon: Icon }) => (
					<Panel key={status} className="flex items-center gap-4 p-5">
						<div className="rounded-xl bg-primary/10 p-3 text-primary">
							<Icon size={22} strokeWidth={1.6} />
						</div>
						<div>
							<p className="text-2xl font-semibold">
								{all.filter((order) => order.status === status).length}
							</p>
							<p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
						</div>
					</Panel>
				))}
			</div>
			<Panel className="mb-5 p-4">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div
						className="flex flex-wrap gap-1 rounded-xl bg-muted/60 p-1"
						aria-label="Filter orders by status"
					>
						{tabs.map((item) => (
							<button
								key={item.id}
								type="button"
								aria-pressed={tab === item.id}
								onClick={() => {
									setTab(item.id)
									setPage(1)
								}}
								className={cn(
									"rounded-lg px-4 py-2 text-xs font-medium transition focus-visible:outline-primary",
									tab === item.id
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{item.label}{" "}
								<span className="ml-2 opacity-70">
									{item.id === "all"
										? all.length
										: all.filter((order) => order.status === item.id).length}
								</span>
							</button>
						))}
					</div>
					<div className="relative w-full sm:w-64">
						<Search size={15} className="absolute top-3 left-3 text-muted-foreground" />
						<input
							value={search}
							aria-label="Search orders"
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							placeholder="Search order, product, or customer"
							className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
						/>
					</div>
				</div>
			</Panel>
			{!visible.length ? (
				<Panel>
					<EmptyState
						title={search ? "No matching orders" : "No orders in this view"}
						description={
							search
								? "Try another order number, customer, or product name."
								: tab === "shipped"
									? "Orders will appear here once you mark them as shipped."
									: "Your orders will appear here as customers shop from your store."
						}
						action={
							<Button
								variant="outline"
								onClick={() => {
									setSearch("")
									setTab("all")
									setPage(1)
								}}
							>
								View all orders
							</Button>
						}
					/>
				</Panel>
			) : (
				<div className="space-y-4">
					{visible.map((order) => (
						<Panel key={order.id} className="p-0">
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-6 py-4">
								<div className="flex flex-wrap items-center gap-x-4 gap-y-1">
									<Link
										href={`/market-vendor/orders/${order.id}`}
										className="text-sm font-semibold hover:text-primary"
									>
										Order #{order.id}
									</Link>
									<span className="text-xs text-muted-foreground">
										Placed {dateLabel(order.created_at)}
									</span>
								</div>
								<OrderStatusBadge status={order.status} />
							</div>
							<div className="grid items-center gap-5 p-6 md:grid-cols-[minmax(0,1fr)_auto]">
								<div className="space-y-4">
									{order.items.slice(0, 2).map((item, index) => (
										<div key={`${item.product}-${index}`} className="flex items-center gap-4">
											<OrderProductImage item={item} className="size-16" />
											<div className="min-w-0">
												<Link
													href={`/market-vendor/orders/${order.id}`}
													className="line-clamp-2 text-sm font-medium hover:text-primary"
												>
													{item.product_name}
												</Link>
												<p className="mt-1 text-xs text-muted-foreground">
													{item.quantity} × {money(item.price)}
												</p>
											</div>
										</div>
									))}
									{order.items.length > 2 && (
										<p className="text-xs text-muted-foreground">
											+ {order.items.length - 2} more products
										</p>
									)}
								</div>
								<div className="md:text-right">
									<p className="text-[11px] text-muted-foreground">Order total</p>
									<p className="mt-1 text-xl font-semibold">{money(order.total)}</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{order.shipping_address?.full_name || "Customer"}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4">
								<p className="text-xs text-muted-foreground">
									{[order.shipping_address?.city, order.shipping_address?.country]
										.filter(Boolean)
										.join(", ") || "Delivery address in order details"}
								</p>
								<div className="flex flex-wrap gap-2">
									<OrderStatusAction order={order} />
									<Button asChild variant="ghost" className="rounded-full text-xs">
										<Link href={`/market-vendor/orders/${order.id}`}>
											View tracking <ArrowUpRight size={14} />
										</Link>
									</Button>
								</div>
							</div>
						</Panel>
					))}
				</div>
			)}
			<Pagination page={currentPage} total={totalPages} onChange={setPage} />
		</>
	)
}
