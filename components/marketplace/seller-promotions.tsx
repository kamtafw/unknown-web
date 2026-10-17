"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowUpRight, BadgeCheck, Megaphone, Plus, Search, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { marketplaceApi } from "@/lib/marketplace/api"
import { durationLabel, promotionKeys, promotionStatus } from "@/lib/marketplace/promotions"
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

const statusStyles = {
	active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	expired: "bg-muted text-muted-foreground",
	inactive: "bg-muted text-muted-foreground",
	scheduled: "bg-primary/10 text-primary",
}

export function SellerPromotions() {
	const [search, setSearch] = useState("")
	const [status, setStatus] = useState("all")
	const [page, setPage] = useState(1)
	const promotions = useQuery({
		queryKey: promotionKeys.all,
		queryFn: marketplaceApi.promotions,
		staleTime: 30000,
	})
	if (promotions.isPending) return <LoadingState />
	if (promotions.isError)
		return <ErrorState error={promotions.error} retry={() => promotions.refetch()} />
	const all = promotions.data
	const filtered = all.filter(
		(promotion) =>
			promotion.product_name.toLowerCase().includes(search.trim().toLowerCase()) &&
			(status === "all" || promotionStatus(promotion) === status),
	)
	const totalPages = Math.max(1, Math.ceil(filtered.length / 8))
	const currentPage = Math.min(page, totalPages)
	return (
		<>
			<PageHeading
				title="Ads & promotions"
				description="Give your products more visibility with a promotion that fits your plans."
				actions={
					<Button asChild className="h-10 rounded-full px-5">
						<Link href="/market-vendor/ads/promote">
							<Plus size={16} /> Promote a product
						</Link>
					</Button>
				}
			/>
			<div className="mb-7 grid gap-4 sm:grid-cols-3">
				{[
					{
						label: "Products promoted",
						value: new Set(all.map((p) => p.product_id)).size,
						icon: Megaphone,
					},
					{
						label: "Active promotions",
						value: all.filter((p) => promotionStatus(p) === "active").length,
						icon: BadgeCheck,
					},
					{
						label: "Expired promotions",
						value: all.filter((p) => promotionStatus(p) === "expired").length,
						icon: Timer,
					},
				].map(({ label, value, icon: Icon }) => (
					<Panel key={label} className="flex items-center gap-4 p-5">
						<div className="rounded-xl bg-primary/10 p-3 text-primary">
							<Icon size={22} strokeWidth={1.6} />
						</div>
						<div>
							<p className="text-2xl font-semibold">{value}</p>
							<p className="mt-1 text-xs text-muted-foreground">{label}</p>
						</div>
					</Panel>
				))}
			</div>
			<Panel className="p-0">
				<div className="border-b border-border p-6">
					<div className="mb-5 flex items-center justify-between gap-4">
						<div>
							<h2 className="font-semibold">Promoted products</h2>
							<p className="mt-1 text-xs text-muted-foreground">
								Your promotion history, dates, and product availability.
							</p>
						</div>
						<Megaphone size={21} className="hidden text-primary sm:block" />
					</div>
					<div className="flex flex-wrap gap-3">
						<div className="relative min-w-48 flex-1">
							<Search size={16} className="absolute top-3.5 left-3.5 text-muted-foreground" />
							<input
								aria-label="Search promoted products"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value)
									setPage(1)
								}}
								placeholder="Search promoted products…"
								className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
							/>
						</div>
						<select
							aria-label="Filter promotions"
							value={status}
							onChange={(e) => {
								setStatus(e.target.value)
								setPage(1)
							}}
							className="h-11 rounded-xl border border-border bg-card px-4 text-xs"
						>
							<option value="all">All promotions</option>
							<option value="active">Active</option>
							<option value="expired">Expired</option>
							<option value="inactive">Inactive</option>
							<option value="scheduled">Scheduled</option>
						</select>
					</div>
				</div>
				{!filtered.length ? (
					<EmptyState
						title={
							search || status !== "all"
								? "No matching promotions"
								: "Put your first product in the spotlight"
						}
						description={
							search || status !== "all"
								? "Try another product name or clear your filters."
								: "Choose a product and duration, then review the wallet payment before starting."
						}
						action={
							search || status !== "all" ? (
								<Button
									variant="outline"
									onClick={() => {
										setSearch("")
										setStatus("all")
										setPage(1)
									}}
								>
									Clear filters
								</Button>
							) : (
								<Button asChild className="rounded-full">
									<Link href="/market-vendor/ads/promote">
										Promote a product <ArrowUpRight size={15} />
									</Link>
								</Button>
							)
						}
					/>
				) : (
					<>
						<div className="overflow-x-auto">
							<table className="w-full min-w-[740px] text-left" aria-label="Promoted products">
								<thead className="bg-muted/30 text-[10px] text-muted-foreground">
									<tr>
										<th className="px-6 py-3 font-medium">Product</th>
										<th className="px-4 py-3 font-medium">Promotion period</th>
										<th className="px-4 py-3 font-medium">Amount paid</th>
										<th className="px-4 py-3 text-right font-medium">Total units sold</th>
										<th className="px-4 py-3 font-medium">Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{filtered.slice((currentPage - 1) * 8, currentPage * 8).map((promotion) => {
										const state = promotionStatus(promotion)
										return (
											<tr key={promotion.id}>
												<td className="max-w-80 px-6 py-5">
													<div className="flex items-center gap-3">
														<ProductImage
															src={promotion.product_image || undefined}
															name={promotion.product_name}
															className="size-16 shrink-0"
															imageClassName="p-1.5"
														/>
														<div className="min-w-0">
															<Link
																href={`/market-vendor/goods/${promotion.product_id}`}
																className="line-clamp-2 text-xs font-medium hover:text-primary"
															>
																{promotion.product_name}
															</Link>
															<p
																className={cn(
																	"mt-1.5 text-[10px]",
																	promotion.is_out_of_stock
																		? "text-destructive"
																		: "text-muted-foreground",
																)}
															>
																{promotion.is_out_of_stock
																	? "Out of stock"
																	: `${promotion.quantity} available`}
															</p>
														</div>
													</div>
												</td>
												<td className="whitespace-nowrap px-4 py-5">
													<p className="text-xs font-medium">
														{durationLabel(promotion.duration_days)}
													</p>
													<p className="mt-1 text-[10px] text-muted-foreground">
														{dateLabel(promotion.start_date)} – {dateLabel(promotion.end_date)}
													</p>
												</td>
												<td className="px-4 py-5 text-xs font-medium">
													{money(promotion.amount_paid)}
												</td>
												<td className="px-4 py-5 text-right text-sm font-semibold">
													{promotion.sold_count || 0}
												</td>
												<td className="px-4 py-5">
													<span
														className={cn(
															"rounded-full px-3 py-1.5 text-[10px] capitalize",
															statusStyles[state],
														)}
													>
														{state}
													</span>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
						<div className="border-t border-border px-6 pb-6">
							<Pagination page={currentPage} total={totalPages} onChange={setPage} />
							<p className="mt-4 text-[10px] text-muted-foreground">
								Units sold reflect total product sales across orders.
							</p>
						</div>
					</>
				)}
			</Panel>
		</>
	)
}
