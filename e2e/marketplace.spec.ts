import { expect, test, type Page } from "@playwright/test"
import type { SellerAccount, SellerOrder } from "../types/marketplace"

const seller = {
	id: 7,
	business_name: "The Everyday Store",
	country: "Nigeria",
	phone_number: "",
}

async function setupAccount(page: Page, verified = false) {
	await setup(page)
	let account: SellerAccount = {
		id: 7,
		approval_status: "approved",
		approval_reviewed_at: "2026-10-16T07:00:00Z",
		country: "NG",
		sell_scope: "local",
		business_name: seller.business_name,
		business_description: "Thoughtfully chosen essentials for everyday living.",
		business_categories: ["Electronics"],
		full_name: "Jordan Lane",
		phone_number: "+2348031234567",
		store_address: "12 Marina Road, Lagos, Nigeria",
		has_payment_account: true,
		stripe_charges_enabled: verified,
		stripe_payouts_enabled: verified,
		stripe_onboarding_completed: verified,
	}
	const writes: Record<string, unknown>[] = []
	let fail = false
	await page.route("**/api/marketplace/seller/account", async (route) => {
		if (route.request().method() === "PATCH") {
			const payload = route.request().postDataJSON()
			writes.push(payload)
			if (fail) {
				await route.fulfill({
					status: 400,
					json: {
						success: false,
						message: "Request failed.",
						errors: {
							business_name: {
								message: "This business name is not available.",
							},
						},
					},
				})
				return
			}
			account = { ...account, ...payload }
		}
		await route.fulfill({ json: envelope(account) })
	})
	return {
		writes,
		failUpdate: () => {
			fail = true
		},
	}
}
const categories = [
	{ id: 1, name: "Electronics" },
	{ id: 2, name: "Home & living" },
]
const product = {
	id: 42,
	name: "Everyday Smart Watch — Classic Edition",
	price: "300550.00",
	discount_price: null,
	quantity: 25,
	images: ["/market.svg", "/market%202.svg"],
	promote: true,
	categories: [categories[0]],
	created_at: "2025-01-17T10:00:00Z",
	description:
		"Stay connected with a beautifully simple everyday watch.\nIncludes a charging cable, adjustable strap, and quick-start guide.",
	specifications: [{ Weight: "120 g" }, { "Battery life": "3 days" }],
	seller,
	delivery_settings: [
		{ delivery_option: { id: 1, name: "God is Good" }, price: "2500.00" },
	],
}
const rating = {
	average_rating: 4.8,
	total_reviews: 14,
	breakdown: Object.fromEntries(
		[5, 4, 3, 2, 1].map((n) => [
			`${n}_star`,
			{ count: n === 5 ? 10 : 1, percent: n === 5 ? 72 : 7 },
		]),
	),
}
const paginate = (results: unknown[], page = 1, pages = 1) => ({
	results,
	count: results.length,
	current: page,
	total_pages: pages,
	next: page < pages ? "?page=2" : null,
	previous: null,
})
const envelope = (data: unknown) => ({
	success: true,
	status_code: 200,
	message: null,
	data,
})

const testOrigin = () =>
	test.info().project.use.baseURL || "http://localhost:4000"

async function setup(page: Page) {
	const payload = Buffer.from(
		JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
	).toString("base64url")
	await page.context().addCookies(
		["ac_token", "rf_token"].map((name) => ({
			name,
			value: `test.${payload}.fixture`,
			url: testOrigin(),
		})),
	)
	let current = structuredClone(product)
	current.images = current.images.map((src) => new URL(src, testOrigin()).href)
	const writes: {
		method: string
		path: string
		body: Record<string, unknown>
	}[] = []
	const reads: string[] = []
	await page.route("**/api/**", async (route) => {
		const request = route.request()
		const url = new URL(request.url())
		const path = url.pathname
		reads.push(`${path}${url.search}`)
		let data: unknown = {}
		if (request.method() !== "GET") {
			const body = request.method() === "DELETE" ? {} : request.postDataJSON()
			writes.push({ method: request.method(), path, body })
			if (path.endsWith("/edit"))
				current = {
					...current,
					...body,
					categories: body.category_ids
						? categories.filter((category) =>
								body.category_ids.includes(category.id),
							)
						: current.categories,
					delivery_settings: body.delivery_settings
						? body.delivery_settings.map(
								(delivery: { delivery_option_id: number; price: string }) => ({
									delivery_option: {
										id: delivery.delivery_option_id,
										name:
											delivery.delivery_option_id === 1 ? "God is Good" : "UPS",
									},
									price: delivery.price,
								}),
							)
						: current.delivery_settings,
				}
			data = { id: 42 }
		} else if (path === "/api/users/me")
			data = {
				id: "seller-user",
				pkid: 1,
				first_name: "Jordan",
				last_name: "Lane",
				username: "jordan",
				email: "jordan@example.test",
				profile_photo: "",
				country: "Nigeria",
			}
		else if (path.includes("social-accounts")) data = { accounts: [] }
		else if (path.endsWith("seller/profile"))
			data = { ...seller, approval_status: "approved" }
		else if (path.endsWith("seller/wallet")) data = { seller_id: seller.id }
		else if (path.endsWith("/details")) data = seller
		else if (path.endsWith("products/list") || path.endsWith("seller/products"))
			data = paginate(
				url.searchParams.get("search") === "missing" ? [] : [current],
			)
		else if (path.endsWith("categories/list")) data = paginate(categories)
		else if (path.endsWith("delivery-options/list"))
			data = paginate([
				{ id: 1, name: "God is Good" },
				{ id: 2, name: "UPS" },
			])
		else if (path.endsWith("/reviews"))
			data = paginate([
				{
					id: 1,
					user: { first_name: "Devon", last_name: "Lane" },
					rating: 5,
					review_text:
						"Beautiful quality and arrived on time. Exactly what I was looking for.",
					images: [],
					created_at: "2026-10-01T10:00:00Z",
				},
			])
		else if (path.endsWith("/summary"))
			data = {
				year: new Date().getFullYear(),
				total_revenue: 30000000,
				total_quantity: 100,
				chart: [
					"Jan",
					"Feb",
					"Mar",
					"Apr",
					"May",
					"Jun",
					"Jul",
					"Aug",
					"Sep",
					"Oct",
					"Nov",
					"Dec",
				].map((label, i) => ({
					label,
					value: [
						1200000, 1800000, 1400000, 2600000, 3000000, 3800000, 2900000,
						3500000, 4100000, 2200000, 0, 0,
					][i],
				})),
			}
		else if (path.endsWith("/sales"))
			data = paginate([
				{
					id: 1,
					product_name: current.name,
					price: current.price,
					quantity: 3,
					order: 1024,
					created_at: "2026-10-15T12:00:00Z",
				},
			])
		else if (path.endsWith("/stats"))
			data = { clicks: 43, unique_views: 62, sold: 20, liked: 43, reviews: 14 }
		else if (/\/products\/42$/.test(path))
			data = { product: current, rating_summary: rating }
		await route.fulfill({ json: envelope(data) })
	})
	return { writes, reads }
}

test.use({ viewport: { width: 1440, height: 1000 } })

const runtimeErrors = new WeakMap<Page, Error[]>()
test.beforeEach(async ({ page }) => {
	const errors: Error[] = []
	runtimeErrors.set(page, errors)
	page.on("pageerror", (error) => errors.push(error))
})
test.afterEach(async ({ page }) => {
	expect(runtimeErrors.get(page)).toEqual([])
})

