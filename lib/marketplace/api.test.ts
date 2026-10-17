import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "@/lib/axios"
import { marketplaceApi, marketplaceError } from "./api"

vi.mock("@/lib/axios", () => ({
	apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const response = (data: unknown) => ({ data: { success: true, status_code: 200, message: null, data } })
beforeEach(() => vi.clearAllMocks())

describe("Django marketplace contracts", () => {
	it("resolves identity from the authenticated profile independently of wallet availability", async () => {
		vi.mocked(apiClient.get).mockResolvedValue(response({ id: 7, business_name: "Store", approval_status: "pending" }))
		expect(await marketplaceApi.identity()).toEqual({ seller_id: 7, business_name: "Store", approval_status: "pending" })
		expect(apiClient.get).toHaveBeenCalledExactlyOnceWith("/api/marketplace/seller/profile", { params: undefined })
	})

	it("keeps owner product reads separate from buyer analytics and fetches orders directly", async () => {
		vi.mocked(apiClient.get).mockResolvedValue(response({ product: { id: 42, description: null }, rating_summary: {} }))
		expect((await marketplaceApi.sellerProduct(42)).product.description).toBeNull()
		expect(apiClient.get).toHaveBeenLastCalledWith("/api/marketplace/seller/products/42", { params: undefined })
		await marketplaceApi.product(42)
		expect(apiClient.get).toHaveBeenLastCalledWith("/api/marketplace/products/42", { params: undefined })
		const order = { id: 1001, total: "601100.00", shipping_address: null, items: [{ product: 42, product_images: [], price: "300550.00" }] }
		vi.mocked(apiClient.get).mockResolvedValue(response(order))
		expect(await marketplaceApi.order(1001)).toEqual(order)
		expect(apiClient.get).toHaveBeenLastCalledWith("/api/marketplace/seller/orders/1001", { params: undefined })
	})

	it("unwraps paginated envelopes and never follows upstream pagination URLs from the browser", async () => {
		vi.mocked(apiClient.get)
			.mockResolvedValueOnce(response({ results: [{ id: 1 }], total_pages: 2, next: "https://backend.example/seller/orders?page=2" }))
			.mockResolvedValueOnce(response({ results: [{ id: 2 }], total_pages: 2, next: null }))
		expect(await marketplaceApi.orders()).toEqual([{ id: 1 }, { id: 2 }])
		expect(apiClient.get).toHaveBeenNthCalledWith(2, "/api/marketplace/seller/orders", { params: { limit: 100, page: 2 } })
	})

	it("does not display a partial list as complete when a later history page fails", async () => {
		const error = new Error("Service unavailable")
		vi.mocked(apiClient.get).mockResolvedValueOnce(response({ results: [{ id: 1 }], total_pages: 2 })).mockRejectedValueOnce(error)
		await expect(marketplaceApi.walletTransactions()).rejects.toBe(error)
	})

	it("uses the distinct backend sales and stats filter parameters with ISO dates", async () => {
		vi.mocked(apiClient.get).mockResolvedValue(response({ results: [] }))
		const filter = { period: "custom" as const, start: "2026-10-01", end: "2026-10-16" }
		await marketplaceApi.sales(42, filter, 2)
		expect(apiClient.get).toHaveBeenLastCalledWith("/api/marketplace/seller/products/42/sales", { params: { filter_by: "custom", start_date: filter.start, end_date: filter.end, page: 2 } })
		await marketplaceApi.stats(42, filter)
		expect(apiClient.get).toHaveBeenLastCalledWith("/api/marketplace/seller/products/42/stats", { params: { filter: "custom", start_date: filter.start, end_date: filter.end } })
	})

	it("preserves explicit null discounts and zero stock through mutations", async () => {
		vi.mocked(apiClient.patch).mockResolvedValue(response({ id: 42, quantity: 0, discount_price: null }))
		expect(await marketplaceApi.update(42, { quantity: 0, discount_price: null })).toEqual({ id: 42, quantity: 0, discount_price: null })
		expect(apiClient.patch).toHaveBeenLastCalledWith("/api/marketplace/products/42/edit", { quantity: 0, discount_price: null })
	})

	it("surfaces renderer field errors and business-rule messages", () => {
		expect(marketplaceError({ isAxiosError: true, response: { data: { message: "Request failed.", errors: { discount_price: { message: "Must be below the regular price.", code: "invalid" } } } } })).toBe("discount price: Must be below the regular price.")
		expect(marketplaceError({ isAxiosError: true, response: { data: { code: "seller_approval_required", message: "Seller approval required." } } })).toBe("Seller approval required.")
	})
})
