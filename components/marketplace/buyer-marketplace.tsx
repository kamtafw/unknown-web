"use client"

import { useDeferredValue, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Search, ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
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

export function BuyerMarketplace() {
	const [search, setSearch] = useState("")
	const query = useDeferredValue(search)
	const [page, setPage] = useState(1)
	const [sort, setSort] = useState("newest")
	const [selected, setSelected] = useState<number | null>(null)
	const products = useQuery({
		queryKey: ["marketplace", "browse", query, sort, page],
		queryFn: () => marketplaceApi.products(undefined, query, sort, page),
	})
	const detail = useQuery({
		queryKey: ["marketplace", "product", selected],
		queryFn: () => marketplaceApi.product(selected!),
		enabled: selected !== null,
	})
	return (
		<main className="min-h-0 flex-1 overflow-y-auto bg-muted/35">
			<div className="mx-auto max-w-[1440px] px-6 py-8 lg:px-12">
				<div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
					<ShoppingBag size={14} />
					Marketplace · Buyer view
				</div>
				<PageHeading
					title="Discover something for you"
					description="Explore products from sellers across AppsCombo."
					actions={
						<Button asChild variant="outline" className="rounded-full">
							<Link href="/market-vendor/account">
								<Store size={15} /> Switch to seller’s account
							</Link>
						</Button>
					}
				/>
				<Panel className="mb-7 flex flex-wrap gap-4 p-4">
					<div className="relative min-w-48 flex-1">
						<Search size={16} className="absolute top-3.5 left-3.5 text-muted-foreground" />
						<input
							aria-label="Search marketplace"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value)
								setPage(1)
							}}
							placeholder="Find something you’ll love…"
							className="h-11 w-full rounded-xl border border-border bg-card pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary"
						/>
					</div>
					<select
						aria-label="Sort marketplace"
						value={sort}
						onChange={(e) => {
							setSort(e.target.value)
							setPage(1)
						}}
						className="h-11 rounded-xl border border-border bg-card px-4 text-sm"
					>
						<option value="newest">Newest first</option>
						<option value="price_asc">Price: low to high</option>
						<option value="price_desc">Price: high to low</option>
					</select>
				</Panel>
				{products.isPending ? (
					<LoadingState />
				) : products.isError ? (
					<ErrorState error={products.error} retry={() => products.refetch()} />
				) : (
					<>
						{!products.data.results.length ? (
							<Panel>
								<EmptyState
									title="No products found"
									description="Try another search or check back as sellers add new products."
								/>
							</Panel>
						) : (
							<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
								{products.data.results.map((product) => (
									<button
										key={product.id}
										onClick={() => setSelected(product.id)}
										className="rounded-2xl border border-border bg-card p-3 text-left transition hover:shadow-md focus-visible:outline-primary"
									>
										<ProductImage
											src={product.images[0]}
											name={product.name}
											className="aspect-[4/3]"
										/>
										<div className="p-2 pt-4">
											<p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
												{product.categories.map((c) => c.name).join(" · ")}
											</p>
											<h2 className="line-clamp-2 min-h-10 text-sm font-semibold">
												{product.name}
											</h2>
											<p className="mt-4 text-lg font-semibold text-primary">
												{money(product.discount_price ?? product.price)}
											</p>
											<p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
												View product <ArrowRight size={12} />
											</p>
										</div>
									</button>
								))}
							</div>
						)}
						<Pagination page={page} total={products.data.total_pages} onChange={setPage} />
					</>
				)}
				<Dialog
					open={selected !== null}
					onOpenChange={(open) => {
						if (!open) setSelected(null)
					}}
				>
					<DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
						<DialogTitle>{detail.data?.product.name || "Product details"}</DialogTitle>
						<DialogDescription>Explore the product and its seller.</DialogDescription>
						{detail.isPending ? (
							<LoadingState />
						) : detail.isError ? (
							<ErrorState error={detail.error} retry={() => detail.refetch()} />
						) : (
							detail.data && (
								<>
									<ProductImage
										src={detail.data.product.images[0]}
										name={detail.data.product.name}
										className="aspect-[2/1]"
									/>
									<p className="text-2xl font-semibold text-primary">
										{money(detail.data.product.discount_price ?? detail.data.product.price)}
									</p>
									<p className="text-xs text-muted-foreground">
										Sold by {detail.data.product.seller.business_name} ·{" "}
										{detail.data.product.quantity
											? `${detail.data.product.quantity} in stock`
											: "Out of stock"}
									</p>
									<p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
										{detail.data.product.description || "No description provided."}
									</p>
									<div className="rounded-xl bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
										Buyer browsing is available now. Cart and checkout are coming in a later update.
									</div>
								</>
							)
						)}
					</DialogContent>
				</Dialog>
			</div>
		</main>
	)
}
