import dayjs from "dayjs"

export type BillingPeriod = "monthly" | "quarterly" | "yearly"
export type TierId = "free" | "individual" | "organization" | "public-figure"

export interface TierPlan {
	id: Exclude<TierId, "free">
	name: string
	tagline: string
	monthlyPrice: number
	inherits?: Exclude<TierId, "free">
	ownFeatures: string[]
	badge?: string
}

export const TIER_ORDER: TierId[] = ["free", "individual", "organization", "public-figure"]

export const TIERS: TierPlan[] = [
	{
		id: "individual",
		name: "Individual",
		tagline: "For creators and everyday users who want more from AppsCombo.",
		monthlyPrice: 9.99,
		ownFeatures: [
			"Blue verification checkmark",
			"Edit posts up to 1 hour after publishing",
			"Enhanced post analytics & reach insights",
			"Ad-free browsing experience",
			"Priority email support",
		],
	},
	{
		id: "organization",
		name: "Organization",
		tagline: "Built for brands, businesses, and teams managing a shared presence.",
		monthlyPrice: 24.99,
		inherits: "individual",
		badge: "Most popular",
		ownFeatures: [
			"Organization verification badge",
			"Up to 10 team member seats",
			"Multi-account switching dashboard",
			"Custom profile branding & cover themes",
			"Dedicated account manager",
		],
	},
	{
		id: "public-figure",
		name: "Public Figure",
		tagline: "For politicians, executives, and public figures who need verified trust.",
		monthlyPrice: 49.99,
		inherits: "organization",
		ownFeatures: [
			"Official Public Figure badge",
			"Verified statements & fact-check priority queue",
			"Direct press & media contact tools",
			"Public records archive on profile",
			"24/7 crisis communication hotline",
		],
	},
]

export function findTier(id: Exclude<TierId, "free">): TierPlan {
	return TIERS.find((t) => t.id === id)!
}

/** flattens a tier's own features with everything it inherits, base-first */
export function getAllFeatures(id: TierId): string[] {
	if (id === "free") return []
	const tier = findTier(id)
	const inherited = tier.inherits ? getAllFeatures(tier.inherits) : []
	return [...inherited, ...tier.ownFeatures]
}

export function tierLabel(id: TierId): string {
	return id === "free" ? "Free" : findTier(id).name
}

export const SAVINGS: Record<BillingPeriod, number> = { monthly: 0, quarterly: 10, yearly: 20 }

export function priceForPeriod(monthlyPrice: number, period: BillingPeriod) {
	if (period === "monthly") {
		return { perMonth: monthlyPrice, totalBilled: monthlyPrice, billingNote: "Billed monthly" }
	}
	const months = period === "quarterly" ? 3 : 12
	const totalBilled = monthlyPrice * months * (1 - SAVINGS[period] / 100)
	const perMonth = totalBilled / months
	const billingNote =
		period === "quarterly"
			? `Billed $${totalBilled.toFixed(2)} every 3 months`
			: `Billed $${totalBilled.toFixed(2)} annually`
	return { perMonth, totalBilled, billingNote }
}

/** months between charges for a given cadence — used for renewal + invoice-history math */
export function periodStepMonths(period: BillingPeriod): number {
	return period === "monthly" ? 1 : period === "quarterly" ? 3 : 12
}

export function nextRenewalDate(period: BillingPeriod, from: Date | string = new Date()): Date {
	return dayjs(from).add(periodStepMonths(period), "month").toDate()
}

export function formatRenewalDate(date: Date | string | null): string {
	if (!date) return "—"
	return dayjs(date).format("MMMM D, YYYY")
}