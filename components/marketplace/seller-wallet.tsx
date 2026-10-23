"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
	ArrowDownLeft,
	ArrowUpRight,
	BadgeCheck,
	ChevronRight,
	Clock3,
	Info,
	RefreshCw,
	Search,
	TrendingUp,
	Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi } from "@/lib/marketplace/api"
import {
	filterWalletHistory,
	payoutLabels,
	payoutRows,
	transactionRows,
	walletDate,
	walletTime,
	type WalletHistoryRow,
} from "@/lib/marketplace/wallet"
import { cn } from "@/lib/utils"
import {
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Pagination,
	Panel,
} from "./shared"
import { isSellerVerified, SellerVerification } from "./seller-verification"
import { PayoutControls } from "./payout-controls"

const statusColors = {
	paid: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
	failed: "bg-destructive/10 text-destructive",
	pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
	recorded: "bg-muted text-muted-foreground",
}

function HistoryStatus({ status }: { status: WalletHistoryRow["status"] }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium",
				statusColors[status],
			)}
		>
			<span className="size-1.5 rounded-full bg-current" />
			{payoutLabels[status]}
		</span>
	)
}

export function SellerWalletPage() {
	const [tab, setTab] = useState<"withdrawals" | "transactions">("withdrawals")
	const [search, setSearch] = useState("")
	const [filter, setFilter] = useState("all")
	const [page, setPage] = useState(1)
	const [selected, setSelected] = useState<WalletHistoryRow | null>(null)
	const wallet = useQuery({
		queryKey: ["marketplace", "wallet"],
		queryFn: marketplaceApi.wallet,
		staleTime: 30000,
	})
	const account = useQuery({
		queryKey: ["marketplace", "account"],
		queryFn: marketplaceApi.account,
		staleTime: 30000,
	})
	const payouts = useQuery({
		queryKey: ["marketplace", "payouts"],
		queryFn: marketplaceApi.payouts,
		enabled: tab === "withdrawals",
		staleTime: 30000,
	})
	const transactions = useQuery({
		queryKey: ["marketplace", "wallet-transactions"],
		queryFn: marketplaceApi.walletTransactions,
		enabled: tab === "transactions",
		staleTime: 30000,
	})
	if (wallet.isPending) return <LoadingState />
	if (wallet.isError)
		return <ErrorState error={wallet.error} retry={() => wallet.refetch()} />
	const history = tab === "withdrawals" ? payouts : transactions
	const rows =
		tab === "withdrawals"
			? payoutRows(payouts.data || [])
			: transactionRows(transactions.data || [])
	const filtered = filterWalletHistory(rows, search, filter)
	const totalPages = Math.max(1, Math.ceil(filtered.length / 10))
	const currentPage = Math.min(page, totalPages)
	const fetching = wallet.isFetching || account.isFetching || history.isFetching
	const ready = account.data && isSellerVerified(account.data)
	function refresh() {
		wallet.refetch()
		account.refetch()
		if (tab === "withdrawals") payouts.refetch()
		else transactions.refetch()
	}
	return (
		<>
			<PageHeading
				title="Wallet"
				description="A clear view of your earnings, balances, and payout history."
				actions={
					<>
						<PayoutControls
							verified={!!ready}
							pending={payouts.data?.some(
								(payout) => payout.status === "pending",
							)}
						/>
						<Button
							variant="outline"
							disabled={fetching}
							className="rounded-full"
							onClick={refresh}
						>
							<RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
							Refresh
						</Button>
					</>
				}
			/>
			<div className="mb-7 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
				<div className="min-w-0">
					{account.isPending ? (
						<div
							role="status"
							aria-label="Loading verification status"
							className="h-48 animate-pulse rounded-2xl bg-muted"
						/>
					) : account.isError ? (
						<Panel className="h-full">
							<Info size={22} className="mb-3 text-muted-foreground" />
							<h2 className="text-sm font-semibold">
								Verification status unavailable
							</h2>
							<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
								Your wallet history is still available. Try again to check your
								account verification.
							</p>
							<Button
								variant="outline"
								className="mt-4 rounded-full text-xs"
								onClick={() => account.refetch()}
							>
								Retry verification status
							</Button>
						</Panel>
					) : ready ? (
						<section className="relative flex h-full min-h-48 flex-col justify-between overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground">
							<div
								aria-hidden="true"
								className="pointer-events-none absolute -top-16 -right-10 size-72 rounded-full"
								style={{ boxShadow: "inset 0 0 0 34px rgb(255 255 255 / .07)" }}
							/>
							<div className="relative flex items-start justify-between gap-4">
								<div className="flex items-center gap-3">
									<div className="rounded-xl bg-white/15 p-3">
										<Wallet size={25} />
									</div>
									<div>
										<h2 className="text-sm font-medium">Available balance</h2>
										<p className="mt-1 text-[11px] opacity-80">
											Current balance available for payouts
										</p>
									</div>
								</div>
								<span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1.5 text-[10px]">
									<BadgeCheck size={12} />
									Verified
								</span>
							</div>
							<p className="relative mt-6 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
								{money(wallet.data.available_balance)}
							</p>
							<p className="relative mt-4 text-[10px] opacity-80">
								Last updated {walletDate(wallet.data.updated_at)} ·{" "}
								{walletTime(wallet.data.updated_at)}
							</p>
						</section>
					) : account.data ? (
						<SellerVerification account={account.data} />
					) : null}
				</div>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
					<Panel className="flex items-center gap-4 p-5">
						<div className="rounded-xl bg-amber-500/10 p-3 text-amber-600">
							<Clock3 size={21} />
						</div>
						<div className="min-w-0">
							<h2 className="text-xs text-muted-foreground">Pending balance</h2>
							<p className="mt-1 break-words text-xl font-semibold">
								{money(wallet.data.pending_balance)}
							</p>
							<p className="mt-1 text-[10px] text-muted-foreground">
								Funds not yet available for payouts
							</p>
						</div>
					</Panel>
					<Panel className="flex items-center gap-4 p-5">
						<div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600">
							<TrendingUp size={21} />
						</div>
						<div className="min-w-0">
							<h2 className="text-xs text-muted-foreground">Total earned</h2>
							<p className="mt-1 break-words text-xl font-semibold">
								{money(wallet.data.total_earned)}
							</p>
							<p className="mt-1 text-[10px] text-muted-foreground">
								Lifetime earnings recorded in your wallet
							</p>
						</div>
					</Panel>
				</div>
			</div>
			<div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_280px]">
				<Panel className="min-w-0 p-0">
					<div className="border-b border-border p-6">
						<div className="mb-5 flex flex-wrap items-center justify-between gap-4">
							<div>
								<h2 className="font-semibold">History</h2>
								<p className="mt-1 text-xs text-muted-foreground">
									{tab === "withdrawals"
										? "Track successful, pending, and failed payouts."
										: "Credits and debits recorded in your wallet."}
								</p>
							</div>
							<div
								className="inline-flex rounded-xl bg-muted/60 p-1"
								aria-label="Wallet history type"
							>
								{(["withdrawals", "transactions"] as const).map((value) => (
									<button
										key={value}
										type="button"
										aria-pressed={tab === value}
										onClick={() => {
											setTab(value)
											setFilter("all")
											setSearch("")
											setPage(1)
										}}
										className={cn(
											"rounded-lg px-4 py-2 text-xs font-medium transition focus-visible:outline-primary",
											tab === value
												? "bg-primary text-primary-foreground"
												: "text-muted-foreground hover:text-foreground",
										)}
									>
										{value === "withdrawals" ? "Withdrawals" : "Transactions"}
									</button>
								))}
							</div>
						</div>
						<div className="flex flex-wrap gap-3">
							<div className="relative min-w-48 flex-1">
								<Search
									size={15}
									className="absolute top-3.5 left-3.5 text-muted-foreground"
								/>
								<input
									aria-label="Search wallet history"
									value={search}
									onChange={(e) => {
										setSearch(e.target.value)
										setPage(1)
									}}
									placeholder={
										tab === "withdrawals"
											? "Search payout reference or amount…"
											: "Search reference, order, or amount…"
									}
									className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-xs outline-none focus-visible:ring-2 focus-visible:ring-primary"
								/>
							</div>
							<select
								aria-label={
									tab === "withdrawals"
										? "Filter payout status"
										: "Filter transaction type"
								}
								value={filter}
								onChange={(e) => {
									setFilter(e.target.value)
									setPage(1)
								}}
								className="h-11 rounded-xl border border-border bg-card px-4 text-xs focus-visible:outline-primary"
							>
								<option value="all">
									{tab === "withdrawals" ? "All statuses" : "All transactions"}
								</option>
								{tab === "withdrawals" ? (
									<>
										<option value="paid">Successful</option>
										<option value="failed">Failed</option>
										<option value="pending">Pending</option>
									</>
								) : (
									<>
										<option value="credit">Credits</option>
										<option value="debit">Debits</option>
									</>
								)}
							</select>
						</div>
					</div>
					{history.isPending ? (
						<div className="p-6">
							<LoadingState />
						</div>
					) : history.isError ? (
						<div className="p-5">
							<ErrorState
								error={history.error}
								retry={() => history.refetch()}
							/>
						</div>
					) : !filtered.length ? (
						<EmptyState
							title={
								search || filter !== "all"
									? "No matching records"
									: tab === "withdrawals"
										? "No withdrawals yet"
										: "No transactions yet"
							}
							description={
								search || filter !== "all"
									? "Try another reference or amount, or clear your filters."
									: tab === "withdrawals"
										? "Payout requests will appear here with their latest status."
										: "Wallet credits and debits will appear here as they are recorded."
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
					) : (
						<>
							<div className="overflow-x-auto">
								<table
									aria-label="Wallet history"
									className="w-full min-w-[600px] text-left"
								>
									<thead className="border-b border-border bg-muted/30 text-[10px] font-medium text-muted-foreground">
										<tr>
											<th className="px-6 py-3 font-medium">
												{tab === "withdrawals" ? "Requested" : "Date"}
											</th>
											<th className="px-4 py-3 font-medium">Activity</th>
											<th className="px-4 py-3 text-right font-medium">
												Amount
											</th>
											<th className="px-4 py-3 font-medium">Status</th>
											<th className="px-4 py-3">
												<span className="sr-only">Details</span>
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{filtered
											.slice((currentPage - 1) * 10, currentPage * 10)
											.map((row) => (
												<tr
													key={row.id}
													className="transition hover:bg-muted/20"
												>
													<td className="whitespace-nowrap px-6 py-5">
														<p className="text-xs">{walletDate(row.date)}</p>
														<p className="mt-1 text-[10px] text-muted-foreground">
															{walletTime(row.date)}
														</p>
													</td>
													<td className="px-4 py-5">
														<div className="flex items-center gap-3">
															<div
																className={cn(
																	"rounded-full p-2.5",
																	row.kind === "credit"
																		? "bg-emerald-500/10 text-emerald-600"
																		: "bg-muted text-muted-foreground",
																)}
															>
																{row.kind === "credit" ? (
																	<ArrowDownLeft size={16} />
																) : (
																	<ArrowUpRight size={16} />
																)}
															</div>
															<div>
																<p className="text-xs font-medium">
																	{row.label}
																</p>
																<button
																	className="mt-1 max-w-56 truncate text-[10px] text-muted-foreground hover:text-primary"
																	onClick={() => setSelected(row)}
																>
																	{row.reference}
																</button>
															</div>
														</div>
													</td>
													<td
														className={cn(
															"whitespace-nowrap px-4 py-5 text-right text-sm font-semibold",
															row.kind === "credit" &&
																"text-emerald-700 dark:text-emerald-400",
														)}
													>
														{row.kind === "credit"
															? "+"
															: row.kind === "debit"
																? "−"
																: ""}
														{money(row.amount)}
													</td>
													<td className="px-4 py-5">
														<HistoryStatus status={row.status} />
													</td>
													<td className="px-4 py-5">
														<button
															aria-label={`View ${row.reference}`}
															className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary focus-visible:outline-primary"
															onClick={() => setSelected(row)}
														>
															<ChevronRight size={15} />
														</button>
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
							<div className="border-t border-border px-6 pb-6">
								<Pagination
									page={currentPage}
									total={totalPages}
									onChange={setPage}
								/>
								<p className="mt-4 text-[10px] text-muted-foreground">
									Showing{" "}
									{Math.min((currentPage - 1) * 10 + 1, filtered.length)}–
									{Math.min(currentPage * 10, filtered.length)} of{" "}
									{filtered.length} records · All times WAT
								</p>
							</div>
						</>
					)}
				</Panel>
				<div className="space-y-5">
					<Panel>
						<h2 className="mb-5 text-sm font-semibold">About your balances</h2>
						<dl className="space-y-4 text-xs">
							<div>
								<dt className="font-medium">Available balance</dt>
								<dd className="mt-1.5 leading-relaxed text-muted-foreground">
									The current amount available in your seller wallet.
								</dd>
							</div>
							<div>
								<dt className="font-medium">Pending balance</dt>
								<dd className="mt-1.5 leading-relaxed text-muted-foreground">
									The amount recorded as pending, separate from available funds.
								</dd>
							</div>
							<div className="border-t border-border pt-4">
								<dt className="flex justify-between gap-3 text-muted-foreground">
									Total refunded
									<span className="font-medium text-foreground">
										{money(wallet.data.total_refunded)}
									</span>
								</dt>
							</div>
						</dl>
					</Panel>
					<Panel className="bg-primary/5">
						<Wallet size={23} className="mb-3 text-primary" />
						<h2 className="text-sm font-semibold">Your payment account</h2>
						<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
							Review your business details and verification from your account
							page.
						</p>
						<Link
							href="/market-vendor/account"
							className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
						>
							Manage account <ArrowUpRight size={13} />
						</Link>
					</Panel>
					<div className="px-2">
						<p className="text-xs text-muted-foreground">
							Have a question about a payout?
						</p>
						<Link
							href="/support"
							className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
						>
							Contact support →
						</Link>
					</div>
				</div>
			</div>
			<Dialog
				open={selected !== null}
				onOpenChange={(open) => {
					if (!open) setSelected(null)
				}}
			>
				<DialogContent className="rounded-2xl p-7">
					<DialogTitle>{selected?.reference || "Record details"}</DialogTitle>
					<DialogDescription>
						{selected?.kind === "payout"
							? "Details of this payout request."
							: "Details of this recorded wallet transaction."}
					</DialogDescription>
					{selected && (
						<>
							<div className="flex items-center justify-between gap-4 rounded-xl bg-muted/50 p-4">
								<p className="text-xl font-semibold">
									{money(selected.amount)}
								</p>
								<HistoryStatus status={selected.status} />
							</div>
							<dl className="space-y-4 text-xs">
								<div className="flex justify-between gap-4">
									<dt className="text-muted-foreground">Type</dt>
									<dd>{selected.label}</dd>
								</div>
								<div className="flex justify-between gap-4">
									<dt className="text-muted-foreground">
										{selected.kind === "payout" ? "Requested" : "Recorded"}
									</dt>
									<dd>
										{walletDate(selected.date)} · {walletTime(selected.date)}
									</dd>
								</div>
								{selected.kind === "payout" && (
									<div className="flex justify-between gap-4">
										<dt className="text-muted-foreground">Processed</dt>
										<dd>
											{selected.processedAt
												? `${walletDate(selected.processedAt)} · ${walletTime(selected.processedAt)}`
												: selected.status === "pending"
													? "Awaiting processing"
													: "Not provided"}
										</dd>
									</div>
								)}
								{selected.orderId && (
									<div className="flex justify-between gap-4">
										<dt className="text-muted-foreground">Related order</dt>
										<dd>
											<Link
												href={`/market-vendor/orders/${selected.orderId}`}
												className="text-primary hover:underline"
											>
												Order #{selected.orderId} →
											</Link>
										</dd>
									</div>
								)}
							</dl>
							<Button
								variant="outline"
								className="mt-2 rounded-full"
								onClick={() => setSelected(null)}
							>
								Close details
							</Button>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
