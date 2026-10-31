import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { marketplaceApi } from "@/lib/marketplace/api"
import { PayoutControls } from "./payout-controls"

vi.mock("@/lib/marketplace/api", () => ({
	marketplaceApi: {
		payoutQuote: vi.fn(),
		requestPayout: vi.fn(),
		payoutSettings: vi.fn(),
		updatePayoutSettings: vi.fn(),
	},
	marketplaceError: (error: Error) => error.message,
}))
vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

function show() {
	render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<PayoutControls verified />
		</QueryClientProvider>,
	)
	return userEvent.setup()
}

beforeEach(() => {
	vi.resetAllMocks()
	vi.mocked(marketplaceApi.payoutQuote).mockResolvedValue({
		amount: "9700.00",
		currency: "NGN",
		eligible: true,
		reason: null,
		minimum_payout_amount: "5000.00",
		scheduled_for: "2026-11-25",
		settlement_timezone: "Africa/Lagos",
	})
	vi.mocked(marketplaceApi.payoutSettings).mockResolvedValue({
		payout_frequency: "monthly",
		minimum_payout_amount: "5000.00",
		enabled: true,
	})
	vi.mocked(marketplaceApi.requestPayout).mockResolvedValue({
		detail: "Withdrawal scheduled",
		scheduled_for: "2026-11-25",
	})
})

describe("monthly withdrawal requests", () => {
	it("shows the settlement date and cutoff before submitting the reviewed cashable amount", async () => {
		const user = show()
		await user.click(screen.getByRole("button", { name: "Request payout" }))
		await screen.findByText(/Settlement: 25 Nov 2026/)
		expect(screen.getByText(/requests on or after the 25th/i)).toBeVisible()
		expect(marketplaceApi.requestPayout).not.toHaveBeenCalled()
		await user.click(screen.getByRole("button", { name: /Confirm payout/ }))
		await waitFor(() =>
			expect(marketplaceApi.requestPayout).toHaveBeenCalledTimes(1),
		)
		expect(vi.mocked(marketplaceApi.requestPayout).mock.calls[0][0]).toEqual({
			expected_amount: "9700.00",
			expected_settlement_date: "2026-11-25",
		})
	})

	it("cannot request withdrawals against uncleared order payments", async () => {
		vi.mocked(marketplaceApi.payoutQuote).mockResolvedValue({
			amount: "0.00",
			currency: "NGN",
			eligible: false,
			reason: "No cashable delivery earnings",
			minimum_payout_amount: "5000.00",
			scheduled_for: "2026-11-25",
			settlement_timezone: "Africa/Lagos",
		})
		const user = show()
		await user.click(screen.getByRole("button", { name: "Request payout" }))
		await screen.findByText("No cashable delivery earnings")
		expect(
			screen.getByRole("button", { name: /Confirm payout/ }),
		).toBeDisabled()
	})

	it("presents a fixed monthly settlement day without daily or weekly controls", async () => {
		const user = show()
		await user.click(screen.getByRole("button", { name: "Payout settings" }))
		await screen.findByText("25th of every month")
		expect(
			screen.queryByRole("combobox", { name: "Payout frequency" }),
		).not.toBeInTheDocument()
	})
})
