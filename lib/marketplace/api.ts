import { apiClient } from "@/lib/axios"
import type { ApiResponse } from "@/types/api"
import type {
	Category,
	DeliveryOption,
	MarketplacePage,
	Product,
	ProductPayload,
	ProductResponse,
	ProductSale,
	ProductStats,
	Review,
	SalesFilter,
	SalesSummary,
	SellerOrder,
	SellerAccount,
	SellerAccountFields,
	SellerWallet,
	SellerPayout,
	WalletTransaction,
	ProductPromotion,
	PromotionPricing,
	PromotionPurchase,
	PayoutSettings,
	PayoutQuote,
	SellerAlert,
	ShipmentDetails,
	TrackingUpdate,
	SpecificationSuggestionQuery,
} from "@/types/marketplace"
import { isAxiosError } from "axios"

const root = "/api/marketplace"
const get = <T>(
	path: string,
	params?: Record<string, string | number | undefined>,
) =>
	apiClient
		.get<ApiResponse<T>>(`${root}/${path}`, { params })
		.then((r) => r.data.data)

// Reference lists are paginated too. Fetch every page so a picker never silently omits options.
async function options<T>(path: string): Promise<T[]> {
	const first = await get<MarketplacePage<T>>(path, { limit: 100 })
	const items = [...first.results]
	for (let page = 2; page <= first.total_pages; page++) {
		items.push(
			...(await get<MarketplacePage<T>>(path, { limit: 100, page })).results,
		)
	}
	return items
}