test("catalogue identity is independent of wallet and offers setup for a missing profile", async ({
	page,
}) => {
	const { reads } = await setup(page)
	await page.route("**/api/marketplace/seller/wallet", (route) =>
		route.fulfill({
			status: 503,
			json: { success: false, message: "Wallet unavailable" },
		}),
	)
	await page.goto("/market-vendor/goods")
	await expect(page.getByRole("heading", { name: product.name })).toBeVisible()
	expect(reads.some((path) => path.endsWith("seller/wallet"))).toBe(false)
	await page.route("**/api/marketplace/seller/profile", (route) =>
		route.fulfill({
			status: 404,
			json: {
				success: false,
				code: "seller_profile_not_found",
				message: "Seller profile not found.",
			},
		}),
	)
	await page.goto("/market-vendor/goods")
	await expect(
		page.getByRole("heading", { name: "Set up your seller account" }),
	).toBeVisible()
	await expect(
		page.getByRole("link", { name: "Set up your store" }),
	).toHaveAttribute("href", "/market-vendor/setup")
})

test("pending sellers can create private listings before approval", async ({
	page,
}) => {
	const { writes } = await setup(page)
	await page.route("**/api/marketplace/seller/profile", (route) =>
		route.fulfill({
			json: envelope({ ...seller, approval_status: "pending" }),
		}),
	)
	await page.goto("/market-vendor/list-product")
	await expect(
		page.getByText("You can create and edit listings now.", { exact: false }),
	).toBeVisible()
	await page
		.getByLabel("Product name", { exact: true })
		.fill("Private desk lamp")
	await page.getByLabel("Product price (₦)", { exact: true }).fill("12500")
	await page.getByLabel("Product quantity", { exact: true }).fill("8")
	await page
		.getByRole("button", { name: "Select categories", exact: true })
		.click()
	await page.getByRole("button", { name: "Electronics", exact: true }).click()
	await page.getByRole("button", { name: "Done", exact: true }).click()
	await page
		.getByRole("button", { name: "Save listing", exact: true })
		.first()
		.click()
	await expect(page).toHaveURL(/\/goods\/42$/)
	expect(writes[0].body.name).toBe("Private desk lamp")
})

