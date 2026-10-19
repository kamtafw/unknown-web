"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

const TABS = [
	{ label: "Events", href: "/events" },
	{ label: "My events", href: "/events/my-events" },
] as const

function isActive(pathname: string, href: string) {
	// "/events" must not also match "/events/my-events"
	return href === "/events" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Segmented Events / My events control (design: muted track, white pill for the
 * selected segment). Route-based, so each tab is deep-linkable and keeps its own
 * data and cache; these are links, not a tablist.
 */
export function EventsTabs() {
	const pathname = usePathname()

	return (
		<nav aria-label="Events sections" className="flex rounded-full bg-muted p-2">
			{TABS.map(({ label, href }) => {
				const active = isActive(pathname, href)
				return (
					<Link
						key={href}
						href={href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"flex h-7 flex-1 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
							active
								? "bg-card text-foreground shadow-sm"
								: "text-foreground/80 hover:text-foreground",
						)}
					>
						{label}
					</Link>
				)
			})}
		</nav>
	)
}
