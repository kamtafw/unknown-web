"use client"

import { useDeferredValue, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
	ArrowUpRight,
	Megaphone,
	Plus,
	Search,
	SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { marketplaceApi } from "@/lib/marketplace/api"
import {
	EmptyState,
	ErrorState,
	LoadingState,
	money,
	PageHeading,
	Pagination,
	Panel,
	ProductImage,
} from "./shared"

export function ProductCatalogue() {
	const [search, setSearch] = useState("")
	const query = useDeferredValue(search)
	const [sort, setSort] = useState("newest")
	const [page, setPage] = useState(1)
	const identity = useQuery({
		queryKey: ["marketplace", "identity"],
		queryFn: marketplaceApi.identity,
	})
	const products = useQuery({
		queryKey: [
			"marketplace",
			"products",
			identity.data?.seller_id,
			query,
			sort,
			page,
		],
		queryFn: () =>
			marketplaceApi.products(identity.data!.seller_id, query, sort, page),
		enabled: !!identity.data?.seller_id,
	})
	return (
		<>
			<PageHeading
				title="My products"
				description="A home for everything you sell. Manage, refine, and grow your store."
				actions={
					<>
						<Button asChild variant="outline" className="h-10 rounded-full">
							<Link href="/market-vendor/ads">
								<Megaphone size={15} /> Ads & promotions
							</Link>
						</Button>
						<Button asChild className="h-10 rounded-full px-5">
							<Link href="/market-vendor/list-product">
								<Plus size={17} /> List a product
							</Link>
						</Button>
					</>
				}
			/>
			<div className="mb-7 flex items-center justify-between gap-5 rounded-2xl border border-primary/15 bg-primary/5 px-6 py-5">
				<div>
					<p className="text-sm font-semibold">
						{identity.data && identity.data.approval_status !== "approved"
							? "Build your catalogue while your account is reviewed"
							: "Your next sale starts with a great listing"}
					</p>
					<p className="mt-1 text-xs leading-relaxed text-muted-foreground">
						{identity.data && identity.data.approval_status !== "approved"
							? "Your listings are private until AppsCombo approves your seller account. You can add and edit products now."
							: "Add clear photos, helpful details, and delivery options to help customers choose."}
					</p>
				</div>
				<div className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-card text-primary sm:flex">
					<ArrowUpRight size={24} />
				</div>
			</div>
			<Panel className="mb-6 flex flex-wrap items-center gap-4 p-4">
				<div className="relative min-w-48 flex-1">
					<Search
						size={17}
						className="absolute left-3.5 top-3 text-muted-foreground"
					/>
					<input
						aria-label="Search products"
						value={search}
						onChange={(e) => {
							setSearch(e.target.value)
							setPage(1)
						}}
						placeholder="Search your products…"
						className="h-10 w-full rounded-xl border border-border bg-muted/35 pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
					/>
				</div>
				<label className="flex items-center gap-2 text-xs text-muted-foreground">
					<SlidersHorizontal size={15} />
					<span className="sr-only">Sort products</span>
					<select
						value={sort}
						onChange={(e) => {
							setSort(e.target.value)
							setPage(1)
						}}
						className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground focus-visible:outline-primary"
					>
						<option value="newest">Newest first</option>
						<option value="promoted">Marked for promotion first</option>
						<option value="price_asc">Price: low to high</option>
						<option value="price_desc">Price: high to low</option>
					</select>
				</label>
			</Panel>
			{identity.isError ? (
				<ErrorState error={identity.error} retry={() => identity.refetch()} />
			) : identity.isPending || products.isPending ? (
				<LoadingState />
			) : products.isError ? (
				<ErrorState error={products.error} retry={() => products.refetch()} />
			) : (
				<>
					<div className="mb-4 flex items-center gap-2 text-sm font-medium">
						{query ? "Search results" : "All products"}
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
							{products.data.count}
						</span>
					</div>
					{!products.data.results.length ? (
						<Panel>
							<EmptyState
								title={
									query
										? "No matching products"
										: "Let’s list your first product"
								}
								description={
									query
										? "Try another name or clear your search to see your products."
										: "Bring your store to life with photos, a price, and the details customers need."
								}
								action={
									query ? (
										<Button
											variant="outline"
											onClick={() => {
												setSearch("")
												setPage(1)
											}}
										>
											Clear search
										</Button>
									) : (
										<Button asChild>
											<Link href="/market-vendor/list-product">
												<Plus /> List a product
											</Link>
										</Button>
									)
								}
							/>
						</Panel>
					) : (
						<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
							{products.data.results.map((product) => (
								<Link
									href={`/market-vendor/goods/${product.id}`}
									key={product.id}
									className="group overflow-hidden rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-primary"
								>
									<div className="relative">
										<ProductImage
											src={product.images[0]}
											name={product.name}
											className="aspect-[4/3]"
										/>
										{product.promote && (
											<span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-card/95 px-2.5 py-1 text-[10px] font-medium text-primary">
												<Megaphone size={12} /> Marked for promotion
											</span>
										)}
									</div>
									<div className="p-2 pt-4">
										<p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
											{product.categories.map((c) => c.name).join(" · ") ||
												"Uncategorised"}
										</p>
										<h2 className="line-clamp-2 min-h-10 text-sm leading-5 font-semibold group-hover:text-primary">
											{product.name}
										</h2>
										<div className="mt-4 flex items-end justify-between gap-2">
											<div>
												<p className="text-lg font-semibold text-primary">
													{money(product.discount_price ?? product.price)}
												</p>
												{product.discount_price !== null && (
													<p className="text-xs text-muted-foreground line-through">
														{money(product.price)}
													</p>
												)}
											</div>
											<span
												className={`rounded-full px-2 py-1 text-[10px] ${product.quantity === 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"}`}
											>
												{product.quantity === 0
													? "Out of stock"
													: `${product.quantity} in stock`}
											</span>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
					<Pagination
						page={page}
						total={products.data.total_pages}
						onChange={setPage}
					/>
				</>
			)}
		</>
	)
}
