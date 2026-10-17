import type { ProductPromotion } from "@/types/marketplace"

export const promotionKeys = {
	all: ["marketplace", "promotions"] as const,
	pricing: ["marketplace", "promotion-pricing"] as const,
}
export const durationLabel = (days: number) => (days === 180 ? "6 months" : `${days} days`)
export function promotionStatus(promotion: ProductPromotion, now = Date.now()) {
	if (new Date(promotion.end_date).getTime() <= now) return "expired"
	if (!promotion.is_active) return "inactive"
	if (new Date(promotion.start_date).getTime() > now) return "scheduled"
	return "active"
}
export function hasActivePromotion(promotions: ProductPromotion[], productId: number) {
	return promotions.some(
		(promotion) =>
			promotion.product_id === productId &&
			["active", "scheduled"].includes(promotionStatus(promotion)),
	)
}
