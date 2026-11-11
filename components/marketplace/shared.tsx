"use client"

import * as Switch from "@radix-ui/react-switch"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, Package, RefreshCw, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { marketplaceError } from "@/lib/marketplace/api"
import type { ReactNode } from "react"
import { isAxiosError } from "axios"

export const money = (value: number | string) =>
	new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 2,
	}).format(Number(value))
export const dateLabel = (value: string) =>
	new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

export function ProductImage({
	src,
	name,
	className,
	priority = false,
	imageClassName,
}: {
	src?: string
	name: string
	className?: string
	priority?: boolean
	imageClassName?: string
}) {
	return (
		<div className={cn("relative overflow-hidden rounded-xl bg-muted/60", className)}>
			{src ? (
				<Image
					src={src}
					alt={name}
					fill
					unoptimized
					priority={priority}
					className={cn("object-contain p-4", imageClassName)}
					sizes="(max-width: 768px) 100vw, 40vw"
				/>
			) : (
				<div className="flex h-full items-center justify-center text-muted-foreground">
					<Package size={38} strokeWidth={1.2} />
					<span className="sr-only">No product image</span>
				</div>
			)}
		</div>
	)
}

export function PageHeading({
	title,
	description,
	actions,
	back,
	backLabel = "Back to products",
}: {
	title: string
	description?: string
	actions?: ReactNode
	back?: string
	backLabel?: string
}) {
	return (
		<div className="mb-7 flex flex-wrap items-center justify-between gap-4">
			<div>
				{back && (
					<Link
						href={back}
						className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
					>
						<ArrowLeft size={14} /> {backLabel}
					</Link>
				)}
				<h1 className="text-2xl font-semibold tracking-tight lg:text-[28px]">{title}</h1>
				{description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
			</div>
			{actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
		</div>
	)
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<section className={cn("rounded-2xl border border-border bg-card p-6", className)}>
			{children}
		</section>
	)
}

export function LoadingState() {
	return (
		<div role="status" aria-label="Loading marketplace" className="space-y-5 animate-pulse">
			<div className="h-9 w-56 rounded-lg bg-muted" />
			<div className="grid gap-5 md:grid-cols-2">
				<div className="h-80 rounded-2xl bg-muted" />
				<div className="h-80 rounded-2xl bg-muted" />
			</div>
			<span className="sr-only">Loading…</span>
		</div>
	)
}

export function ErrorState({ error, retry }: { error: unknown; retry: () => void }) {
	const code = isAxiosError(error) ? error.response?.data?.code : undefined
	const setupRequired = code === "seller_profile_not_found" || code === "seller_profile_missing"
	return (
		<Panel className="py-16 text-center">
			<Package className="mx-auto mb-4 text-muted-foreground" size={36} />
			<h2 className="font-semibold">{setupRequired ? "Set up your seller account" : "Unable to load marketplace"}</h2>
			<p role="alert" className="mx-auto mt-2 mb-5 max-w-md text-sm text-muted-foreground">
				{marketplaceError(error)}
			</p>
			{setupRequired ? (
				<Button asChild><Link href="/market-vendor/setup">Set up your store</Link></Button>
			) : (
				<Button variant="outline" onClick={retry}>
					<RefreshCw size={16} /> Try again
				</Button>
			)}
		</Panel>
	)
}

export function EmptyState({
	title,
	description,
	action,
}: {
	title: string
	description: string
	action?: ReactNode
}) {
	return (
		<div className="flex flex-col items-center px-6 py-16 text-center">
			<div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary">
				<Package size={28} strokeWidth={1.5} />
			</div>
			<h3 className="font-semibold">{title}</h3>
			<p className="mt-2 mb-5 max-w-sm text-sm text-muted-foreground">{description}</p>
			{action}
		</div>
	)
}

export function Pagination({
	page,
	total,
	onChange,
}: {
	page: number
	total: number
	onChange: (page: number) => void
}) {
	if (total <= 1) return null
	return (
		<nav
			aria-label="Pagination"
			className="mt-6 flex items-center justify-end gap-4 text-xs text-muted-foreground"
		>
			<span>
				Page {page} of {total}
			</span>
			<Button
				aria-label="Previous page"
				size="icon"
				variant="outline"
				disabled={page === 1}
				onClick={() => onChange(page - 1)}
			>
				<ChevronLeft />
			</Button>
			<Button
				aria-label="Next page"
				size="icon"
				variant="outline"
				disabled={page >= total}
				onClick={() => onChange(page + 1)}
			>
				<ChevronRight />
			</Button>
		</nav>
	)
}

export function Stars({ rating }: { rating: number }) {
	return (
		<span aria-label={`${rating} out of 5 stars`} className="inline-flex gap-0.5 text-amber-500">
			{[1, 2, 3, 4, 5].map((n) => (
				<Star
					key={n}
					size={14}
					className={n <= Math.round(rating) ? "fill-current" : "text-border fill-border"}
				/>
			))}
		</span>
	)
}

export function PromoteSwitch({
	checked,
	onChange,
	disabled,
	id = "promote",
}: {
	checked: boolean
	onChange: (value: boolean) => void
	disabled?: boolean
	id?: string
}) {
	return (
		<Switch.Root
			id={id}
			checked={checked}
			disabled={disabled}
			onCheckedChange={onChange}
			aria-label="Promote this product"
			className="inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-muted-foreground/30 p-0.5 transition data-[state=checked]:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50"
		>
			<Switch.Thumb className="size-5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5" />
		</Switch.Root>
	)
}
