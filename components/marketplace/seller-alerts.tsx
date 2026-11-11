"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowUpRight, Bell, CheckCheck, RefreshCw, Search } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import type { SellerAlert } from "@/types/marketplace"
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
	ProductImage,
} from "./shared"

const alertKey = ["marketplace", "alerts"] as const
const filters = [
	{ id: "all", label: "All activity" },
	{ id: "unread", label: "Unread" },
	{ id: "new", label: "New orders" },
	{ id: "shipped", label: "Shipped" },
	{ id: "delivered", label: "Delivered" },
	{ id: "review", label: "Reviews" },
] as const

export function SellerAlerts() {
	const [search, setSearch] = useState("")
	const [filter, setFilter] = useState<string>("all")
	const [page, setPage] = useState(1)
	const client = useQueryClient()
	const alerts = useQuery({
		queryKey: alertKey,
		queryFn: marketplaceApi.alerts,
		staleTime: 30000,
	})
	const read = useMutation({
		mutationFn: marketplaceApi.readAlert,
		onSuccess: (updated) => {
			client.setQueryData<SellerAlert[]>(alertKey, (items) =>
				items?.map((item) => (item.id === updated.id ? updated : item)),
			)
		},
		onError: (err) => toast.error(marketplaceError(err)),
	})
	const readAll = useMutation({
		mutationFn: marketplaceApi.readAllAlerts,
		onSuccess: () => client.invalidateQueries({ queryKey: alertKey }),
		onError: (err) => toast.error(marketplaceError(err)),
	})
	if (alerts.isPending) return <LoadingState />
	if (alerts.isError)
		return <ErrorState error={alerts.error} retry={() => alerts.refetch()} />
	const unread = alerts.data.filter((alert) => !alert.is_read).length
	const activity = alerts.data.filter((alert) => {
		const matches = [
			alert.message,
			alert.metadata?.title,
			alert.metadata?.product_name,
			String(alert.metadata?.order_id || ""),
		]
			.join(" ")
			.toLowerCase()
			.includes(search.trim().replace(/^#/, "").toLowerCase())
		return (
			matches &&
			(filter === "all" ||
				(filter === "unread"
					? !alert.is_read
					: alert.metadata?.kind === filter))
		)
	})
	const totalPages = Math.max(1, Math.ceil(activity.length / 10))
	const currentPage = Math.min(page, totalPages)
	return (
		<>
			<PageHeading
				title="Alerts"
				description="Order updates, tracking activity, and customer reviews from your store."
				actions={
					<>
						<Button
							variant="outline"
							className="rounded-full"
							disabled={!unread || readAll.isPending}
							onClick={() => readAll.mutate()}
						>
							<CheckCheck size={15} />
							Mark all as read
						</Button>
						<Button
							variant="outline"
							className="rounded-full"
							disabled={alerts.isFetching}
							onClick={() => alerts.refetch()}
						>
							<RefreshCw
								size={15}
								className={alerts.isFetching ? "animate-spin" : ""}
							/>
							Refresh
						</Button>
					</>
				}
			/>
			<div className="mb-6 flex items-center gap-4 rounded-2xl border border-primary/15 bg-primary/5 px-6 py-5">
				<div className="rounded-xl bg-card p-3 text-primary">
					<Bell size={22} />
				</div>
				<div>
					<h2 className="text-sm font-semibold">Keep your store moving</h2>
					<p className="mt-1 text-xs text-muted-foreground">
						{unread} unread {unread === 1 ? "update" : "updates"} · Most recent
						first
					</p>
				</div>
				<Button
					asChild
					variant="ghost"
					className="ml-auto hidden rounded-full text-xs text-primary sm:inline-flex"
				>
					<Link href="/market-vendor/orders">
						Manage orders <ArrowUpRight size={14} />
					</Link>
				</Button>
			</div>
			<Panel className="mb-5 p-4">
				<div className="flex flex-wrap justify-between gap-4">
					<div className="flex flex-wrap gap-1" aria-label="Filter alerts">
						{filters.map((item) => (
							<button
								key={item.id}
								type="button"
								aria-pressed={filter === item.id}
								onClick={() => {
									setFilter(item.id)
									setPage(1)
								}}
								className={cn(
									"rounded-full px-4 py-2 text-xs font-medium",
									filter === item.id
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:bg-muted",
								)}
							>
								{item.label}
							</button>
						))}
					</div>
					<div className="relative w-full sm:w-64">
						<Search
							size={15}
							className="absolute top-3 left-3 text-muted-foreground"
						/>
						<input
							aria-label="Search alerts"
							value={search}
							onChange={(event) => {
								setSearch(event.target.value)
								setPage(1)
							}}
							placeholder="Search alerts…"
							className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-9 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
						/>
					</div>
				</div>
			</Panel>
			{!activity.length ? (
				<Panel>
					<EmptyState
						title={search ? "No matching alerts" : "You’re all caught up"}
						description={
							search
								? "Try a different order number or product."
								: "New order, delivery, and review notifications will appear here."
						}
						action={
							search || filter !== "all" ? (
								<Button
									variant="outline"
									onClick={() => {
										setSearch("")
										setFilter("all")
										setPage(1)
									}}
								>
									Clear filters
								</Button>
							) : undefined
						}
					/>
				</Panel>
			) : (
				<Panel className="p-0">
					<div className="divide-y divide-border">
						{activity
							.slice((currentPage - 1) * 10, currentPage * 10)
							.map((alert) => {
								const data = alert.metadata
								const href = data?.order_id
									? `/market-vendor/orders/${data.order_id}`
									: data?.product_id
										? `/market-vendor/goods/${data.product_id}/reviews`
										: null
								return (
									<article
										key={alert.id}
										className={cn(
											"flex gap-4 px-6 py-6",
											!alert.is_read && "bg-primary/[.03]",
										)}
									>
										<div className="hidden size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary sm:flex">
											<Bell size={18} />
										</div>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-start justify-between gap-3">
												<h2 className="text-sm font-semibold">
													{data?.title || "Store update"}
												</h2>
												{!alert.is_read && (
													<span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] text-primary">
														Unread
													</span>
												)}
											</div>
											<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
												{alert.message}
											</p>
											{data?.product_name && (
												<div className="mt-4 flex items-center gap-3">
													<ProductImage
														src={data.product_image || undefined}
														name={data.product_name}
														className="size-14 shrink-0"
													/>
													<div className="min-w-0">
														<p className="line-clamp-1 text-xs font-medium">
															{data.product_name}
														</p>
														{data.total && (
															<p className="mt-1 text-xs font-semibold text-primary">
																{money(data.total)}
															</p>
														)}
													</div>
												</div>
											)}
											<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
												<p className="text-[11px] text-muted-foreground">
													{dateLabel(alert.sent_at)} ·{" "}
													{new Date(alert.sent_at).toLocaleTimeString("en-NG", {
														hour: "2-digit",
														minute: "2-digit",
														timeZone: "Africa/Lagos",
													})}{" "}
													WAT
												</p>
												<div className="flex gap-2">
													{!alert.is_read && (
														<Button
															variant="ghost"
															className="rounded-full text-xs"
															disabled={read.isPending}
															onClick={() => read.mutate(alert.id)}
														>
															Mark as read
														</Button>
													)}
													{href && (
														<Button
															asChild
															variant="outline"
															className="rounded-full text-xs"
														>
															<Link
																href={href}
																onClick={() => {
																	if (!alert.is_read) read.mutate(alert.id)
																}}
															>
																See details <ArrowUpRight size={13} />
															</Link>
														</Button>
													)}
												</div>
											</div>
										</div>
									</article>
								)
							})}
					</div>
				</Panel>
			)}
			<Pagination page={currentPage} total={totalPages} onChange={setPage} />
		</>
	)
}
