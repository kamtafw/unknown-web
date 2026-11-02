"use client"

import {
	ArrowUpRight,
	Bell,
	ShoppingBag,
	ChartNoAxesCombined,
	ChevronRight,
	CircleHelp,
	Package,
	Plus,
	Store,
	UserRound,
	Wallet,
	Megaphone,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { marketplaceApi } from "@/lib/marketplace/api"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function SellerShell({ children }: { children: ReactNode }) {
	const pathname = usePathname()
	const identity = useQuery({
		queryKey: ["marketplace", "identity"],
		queryFn: marketplaceApi.identity,
	})
	const listing =
		pathname.includes("list-product") ||
		(pathname.startsWith("/market-vendor/goods") && pathname.endsWith("/edit"))
	const navigation = [
		{
			href: "/market-vendor/goods",
			label: "My products",
			icon: Package,
			active: pathname.startsWith("/market-vendor/goods") && !listing,
		},
		{
			href: "/market-vendor/orders",
			label: "Orders",
			icon: ShoppingBag,
			active: pathname.startsWith("/market-vendor/orders"),
		},
		{
			href: "/market-vendor/ads",
			label: "Ads & promotions",
			icon: Megaphone,
			active: pathname.startsWith("/market-vendor/ads"),
		},
		{
			href: "/market-vendor/wallet",
			label: "Wallet",
			icon: Wallet,
			active: pathname.startsWith("/market-vendor/wallet"),
		},
		{
			href: "/market-vendor/alerts",
			label: "Alerts",
			icon: Bell,
			active: pathname.startsWith("/market-vendor/alerts"),
		},
		{ href: "/market-vendor/list-product", label: "List a product", icon: Plus, active: listing },
		{
			href: "/market-vendor/account",
			label: "Account",
			icon: UserRound,
			active: pathname.startsWith("/market-vendor/account") || pathname === "/market-vendor/setup",
		},
	]
	return (
		<div className="flex min-h-0 flex-1 bg-muted/35">
			<aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-card px-4 py-7 lg:flex">
				<div className="mb-8 flex items-center gap-3 px-3">
					<div className="rounded-xl bg-primary/10 p-2.5 text-primary">
						<Store size={22} />
					</div>
					<div>
						<p className="text-sm font-semibold">Seller centre</p>
						<p className="mt-0.5 text-[11px] text-muted-foreground">Your business, in one place</p>
					</div>
				</div>
				<p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.15em] text-muted-foreground">
					Marketplace
				</p>
				<nav aria-label="Seller navigation" className="space-y-1">
					{navigation.map(({ href, label, icon: Icon, active }) => (
						<Link
							key={href}
							href={href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"flex items-center gap-3 rounded-xl px-3 py-3 text-sm",
								active
									? "bg-primary/10 font-semibold text-primary"
									: "text-muted-foreground hover:bg-muted",
							)}
						>
							<Icon size={19} />
							{label}
							{active && <ChevronRight size={15} className="ml-auto" />}
						</Link>
					))}
				</nav>
				<div className="mt-8 rounded-xl border border-primary/15 bg-primary/5 p-4">
					<ChartNoAxesCombined size={21} className="mb-3 text-primary" />
					<p className="text-xs font-semibold">A little insight goes a long way</p>
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
						Open a product to track sales and see what your customers are loving.
					</p>
				</div>
				<div className="mt-auto pt-10">
					<Link
						href="/support"
						className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground hover:text-primary"
					>
						<CircleHelp size={17} /> Help & support <ArrowUpRight size={14} className="ml-auto" />
					</Link>
					<div className="mt-3 flex items-center gap-2.5 border-t border-border px-3 pt-5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Store size={17} />
						</div>
						<div className="min-w-0">
							<p className="truncate text-xs font-semibold">
								{identity.data?.business_name || "Your store"}
							</p>
							<p className="mt-1 text-[10px] text-muted-foreground">Seller workspace</p>
						</div>
					</div>
				</div>
			</aside>
			<main id="seller-content" className="min-w-0 flex-1 overflow-y-auto">
				<div className="mx-auto max-w-[1480px] px-5 py-7 lg:px-9 lg:py-8 xl:px-12">
					<div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
						<Store size={13} />
						<span>Marketplace</span>
						<ChevronRight size={12} />
						<span className="text-foreground">Seller centre</span>
					</div>
					<nav
						className="mb-6 flex flex-wrap gap-4 text-sm lg:hidden"
						aria-label="Seller navigation"
					>
						{navigation.map(({ href, label, active }) => (
							<Link
								key={href}
								href={href}
								aria-current={active ? "page" : undefined}
								className={active ? "font-semibold text-primary" : "text-muted-foreground"}
							>
								{label}
							</Link>
						))}
					</nav>
					{children}
				</div>
			</main>
		</div>
	)
}
