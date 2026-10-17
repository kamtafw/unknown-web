"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
	{ label: "Discover", href: "/events" },
	{ label: "My Events", href: "/events/my-events" },
] as const

/** Route-based tabs, so each view is deep-linkable and has its own cache and state. */
export function EventsHeader() {
	const pathname = usePathname()

	return (
		<div className="mb-5 flex flex-col gap-4">
			<h1 className="text-xl font-bold text-foreground">Events</h1>

			<nav aria-label="Events sections" className="flex gap-1.5">
				{TABS.map(({ label, href }) => {
					const active = pathname === href
					return (
						<Link
							key={href}
							href={href}
							aria-current={active ? "page" : undefined}
							className={cn(
								"px-5 py-2 rounded-full text-sm font-medium border transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
								active
									? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
									: "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							{label}
						</Link>
					)
				})}
			</nav>
		</div>
	)
}
