"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Star } from "lucide-react"
import Link from "next/link"
import { marketplaceApi } from "@/lib/marketplace/api"
import type { RatingSummary } from "@/types/marketplace"
import { cn } from "@/lib/utils"
import {
	dateLabel,
	EmptyState,
	ErrorState,
	LoadingState,
	Pagination,
	Panel,
	ProductImage,
	Stars,
} from "./shared"

export function ProductReviews({
	id,
	summary,
	compact = false,
}: {
	id: number
	summary: RatingSummary
	compact?: boolean
}) {
	const [rating, setRating] = useState(0)
	const [page, setPage] = useState(1)
	const reviews = useQuery({
		queryKey: ["marketplace", "reviews", id, rating, page],
		queryFn: () => marketplaceApi.reviews(id, rating, page),
	})
	return (
		<Panel>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-semibold">Ratings & reviews</h2>
				{compact && (
					<Link
						href={`/market-vendor/goods/${id}/reviews`}
						className="text-xs font-medium text-primary hover:underline"
					>
						View all reviews →
					</Link>
				)}
			</div>
			<div className="mb-7 grid gap-6 border-b border-border pb-7 sm:grid-cols-[180px_1fr]">
				<div>
					<p className="text-5xl font-semibold tracking-tight">
						{summary.total_reviews ? summary.average_rating.toFixed(1) : "—"}
						<span className="ml-1 text-sm font-normal text-muted-foreground">/ 5</span>
					</p>
					<div className="mt-3">
						<Stars rating={summary.average_rating} />
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						{summary.total_reviews.toLocaleString()}{" "}
						{summary.total_reviews === 1 ? "review" : "reviews"}
					</p>
				</div>
				<div className="max-w-md space-y-2">
					{[5, 4, 3, 2, 1].map((n) => (
						<div key={n} className="flex items-center gap-2 text-xs">
							<span>{n}</span>
							<Star size={11} className="fill-amber-400 text-amber-400" />
							<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-amber-400"
									style={{ width: `${summary.breakdown[`${n}_star`]?.percent || 0}%` }}
								/>
							</div>
							<span className="w-8 text-right text-muted-foreground">
								{summary.breakdown[`${n}_star`]?.count || 0}
							</span>
						</div>
					))}
				</div>
			</div>
			{!compact && (
				<div className="mb-6 flex flex-wrap gap-2" aria-label="Filter reviews by rating">
					{[0, 5, 4, 3, 2, 1].map((n) => (
						<button
							key={n}
							type="button"
							aria-pressed={rating === n}
							onClick={() => {
								setRating(n)
								setPage(1)
							}}
							className={cn(
								"inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition focus-visible:outline-2 focus-visible:outline-primary",
								rating === n
									? "bg-primary text-primary-foreground"
									: "bg-muted/60 text-muted-foreground hover:bg-muted",
							)}
						>
							{n === 0 ? (
								"All reviews"
							) : (
								<>
									{n} <Star size={12} className="fill-current" />
								</>
							)}
						</button>
					))}
				</div>
			)}
			{reviews.isPending ? (
				<LoadingState />
			) : reviews.isError ? (
				<ErrorState error={reviews.error} retry={() => reviews.refetch()} />
			) : !reviews.data.results.length ? (
				<EmptyState
					title="No reviews yet"
					description={
						rating
							? "There are no reviews with this rating."
							: "Customer feedback will appear here after your first reviews."
					}
				/>
			) : (
				<>
					<div className="divide-y divide-border">
						{(compact ? reviews.data.results.slice(0, 2) : reviews.data.results).map((review) => {
							const name =
								[review.user.first_name, review.user.last_name].filter(Boolean).join(" ") ||
								review.user.username ||
								"Customer"
							return (
								<article key={review.id} className="py-5 first:pt-0">
									<div className="mb-3 flex flex-wrap items-center justify-between gap-2">
										<div className="flex items-center gap-3">
											<div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
												{name.slice(0, 2).toUpperCase()}
											</div>
											<div>
												<h3 className="text-sm font-medium">{name}</h3>
												<p className="mt-0.5 text-[11px] text-muted-foreground">
													{dateLabel(review.created_at)}
												</p>
											</div>
										</div>
										<Stars rating={review.rating} />
									</div>
									<p className="text-sm leading-relaxed text-muted-foreground">
										{review.review_text || "This customer left a rating."}
									</p>
									{review.images.length > 0 && (
										<div className="mt-3 flex flex-wrap gap-2">
											{review.images.map((src, i) => (
												<a
													key={`${src}-${i}`}
													href={src}
													target="_blank"
													rel="noreferrer"
													aria-label={`Open review photo ${i + 1}`}
												>
													<ProductImage
														src={src}
														name={`Review photo ${i + 1}`}
														className="size-20"
													/>
												</a>
											))}
										</div>
									)}
								</article>
							)
						})}
					</div>
					{!compact && (
						<Pagination page={page} total={reviews.data.total_pages} onChange={setPage} />
					)}
				</>
			)}
		</Panel>
	)
}
