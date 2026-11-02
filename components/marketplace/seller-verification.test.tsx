import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { SellerAccount } from "@/types/marketplace"
import { marketplaceApi } from "@/lib/marketplace/api"
import { SellerVerification } from "./seller-verification"

vi.mock("@/lib/marketplace/api", () => ({
	marketplaceApi: { verificationLink: vi.fn() },
	marketplaceError: (error: Error) => error.message,
}))

const account: SellerAccount = {
	id: 7,
	country: "NG",
	sell_scope: "local",
	business_name: "Store",
	business_description: "Goods",
	business_categories: ["Electronics"],
	full_name: "Seller",
	phone_number: "+2348031234567",
	store_address: "12 Marina Road",
	approval_status: "pending",
	approval_reviewed_at: null,
	has_payment_account: false,
	stripe_charges_enabled: false,
	stripe_payouts_enabled: false,
	stripe_onboarding_completed: false,
}

function show(data: SellerAccount) {
	return render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { mutations: { retry: false } } })
			}
		>
			<SellerVerification account={data} />
		</QueryClientProvider>,
	)
}

beforeEach(() => vi.clearAllMocks())
afterEach(cleanup)

describe("AppsCombo approval before Stripe verification", () => {
	it.each(["pending", "rejected"] as const)(
		"does not offer or request Stripe verification while %s",
		(approval_status) => {
			show({ ...account, approval_status })
			expect(
				screen.queryByRole("button", { name: "Verify account" }),
			).not.toBeInTheDocument()
			expect(marketplaceApi.verificationLink).not.toHaveBeenCalled()
		},
	)

	it("lets an approved seller with no Stripe account explicitly start payment setup", async () => {
		vi.mocked(marketplaceApi.verificationLink).mockRejectedValue(
			new Error("Verification is temporarily unavailable."),
		)
		show({ ...account, approval_status: "approved" })
		const user = userEvent.setup()
		expect(screen.getByRole("button", { name: "Verify account" })).toBeEnabled()
		expect(marketplaceApi.verificationLink).not.toHaveBeenCalled()
		await user.click(screen.getByRole("button", { name: "Verify account" }))
		expect(marketplaceApi.verificationLink).not.toHaveBeenCalled()
		await user.click(
			screen.getByRole("button", { name: "Continue to verification" }),
		)
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Verification is temporarily unavailable.",
		)
		expect(marketplaceApi.verificationLink).toHaveBeenCalledTimes(1)
	})

    it("accepts payout-enabled recipient accounts without requiring card charges", () => {
        show({ ...account, approval_status: "approved", has_payment_account: true, stripe_payouts_enabled: true })
        expect(screen.getByText("Your account is verified")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Verify account" })).not.toBeInTheDocument()
    })

	it("does not substitute an existing verified Stripe account for AppsCombo approval", () => {
		show({
			...account,
			has_payment_account: true,
			stripe_onboarding_completed: true,
			stripe_payouts_enabled: true,
		})
		expect(
			screen.getByText("Waiting for AppsCombo approval"),
		).toBeInTheDocument()
		expect(
			screen.queryByText("Your account is verified"),
		).not.toBeInTheDocument()
	})
})
