import { BillingPeriod, TierId, nextRenewalDate } from "@/lib/billing"
import { create } from "zustand"

interface PaymentMethod {
	brand: string
	last4: string
}

interface SubscriptionState {
	tierId: TierId
	period: BillingPeriod | null
	renewalDate: string | null
	cancelAtPeriodEnd: boolean
	paymentMethod: PaymentMethod | null
	setSubscription: (tierId: TierId, period: BillingPeriod) => void
	setPaymentMethod: (pm: PaymentMethod) => void
	setCancelAtPeriodEnd: (cancel: boolean) => void
}

/**
 * stand-in for a real /users/subscription endpoint — swap the actions below
 * for mutations once billing is wired up server-side; the shape (tierId,
 * period, renewalDate, cancelAtPeriodEnd, paymentMethod) is what both the
 * switch-tier and manage-subscription panels read from
 */
export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
	tierId: "free",
	period: null,
	renewalDate: null,
	cancelAtPeriodEnd: false,
	paymentMethod: null,

	setSubscription: (tierId, period) =>
		set({
			tierId,
			period,
			renewalDate: nextRenewalDate(period).toISOString(),
			cancelAtPeriodEnd: false,
			// mock: assume a card gets charged on first upgrade if none is on file
			paymentMethod: { brand: "Visa", last4: "4242" },
		}),

	setPaymentMethod: (pm) => set({ paymentMethod: pm }),
	setCancelAtPeriodEnd: (cancel) => set({ cancelAtPeriodEnd: cancel }),
}))