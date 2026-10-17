"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
	BarChart3,
	Eye,
	Heart,
	ListFilter,
	MousePointer2,
	ShoppingBag,
	Star,
	TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { marketplaceApi } from "@/lib/marketplace/api"
import type { ProductDetail, SalesFilter, SalesSummary } from "@/types/marketplace"
import { cn } from "@/lib/utils"
import {
	dateLabel,
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	Pagination,
	Panel,
	ProductImage,
} from "./shared"

const periods: { value: SalesFilter["period"]; label: string }[] = [
	{ value: "today", label: "Today" },
	{ value: "week", label: "This week" },
	{ value: "month", label: "This month" },
	{ value: "year", label: "This year" },
	{ value: "custom", label: "Custom duration" },
]
const initialFilter: SalesFilter = { period: "month", start: "", end: "" }

function SalesChart({ summary }: { summary: SalesSummary }) {
	const gradient = useId().replaceAll(":", "")
	const points = summary.chart
	const max = Math.max(...points.map((p) => Number(p.value)), 1)
	const x = (i: number) => 65 + i * (785 / Math.max(points.length - 1, 1))
	const y = (value: number) => 205 - (Number(value) / max) * 165
	const line = points.map((p, i) => `${i ? "L" : "M"} ${x(i)} ${y(p.value)}`).join(" ")
	return (
		<div className="mt-7">
			<svg
				viewBox="0 0 880 250"
				role="img"
				aria-label={`Monthly revenue for ${summary.year}`}
				className="w-full"
			>
				<defs>
					<linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="#6a88d1" stopOpacity=".18" />
						<stop offset="100%" stopColor="#6a88d1" stopOpacity="0" />
					</linearGradient>
				</defs>
				{[0, 0.25, 0.5, 0.75, 1].map((p) => (
					<g key={p}>
						<line
							x1="65"
							x2="850"
							y1={y(max * p)}
							y2={y(max * p)}
							stroke="currentColor"
							className="text-border"
							strokeDasharray="3 4"
						/>
						<text
							x="53"
							y={y(max * p) + 4}
							textAnchor="end"
							fontSize="10"
							fill="currentColor"
							className="text-muted-foreground"
						>
							{new Intl.NumberFormat("en", {
								notation: "compact",
								maximumFractionDigits: 1,
							}).format(max * p)}
						</text>
					</g>
				))}
				{points.length > 0 && (
					<>
						<path
							d={`${line} L ${x(points.length - 1)} 205 L 65 205 Z`}
							fill={`url(#${gradient})`}
						/>
						<path d={line} fill="none" stroke="#6a88d1" strokeWidth="2.5" strokeLinejoin="round" />
						{points.map((p, i) => (
							<g key={p.label}>
								<circle cx={x(i)} cy={y(p.value)} r="4" fill="#6a88d1">
									<title>
										{p.label}: {money(p.value)}
									</title>
								</circle>
								<text
									x={x(i)}
									y="234"
									textAnchor="middle"
									fontSize="11"
									fill="currentColor"
									className="text-muted-foreground"
								>
									{p.label}
								</text>
							</g>
						))}
					</>
				)}
			</svg>
			<p className="sr-only">{points.map((p) => `${p.label}: ${money(p.value)}`).join("; ")}</p>
		</div>
	)
}

