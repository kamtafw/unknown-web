export interface MarketplacePage<T> {
	results: T[]
	count: number
	current: number
	total_pages: number
	next: string | null
	previous: string | null
}

export interface Category {
	id: number
	name: string
	parent?: number | null
}

export interface SpecificationSuggestionQuery {
	field: "name" | "value"
	q: string
	name?: string
	category_ids?: string
	exclude?: string
}

export interface SellerAccountFields {
	country: string
	sell_scope: "local" | "global"
	business_name: string
	business_description: string
	business_categories: string[]
	full_name: string
	phone_number: string
	store_address: string
}
export interface SellerAccount extends Omit<
	SellerAccountFields,
	"full_name" | "business_categories"
> {
	full_name: string | null
	business_categories: string[] | null
	id: number
	approval_status: "pending" | "approved" | "rejected"
	approval_reviewed_at: string | null
	has_payment_account: boolean
	stripe_charges_enabled: boolean
	stripe_payouts_enabled: boolean
	stripe_onboarding_completed: boolean
}
export interface DeliveryOption {
	id: number
	name: string
}
export interface Product {
	id: number
	name: string
	price: string
	discount_price: string | null
	quantity: number
	images: string[]
	promote: boolean
	categories: Category[]
	created_at: string
}
export interface ProductDetail extends Product {
	description: string | null
	specifications: Record<string, string>[]
	delivery_settings: { delivery_option: DeliveryOption; price: string }[]
	seller: {
		id: number
		business_name: string
		country: string
		phone_number: string
	}
}
export interface RatingSummary {
	average_rating: number
	total_reviews: number
	breakdown: Record<string, { count: number; percent: number }>
}
export interface ProductResponse {
	product: ProductDetail
	rating_summary: RatingSummary
}
export interface Review {
	id: number
	user: {
		first_name?: string
		last_name?: string
		username?: string
		profile_photo?: string
	}
	rating: number
	review_text: string
	images: string[]
	created_at: string
}
export interface ProductPayload {
	name: string
	description: string
	price: string
	discount_price: string | null
	quantity: number
	promote: boolean
	images: string[]
	specifications: Record<string, string>[]
	category_ids: number[]
	delivery_settings: { delivery_option_id: number; price: string }[]
}
export interface SalesSummary {
	year: number
	total_revenue: number | string
	total_quantity: number
	chart: { label: string; value: number }[]
}
export interface ProductSale {
	id: number
	product_name: string
	price: string
	quantity: number
	order: number
	created_at: string
}
export interface ProductStats {
	clicks: number
	unique_views: number
	sold: number
	liked: number
	reviews: number
}
export interface SalesFilter {
	period: "today" | "week" | "month" | "year" | "custom"
	start: string
	end: string
}

export type OrderStatus =
	| "pending"
	| "paid"
	| "shipped"
	| "delivered"
	| "cancelled"
	| "refunded"
	| "partially_refunded"
export interface SellerOrderItem {
	product: number
	product_name: string
	product_images?: string[]
	quantity: number
	price: string
}
export interface OrderDeliverySelection {
	product_id: number
	delivery_option_id: number
	name: string
	price: string
}
export interface SellerOrder {
	delivery_verified_at?: string | null
	id: number
	buyer_id: string
	seller: number
	seller_name: string
	shipping_address: {
		full_name?: string
		phone_number?: string
		address_line?: string
		city?: string
		state?: string
		country?: string
		postal_code?: string
	} | null
	subtotal: string
	commission: string
	total: string
	refunded_amount: string
	status: OrderStatus
	created_at: string
	items: SellerOrderItem[]
	delivery_selections?: OrderDeliverySelection[]
	shipment?: ShipmentDetails
	tracking_events?: TrackingEvent[]
}

export interface ShipmentDetails {
	carrier?: string
	tracking_number?: string
	estimated_delivery?: string | null
}
export type TrackingCheckpoint =
	| "created"
	| "paid"
	| "preparing"
	| "collected"
	| "sorting"
	| "in_transit"
	| "delivered"
export interface TrackingUpdate {
	checkpoint: Exclude<TrackingCheckpoint, "created" | "paid">
	status: "successful" | "pending" | "unsuccessful"
	note: string
	location: string
}
export interface TrackingEvent extends Omit<TrackingUpdate, "checkpoint"> {
	id: number
	checkpoint: TrackingCheckpoint
	occurred_at: string
}
export interface SellerAlert {
	id: number
	notification_type: string
	message: string
	sent_at: string
	is_read: boolean
	metadata: {
		title?: string
		kind?: "new" | "shipped" | "delivered" | "tracking" | "review"
		order_id?: number
		product_id?: number
		product_name?: string
		product_image?: string | null
		total?: string
		rating?: number
	} | null
}
export interface PayoutSettings {
	payout_frequency: "monthly"
	minimum_payout_amount: string
	enabled: boolean
}
export interface PayoutQuote {
	scheduled_for: string
	settlement_timezone: string
	amount: string
	currency: "NGN"
	eligible: boolean
	reason: string | null
	minimum_payout_amount: string
}

export interface SellerWallet {
	book_balance: string
	cashable_balance: string
	awaiting_delivery_balance: string
	withdrawal_pending_balance: string
	seller_id: number
	available_balance: string
	pending_balance: string
	total_earned: string
	total_refunded: string
	created_at: string
	updated_at: string
}
export interface SellerPayout {
	scheduled_for?: string | null
	id: number
	amount: string
	status: "queued" | "pending" | "paid" | "failed"
	requested_at: string
	processed_at: string | null
}
export interface WalletTransaction {
	id: number
	amount: string
	transaction_type: "credit" | "debit"
	reference: string
	order_id?: number | null
	created_at: string
}

export interface ProductPromotion {
	id: number
	product_id: number
	product_name: string
	product_image: string | null
	quantity: number
	duration_days: number
	amount_paid: string
	start_date: string
	end_date: string
	is_active: boolean
	sold_count: number | null
	is_out_of_stock: boolean
}
export interface PromotionPricing {
	currency: "NGN"
	payment_source: "seller_wallet"
	options: { duration_days: number; price: string }[]
}
export interface PromotionPurchase {
	product_id: number
	duration_days: number
	expected_price: string
}