test("tracking opens an owner-scoped order without list or product analytics requests", async ({
	page,
}) => {
	await setupOrders(page)
	const reads: string[] = []
	page.on("request", (request) => {
		if (request.method() === "GET") reads.push(new URL(request.url()).pathname)
	})
	await page.goto("/market-vendor/orders/1001")
	await expect(
		page.getByRole("heading", { name: "Order #1001", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("img", { name: product.name }).first(),
	).toBeVisible()
	expect(reads).toContain("/api/marketplace/seller/orders/1001")
	expect(reads).not.toContain("/api/marketplace/seller/orders")
	expect(reads).not.toContain("/api/marketplace/products/42")
	await page.goto("/market-vendor/orders/9999")
	await expect(
		page.getByRole("heading", { name: "Order not found" }),
	).toBeVisible()
})

test("seller catalogue, details, reviews, and date-filtered tracking", async ({
	page,
}) => {
	const { reads, writes } = await setup(page)
	await page.goto("/market-vendor/goods")
	await expect(
		page.getByRole("heading", { name: "My products", exact: true }),
	).toBeVisible()
	await expect(page.getByRole("heading", { name: product.name })).toBeVisible()
	await page.getByRole("heading", { name: product.name }).click()
	await expect(
		page.getByRole("heading", { name: "Product details", exact: true }),
	).toBeVisible()
	await expect(page.getByText("25 in stock")).toBeVisible()
	await page.screenshot({ path: "/tmp/marketplace-details.png" })
	await page.getByRole("switch", { name: "Promote this product" }).click()
	await expect.poll(() => writes.length).toBe(1)
	expect(writes[0].body.promote).toBe(false)
	await page.getByRole("button", { name: "Reviews & ratings" }).click()
	await expect(
		page.getByText("Beautiful quality", { exact: false }),
	).toBeVisible()
	await page.getByRole("link", { name: "View all reviews" }).click()
	await page.getByRole("button", { name: "4", exact: true }).click()
	await expect
		.poll(() => reads.some((url) => url.includes("rating=4")))
		.toBe(true)
	await page.getByRole("link", { name: "Back to product details" }).click()
	await page.getByRole("tab", { name: "Track sales" }).click()
	await expect(page.getByText("₦30,000,000.00", { exact: true })).toBeVisible()
	await page.getByRole("button", { name: "This month", exact: true }).click()
	await page.getByRole("button", { name: "Custom duration" }).click()
	await page.getByLabel("From", { exact: true }).fill("2026-09-01")
	await page.getByLabel("To", { exact: true }).fill("2026-09-30")
	await page.getByRole("button", { name: "Apply filter" }).click()
	await expect
		.poll(() =>
			reads.some(
				(url) =>
					url.includes("filter_by=custom") &&
					url.includes("start_date=2026-09-01"),
			),
		)
		.toBe(true)
	await page.getByRole("button", { name: "Tracks", exact: true }).click()
	await expect(page.getByText("Unique views", { exact: true })).toBeVisible()
	await expect
		.poll(() => reads.some((url) => url.includes("stats?filter=custom")))
		.toBe(true)
	await page.screenshot({ path: "/tmp/marketplace-sales.png" })
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
})

test("editor validates discounts and sends category, specs, delivery, and image changes", async ({
	page,
}) => {
	const { writes } = await setup(page)
	await page.goto("/market-vendor/goods/42/edit")
	await expect(page.getByLabel("Product name", { exact: true })).toHaveValue(
		product.name,
	)
	await page.screenshot({ path: "/tmp/marketplace-editor.png" })
	await page
		.getByLabel("Product name", { exact: true })
		.fill("Updated smart watch")
	await page.getByRole("switch", { name: "Add a discount" }).check()
	await page.getByLabel("Discount price (₦)", { exact: true }).fill("400000")
	await page
		.getByRole("button", { name: "Save changes", exact: true })
		.first()
		.click()
	await expect(
		page.getByRole("alert").filter({ hasText: "below the regular price" }),
	).toBeVisible()
	expect(writes).toHaveLength(0)
	await page.getByLabel("Discount price (₦)", { exact: true }).fill("250000")
	await page.getByRole("button", { name: "Electronics", exact: true }).click()
	await page.getByRole("button", { name: "Home & living", exact: true }).click()
	await page.getByRole("button", { name: "Done", exact: true }).click()
	await page.getByRole("button", { name: "Add another specification" }).click()
	await page
		.getByRole("textbox", { name: "Specification 3 name" })
		.fill("Colour")
	await page
		.getByRole("textbox", { name: "Specification 3 value" })
		.fill("White")
	await page
		.getByRole("button", { name: "Add another delivery option" })
		.click()
	await page
		.getByRole("button", { name: "Select delivery", exact: true })
		.click()
	await page.getByRole("button", { name: "UPS", exact: true }).click()
	await page
		.getByRole("spinbutton", { name: "Delivery 2 price in naira" })
		.fill("3500")
	await page.getByRole("button", { name: "Remove image 2" }).click()
	await page
		.getByRole("button", { name: "Save changes", exact: true })
		.first()
		.click()
	await expect.poll(() => writes.length).toBe(1)
	expect(writes[0].body).toMatchObject({
		name: "Updated smart watch",
		discount_price: "250000",
		category_ids: [1, 2],
		specifications: [
			{ Weight: "120 g" },
			{ "Battery life": "3 days" },
			{ Colour: "White" },
		],
		delivery_settings: [
			{ delivery_option_id: 1, price: "2500.00" },
			{ delivery_option_id: 2, price: "3500" },
		],
		images: [new URL(product.images[0], testOrigin()).href],
	})
	await expect(page).toHaveURL(/\/goods\/42$/)
})

test("publishes a new listing and confirms removal", async ({ page }) => {
	const { writes } = await setup(page)
	await page.goto("/market-vendor/list-product")
	await page.getByLabel("Product name", { exact: true }).fill("New desk lamp")
	await page.getByLabel("Product price (₦)", { exact: true }).fill("12500")
	await page.getByLabel("Product quantity", { exact: true }).fill("8")
	await page
		.getByRole("button", { name: "Select categories", exact: true })
		.click()
	await page.getByRole("button", { name: "Electronics", exact: true }).click()
	await page.getByRole("button", { name: "Done", exact: true }).click()
	await page
		.getByRole("button", { name: "Publish product", exact: true })
		.first()
		.click()
	await expect.poll(() => writes.length).toBe(1)
	expect(writes[0]).toMatchObject({
		method: "POST",
		body: { name: "New desk lamp", quantity: 8, category_ids: [1] },
	})
	await expect(page).toHaveURL(/\/goods\/42$/)
	await page.getByRole("button", { name: "Remove", exact: true }).click()
	await page.getByRole("button", { name: "Keep product" }).click()
	expect(writes).toHaveLength(1)
	await page.getByRole("button", { name: "Remove", exact: true }).click()
	await page
		.getByRole("button", { name: "Remove product", exact: true })
		.click()
	await expect
		.poll(() => writes.some((write) => write.method === "DELETE"))
		.toBe(true)
	await expect(page).toHaveURL(/\/market-vendor\/goods$/)
})

test("shows empty search, server errors, and prevents editing another seller’s listing", async ({
	page,
}) => {
	await setup(page)
	await page.goto("/market-vendor/goods")
	await page.getByRole("textbox", { name: "Search products" }).fill("missing")
	await expect(
		page.getByRole("heading", { name: "No matching products" }),
	).toBeVisible()
	await page.getByRole("button", { name: "Clear search" }).click()
	await expect(page.getByRole("heading", { name: product.name })).toBeVisible()
	await page.route("**/api/marketplace/seller/products/42", (route) =>
		route.fulfill({
			json: envelope({
				product: { ...product, seller: { ...seller, id: 99 } },
				rating_summary: rating,
			}),
		}),
	)
	await page.goto("/market-vendor/goods/42/edit")
	await expect(
		page.getByRole("heading", {
			name: "This listing belongs to another seller",
		}),
	).toBeVisible()
	await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(
		0,
	)
	await page.route("**/api/marketplace/seller/profile", (route) =>
		route.fulfill({
			status: 403,
			json: { success: false, message: "Complete seller setup first." },
		}),
	)
	await page.goto("/market-vendor/goods")
	await expect(
		page.getByRole("alert").filter({ hasText: "Complete seller setup first." }),
	).toBeVisible()
})

test("uploads images, enforces the six-image limit, and fits a smaller desktop", async ({
	page,
}) => {
	await setup(page)
	let uploads = 0
	await page.route("**/api/socials/upload-media", async (route) => {
		uploads++
		expect(route.request().headers()["content-type"]).toContain(
			"multipart/form-data",
		)
		await route.fulfill({
			json: envelope({
				media_urls: [new URL("/market.svg", testOrigin()).href],
			}),
		})
	})
	await page.setViewportSize({ width: 1100, height: 900 })
	await page.goto("/market-vendor/goods/42/edit")
	await expect(page.getByLabel("Product name", { exact: true })).toHaveValue(
		product.name,
	)
	const image = {
		name: "product.png",
		mimeType: "image/png",
		buffer: Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
			"base64",
		),
	}
	await page.getByLabel("Upload product images").setInputFiles(image)
	await expect(page.getByText("3 / 6", { exact: true })).toBeVisible()
	expect(uploads).toBe(1)
	await page
		.getByLabel("Upload product images")
		.setInputFiles([image, image, image, image])
	await expect(
		page.getByRole("alert").filter({ hasText: "up to 6 images" }),
	).toBeVisible()
	expect(uploads).toBe(1)
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
	await page.screenshot({ path: "/tmp/marketplace-editor-desktop.png" })
	await page.goto("/market-vendor/goods/42")
	await page.getByRole("tab", { name: "Product details", exact: true }).focus()
	await page.keyboard.press("ArrowRight")
	await expect(page.getByRole("tab", { name: "Track sales" })).toBeFocused()
	await expect(page.getByRole("tab", { name: "Track sales" })).toHaveAttribute(
		"aria-selected",
		"true",
	)
})

async function setupOrders(page: Page) {
	await setup(page)
	let orders: SellerOrder[] = (
		["paid", "shipped", "delivered", "pending", "cancelled"] as const
	).map((status, index) => ({
		id: 1001 + index,
		buyer_id: `buyer-${index}`,
		seller: 7,
		seller_name: seller.business_name,
		shipping_address: {
			full_name: `Customer ${index + 1}`,
			phone_number: "+2348001234567",
			address_line: "12 Marina Road",
			city: "Lagos",
			state: "Lagos",
			country: "Nigeria",
			postal_code: "100001",
		},
		subtotal: "601100.00",
		commission: "18033.00",
		total: "601100.00",
		refunded_amount: "0.00",
		status,
		created_at: "2026-10-15T12:00:00Z",
		items: [
			{
				product: 42,
				product_name: product.name,
				product_images: product.images.map(
					(src) => new URL(src, testOrigin()).href,
				),
				quantity: 2,
				price: "300550.00",
			},
		],
	}))
	const writes: { id: number; status: string }[] = []
	const pages: number[] = []
	let failUpdate = false
	await page.route("**/api/marketplace/seller/orders**", async (route) => {
		const request = route.request()
		if (request.method() === "PATCH") {
			const id = Number(new URL(request.url()).pathname.split("/").at(-2))
			const { status } = request.postDataJSON()
			writes.push({ id, status })
			if (failUpdate) {
				await route.fulfill({
					status: 400,
					json: { success: false, message: "Order must be paid first." },
				})
				return
			}
			orders = orders.map((order) =>
				order.id === id ? { ...order, status } : order,
			)
			await route.fulfill({
				json: envelope(orders.find((order) => order.id === id)),
			})
		} else if (/\/seller\/orders\/\d+$/.test(new URL(request.url()).pathname)) {
			const id = Number(new URL(request.url()).pathname.split("/").at(-1))
			const order = orders.find((entry) => entry.id === id)
			await route.fulfill(
				order
					? { json: envelope(order) }
					: {
							status: 404,
							json: { success: false, message: "Order not found." },
						},
			)
		} else {
			const pageNumber = Number(
				new URL(request.url()).searchParams.get("page") || 1,
			)
			pages.push(pageNumber)
			await route.fulfill({
				json: envelope({
					...paginate(
						pageNumber === 1 ? orders.slice(0, 2) : orders.slice(2),
						pageNumber,
						2,
					),
					count: orders.length,
				}),
			})
		}
	})
	let alerts = orders.slice(0, 3).map((order, index) => ({
		id: 500 + index,
		notification_type: "marketplace_seller_order",
		message: "Order status updated.",
		sent_at: "2026-10-15T12:00:00Z",
		is_read: false,
		metadata: {
			title:
				index === 0
					? "You have a new paid order #1001"
					: index === 1
						? "Order #1002 has been shipped"
						: "Order #1003 has been delivered",
			kind: ["new", "shipped", "delivered"][index],
			order_id: order.id,
			product_id: 42,
			product_name: product.name,
			product_image: new URL(product.images[0], testOrigin()).href,
			total: order.total,
		},
	}))
	await page.route("**/api/marketplace/seller/alerts**", async (route) => {
		const path = new URL(route.request().url()).pathname
		if (route.request().method() === "PATCH") {
			if (path.endsWith("read-all")) {
				alerts = alerts.map((alert) => ({ ...alert, is_read: true }))
				await route.fulfill({ json: envelope({ updated: alerts.length }) })
				return
			}
			const id = Number(path.split("/").at(-2))
			alerts = alerts.map((alert) =>
				alert.id === id ? { ...alert, is_read: true } : alert,
			)
			await route.fulfill({
				json: envelope(alerts.find((alert) => alert.id === id)),
			})
			return
		}
		await route.fulfill({
			json: envelope({
				...paginate(alerts),
				unread_count: alerts.filter((alert) => !alert.is_read).length,
			}),
		})
	})

	return {
		writes,
		pages,
		getOrders: () => orders,
		failNextUpdate: () => {
			failUpdate = true
		},
	}
}

test("orders filters include later API pages and link to tracking", async ({
	page,
}) => {
	const { pages } = await setupOrders(page)
	await page.goto("/market-vendor/orders")
	await expect(
		page.getByRole("heading", { name: "Orders", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("link", { name: "Order #1002", exact: true }),
	).toBeVisible()
	expect(pages).toEqual([1, 2])
	await expect(
		page
			.getByRole("navigation", { name: "Seller navigation" })
			.first()
			.getByRole("link", { name: "Orders", exact: true }),
	).toHaveAttribute("aria-current", "page")
	await page.screenshot({ path: "/tmp/marketplace-orders.png" })
	await page.getByRole("button", { name: "Delivered 1", exact: true }).click()
	await expect(
		page.getByRole("link", { name: "Order #1003", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Mark as delivered", exact: true }),
	).toHaveCount(0)
	await page.getByRole("textbox", { name: "Search orders" }).fill("missing")
	await expect(
		page.getByRole("heading", { name: "No matching orders" }),
	).toBeVisible()
	await page
		.getByRole("button", { name: "View all orders", exact: true })
		.click()
	await page.getByRole("textbox", { name: "Search orders" }).fill("#1002")
	await expect(
		page.getByRole("link", { name: "Order #1002", exact: true }),
	).toBeVisible()
	await page.getByRole("link", { name: "View tracking", exact: true }).click()
	await expect(
		page.getByRole("heading", { name: "Order #1002", exact: true }),
	).toBeVisible()
	await expect(page.getByText("12 Marina Road", { exact: false })).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "Package on the way" }),
	).toBeVisible()
	await expect(page.getByText("Completion time not provided")).toHaveCount(2)
	await page.screenshot({ path: "/tmp/marketplace-tracking.png" })
})

test("paid orders require confirmation before shipping and delivery", async ({
	page,
}) => {
	const { writes } = await setupOrders(page)
	await page.goto("/market-vendor/orders/1001")
	await expect(
		page.getByRole("button", { name: "Mark as delivered", exact: true }),
	).toHaveCount(0)
	await page
		.getByRole("button", { name: "Mark as shipped", exact: true })
		.click()
	await page.getByRole("button", { name: "Cancel", exact: true }).click()
	expect(writes).toEqual([])
	await page
		.getByRole("button", { name: "Mark as shipped", exact: true })
		.click()
	await page
		.getByRole("button", { name: "Confirm shipped", exact: true })
		.click()
	await expect(
		page.getByRole("button", { name: "Mark as delivered", exact: true }),
	).toBeVisible()
	expect(writes).toEqual([{ id: 1001, status: "shipped" }])
	await page
		.getByRole("button", { name: "Mark as delivered", exact: true })
		.click()
	await page
		.getByRole("button", { name: "Confirm delivered", exact: true })
		.click()
	await expect(
		page.getByText("This order has been marked as delivered."),
	).toBeVisible()
	expect(writes).toEqual([
		{ id: 1001, status: "shipped" },
		{ id: 1001, status: "delivered" },
	])
	await expect(
		page.getByRole("button", { name: "Mark as delivered", exact: true }),
	).toHaveCount(0)
	await page.goto("/market-vendor/orders/1004")
	await expect(page.getByRole("button", { name: /Mark as/ })).toHaveCount(0)
	await page.goto("/market-vendor/orders/1005")
	await expect(
		page.getByRole("heading", { name: "Package on the way" }),
	).toHaveCount(0)
})

test("alerts show order activity, support search, and open the correct order", async ({
	page,
}) => {
	await setupOrders(page)
	await page.goto("/market-vendor/alerts")
	await expect(
		page.getByRole("heading", { name: "Alerts", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("heading", {
			name: "You have a new paid order #1001",
			exact: true,
		}),
	).toBeVisible()
	await expect(
		page.getByRole("heading", {
			name: "Order #1003 has been delivered",
			exact: true,
		}),
	).toBeVisible()
	await page.screenshot({ path: "/tmp/marketplace-alerts.png" })
	await page.getByRole("button", { name: "Delivered", exact: true }).click()
	await expect(
		page.getByRole("heading", {
			name: "You have a new paid order #1001",
			exact: true,
		}),
	).toHaveCount(0)
	await page.getByRole("textbox", { name: "Search alerts" }).fill("#1003")
	await page.getByRole("link", { name: "See details", exact: true }).click()
	await expect(page).toHaveURL(/\/orders\/1003$/)
	await page.setViewportSize({ width: 1100, height: 900 })
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
	await page.goto("/market-vendor/orders/9999")
	await expect(
		page.getByRole("heading", { name: "Order not found" }),
	).toBeVisible()
})

test("a rejected order update keeps the status unchanged and shows the server error", async ({
	page,
}) => {
	const { failNextUpdate } = await setupOrders(page)
	failNextUpdate()
	await page.goto("/market-vendor/orders/1001")
	await page
		.getByRole("button", { name: "Mark as shipped", exact: true })
		.click()
	await page
		.getByRole("button", { name: "Confirm shipped", exact: true })
		.click()
	await expect(
		page.getByRole("alert").filter({ hasText: "Order must be paid first." }),
	).toBeVisible()
	await expect(page.getByRole("dialog")).toBeVisible()
	await page.getByRole("button", { name: "Cancel", exact: true }).click()
	await expect(
		page.getByRole("button", { name: "Mark as shipped", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Mark as delivered", exact: true }),
	).toHaveCount(0)
})

test("account editor loads saved details, validates phone, and saves business categories", async ({
	page,
}) => {
	const { writes } = await setupAccount(page)
	await page.goto("/market-vendor/account")
	await expect(
		page.getByRole("heading", { name: "Account", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "Jordan Lane", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Verify account", exact: true }),
	).toBeVisible()
	await page.screenshot({ path: "/tmp/marketplace-account.png" })
	await page.getByRole("link", { name: "Edit account", exact: true }).click()
	await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
		seller.business_name,
	)
	await expect(
		page.getByLabel("Business country", { exact: true }),
	).toBeDisabled()
	await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
		"Jordan Lane",
	)
	await expect(page.getByLabel("Store address", { exact: true })).toHaveValue(
		"12 Marina Road, Lagos, Nigeria",
	)
	await page.screenshot({ path: "/tmp/marketplace-account-editor.png" })
	await page
		.getByLabel("Business name", { exact: true })
		.fill("Jordan’s Everyday Store")
	await page.getByLabel("Phone number", { exact: true }).fill("123")
	await page
		.getByRole("button", { name: "Save changes", exact: true })
		.first()
		.click()
	await expect(
		page.getByRole("alert").filter({ hasText: "valid phone number" }),
	).toBeVisible()
	expect(writes).toEqual([])
	await page.getByLabel("Phone number", { exact: true }).fill("+2348031234567")
	await page.getByRole("button", { name: "Home & living", exact: true }).click()
	await page
		.getByLabel("Where do you sell?", { exact: true })
		.selectOption("global")
	await page
		.getByRole("button", { name: "Save changes", exact: true })
		.first()
		.click()
	await expect(page).toHaveURL(/\/market-vendor\/account$/)
	await expect(
		page.getByText("Jordan’s Everyday Store", { exact: true }),
	).toBeVisible()
	expect(writes[0]).toMatchObject({
		business_name: "Jordan’s Everyday Store",
		business_categories: ["Electronics", "Home & living"],
		country: "NG",
		full_name: "Jordan Lane",
		phone_number: "+2348031234567",
		sell_scope: "global",
	})
})

test("verified account hides verification prompt and switches to buyer browsing", async ({
	page,
}) => {
	await setupAccount(page, true)
	await page.goto("/market-vendor/account")
	await expect(
		page.getByRole("heading", {
			name: "Your account is verified",
			exact: true,
		}),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Verify account" }),
	).toHaveCount(0)
	await page
		.getByRole("link", { name: "Switch to buyer’s account", exact: true })
		.click()
	await expect(page).toHaveURL(/\/marketplace\/homes$/)
	await expect(
		page.getByRole("heading", {
			name: "Discover something for you",
			exact: true,
		}),
	).toBeVisible()
	await page.getByRole("heading", { name: product.name, exact: true }).click()
	await expect(page.getByRole("dialog")).toBeVisible()
	await expect(
		page.getByText("Sold by The Everyday Store", { exact: false }),
	).toBeVisible()
	await page.keyboard.press("Escape")
	await page
		.getByRole("link", { name: "Switch to seller’s account", exact: true })
		.click()
	await expect(page).toHaveURL(/\/market-vendor\/account$/)
	await page.setViewportSize({ width: 1100, height: 900 })
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
})

test("verification opens the Stripe link and failed account saves preserve edits", async ({
	page,
}) => {
	const { failUpdate } = await setupAccount(page)
	await page.route("**/api/marketplace/seller/verification-link", (route) =>
		route.fulfill({
			json: envelope({ url: "https://connect.stripe.com/setup/test" }),
		}),
	)
	await page.route("https://connect.stripe.com/**", (route) =>
		route.fulfill({
			contentType: "text/html",
			body: "<h1>Test verification page</h1>",
		}),
	)
	await page.goto("/market-vendor/account")
	await page
		.getByRole("button", { name: "Verify account", exact: true })
		.click()
	await page
		.getByRole("button", { name: "Continue to verification", exact: true })
		.click()
	await expect(page).toHaveURL("https://connect.stripe.com/setup/test")
	await page.goto(`${testOrigin()}/market-vendor/account/edit`)
	failUpdate()
	await page
		.getByLabel("Business name", { exact: true })
		.fill("A different name")
	await page
		.getByRole("button", { name: "Save changes", exact: true })
		.first()
		.click()
	await expect(
		page
			.getByRole("alert")
			.filter({ hasText: "This business name is not available." }),
	).toBeVisible()
	await expect(page.getByLabel("Business name", { exact: true })).toHaveValue(
		"A different name",
	)
	await expect(page).toHaveURL(/\/account\/edit$/)
})

test("missing account offers seller setup and sends the completed form", async ({
	page,
}) => {
	await setup(page)
	let exists = false
	const writes: Record<string, unknown>[] = []
	await page.route("**/api/marketplace/seller/account", (route) =>
		route.fulfill(
			exists
				? {
						json: envelope({
							id: 7,
							approval_status: "pending",
							approval_reviewed_at: null,
							country: "NG",
							sell_scope: "local",
							business_name: "New store",
							business_description: "Everyday products",
							business_categories: ["Electronics"],
							full_name: "Jordan Lane",
							phone_number: "+2348031234567",
							store_address: "12 Marina Road",
							has_payment_account: true,
							stripe_charges_enabled: false,
							stripe_payouts_enabled: false,
							stripe_onboarding_completed: false,
						}),
					}
				: {
						status: 404,
						json: {
							success: false,
							message: "Set up your seller account first.",
							code: "seller_profile_missing",
						},
					},
		),
	)
	await page.route("**/api/marketplace/setup", async (route) => {
		writes.push(route.request().postDataJSON())
		exists = true
		await route.fulfill({ json: envelope({ id: 7 }) })
	})
	await page.goto("/market-vendor/account")
	await page
		.getByRole("link", { name: "Set up your store", exact: true })
		.click()
	await page.getByLabel("Business name", { exact: true }).fill("New store")
	await page
		.getByLabel("Business description", { exact: true })
		.fill("Everyday products")
	await page.getByLabel("Full name", { exact: true }).fill("Jordan Lane")
	await page.getByLabel("Phone number", { exact: true }).fill("+2348031234567")
	await page.getByLabel("Store address", { exact: true }).fill("12 Marina Road")
	await page.getByRole("button", { name: "Electronics", exact: true }).click()
	await page
		.getByRole("button", { name: "Create seller account", exact: true })
		.first()
		.click()
	await expect(page).toHaveURL(/\/market-vendor\/account$/)
	expect(writes[0]).toMatchObject({
		country: "NG",
		business_name: "New store",
		full_name: "Jordan Lane",
		business_categories: ["Electronics"],
	})
})

async function setupWallet(page: Page, verified = true) {
	await setupAccount(page, verified)
	const requestedPages: number[] = []
	const payouts = Array.from({ length: 12 }, (_, index) => ({
		id: 901 + index,
		amount: index === 10 ? "275000.00" : "250000.00",
		status: ["failed", "paid", "pending"][index % 3],
		requested_at: "2026-10-15T12:00:00Z",
		processed_at: index % 3 === 2 ? null : "2026-10-15T12:30:00Z",
	}))
	await page.route("**/api/marketplace/seller/wallet", (route) =>
		route.fulfill({
			json: envelope({
				seller_id: 7,
				available_balance: "300550000.00",
				pending_balance: "125000.00",
				total_earned: "350000000.00",
				total_refunded: "15000.00",
				created_at: "2025-01-17T10:00:00Z",
				updated_at: "2026-10-15T12:00:00Z",
			}),
		}),
	)
	await page.route("**/api/marketplace/seller/payouts/history**", (route) => {
		const pageNumber = Number(
			new URL(route.request().url()).searchParams.get("page") || 1,
		)
		requestedPages.push(pageNumber)
		return route.fulfill({
			json: envelope({
				...paginate(
					pageNumber === 1 ? payouts.slice(0, 6) : payouts.slice(6),
					pageNumber,
					2,
				),
				count: payouts.length,
			}),
		})
	})
	await page.route("**/api/marketplace/seller/wallet/transactions**", (route) =>
		route.fulfill({
			json: envelope(
				paginate([
					{
						id: 11,
						amount: "10000.00",
						transaction_type: "credit",
						reference: "Order #1001 payment",
						order_id: 1001,
						created_at: "2026-10-15T12:00:00Z",
					},
					{
						id: 12,
						amount: "250000.00",
						transaction_type: "debit",
						reference: "Marketplace payout #902",
						order_id: null,
						created_at: "2026-10-14T12:00:00Z",
					},
				]),
			),
		}),
	)
	return { requestedPages }
}

test("verified wallet shows balances, filters every payout page, and opens records", async ({
	page,
}) => {
	const { requestedPages } = await setupWallet(page)
	await page.goto("/market-vendor/wallet")
	await expect(
		page.getByRole("heading", { name: "Wallet", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "Available balance", exact: true }),
	).toBeVisible()
	await expect(page.getByText("₦300,550,000.00", { exact: true })).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Verify account", exact: true }),
	).toHaveCount(0)
	await expect(
		page.getByRole("table", { name: "Wallet history" }),
	).toBeVisible()
	expect(requestedPages).toEqual([1, 2])
	await page.screenshot({ path: "/tmp/marketplace-wallet-verified.png" })
	await page.getByRole("button", { name: "Next page", exact: true }).click()
	await expect(
		page.getByRole("button", { name: "Payout #911", exact: true }),
	).toBeVisible()
	await page
		.getByRole("textbox", { name: "Search wallet history" })
		.fill("Payout #911")
	await page
		.getByRole("button", { name: "View Payout #911", exact: true })
		.click()
	await expect(page.getByRole("dialog")).toContainText("Successful")
	await expect(page.getByRole("dialog")).toContainText("₦275,000.00")
	await page.keyboard.press("Escape")
	await page
		.getByRole("combobox", { name: "Filter payout status" })
		.selectOption("failed")
	await expect(
		page.getByRole("heading", { name: "No matching records", exact: true }),
	).toBeVisible()
	await page.getByRole("button", { name: "Clear filters", exact: true }).click()
	await page
		.getByRole("combobox", { name: "Filter payout status" })
		.selectOption("failed")
	await expect(
		page
			.getByRole("table", { name: "Wallet history" })
			.getByText("Failed", { exact: true }),
	).toHaveCount(4)
	await page
		.getByRole("textbox", { name: "Search wallet history" })
		.fill("₦250,000")
	await expect(
		page
			.getByRole("table", { name: "Wallet history" })
			.getByText("Failed", { exact: true }),
	).toHaveCount(4)
})

test("unverified wallet shows verification and keeps transaction records separate", async ({
	page,
}) => {
	await setupWallet(page, false)
	await page.goto("/market-vendor/wallet")
	await expect(
		page.getByRole("button", { name: "Verify account", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "Available balance", exact: true }),
	).toHaveCount(0)
	await page
		.getByRole("button", { name: "Verify account", exact: true })
		.click()
	await expect(
		page.getByRole("dialog", { name: "Verify your seller account" }),
	).toBeVisible()
	await page.getByRole("button", { name: "Cancel", exact: true }).click()
	await page.screenshot({ path: "/tmp/marketplace-wallet-unverified.png" })
	await page.getByRole("button", { name: "Transactions", exact: true }).click()
	await expect(
		page
			.getByRole("table", { name: "Wallet history" })
			.getByText("Recorded", { exact: true }),
	).toHaveCount(2)
	await expect(
		page
			.getByRole("table", { name: "Wallet history" })
			.getByText("Successful", { exact: true }),
	).toHaveCount(0)
	await page
		.getByRole("combobox", { name: "Filter transaction type" })
		.selectOption("credit")
	await expect(
		page
			.getByRole("table", { name: "Wallet history" })
			.getByText("Recorded", { exact: true }),
	).toHaveCount(1)
	await page
		.getByRole("button", { name: "View Order #1001 payment", exact: true })
		.click()
	await expect(
		page
			.getByRole("dialog")
			.getByRole("link", { name: "Order #1001", exact: false }),
	).toHaveAttribute("href", "/market-vendor/orders/1001")
	await page.keyboard.press("Escape")
	await page.setViewportSize({ width: 1100, height: 900 })
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
})

test("wallet handles empty history and unavailable account verification independently", async ({
	page,
}) => {
	await setupWallet(page)
	await page.route("**/api/marketplace/seller/account", (route) =>
		route.fulfill({
			status: 403,
			json: { success: false, message: "Verification status unavailable." },
		}),
	)
	await page.route("**/api/marketplace/seller/payouts/history**", (route) =>
		route.fulfill({ json: envelope(paginate([])) }),
	)
	await page.goto("/market-vendor/wallet")
	await expect(
		page.getByRole("heading", {
			name: "Verification status unavailable",
			exact: true,
		}),
	).toBeVisible()
	await expect(
		page.getByRole("heading", { name: "No withdrawals yet", exact: true }),
	).toBeVisible()
	await page.route("**/api/marketplace/seller/wallet/transactions**", (route) =>
		route.fulfill({
			status: 403,
			json: { success: false, message: "Transaction history is unavailable." },
		}),
	)
	await page.getByRole("button", { name: "Transactions", exact: true }).click()
	await expect(
		page
			.getByRole("alert")
			.filter({ hasText: "Transaction history is unavailable." }),
	).toBeVisible()
	await expect(page.getByText("₦125,000.00", { exact: true })).toBeVisible()
})

async function setupPromotions(page: Page, balance = "50000.00") {
	await setupAccount(page, true)
	const writes: Record<string, unknown>[] = []
	let fail = false
	let records = [
		{
			id: 1,
			product_id: 43,
			product_name: "Desk speaker",
			product_image: "/market.svg",
			quantity: 25,
			duration_days: 14,
			amount_paid: "9000.00",
			start_date: "2020-01-01T00:00:00Z",
			end_date: "2040-01-01T00:00:00Z",
			is_active: true,
			sold_count: 25,
			is_out_of_stock: false,
		},
		{
			id: 2,
			product_id: 44,
			product_name: "Travel power pack",
			product_image: "/market.svg",
			quantity: 0,
			duration_days: 7,
			amount_paid: "5000.00",
			start_date: "2024-01-01T00:00:00Z",
			end_date: "2024-01-08T00:00:00Z",
			is_active: true,
			sold_count: null,
			is_out_of_stock: true,
		},
	]
	await page.route("**/api/marketplace/seller/wallet", (route) =>
		route.fulfill({
			json: envelope({
				seller_id: 7,
				available_balance: balance,
				pending_balance: "0.00",
				total_earned: "50000.00",
				total_refunded: "0.00",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2026-10-16T00:00:00Z",
			}),
		}),
	)
	await page.route("**/api/marketplace/seller/promotions**", (route) =>
		route.fulfill({ json: envelope(paginate(records)) }),
	)
	await page.route("**/api/marketplace/promotions/options", (route) =>
		route.fulfill({
			json: envelope({
				currency: "NGN",
				payment_source: "seller_wallet",
				options: [
					{ duration_days: 7, price: "5000.00" },
					{ duration_days: 14, price: fail ? "10000.00" : "9000.00" },
					{ duration_days: 30, price: "15000.00" },
					{ duration_days: 180, price: "70000.00" },
				],
			}),
		}),
	)
	await page.route("**/api/marketplace/seller/products?**", (route) => {
		const url = new URL(route.request().url())
		const list = [
			product,
			{ ...product, id: 43, name: "Desk speaker" },
			{ ...product, id: 44, name: "Travel power pack", quantity: 0 },
			{ ...product, id: 45, name: "Portable light", quantity: 2 },
		].filter((item) =>
			item.name
				.toLowerCase()
				.includes((url.searchParams.get("search") || "").toLowerCase()),
		)
		return route.fulfill({ json: envelope(paginate(list)) })
	})
	await page.route("**/api/marketplace/promotions/create", async (route) => {
		const payload = route.request().postDataJSON()
		writes.push(payload)
		if (fail) {
			await route.fulfill({
				status: 400,
				json: {
					success: false,
					message:
						"Promotion pricing has changed. Review the new cost before paying.",
				},
			})
			return
		}
		records = [
			...records,
			{
				id: 9,
				product_id: 42,
				product_name: product.name,
				product_image: "/market.svg",
				quantity: 25,
				duration_days: payload.duration_days,
				amount_paid: payload.expected_price,
				start_date: new Date().toISOString(),
				end_date: "2040-01-01T00:00:00Z",
				is_active: true,
				sold_count: 0,
				is_out_of_stock: false,
			},
		]
		await route.fulfill({
			json: envelope({ promotion_id: 9, expires_at: "2040-01-01T00:00:00Z" }),
		})
	})
	return {
		writes,
		failWithNewPrice: () => {
			fail = true
		},
	}
}

test("promotions overview shows campaign history and excludes expired flags from active counts", async ({
	page,
}) => {
	await setupPromotions(page)
	await page.goto("/market-vendor/ads")
	await expect(
		page.getByRole("heading", { name: "Ads & promotions", exact: true }),
	).toBeVisible()
	await expect(
		page
			.getByRole("table", { name: "Promoted products" })
			.getByText("Out of stock", { exact: true }),
	).toBeVisible()
	await expect(
		page
			.getByRole("table", { name: "Promoted products" })
			.getByText("expired", { exact: true }),
	).toBeVisible()
	await page.screenshot({ path: "/tmp/marketplace-promotions.png" })
	await page
		.getByRole("combobox", { name: "Filter promotions" })
		.selectOption("active")
	await expect(
		page.getByRole("link", { name: "Travel power pack", exact: true }),
	).toHaveCount(0)
	await expect(
		page.getByRole("link", { name: "Desk speaker", exact: true }),
	).toBeVisible()
	await page
		.getByRole("textbox", { name: "Search promoted products" })
		.fill("missing")
	await expect(
		page.getByRole("heading", { name: "No matching promotions" }),
	).toBeVisible()
})

test("product selection guards stock and active campaigns, then confirms the actual wallet price", async ({
	page,
}) => {
	const { writes } = await setupPromotions(page)
	await page.goto("/market-vendor/ads/promote")
	await expect(
		page.getByRole("button", { name: "Promote Desk speaker", exact: true }),
	).toBeDisabled()
	await expect(
		page.getByRole("button", {
			name: "Promote Travel power pack",
			exact: true,
		}),
	).toBeDisabled()
	await expect(page.getByText("2 available", { exact: true })).toBeVisible()
	await page.screenshot({ path: "/tmp/marketplace-promotion-picker.png" })
	await page
		.getByRole("button", { name: `Promote ${product.name}`, exact: true })
		.click()
	await expect(
		page.getByRole("heading", { name: "Promote this product", exact: true }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Proceed", exact: true }),
	).toBeDisabled()
	await page
		.getByRole("radio", { name: "14 days for ₦9,000.00", exact: true })
		.check()
	await expect(
		page.getByRole("button", { name: "Proceed", exact: true }),
	).toBeEnabled()
	await page.screenshot({
		path: "/tmp/marketplace-promotion-duration.png",
		animations: "disabled",
	})
	expect(writes).toEqual([])
	await page.getByRole("button", { name: "Proceed", exact: true }).click()
	await expect(page.getByRole("dialog")).toContainText("₦9,000.00")
	expect(writes).toEqual([])
	await page.getByRole("button", { name: "Back", exact: true }).click()
	expect(writes).toEqual([])
	await page.getByRole("button", { name: "Proceed", exact: true }).click()
	await page
		.getByRole("button", { name: "Confirm and pay ₦9,000.00", exact: true })
		.click()
	await expect(
		page.getByRole("heading", {
			name: "Promotion started successfully",
			exact: true,
		}),
	).toBeVisible()
	expect(writes).toEqual([
		{ product_id: 42, duration_days: 14, expected_price: "9000.00" },
	])
	await page.getByRole("link", { name: "View promotions", exact: true }).click()
	await expect(
		page.getByRole("link", { name: product.name, exact: true }),
	).toBeVisible()
})

test("insufficient balance prevents payment and changed pricing requires a new review", async ({
	page,
}) => {
	let result = await setupPromotions(page, "1000.00")
	await page.goto("/market-vendor/ads/promote?product=42")
	await page
		.getByRole("radio", { name: "7 days for ₦5,000.00", exact: true })
		.check()
	await expect(
		page.getByRole("alert").filter({ hasText: "below the promotion cost" }),
	).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Proceed", exact: true }),
	).toBeDisabled()
	expect(result.writes).toEqual([])
	await page.unrouteAll({ behavior: "wait" })
	result = await setupPromotions(page)
	await page.goto("/market-vendor/ads/promote?product=42")
	await page
		.getByRole("radio", { name: "14 days for ₦9,000.00", exact: true })
		.check()
	await page.getByRole("button", { name: "Proceed", exact: true }).click()
	result.failWithNewPrice()
	await page
		.getByRole("button", { name: "Confirm and pay ₦9,000.00", exact: true })
		.click()
	await expect(
		page
			.getByRole("alert")
			.filter({ hasText: "Promotion pricing has changed" }),
	).toBeVisible()
	await expect(
		page.getByRole("button", {
			name: "Confirm and pay ₦9,000.00",
			exact: true,
		}),
	).toBeDisabled()
	expect(result.writes).toHaveLength(1)
	await page.getByRole("button", { name: "Back", exact: true }).click()
	await expect(
		page.getByRole("radio", { name: "14 days for ₦10,000.00", exact: true }),
	).toBeVisible()
	await page.setViewportSize({ width: 1100, height: 900 })
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth,
		),
	).toBe(true)
})

test("payout settings persist and changed payout amounts require a fresh confirmation", async ({
	page,
}) => {
	await setupWallet(page)
	const settingsWrites: Record<string, unknown>[] = []
	const payoutWrites: Record<string, unknown>[] = []
	let settings = {
		payout_frequency: "weekly",
		minimum_payout_amount: "5000.00",
		enabled: true,
	}
	let amount = "250000.00"
	await page.route(
		"**/api/marketplace/seller/payout-settings",
		async (route) => {
			if (route.request().method() === "PATCH") {
				const data = route.request().postDataJSON()
				settingsWrites.push(data)
				settings = { ...settings, ...data }
			}
			await route.fulfill({ json: envelope(settings) })
		},
	)
	await page.route("**/api/marketplace/seller/payouts/preview", (route) =>
		route.fulfill({
			json: envelope({
				amount,
				eligible: true,
				currency: "NGN",
				minimum_payout_amount: settings.minimum_payout_amount,
				reason: null,
			}),
		}),
	)
	await page.route("**/api/marketplace/seller/payouts", async (route) => {
		payoutWrites.push(route.request().postDataJSON())
		if (payoutWrites.length === 1) {
			amount = "275000.00"
			await route.fulfill({
				status: 400,
				json: {
					success: false,
					message:
						"The payout amount has changed. Refresh and review it before confirming.",
				},
			})
			return
		}
		await route.fulfill({ json: envelope({}) })
	})
	await page.goto("/market-vendor/wallet")
	await page
		.getByRole("button", { name: "Payout settings", exact: true })
		.click()
	await page
		.getByLabel("Payout frequency", { exact: true })
		.selectOption("manual")
	await page
		.getByLabel("Minimum payout amount (₦)", { exact: true })
		.fill("7500")
	await page
		.getByRole("button", { name: "Save payout settings", exact: true })
		.click()
	await expect(page.getByRole("dialog")).toHaveCount(0)
	expect(settingsWrites[0]).toMatchObject({
		payout_frequency: "manual",
		minimum_payout_amount: "7500",
	})
	await page
		.getByRole("button", { name: "Request payout", exact: true })
		.click()
	await expect(
		page.getByRole("heading", { name: "Review your payout" }),
	).toBeVisible()
	expect(payoutWrites).toHaveLength(0)
	await page.screenshot({
		path: "/tmp/marketplace-payout-review.png",
		animations: "disabled",
	})
	await page
		.getByRole("button", { name: "Confirm payout ₦250,000.00", exact: true })
		.click()
	await expect(
		page.getByRole("alert").filter({ hasText: "payout amount has changed" }),
	).toBeVisible()
	await page
		.getByRole("button", { name: "Confirm payout ₦275,000.00", exact: true })
		.click()
	await expect(page.getByRole("dialog")).toHaveCount(0)
	expect(payoutWrites).toEqual([
		{ expected_amount: "250000.00" },
		{ expected_amount: "275000.00" },
	])
})

test("stored alerts retain read state and mark all as read", async ({
	page,
}) => {
	await setupOrders(page)
	await page.goto("/market-vendor/alerts")
	await expect(
		page.getByText("3 unread updates · Most recent first"),
	).toBeVisible()
	await page
		.getByRole("button", { name: "Mark as read", exact: true })
		.first()
		.click()
	await expect(
		page.getByText("2 unread updates · Most recent first"),
	).toBeVisible()
	await page.reload()
	await expect(
		page.getByText("2 unread updates · Most recent first"),
	).toBeVisible()
	await page
		.getByRole("button", { name: "Mark all as read", exact: true })
		.click()
	await expect(
		page.getByText("0 unread updates · Most recent first"),
	).toBeVisible()
	await page.getByRole("button", { name: "Unread", exact: true }).click()
	await expect(
		page.getByRole("heading", { name: "You’re all caught up" }),
	).toBeVisible()
})

test("shipment details and checkpoint history are saved and displayed", async ({
	page,
}) => {
	const fixture = await setupOrders(page)
	let order = fixture.getOrders()[1]
	const writes: Record<string, unknown>[] = []
	await page.route("**/api/marketplace/seller/orders/1002", (route) =>
		route.fulfill({ json: envelope(order) }),
	)
	await page.route(
		"**/api/marketplace/seller/orders/1002/shipment",
		async (route) => {
			const data = route.request().postDataJSON()
			writes.push(data)
			order = { ...order, shipment: data }
			await route.fulfill({ json: envelope(order) })
		},
	)
	await page.route(
		"**/api/marketplace/seller/orders/1002/tracking",
		async (route) => {
			const data = route.request().postDataJSON()
			writes.push(data)
			order = {
				...order,
				tracking_events: [
					{ id: 99, ...data, occurred_at: "2026-10-16T10:00:00Z" },
				],
			}
			await route.fulfill({ status: 201, json: envelope(order) })
		},
	)
	await page.goto("/market-vendor/orders/1002")
	await page.getByRole("button", { name: "Edit shipment", exact: true }).click()
	await page.getByLabel("Carrier", { exact: true }).fill("UPS")
	await page.getByLabel("Tracking number", { exact: true }).fill("ABC123")
	await page
		.getByLabel("Estimated delivery date", { exact: true })
		.fill("2026-10-30")
	await page
		.getByRole("button", { name: "Save shipment details", exact: true })
		.click()
	await expect(page.getByText("ABC123", { exact: true })).toBeVisible()
	await page
		.getByRole("button", { name: "Add tracking update", exact: true })
		.click()
	await page.getByLabel("Checkpoint", { exact: true }).selectOption("sorting")
	await page
		.getByLabel("Checkpoint status", { exact: true })
		.selectOption("pending")
	await page.getByLabel("Location", { exact: true }).fill("Lagos")
	await page
		.getByLabel("Update note", { exact: true })
		.fill("Awaiting the next delivery run.")
	await page
		.getByRole("button", { name: "Record tracking update", exact: true })
		.click()
	await expect(
		page.getByRole("heading", { name: "Tracking history", exact: true }),
	).toBeVisible()
	await expect(
		page.getByText("Awaiting the next delivery run.", { exact: true }),
	).toBeVisible()
	expect(writes).toEqual([
		{
			carrier: "UPS",
			tracking_number: "ABC123",
			estimated_delivery: "2026-10-30",
		},
		{
			checkpoint: "sorting",
			status: "pending",
			location: "Lagos",
			note: "Awaiting the next delivery run.",
		},
	])
	await page.screenshot({
		path: "/tmp/marketplace-shipment-tracking.png",
		animations: "disabled",
	})
})

test("unapproved sellers can save listings but cannot buy promotions", async ({
	page,
}) => {
	const { writes } = await setupPromotions(page)
	await page.route("**/api/marketplace/seller/profile", (route) =>
		route.fulfill({
			json: envelope({ ...seller, approval_status: "pending" }),
		}),
	)
	await page.goto("/market-vendor/ads/promote?product=42")
	await expect(
		page.getByRole("heading", {
			name: "Seller approval required for promotions",
			exact: true,
		}),
	).toBeVisible()
	await expect(
		page.getByRole("link", { name: "View seller account", exact: true }),
	).toHaveAttribute("href", "/market-vendor/account")
	expect(writes).toHaveLength(0)
	await expect(page.getByRole("button", { name: /Pay.*promote/ })).toHaveCount(
		0,
	)
	await page.goto("/market-vendor/list-product")
	await expect(
		page.getByRole("button", { name: "Save listing", exact: true }).first(),
	).toBeVisible()
})

test("pending payout recovery refreshes wallet balances and payout history", async ({
	page,
}) => {
	await setupWallet(page)
	let recovered = false
	let checks = 0
	await page.route("**/api/marketplace/seller/payouts/history**", (route) =>
		route.fulfill({
			json: envelope(
				paginate([
					{
						id: 901,
						amount: "100.00",
						status: recovered ? "paid" : "pending",
						requested_at: "2026-10-16T10:00:00Z",
						processed_at: recovered ? "2026-10-16T11:00:00Z" : null,
					},
				]),
			),
		}),
	)
	await page.route("**/api/marketplace/seller/wallet", (route) =>
		route.fulfill({
			json: envelope({
				seller_id: 7,
				available_balance: "0.00",
				pending_balance: recovered ? "0.00" : "100.00",
				total_earned: "100.00",
				total_refunded: "0.00",
				created_at: "2026-10-01T10:00:00Z",
				updated_at: "2026-10-16T11:00:00Z",
			}),
		}),
	)
	await page.route(
		"**/api/marketplace/seller/payouts/reconcile",
		async (route) => {
			checks++
			recovered = true
			await route.fulfill({
				json: envelope({ checked: 1, status: "paid", pending: 0 }),
			})
		},
	)
	await page.goto("/market-vendor/wallet")
	const pendingCard = page
		.getByRole("heading", { name: "Pending balance", exact: true })
		.locator("..")
	await expect(pendingCard.getByText("₦100.00", { exact: true })).toBeVisible()
	await page
		.getByRole("button", { name: "Check pending payouts", exact: true })
		.click()
	await expect(pendingCard.getByText("₦0.00", { exact: true })).toBeVisible()
	await expect(
		page.getByRole("button", { name: "Check pending payouts", exact: true }),
	).toHaveCount(0)
	expect(checks).toBe(1)
})
