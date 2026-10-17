import { beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest, NextResponse } from "next/server"
import { getAccessToken } from "@/lib/cookies"
import { proxyJson } from "@/lib/server-fetch"
import { GET, POST, PATCH } from "./route"

vi.mock("@/lib/cookies", () => ({ getAccessToken: vi.fn() }))
vi.mock("@/lib/server-fetch", () => ({ proxyJson: vi.fn() }))

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(getAccessToken).mockResolvedValue("test-access-token")
	vi.mocked(proxyJson).mockResolvedValue(NextResponse.json({ success: true }))
})

describe("seller marketplace proxy", () => {
	it("requires authentication for seller payout reconciliation", async () => {
		const path = ["seller", "payouts", "reconcile"]
		await POST(
			new NextRequest(
				"http://localhost/api/marketplace/seller/payouts/reconcile",
				{ method: "POST", body: "{}" },
			),
			{ params: Promise.resolve({ path }) },
		)
		expect(proxyJson).toHaveBeenCalledWith(
			expect.stringContaining("/marketplaces/seller/payouts/reconcile"),
			expect.objectContaining({
				method: "POST",
				body: "{}",
				headers: expect.objectContaining({
					Authorization: "Bearer test-access-token",
				}),
			}),
		)
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		vi.mocked(proxyJson).mockClear()
		const response = await POST(
			new NextRequest(
				"http://localhost/api/marketplace/seller/payouts/reconcile",
				{ method: "POST", body: "{}" },
			),
			{ params: Promise.resolve({ path }) },
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})
	it("authenticates private profile, product, and single-order reads", async () => {
		for (const path of [
			["seller", "profile"],
			["seller", "products", "42"],
			["seller", "orders", "1001"],
		]) {
			await GET(
				new NextRequest(`http://localhost/api/marketplace/${path.join("/")}`),
				{ params: Promise.resolve({ path }) },
			)
			expect(proxyJson).toHaveBeenLastCalledWith(
				expect.stringContaining(`/marketplaces/${path.join("/")}`),
				expect.objectContaining({
					method: "GET",
					cache: "no-store",
					headers: expect.objectContaining({
						Authorization: "Bearer test-access-token",
					}),
				}),
			)
			vi.mocked(getAccessToken).mockResolvedValueOnce(undefined)
			vi.mocked(proxyJson).mockClear()
			const response = await GET(
				new NextRequest(`http://localhost/api/marketplace/${path.join("/")}`),
				{ params: Promise.resolve({ path }) },
			)
			expect(response.status).toBe(401)
			expect(proxyJson).not.toHaveBeenCalled()
		}
	})
	it("preserves the confirmed promotion price and requires authentication to charge", async () => {
		await GET(
			new NextRequest("http://localhost/api/marketplace/promotions/options"),
			{
				params: Promise.resolve({ path: ["promotions", "options"] }),
			},
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/promotions/options"),
			expect.objectContaining({ method: "GET" }),
		)
		const payload = {
			product_id: 42,
			duration_days: 14,
			expected_price: "9000.00",
		}
		await POST(
			new NextRequest("http://localhost/api/marketplace/promotions/create", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
			{ params: Promise.resolve({ path: ["promotions", "create"] }) },
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/promotions/create"),
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify(payload),
			}),
		)
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		vi.mocked(proxyJson).mockClear()
		const response = await POST(
			new NextRequest("http://localhost/api/marketplace/promotions/create", {
				method: "POST",
				body: JSON.stringify(payload),
			}),
			{ params: Promise.resolve({ path: ["promotions", "create"] }) },
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})
	it("authenticates wallet history reads and payout requests", async () => {
		for (const path of [
			["seller", "wallet", "transactions"],
			["seller", "payouts", "history"],
		]) {
			await GET(
				new NextRequest(
					`http://localhost/api/marketplace/${path.join("/")}?page=2&limit=100`,
				),
				{ params: Promise.resolve({ path }) },
			)
			expect(proxyJson).toHaveBeenLastCalledWith(
				expect.stringContaining(
					`/marketplaces/${path.join("/")}?page=2&limit=100`,
				),
				expect.objectContaining({
					method: "GET",
					cache: "no-store",
					headers: expect.objectContaining({
						Authorization: "Bearer test-access-token",
					}),
				}),
			)
		}
		vi.mocked(proxyJson).mockClear()
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		const response = await POST(
			new NextRequest("http://localhost/api/marketplace/seller/payouts", {
				method: "POST",
				body: "{}",
			}),
			{ params: Promise.resolve({ path: ["seller", "payouts"] }) },
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})
	it("forwards private account reads, edits, and verification without a seller ID", async () => {
		await GET(
			new NextRequest("http://localhost/api/marketplace/seller/account"),
			{
				params: Promise.resolve({ path: ["seller", "account"] }),
			},
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/seller/account"),
			expect.objectContaining({ method: "GET", cache: "no-store" }),
		)
		await PATCH(
			new NextRequest("http://localhost/api/marketplace/seller/account", {
				method: "PATCH",
				body: JSON.stringify({ business_name: "New store" }),
			}),
			{ params: Promise.resolve({ path: ["seller", "account"] }) },
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/seller/account"),
			expect.objectContaining({
				method: "PATCH",
				body: '{"business_name":"New store"}',
			}),
		)
		await POST(
			new NextRequest(
				"http://localhost/api/marketplace/seller/verification-link",
				{
					method: "POST",
					body: "{}",
				},
			),
			{ params: Promise.resolve({ path: ["seller", "verification-link"] }) },
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/seller/verification-link"),
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer test-access-token",
				}),
			}),
		)
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		vi.mocked(proxyJson).mockClear()
		const response = await GET(
			new NextRequest("http://localhost/api/marketplace/seller/account"),
			{
				params: Promise.resolve({ path: ["seller", "account"] }),
			},
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})
	it("authenticates seller order reads and status changes", async () => {
		await GET(
			new NextRequest(
				"http://localhost/api/marketplace/seller/orders?page=2&limit=100",
			),
			{
				params: Promise.resolve({ path: ["seller", "orders"] }),
			},
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/seller/orders?page=2&limit=100"),
			expect.objectContaining({
				method: "GET",
				cache: "no-store",
				headers: expect.objectContaining({
					Authorization: "Bearer test-access-token",
				}),
			}),
		)
		await PATCH(
			new NextRequest(
				"http://localhost/api/marketplace/seller/orders/42/status",
				{
					method: "PATCH",
					body: JSON.stringify({ status: "shipped" }),
				},
			),
			{
				params: Promise.resolve({ path: ["seller", "orders", "42", "status"] }),
			},
		)
		expect(proxyJson).toHaveBeenLastCalledWith(
			expect.stringContaining("/marketplaces/seller/orders/42/status"),
			expect.objectContaining({
				method: "PATCH",
				body: '{"status":"shipped"}',
			}),
		)
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		vi.mocked(proxyJson).mockClear()
		const response = await PATCH(
			new NextRequest(
				"http://localhost/api/marketplace/seller/orders/42/status",
				{
					method: "PATCH",
					body: "{}",
				},
			),
			{
				params: Promise.resolve({ path: ["seller", "orders", "42", "status"] }),
			},
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})
	it("rejects unauthenticated requests before calling the backend", async () => {
		vi.mocked(getAccessToken).mockResolvedValue(undefined)
		const response = await GET(
			new NextRequest("http://localhost/api/marketplace/seller/wallet"),
			{
				params: Promise.resolve({ path: ["seller", "wallet"] }),
			},
		)
		expect(response.status).toBe(401)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("does not proxy arbitrary marketplace endpoints or unsupported methods", async () => {
		const unknown = await GET(
			new NextRequest("http://localhost/api/marketplace/stripe/webhook"),
			{
				params: Promise.resolve({ path: ["stripe", "webhook"] }),
			},
		)
		const method = await POST(
			new NextRequest("http://localhost/api/marketplace/seller/wallet", {
				method: "POST",
				body: "{}",
			}),
			{ params: Promise.resolve({ path: ["seller", "wallet"] }) },
		)
		expect(unknown.status).toBe(404)
		expect(method.status).toBe(404)
		expect(proxyJson).not.toHaveBeenCalled()
	})

	it("preserves sales filters and pagination while authenticating upstream", async () => {
		await GET(
			new NextRequest(
				"http://localhost/api/marketplace/seller/products/42/sales?filter_by=custom&start_date=2026-09-01&end_date=2026-09-30&page=2",
			),
			{
				params: Promise.resolve({
					path: ["seller", "products", "42", "sales"],
				}),
			},
		)
		expect(proxyJson).toHaveBeenCalledWith(
			expect.stringContaining(
				"/marketplaces/seller/products/42/sales?filter_by=custom&start_date=2026-09-01&end_date=2026-09-30&page=2",
			),
			expect.objectContaining({
				method: "GET",
				cache: "no-store",
				headers: expect.objectContaining({
					Authorization: "Bearer test-access-token",
				}),
			}),
		)
	})

	it("forwards product edits and rejects malformed JSON", async () => {
		const params = {
			params: Promise.resolve({ path: ["products", "42", "edit"] }),
		}
		await PATCH(
			new NextRequest("http://localhost/api/marketplace/products/42/edit", {
				method: "PATCH",
				body: JSON.stringify({ quantity: 0, discount_price: null }),
			}),
			params,
		)
		expect(proxyJson).toHaveBeenCalledWith(
			expect.stringContaining("/products/42/edit"),
			expect.objectContaining({
				method: "PATCH",
				body: '{"quantity":0,"discount_price":null}',
			}),
		)
		vi.mocked(proxyJson).mockClear()
		const malformed = await PATCH(
			new NextRequest("http://localhost/api/marketplace/products/42/edit", {
				method: "PATCH",
				body: "{",
			}),
			params,
		)
		expect(malformed.status).toBe(400)
		expect(proxyJson).not.toHaveBeenCalled()
	})
})