export const marketplaceApi = {
	promotions: () => options<ProductPromotion>("seller/promotions"),
	promotionPricing: () => get<PromotionPricing>("promotions/options"),
	createPromotion: (payload: PromotionPurchase) =>
		apiClient
			.post<ApiResponse<{ promotion_id: number; expires_at: string }>>(
				`${root}/promotions/create`,
				payload,
			)
			.then((r) => r.data.data),
	wallet: () => get<SellerWallet>("seller/wallet"),
	payoutSettings: () => get<PayoutSettings>("seller/payout-settings"),
	updatePayoutSettings: (payload: PayoutSettings) =>
		apiClient
			.patch<ApiResponse<PayoutSettings>>(
				`${root}/seller/payout-settings`,
				payload,
			)
			.then((r) => r.data.data),
	payoutQuote: () => get<PayoutQuote>("seller/payouts/preview"),
	reconcilePayouts: () =>
		apiClient
			.post<
				ApiResponse<{ checked: number; pending: number; status: string | null }>
			>(`${root}/seller/payouts/reconcile`, {})
			.then((r) => r.data.data),
	requestPayout: (expected_amount: string) =>
		apiClient
			.post<ApiResponse<Record<string, never>>>(`${root}/seller/payouts`, {
				expected_amount,
			})
			.then((r) => r.data.data),
	alerts: () => options<SellerAlert>("seller/alerts"),
	readAlert: (id: number) =>
		apiClient
			.patch<ApiResponse<SellerAlert>>(`${root}/seller/alerts/${id}/read`, {})
			.then((r) => r.data.data),
	readAllAlerts: () =>
		apiClient
			.patch<ApiResponse<{ updated: number }>>(
				`${root}/seller/alerts/read-all`,
				{},
			)
			.then((r) => r.data.data),
	payouts: () => options<SellerPayout>("seller/payouts/history"),
	walletTransactions: () =>
		options<WalletTransaction>("seller/wallet/transactions"),
	account: () => get<SellerAccount>("seller/account"),
	updateAccount: (payload: Partial<SellerAccountFields>) =>
		apiClient
			.patch<ApiResponse<SellerAccount>>(`${root}/seller/account`, payload)
			.then((r) => r.data.data),
	setupAccount: (payload: SellerAccountFields) =>
		apiClient
			.post<ApiResponse<{ id: number }>>(`${root}/setup`, payload)
			.then((r) => r.data.data),
	verificationLink: () =>
		apiClient
			.post<ApiResponse<{ url: string }>>(
				`${root}/seller/verification-link`,
				{},
			)
			.then((r) => r.data.data),
	// The backend currently provides pagination without order search/status filters.
	// Load every page before filtering, so older matching orders are never hidden.
	orders: () => options<SellerOrder>("seller/orders"),
	order: (id: number) => get<SellerOrder>(`seller/orders/${id}`),
	updateShipment: (id: number, payload: ShipmentDetails) =>
		apiClient
			.patch<ApiResponse<SellerOrder>>(
				`${root}/seller/orders/${id}/shipment`,
				payload,
			)
			.then((r) => r.data.data),
	addTrackingEvent: (id: number, payload: TrackingUpdate) =>
		apiClient
			.post<ApiResponse<SellerOrder>>(
				`${root}/seller/orders/${id}/tracking`,
				payload,
			)
			.then((r) => r.data.data),
	updateOrderStatus: (id: number, status: "shipped" | "delivered") =>
		apiClient
			.patch<ApiResponse<SellerOrder>>(`${root}/seller/orders/${id}/status`, {
				status,
			})
			.then((r) => r.data.data),
	identity: async () => {
		const profile =
			await get<
				Pick<SellerAccount, "id" | "business_name" | "approval_status">
			>("seller/profile")
		return {
			seller_id: profile.id,
			business_name: profile.business_name,
			approval_status: profile.approval_status,
		}
	},
	seller: (id: number) =>
		get<{ business_name: string; sell_scope: string }>(`sellers/${id}/details`),
	products: (
		sellerId: number | undefined,
		search: string,
		sort: string,
		page: number,
	) =>
		get<MarketplacePage<Product>>(
			sellerId === undefined ? "products/list" : "seller/products",
			{
				search,
				sort,
				page,
				limit: 12,
			},
		),
	product: (id: number) => get<ProductResponse>(`products/${id}`),
	sellerProduct: (id: number) => get<ProductResponse>(`seller/products/${id}`),
	categories: () => options<Category>("categories/list"),
	specificationSuggestions: (
		params: SpecificationSuggestionQuery,
		signal?: AbortSignal,
	) =>
		apiClient
			.get<ApiResponse<{ results: string[] }>>(
				`${root}/products/specification-suggestions`,
				{ params, signal },
			)
			.then((r) => r.data.data.results),
	deliveries: () => options<DeliveryOption>("delivery-options/list"),
	create: (payload: ProductPayload) =>
		apiClient
			.post<ApiResponse<{ id: number }>>(`${root}/products`, payload)
			.then((r) => r.data.data),
	update: (id: number, payload: Partial<ProductPayload>) =>
		apiClient
			.patch<ApiResponse<{ id: number }>>(
				`${root}/products/${id}/edit`,
				payload,
			)
			.then((r) => r.data.data),
	remove: (id: number) =>
		apiClient
			.delete<ApiResponse<null>>(`${root}/products/${id}/delete`)
			.then((r) => r.data.data),
	reviews: (id: number, rating: number, page: number) =>
		get<MarketplacePage<Review>>(`products/${id}/reviews`, {
			rating: rating || undefined,
			page,
		}),
	summary: (id: number, year: number) =>
		get<SalesSummary>(`seller/products/${id}/sales/summary`, { year }),
	sales: (id: number, filter: SalesFilter, page: number) =>
		get<MarketplacePage<ProductSale>>(`seller/products/${id}/sales`, {
			filter_by: filter.period,
			start_date: filter.period === "custom" ? filter.start : undefined,
			end_date: filter.period === "custom" ? filter.end : undefined,
			page,
		}),
	stats: (id: number, filter: SalesFilter) =>
		get<ProductStats>(`seller/products/${id}/stats`, {
			filter: filter.period,
			start_date: filter.period === "custom" ? filter.start : undefined,
			end_date: filter.period === "custom" ? filter.end : undefined,
		}),
}

export function marketplaceError(error: unknown): string {
	if (isAxiosError(error)) {
		const data = error.response?.data
		if (data?.errors && typeof data.errors === "object") {
			const field = Object.entries(data.errors)[0]
			if (
				field &&
				typeof (field[1] as { message?: string })?.message === "string"
			)
				return `${field[0].replaceAll("_", " ")}: ${(field[1] as { message: string }).message}`
		}
		if (typeof data?.detail === "string") return data.detail
		if (typeof data?.message === "string") return data.message
		if (data && typeof data === "object") {
			const entry = Object.entries(data)[0]
			if (entry)
				return `${entry[0].replaceAll("_", " ")}: ${Array.isArray(entry[1]) ? entry[1].join(" ") : String(entry[1])}`
		}
	}
	return "We couldn’t load this information. Please try again."
}
