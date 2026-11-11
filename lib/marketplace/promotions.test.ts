import { expect, it } from "vitest"
import { hasActivePromotion, promotionStatus } from "./promotions"
import type { ProductPromotion } from "@/types/marketplace"

const promotion: ProductPromotion = {
	id: 1,
	product_id: 42,
	product_name: "Product",
	product_image: null,
	quantity: 25,
	duration_days: 7,
	amount_paid: "5000.00",
	start_date: "2020-01-01T00:00:00Z",
	end_date: "2024-01-01T00:00:00Z",
	is_active: true,
	sold_count: null,
	is_out_of_stock: false,
}

it("does not consider an expired promotion active even when its stored flag is still true", () => {
	expect(promotionStatus(promotion, new Date("2026-01-01").getTime())).toBe("expired")
	expect(hasActivePromotion([promotion], 42)).toBe(false)
})

it("prevents selecting a product that already has a current or scheduled promotion", () => {
	expect(hasActivePromotion([{ ...promotion, end_date: "2040-01-01T00:00:00Z" }], 42)).toBe(true)
	expect(
		hasActivePromotion(
			[{ ...promotion, start_date: "2039-01-01T00:00:00Z", end_date: "2040-01-01T00:00:00Z" }],
			42,
		),
	).toBe(true)
	expect(hasActivePromotion([{ ...promotion, end_date: "2040-01-01T00:00:00Z" }], 99)).toBe(false)
})