export function ProductSales({ product }: { product: ProductDetail }) {
	const [year, setYear] = useState(new Date().getFullYear())
	const [tab, setTab] = useState<"sales" | "tracks">("sales")
	const [filter, setFilter] = useState<SalesFilter>(initialFilter)
	const [draft, setDraft] = useState<SalesFilter>(initialFilter)
	const [open, setOpen] = useState(false)
	const [page, setPage] = useState(1)
	const [filterError, setFilterError] = useState("")
	const summary = useQuery({
		queryKey: ["marketplace", "summary", product.id, year],
		queryFn: () => marketplaceApi.summary(product.id, year),
	})
	const sales = useQuery({
		queryKey: ["marketplace", "sales", product.id, filter, page],
		queryFn: () => marketplaceApi.sales(product.id, filter, page),
		enabled: tab === "sales",
	})
	const stats = useQuery({
		queryKey: ["marketplace", "stats", product.id, filter],
		queryFn: () => marketplaceApi.stats(product.id, filter),
		enabled: tab === "tracks",
	})
	const label =
		filter.period === "custom"
			? `${filter.start} – ${filter.end}`
			: periods.find((p) => p.value === filter.period)?.label
	const firstYear = Math.min(
		new Date(product.created_at).getFullYear() || year,
		new Date().getFullYear(),
	)
	return (
		<div className="space-y-6">
			<Panel>
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<ProductImage src={product.images[0]} name={product.name} className="size-14" />
						<div>
							<p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
								Product performance
							</p>
							<h2 className="mt-1 max-w-lg text-sm font-semibold">{product.name}</h2>
						</div>
					</div>
					<label className="flex items-center gap-2 text-xs text-muted-foreground">
						Year
						<select
							aria-label="Sales year"
							value={year}
							onChange={(e) => setYear(Number(e.target.value))}
							className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground"
						>
							{Array.from(
								{ length: new Date().getFullYear() - firstYear + 1 },
								(_, i) => new Date().getFullYear() - i,
							).map((y) => (
								<option key={y}>{y}</option>
							))}
						</select>
					</label>
				</div>
				{summary.isPending ? (
					<div className="mt-6">
						<LoadingState />
					</div>
				) : summary.isError ? (
					<ErrorState error={summary.error} retry={() => summary.refetch()} />
				) : (
					<>
						<div className="mt-7 flex flex-wrap items-start justify-between gap-4 border-l-2 border-primary pl-4">
							<div>
								<p className="text-xs text-muted-foreground">Total sales · {year}</p>
								<p className="mt-2 text-3xl font-semibold tracking-tight">
									{money(summary.data.total_revenue)}
								</p>
								<p className="mt-2 text-xs text-muted-foreground">
									Revenue from paid, shipped, and delivered orders
								</p>
							</div>
							<div className="rounded-xl bg-emerald-500/10 px-4 py-3">
								<span className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
									<TrendingUp size={16} />
									{summary.data.total_quantity.toLocaleString()} units sold
								</span>
								<p className="mt-1 text-[10px] text-muted-foreground">During {year}</p>
							</div>
						</div>
						<SalesChart summary={summary.data} />
					</>
				)}
			</Panel>
			<Panel>
				<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
					<div className="inline-flex gap-1 rounded-xl bg-muted/60 p-1" aria-label="Activity view">
						{(["sales", "tracks"] as const).map((t) => (
							<button
								key={t}
								aria-pressed={tab === t}
								onClick={() => setTab(t)}
								className={cn(
									"flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition",
									tab === t
										? "bg-primary text-primary-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								{t === "sales" ? <ShoppingBag size={14} /> : <BarChart3 size={14} />}
								{t === "sales" ? "Sales" : "Tracks"}
							</button>
						))}
					</div>
					<Button
						variant="outline"
						className="rounded-full text-xs"
						onClick={() => {
							setDraft(filter)
							setFilterError("")
							setOpen(true)
						}}
					>
						<ListFilter size={14} />
						{label}
					</Button>
				</div>
				<h3 className="mb-1 text-sm font-semibold">
					{tab === "sales" ? "Sales activity" : "Engagement overview"}
				</h3>
				<p className="mb-5 text-xs text-muted-foreground">
					{label} ·{" "}
					{tab === "sales"
						? "Completed payments for this product"
						: "See how customers interact with your listing"}
				</p>
				{tab === "sales" ? (
					sales.isPending ? (
						<LoadingState />
					) : sales.isError ? (
						<ErrorState error={sales.error} retry={() => sales.refetch()} />
					) : !sales.data.results.length ? (
						<EmptyState
							title="No sales in this period"
							description="Try another date range. Paid orders will appear here as your product sells."
						/>
					) : (
						<>
							<div className="overflow-x-auto">
								<table className="w-full min-w-[520px] text-left text-sm">
									<thead className="border-y border-border bg-muted/35 text-[11px] text-muted-foreground">
										<tr>
											<th className="px-4 py-3 font-medium">Product</th>
											<th className="px-4 py-3 font-medium">Order</th>
											<th className="px-4 py-3 text-right font-medium">Unit price</th>
											<th className="px-4 py-3 text-right font-medium">Quantity</th>
											<th className="px-4 py-3 text-right font-medium">Total</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{sales.data.results.map((s) => (
											<tr key={s.id}>
												<td className="max-w-64 px-4 py-4">
													<div className="flex items-center gap-3">
														<ProductImage
															src={product.images[0]}
															name={s.product_name}
															className="size-11 shrink-0"
														/>
														<span className="line-clamp-2 text-xs font-medium">
															{s.product_name}
														</span>
													</div>
												</td>
												<td className="px-4 py-4 text-xs text-muted-foreground">
													<Link href={`/market-vendor/orders/${s.order}`} className="text-primary hover:underline">#{s.order}</Link>
													<p className="mt-1 text-[10px]">{s.created_at ? dateLabel(s.created_at) : "Date unavailable"}</p>
												</td>
												<td className="px-4 py-4 text-right text-xs">{money(s.price)}</td>
												<td className="px-4 py-4 text-right text-xs">{s.quantity}</td>
												<td className="px-4 py-4 text-right text-xs font-semibold">
													{money(Number(s.price) * s.quantity)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
							<Pagination page={page} total={sales.data.total_pages} onChange={setPage} />
						</>
					)
				) : stats.isPending ? (
					<LoadingState />
				) : stats.isError ? (
					<ErrorState error={stats.error} retry={() => stats.refetch()} />
				) : (
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
						{[
							{ label: "Clicks", value: stats.data.clicks, icon: MousePointer2 },
							{ label: "Unique views", value: stats.data.unique_views, icon: Eye },
							{ label: "Sold", value: stats.data.sold, icon: ShoppingBag },
							{ label: "Liked", value: stats.data.liked, icon: Heart },
							{ label: "Reviews", value: stats.data.reviews, icon: Star },
						].map(({ label, value, icon: Icon }) => (
							<div key={label} className="rounded-xl border border-border p-5">
								<Icon size={19} className="mb-4 text-primary" />
								<p className="text-2xl font-semibold">{value.toLocaleString()}</p>
								<p className="mt-1 text-xs text-muted-foreground">{label}</p>
							</div>
						))}
					</div>
				)}
			</Panel>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="rounded-2xl p-7">
					<DialogTitle>Filter activity</DialogTitle>
					<DialogDescription>
						Choose a date range for sales activity and engagement. The annual revenue chart uses the
						year above.
					</DialogDescription>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							if (
								draft.period === "custom" &&
								(!draft.start || !draft.end || draft.start > draft.end)
							) {
								setFilterError("Choose a valid start and end date.")
								return
							}
							setFilter(draft)
							setPage(1)
							setOpen(false)
						}}
					>
						<div className="mb-6 flex flex-wrap gap-2">
							{periods.map((p) => (
								<button
									key={p.value}
									type="button"
									aria-pressed={draft.period === p.value}
									onClick={() => {
										setDraft({ ...draft, period: p.value })
										setFilterError("")
									}}
									className={cn(
										"rounded-full px-4 py-2.5 text-xs",
										draft.period === p.value
											? "bg-primary text-primary-foreground"
											: "bg-muted text-muted-foreground",
									)}
								>
									{p.label}
								</button>
							))}
						</div>
						{draft.period === "custom" && (
							<div className="mb-5 grid grid-cols-2 gap-4">
								<label className="text-xs text-muted-foreground">
									From
									<input
										type="date"
										required
										value={draft.start}
										max={draft.end || undefined}
										onChange={(e) => setDraft({ ...draft, start: e.target.value })}
										className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-2 text-foreground"
									/>
								</label>
								<label className="text-xs text-muted-foreground">
									To
									<input
										type="date"
										required
										value={draft.end}
										min={draft.start || undefined}
										onChange={(e) => setDraft({ ...draft, end: e.target.value })}
										className="mt-2 h-10 w-full rounded-lg border border-border bg-card px-2 text-foreground"
									/>
								</label>
							</div>
						)}
						{filterError && (
							<p role="alert" className="mb-4 text-xs text-destructive">
								{filterError}
							</p>
						)}
						<div className="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								className="rounded-full"
								onClick={() => {
									setDraft(initialFilter)
									setFilterError("")
								}}
							>
								Reset
							</Button>
							<Button type="submit" className="rounded-full px-6">
								Apply filter
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	)
}
