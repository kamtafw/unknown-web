import type { SellerPayout, WalletTransaction } from "@/types/marketplace"

export interface WalletHistoryRow {
	id: string
	label: string
	reference: string
	amount: string
	kind: "payout" | "credit" | "debit"
	status: "queued" | "pending" | "paid" | "failed" | "recorded"
	date: string
	scheduledFor?: string | null
	processedAt: string | null
	orderId: number | null
}

export const payoutLabels = {
	queued: "Scheduled",
	pending: "Pending",
	paid: "Transferred to Stripe",
	failed: "Failed",
	recorded: "Recorded",
}
export const walletDate = (date: string) =>
	new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
		timeZone: "Africa/Lagos",
	}).format(new Date(date))
export const walletTime = (date: string) =>
	`${new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(date))} WAT`

export function payoutRows(payouts: SellerPayout[]): WalletHistoryRow[] {
	return payouts.map((payout) => ({
		id: `payout-${payout.id}`,
		label: "Withdrawal",
		reference: `Payout #${payout.id}`,
		amount: payout.amount,
		kind: "payout",
		status: payout.status,
		date: payout.requested_at,
		processedAt: payout.processed_at,
		scheduledFor: payout.scheduled_for,
		orderId: null,
	}))
}

export function transactionRows(
	transactions: WalletTransaction[],
): WalletHistoryRow[] {
	return transactions.map((transaction) => ({
		id: `transaction-${transaction.id}`,
		label: transaction.transaction_type === "credit" ? "Credit" : "Debit",
		reference: transaction.reference,
		amount: transaction.amount,
		kind: transaction.transaction_type,
		status: "recorded",
		date: transaction.created_at,
		processedAt: null,
		orderId: transaction.order_id ?? null,
	}))
}

export function filterWalletHistory(
	rows: WalletHistoryRow[],
	search: string,
	filter: string,
) {
	const query = search.trim().toLowerCase()
	const amountQuery = query.replace(/[₦,\s]/g, "")
	const matchesAmount = (amount: string) =>
		/^\d+(\.\d*)?$/.test(amountQuery) && amount.includes(amountQuery)
	return rows.filter(
		(row) =>
			(filter === "all" || row.status === filter || row.kind === filter) &&
			(!query ||
				matchesAmount(row.amount) ||
				[
					row.reference,
					row.label,
					row.amount,
					payoutLabels[row.status],
					row.orderId ? `Order #${row.orderId}` : "",
				].some((value) => value.toLowerCase().includes(query))),
	)
}
