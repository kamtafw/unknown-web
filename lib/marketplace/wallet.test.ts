import { describe, expect, it } from "vitest"
import { filterWalletHistory, payoutRows, transactionRows, walletDate, walletTime } from "./wallet"

describe("wallet history", () => {
	it("keeps failed payouts and ledger records distinct", () => {
		const payout = payoutRows([
			{
				id: 1,
				amount: "250000.00",
				status: "failed",
				requested_at: "2026-10-15T12:00:00Z",
				processed_at: null,
			},
		])[0]
		expect(payout.status).toBe("failed")
		expect(payout.processedAt).toBeNull()
		const debit = transactionRows([
			{
				id: 1,
				amount: "250000.00",
				transaction_type: "debit",
				reference: "Marketplace payout #1",
				created_at: "2026-10-15T12:00:00Z",
			},
		])[0]
		expect(debit.status).toBe("recorded")
		expect(debit.kind).toBe("debit")
		expect(debit.id).not.toBe(payout.id)
	})
	it("searches formatted naira amounts and applies status filters together", () => {
		const rows = payoutRows([
			{
				id: 1,
				amount: "250000.00",
				status: "failed",
				requested_at: "2026-10-15T12:00:00Z",
				processed_at: null,
			},
		])
		expect(filterWalletHistory(rows, "₦250,000", "failed")).toHaveLength(1)
		expect(filterWalletHistory(rows, "₦250,000", "paid")).toHaveLength(0)
		expect(filterWalletHistory(rows, "Payout #1", "all")).toHaveLength(1)
	})
	it("keeps dates and times in WAT across UTC midnight boundaries", () => {
		expect(walletDate("2026-10-15T23:30:00Z")).toBe("16 Oct 2026")
		expect(walletTime("2026-10-15T23:30:00Z")).toBe("00:30 WAT")
	})
})
