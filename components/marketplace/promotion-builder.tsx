"use client"

import { useDeferredValue, useState } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	ArrowRight,
	Check,
	CheckCircle2,
	ChevronRight,
	Clock3,
	Info,
	Loader2,
	Megaphone,
	Search,
	ShieldCheck,
	Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import {
	durationLabel,
	hasActivePromotion,
	promotionKeys,
} from "@/lib/marketplace/promotions"
import type { PromotionPurchase } from "@/types/marketplace"
import { cn } from "@/lib/utils"
import {
	dateLabel,
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Pagination,
	Panel,
	ProductImage,
} from "./shared"

export function PromotionBuilder({
	initialProductId,
}: {
	initialProductId?: number
}) {
	const client = useQueryClient()
	const [stage, setStage] = useState<"product" | "duration">(
		initialProductId ? "duration" : "product",
	)
	const [selectedId, setSelectedId] = useState<number | null>(
		initialProductId || null,
	)
	const [search, setSearch] = useState("")
	const query = useDeferredValue(search)
	const [page, setPage] = useState(1)
	const [days, setDays] = useState<number | null>(null)
	const [quote, setQuote] = useState<PromotionPurchase | null>(null)
	const [error, setError] = useState("")
	const [success, setSuccess] = useState<{
		id: number
		expires: string
		name: string
		days: number
		price: string
	} | null>(null)
	const identity = useQuery({
		queryKey: ["marketplace", "identity"],
		queryFn: marketplaceApi.identity,
	})
	const promotions = useQuery({
		queryKey: promotionKeys.all,
		queryFn: marketplaceApi.promotions,
		staleTime: 30000,
	})
	const products = useQuery({
		queryKey: [
			"marketplace",
			"products",
			identity.data?.seller_id,
			query,
			"newest",
			page,
		],
		queryFn: () =>
			marketplaceApi.products(identity.data!.seller_id, query, "newest", page),
		enabled: !!identity.data?.seller_id && stage === "product",
	})
	const product = useQuery({
		queryKey: ["marketplace", "seller-product", selectedId],
		queryFn: () => marketplaceApi.sellerProduct(selectedId!),
		enabled: selectedId !== null,
	})
	const pricing = useQuery({
		queryKey: promotionKeys.pricing,
		queryFn: marketplaceApi.promotionPricing,
		enabled: stage === "duration",
		staleTime: 60000,
	})
	const wallet = useQuery({
		queryKey: ["marketplace", "wallet"],
		queryFn: marketplaceApi.wallet,
		enabled: stage === "duration",
		staleTime: 0,
	})
	const purchase = useMutation({
		mutationFn: marketplaceApi.createPromotion,
		onSuccess: (result, payload) => {
			setSuccess({
				id: result.promotion_id,
				expires: result.expires_at,
				name: product.data?.product.name || "Your product",
				days: payload.duration_days,
				price: payload.expected_price,
			})
			setQuote(null)
			client.invalidateQueries({ queryKey: promotionKeys.all })
			client.invalidateQueries({ queryKey: ["marketplace", "wallet"] })
			client.invalidateQueries({ queryKey: ["marketplace", "identity"] })
			client.invalidateQueries({
				queryKey: ["marketplace", "wallet-transactions"],
			})
			client.invalidateQueries({ queryKey: ["marketplace", "products"] })
		},
		onError: (err) => {
			setError(marketplaceError(err))
			client.invalidateQueries({ queryKey: ["marketplace", "identity"] })
			client.invalidateQueries({ queryKey: promotionKeys.pricing })
			client.invalidateQueries({ queryKey: promotionKeys.all })
			wallet.refetch()
			product.refetch()
		},
	})
	const selectedProduct = product.data?.product
	const option = pricing.data?.options.find(
		(option) => option.duration_days === days,
	)
	const active =
		selectedId !== null && promotions.data
			? hasActivePromotion(promotions.data, selectedId)
			: false
	const affordable =
		option && wallet.data
			? Number(wallet.data.available_balance) >= Number(option.price)
			: false
	const eligible =
		!!selectedProduct &&
		selectedProduct.quantity > 0 &&
		identity.data?.approval_status === "approved" &&
		selectedProduct.seller.id === identity.data?.seller_id &&
		!active
	const canProceed =
		eligible &&
		affordable &&
		!!option &&
		!!promotions.data &&
		pricing.data?.currency === "NGN" &&
		!purchase.isPending &&
		!wallet.isFetching &&
		!pricing.isFetching &&
		!promotions.isFetching
	function chooseAnother() {
		setStage("product")
		setSelectedId(null)
		setDays(null)
		setQuote(null)
		setError("")
		setSuccess(null)
	}
	if (success)
		return (
			<>
				<PageHeading
					title="Your promotion is live"
					description="Your product is ready for its moment in the spotlight."
					back="/market-vendor/ads"
					backLabel="Back to promotions"
				/>
				<Panel className="mx-auto max-w-2xl py-12 text-center">
					<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
						<CheckCircle2 size={34} />
					</div>
					<h2 className="text-xl font-semibold">
						Promotion started successfully
					</h2>
					<p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
						{success.name} is promoted for {durationLabel(success.days)}.
					</p>
					<dl className="mx-auto mt-7 max-w-sm space-y-3 rounded-xl bg-muted/50 p-5 text-left text-sm">
						<div className="flex justify-between gap-3">
							<dt className="text-muted-foreground">Promotion reference</dt>
							<dd>#{success.id}</dd>
						</div>
						<div className="flex justify-between gap-3">
							<dt className="text-muted-foreground">Paid from wallet</dt>
							<dd className="font-semibold">{money(success.price)}</dd>
						</div>
						<div className="flex justify-between gap-3">
							<dt className="text-muted-foreground">Ends</dt>
							<dd>{dateLabel(success.expires)}</dd>
						</div>
					</dl>
					<div className="mt-7 flex flex-wrap justify-center gap-3">
						<Button asChild className="rounded-full">
							<Link href="/market-vendor/ads">
								View promotions <ArrowRight size={15} />
							</Link>
						</Button>
						<Button
							variant="outline"
							className="rounded-full"
							onClick={chooseAnother}
						>
							Promote another product
						</Button>
					</div>
				</Panel>
			</>
		)
	if (identity.isPending || promotions.isPending) return <LoadingState />
	if (identity.isError || promotions.isError)
		return (
			<ErrorState
				error={identity.error || promotions.error}
				retry={() => {
					identity.refetch()
					promotions.refetch()
				}}
			/>
		)
	if (identity.data.approval_status !== "approved")
		return (
			<EmptyState
				title="Seller approval required for promotions"
				description="You can create and edit listings now. Paid promotions become available once AppsCombo approves your seller account and buyers can see your products."
				action={
					<Button asChild>
						<Link href="/market-vendor/account">View seller account</Link>
					</Button>
				}
			/>
		)
	return (
		<>
			<PageHeading
				title={
					stage === "product"
						? "Choose a product to promote"
						: "Promote this product"
				}
				description={
					stage === "product"
						? "Start with something your customers will love."
						: "Choose a duration and review your wallet payment."
				}
				back="/market-vendor/ads"
				backLabel="Back to promotions"
			/>
			<ol
				className="mb-7 flex flex-wrap items-center gap-3 text-xs"
				aria-label="Promotion steps"
			>
				<li
					className={cn(
						"flex items-center gap-2",
						stage === "product"
							? "font-medium text-primary"
							: "text-muted-foreground",
					)}
				>
					<span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
						{stage === "duration" ? <Check size={13} /> : "1"}
					</span>
					Choose product
				</li>
				<ChevronRight size={14} className="text-muted-foreground" />
				<li
					className={cn(
						"flex items-center gap-2",
						stage === "duration"
							? "font-medium text-primary"
							: "text-muted-foreground",
					)}
				>
					<span className="flex size-6 items-center justify-center rounded-full bg-muted">
						2
					</span>
					Duration & payment
				</li>
			</ol>
			{stage === "product" ? (
				<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
					<Panel>
						<div className="relative mb-6">
							<Search
								size={17}
								className="absolute top-3.5 left-3.5 text-muted-foreground"
							/>
							<input
								aria-label="Search products to promote"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value)
									setPage(1)
								}}
								placeholder="Search your products…"
								className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
							/>
						</div>
						{products.isPending ? (
							<LoadingState />
						) : products.isError ? (
							<ErrorState
								error={products.error}
								retry={() => products.refetch()}
							/>
						) : !products.data.results.length ? (
							<EmptyState
								title="No products found"
								description={
									query
										? "Try another product name."
										: "List a product before creating your first promotion."
								}
								action={
									!query && (
										<Button asChild>
											<Link href="/market-vendor/list-product">
												List a product
											</Link>
										</Button>
									)
								}
							/>
						) : (
							<>
								<div className="mb-2 flex justify-between border-b border-border pb-3 text-[11px] text-muted-foreground">
									<span>Product</span>
									<span>Availability</span>
								</div>
								<div className="divide-y divide-border">
									{products.data.results.map((item) => {
										const promoted = hasActivePromotion(
											promotions.data,
											item.id,
										)
										const disabled = item.quantity <= 0 || promoted
										return (
											<button
												key={item.id}
												type="button"
												disabled={disabled}
												aria-label={`Promote ${item.name}`}
												onClick={() => {
													setSelectedId(item.id)
													setStage("duration")
													setDays(null)
													setError("")
												}}
												className="flex w-full items-center gap-4 rounded-lg py-5 text-left transition hover:bg-muted/40 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
											>
												<ProductImage
													src={item.images[0]}
													name={item.name}
													className="size-20 shrink-0"
													imageClassName="p-2"
												/>
												<div className="min-w-0 flex-1">
													<h2 className="line-clamp-2 text-sm font-medium">
														{item.name}
													</h2>
													<p className="mt-2 text-xs text-primary">
														{money(item.discount_price ?? item.price)}
													</p>
												</div>
												<span
													className={cn(
														"shrink-0 rounded-full px-3 py-1.5 text-[10px]",
														item.quantity === 0
															? "bg-destructive/10 text-destructive"
															: promoted
																? "bg-primary/10 text-primary"
																: item.quantity < 5
																	? "bg-amber-500/10 text-amber-700"
																	: "bg-muted text-muted-foreground",
													)}
												>
													{item.quantity === 0
														? "Out of stock"
														: promoted
															? "Already promoted"
															: `${item.quantity} available`}
												</span>
												{!disabled && (
													<ChevronRight
														size={15}
														className="shrink-0 text-muted-foreground"
													/>
												)}
											</button>
										)
									})}
								</div>
								<Pagination
									page={page}
									total={products.data.total_pages}
									onChange={setPage}
								/>
							</>
						)}
					</Panel>
					<Panel className="bg-primary/5">
						<Megaphone size={25} className="mb-4 text-primary" />
						<h2 className="text-sm font-semibold">A little extra visibility</h2>
						<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
							Promote a product for a fixed duration, paid from your seller
							wallet.
						</p>
						<div className="mt-5 space-y-4 text-xs text-muted-foreground">
							<p className="flex gap-2">
								<Check size={14} className="shrink-0 text-primary" />
								Choose a product that’s in stock
							</p>
							<p className="flex gap-2">
								<Clock3 size={14} className="shrink-0 text-primary" />
								Pick a duration that works for you
							</p>
							<p className="flex gap-2">
								<ShieldCheck size={14} className="shrink-0 text-primary" />
								Review the total before you pay
							</p>
						</div>
					</Panel>
				</div>
			) : product.isPending ? (
				<LoadingState />
			) : product.isError ? (
				<ErrorState error={product.error} retry={() => product.refetch()} />
			) : selectedProduct?.seller.id !== identity.data.seller_id ? (
				<EmptyState
					title="Choose a product from your store"
					description="Only your own products can be promoted from this account."
					action={
						<Button onClick={chooseAnother}>Choose another product</Button>
					}
				/>
			) : (
				<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
					<div className="space-y-6">
						<Panel>
							<div className="flex items-center gap-5">
								<ProductImage
									src={selectedProduct.images[0]}
									name={selectedProduct.name}
									className="size-24 shrink-0"
									imageClassName="p-2"
								/>
								<div className="min-w-0 flex-1">
									<p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
										Selected product
									</p>
									<h2 className="text-base font-semibold">
										{selectedProduct.name}
									</h2>
									<p className="mt-2 text-sm font-medium text-primary">
										{money(
											selectedProduct.discount_price ?? selectedProduct.price,
										)}
									</p>
									<p className="mt-1 text-xs text-muted-foreground">
										{selectedProduct.quantity} available
									</p>
								</div>
								<button
									type="button"
									onClick={chooseAnother}
									className="shrink-0 text-xs font-medium text-primary hover:underline"
								>
									Change
								</button>
							</div>
							{!eligible && (
								<p
									role="alert"
									className="mt-5 rounded-xl bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400"
								>
									{active
										? "This product already has an active promotion. Choose another product or wait for it to end."
										: "This product is out of stock. Add stock before promoting it."}
								</p>
							)}
						</Panel>
						<Panel>
							{pricing.isPending ? (
								<LoadingState />
							) : pricing.isError ? (
								<ErrorState
									error={pricing.error}
									retry={() => pricing.refetch()}
								/>
							) : (
								<fieldset disabled={purchase.isPending}>
									<legend className="mb-2 font-semibold">
										How long do you want to promote this product?
									</legend>
									<p className="mb-6 text-xs text-muted-foreground">
										Choose a fixed duration. The full cost is paid once from
										your wallet.
									</p>
									<div className="grid gap-4 sm:grid-cols-2">
										{pricing.data.options.map((item) => (
											<label
												key={item.duration_days}
												style={{
													borderColor:
														days === item.duration_days
															? "var(--primary)"
															: "var(--border)",
												}}
												className={cn(
													"relative cursor-pointer rounded-xl border p-5 transition focus-within:ring-2 focus-within:ring-primary/25",
													days === item.duration_days
														? "bg-primary/5"
														: "hover:bg-muted/30",
												)}
											>
												<div className="flex items-center justify-between gap-3">
													<span className="text-lg font-semibold">
														{durationLabel(item.duration_days)}
													</span>
													<input
														type="radio"
														name="promotion-duration"
														aria-label={`${durationLabel(item.duration_days)} for ${money(item.price)}`}
														checked={days === item.duration_days}
														onChange={() => {
															setDays(item.duration_days)
															setError("")
														}}
														className="size-4 accent-primary"
													/>
												</div>
												<p className="mt-4 text-xl font-semibold text-primary">
													{money(item.price)}
												</p>
												<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
													{item.duration_days === 180
														? "180 days of promotion"
														: "One payment for the full duration"}
												</p>
											</label>
										))}
									</div>
								</fieldset>
							)}
						</Panel>
					</div>
					<div className="space-y-5 xl:sticky xl:top-0">
						<Panel>
							<div className="mb-5 flex items-center gap-2">
								<Wallet size={18} className="text-primary" />
								<h2 className="text-sm font-semibold">Payment summary</h2>
							</div>
							{wallet.isPending ? (
								<p className="text-xs text-muted-foreground">
									Loading wallet balance…
								</p>
							) : wallet.isError ? (
								<>
									<p className="text-xs text-destructive">
										Couldn’t load your wallet.
									</p>
									<Button
										variant="outline"
										size="sm"
										className="mt-3"
										onClick={() => wallet.refetch()}
									>
										Retry wallet
									</Button>
								</>
							) : (
								<dl className="space-y-4 text-xs">
									<div className="flex justify-between gap-3">
										<dt className="text-muted-foreground">Available balance</dt>
										<dd>{money(wallet.data.available_balance)}</dd>
									</div>
									<div className="flex justify-between gap-3">
										<dt className="text-muted-foreground">Duration</dt>
										<dd>{days ? durationLabel(days) : "Choose a duration"}</dd>
									</div>
									<div className="flex justify-between gap-3 border-t border-border pt-4 text-sm font-semibold">
										<dt>Total cost</dt>
										<dd className="text-primary">
											{option ? money(option.price) : "—"}
										</dd>
									</div>
								</dl>
							)}
							{option && wallet.data && !affordable && (
								<p
									role="alert"
									className="mt-4 rounded-lg bg-destructive/5 p-3 text-xs leading-relaxed text-destructive"
								>
									Your wallet balance is below the promotion cost.{" "}
									<Link href="/market-vendor/wallet" className="underline">
										View wallet
									</Link>
								</p>
							)}
							<Button
								className="mt-6 w-full rounded-full"
								disabled={!canProceed}
								onClick={() => {
									if (selectedId && option) {
										setError("")
										setQuote({
											product_id: selectedId,
											duration_days: option.duration_days,
											expected_price: option.price,
										})
									}
								}}
							>
								Proceed <ArrowRight size={15} />
							</Button>
							<p className="mt-3 text-center text-[10px] leading-relaxed text-muted-foreground">
								You’ll review and confirm the payment before your wallet is
								charged.
							</p>
						</Panel>
						<div className="flex gap-2 px-2 text-xs leading-relaxed text-muted-foreground">
							<Info size={15} className="mt-0.5 shrink-0" />
							<p>
								Promotion duration starts once payment succeeds. Availability
								and pricing are checked again when you confirm.
							</p>
						</div>
					</div>
				</div>
			)}
			<Dialog
				open={quote !== null}
				onOpenChange={(open) => {
					if (!open && !purchase.isPending) setQuote(null)
				}}
			>
				<DialogContent className="rounded-2xl p-7">
					<div className="w-fit rounded-xl bg-primary/10 p-3 text-primary">
						<Megaphone size={25} />
					</div>
					<DialogTitle>Review your promotion</DialogTitle>
					<DialogDescription>
						Confirm this wallet payment to start promoting your product.
					</DialogDescription>
					{quote && (
						<>
							<div className="rounded-xl bg-muted/50 p-5">
								<p className="text-sm font-semibold">{selectedProduct?.name}</p>
								<p className="mt-2 text-xs text-muted-foreground">
									{durationLabel(quote.duration_days)} · Paid from your seller
									wallet
								</p>
								<p className="mt-4 text-2xl font-semibold text-primary">
									{money(quote.expected_price)}
								</p>
							</div>
							{error && (
								<p
									role="alert"
									className="text-xs leading-relaxed text-destructive"
								>
									{error}
								</p>
							)}
							{option?.price !== quote.expected_price && (
								<p role="alert" className="text-xs text-destructive">
									Pricing has changed. Close this review and check the latest
									price before continuing.
								</p>
							)}
							<div className="flex flex-wrap justify-end gap-2">
								<Button
									variant="outline"
									disabled={purchase.isPending}
									onClick={() => setQuote(null)}
								>
									Back
								</Button>
								<Button
									disabled={
										!canProceed || option?.price !== quote.expected_price
									}
									onClick={() => {
										if (!purchase.isPending && canProceed)
											purchase.mutate(quote)
									}}
								>
									{purchase.isPending && (
										<Loader2 size={15} className="animate-spin" />
									)}
									{purchase.isPending
										? "Starting promotion…"
										: `Confirm and pay ${money(quote.expected_price)}`}
								</Button>
							</div>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
