"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, ShieldCheck, Trash2, Truck, Megaphone, Info } from "lucide-react"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { marketplaceApi, marketplaceError } from "@/lib/marketplace/api"
import { cn } from "@/lib/utils"
import {
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Panel,
	ProductImage,
	PromoteSwitch,
	Stars,
} from "./shared"
import { ProductReviews } from "./product-reviews"
import { ProductSales } from "./product-sales"

export function ProductDetails({ id, reviewsOnly = false }: { id: number; reviewsOnly?: boolean }) {
	const router = useRouter()
	const client = useQueryClient()
	const [tab, setTab] = useState<"details" | "sales">("details")
	const [section, setSection] = useState<"description" | "reviews">("description")
	const [image, setImage] = useState(0)
	const [removeOpen, setRemoveOpen] = useState(false)
	const identity = useQuery({
		queryKey: ["marketplace", "identity"],
		queryFn: marketplaceApi.identity,
	})
	const detail = useQuery({
		queryKey: ["marketplace", "seller-product", id],
		queryFn: () => marketplaceApi.sellerProduct(id),
		enabled: Number.isInteger(id) && id > 0,
	})
	const promote = useMutation({
		mutationFn: (value: boolean) => marketplaceApi.update(id, { promote: value }),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["marketplace", "seller-product", id] })
			client.invalidateQueries({ queryKey: ["marketplace", "products"] })
			toast.success("Promotion preference updated")
		},
		onError: (error) => toast.error(marketplaceError(error)),
	})
	const remove = useMutation({
		mutationFn: () => marketplaceApi.remove(id),
		onSuccess: () => {
			client.invalidateQueries({ queryKey: ["marketplace"] })
			toast.success("Product removed")
			router.push("/market-vendor/goods")
		},
		onError: (error) => toast.error(marketplaceError(error)),
	})
	if (!Number.isInteger(id) || id <= 0)
		return (
			<EmptyState
				title="Product not found"
				description="Return to your products to choose a listing."
				action={
					<Button asChild>
						<Link href="/market-vendor/goods">My products</Link>
					</Button>
				}
			/>
		)
	if (detail.isPending || identity.isPending) return <LoadingState />
	if (detail.isError || identity.isError)
		return (
			<ErrorState
				error={detail.error || identity.error}
				retry={() => {
					detail.refetch()
					identity.refetch()
				}}
			/>
		)
	const { product, rating_summary: rating } = detail.data
	if (identity.data.seller_id !== product.seller.id)
		return (
			<EmptyState
				title="This listing belongs to another seller"
				description="Choose one of your own products to manage its details and sales."
				action={
					<Button asChild>
						<Link href="/market-vendor/goods">My products</Link>
					</Button>
				}
			/>
		)
	return (
		<>
			<PageHeading
				title={reviewsOnly ? "Ratings & reviews" : "Product details"}
				description={reviewsOnly ? product.name : "Everything you need to manage this listing."}
				back="/market-vendor/goods"
				actions={
					!reviewsOnly && (
						<>
							<Button variant="outline" asChild className="h-10 rounded-full">
								<Link href={`/market-vendor/ads/promote?product=${id}`}>
									<Megaphone size={15} /> Promote product
								</Link>
							</Button>
							<Button
								variant="outline"
								className="h-10 rounded-full"
								onClick={() => setRemoveOpen(true)}
							>
								<Trash2 size={15} /> Remove
							</Button>
							<Button asChild className="h-10 rounded-full px-5">
								<Link href={`/market-vendor/goods/${id}/edit`}>
									<Pencil size={15} /> Edit product
								</Link>
							</Button>
						</>
					)
				}
			/>
			{reviewsOnly ? (
				<>
					<Link
						href={`/market-vendor/goods/${id}`}
						className="mb-5 inline-block text-sm text-primary hover:underline"
					>
						← Back to product details
					</Link>
					<ProductReviews id={id} summary={rating} />
				</>
			) : (
				<>
					<div
						className="mb-7 flex gap-7 border-b border-border"
						role="tablist"
						aria-label="Product view"
					>
						{(["details", "sales"] as const).map((value) => (
							<button
								role="tab"
								id={`tab-${value}`}
								aria-controls={`panel-${value}`}
								aria-selected={tab === value}
								style={{ borderBottomColor: tab === value ? "var(--primary)" : "transparent" }}
								tabIndex={tab === value ? 0 : -1}
								onKeyDown={(e) => {
									if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
										e.preventDefault()
										const next = value === "details" ? "sales" : "details"
										setTab(next)
										document.getElementById(`tab-${next}`)?.focus()
									}
								}}
								key={value}
								onClick={() => setTab(value)}
								className={cn(
									"border-b-2 px-1 pb-4 text-sm font-medium transition focus-visible:outline-primary",
									tab === value
										? "border-primary text-primary"
										: "border-transparent text-muted-foreground hover:text-foreground",
								)}
							>
								{value === "details" ? "Product details" : "Track sales"}
							</button>
						))}
					</div>
					<div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
						{tab === "sales" ? (
							<ProductSales product={product} />
						) : (
							<>
								<div className="grid items-start gap-6 xl:grid-cols-[1.05fr_1fr]">
									<Panel className="p-4">
										<ProductImage
											src={product.images[image] || product.images[0]}
											name={product.name}
											className="aspect-[6/5]"
											priority
										/>
										{product.images.length > 1 && (
											<div className="mt-4 grid grid-cols-6 gap-2">
												{product.images.map((src, index) => (
													<button
														key={`${src}-${index}`}
														aria-label={`View product image ${index + 1}`}
														aria-pressed={image === index}
														style={{
															borderColor: image === index ? "var(--primary)" : "transparent",
														}}
														onClick={() => setImage(index)}
														className={cn(
															"overflow-hidden rounded-lg border-2 transition",
															image === index
																? "border-primary"
																: "border-transparent hover:border-border",
														)}
													>
														<ProductImage
															src={src}
															name={`${product.name}, image ${index + 1}`}
															className="aspect-square rounded-md"
														/>
													</button>
												))}
											</div>
										)}
									</Panel>
									<div className="space-y-5">
										<Panel>
											<div className="mb-5 flex items-center justify-between border-b border-border pb-5">
												<div className="flex items-center gap-2 text-xs font-medium">
													<Megaphone size={16} className="text-primary" />
													<label htmlFor="promote">Promote this product</label>
													<span title="Mark this listing for promotion. Paid advertising campaigns are managed separately.">
														<Info size={13} className="text-muted-foreground" />
													</span>
												</div>
												<PromoteSwitch
													checked={product.promote}
													disabled={promote.isPending}
													onChange={(value) => promote.mutate(value)}
												/>
											</div>
											<p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-primary">
												{product.categories.map((c) => c.name).join(" / ") || "Uncategorised"}
											</p>
											<h2 className="text-xl leading-snug font-semibold lg:text-2xl">
												{product.name}
											</h2>
											<div className="mt-4 flex flex-wrap items-center gap-2">
												<Stars rating={rating.average_rating} />
												<button
													onClick={() => setSection("reviews")}
													className="text-xs text-muted-foreground hover:text-primary"
												>
													{rating.total_reviews
														? `${rating.average_rating} · ${rating.total_reviews} reviews`
														: "No reviews yet"}
												</button>
											</div>
											<div className="my-6">
												<p className="text-3xl font-semibold tracking-tight text-primary">
													{money(product.discount_price ?? product.price)}
												</p>
												{product.discount_price !== null && (
													<p className="mt-1 text-sm text-muted-foreground line-through">
														{money(product.price)}
													</p>
												)}
											</div>
											<div className="flex items-center justify-between rounded-xl bg-muted/50 p-3.5">
												<span className="text-xs text-muted-foreground">Available inventory</span>
												<span
													className={cn(
														"inline-flex items-center gap-2 text-xs font-medium",
														product.quantity
															? "text-emerald-700 dark:text-emerald-400"
															: "text-destructive",
													)}
												>
													<span className="size-1.5 rounded-full bg-current" />
													{product.quantity ? `${product.quantity} in stock` : "Out of stock"}
												</span>
											</div>
										</Panel>
										<Panel className="space-y-5">
											<div className="flex gap-3">
												<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
													<Truck size={19} />
												</div>
												<div className="flex-1">
													<h3 className="text-sm font-semibold">Shipping & delivery</h3>
													{product.delivery_settings.length ? (
														product.delivery_settings.map((d) => (
															<div
																key={d.delivery_option.id}
																className="mt-2 flex justify-between gap-2 text-xs text-muted-foreground"
															>
																<span>{d.delivery_option.name}</span>
																<span className="font-medium text-foreground">
																	{money(d.price)}
																</span>
															</div>
														))
													) : (
														<p className="mt-1 text-xs text-muted-foreground">
															No delivery options added.
														</p>
													)}
												</div>
											</div>
											<div className="flex gap-3 border-t border-border pt-5">
												<div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600">
													<ShieldCheck size={19} />
												</div>
												<div>
													<h3 className="text-sm font-semibold">Security & privacy</h3>
													<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
														Your personal information stays protected on AppsCombo.
													</p>
												</div>
											</div>
										</Panel>
									</div>
								</div>
								<div
									className="mt-7 mb-5 flex gap-6 border-b border-border"
									aria-label="Product information"
								>
									{(["description", "reviews"] as const).map((value) => (
										<button
											key={value}
											aria-pressed={section === value}
											style={{
												borderBottomColor: section === value ? "var(--primary)" : "transparent",
											}}
											onClick={() => setSection(value)}
											className={cn(
												"border-b-2 pb-3 text-sm font-medium",
												section === value
													? "border-primary text-primary"
													: "border-transparent text-muted-foreground",
											)}
										>
											{value === "description"
												? "Description & specifications"
												: "Reviews & ratings"}
										</button>
									))}
								</div>
								{section === "reviews" ? (
									<ProductReviews id={id} summary={rating} compact />
								) : (
									<div className="grid items-start gap-6 xl:grid-cols-[1.05fr_1fr]">
										<Panel>
											<h3 className="mb-4 font-semibold">Description</h3>
											<p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
												{product.description ||
													"No description has been added to this product yet."}
											</p>
										</Panel>
										<Panel>
											<div className="mb-4 flex items-center justify-between">
												<h3 className="font-semibold">Specifications</h3>
												<Link
													href={`/market-vendor/goods/${id}/edit`}
													className="inline-flex items-center gap-1 text-xs text-primary"
												>
													<Plus size={13} /> Add more
												</Link>
											</div>
											<dl className="divide-y divide-border">
												<div className="grid grid-cols-2 py-3 text-sm">
													<dt className="text-muted-foreground">Quantity</dt>
													<dd className="font-medium">{product.quantity}</dd>
												</div>
												{product.specifications.flatMap((spec, index) =>
													Object.entries(spec).map(([key, value]) => (
														<div
															key={`${index}-${key}`}
															className="grid grid-cols-2 gap-4 py-3 text-sm"
														>
															<dt className="break-words text-muted-foreground">{key}</dt>
															<dd className="break-words font-medium">{value}</dd>
														</div>
													)),
												)}
											</dl>
										</Panel>
									</div>
								)}
							</>
						)}
					</div>
				</>
			)}
			<AlertDialog.Root open={removeOpen} onOpenChange={setRemoveOpen}>
				<AlertDialog.Portal>
					<AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
					<AlertDialog.Content className="fixed top-1/2 left-1/2 z-[61] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-7 shadow-xl">
						<div className="mb-4 inline-flex rounded-xl bg-destructive/10 p-3 text-destructive">
							<Trash2 size={23} />
						</div>
						<AlertDialog.Title className="text-xl font-semibold">
							Remove this product?
						</AlertDialog.Title>
						<AlertDialog.Description className="mt-3 text-sm leading-relaxed text-muted-foreground">
							“{product.name}” will be removed from your store. This action cannot be undone.
						</AlertDialog.Description>
						<div className="mt-7 flex justify-end gap-2">
							<AlertDialog.Cancel asChild>
								<Button variant="outline" disabled={remove.isPending}>
									Keep product
								</Button>
							</AlertDialog.Cancel>
							<Button
								variant="destructive"
								disabled={remove.isPending}
								onClick={() => remove.mutate()}
							>
								{remove.isPending ? "Removing…" : "Remove product"}
							</Button>
						</div>
					</AlertDialog.Content>
				</AlertDialog.Portal>
			</AlertDialog.Root>
		</>
	)
}
