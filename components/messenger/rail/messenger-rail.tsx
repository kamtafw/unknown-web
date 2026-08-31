"use client"

import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Chats, Groups, Status } from "../icons/messenger-rail-icons"

interface RailItem {
	label: string
	icon: typeof Chats
	href?: string
	badge?: number
}

const RAIL_ITEMS: RailItem[] = [
	{ label: "Chat", icon: Chats, href: "/messenger" },
	{ label: "Groups", icon: Groups, href: "/messenger/groups" },
	{ label: "Status", icon: Status, href: "/messenger/status" },
]

/**
 * Only "Chat" and "Groups" are wired — every other destination belongs to
 * a later milestone (Status — M5; Calls — M8). "Groups" (Users icon)
 * resolves the earlier open question from M1 ("Contacts/Lists —
 * unconfirmed which mobile capability they map to") — Figma confirms this
 * rail slot is the Groups/Communities entry point, not a contacts/address
 * book screen. See DECISIONS.md.
 */
export function MessengerRail() {
	const pathname = usePathname()

	return (
		<nav className="w-14 sm:w-16 shrink-0 border-r border-border bg-background flex flex-col items-center px-2 py-3 gap-2">
			{RAIL_ITEMS.map((item) => {
				const isActive = item.href
					? item.href === "/messenger"
						? pathname === item.href
						: pathname.startsWith(item.href)
					: false
				const Icon = item.icon

				if (item.href) {
					return (
						<Link
							key={item.label}
							href={item.href}
							title={item.label}
							className={cn(
								"relative w-full h-10 rounded-r-xl flex items-center justify-center transition-colors",
								isActive
									? "bg-primary/10 text-primary border-l-3 border-l-primary"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							<Icon size={20} />
							{!!item.badge && (
								<span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
									{item.badge > 99 ? "99+" : item.badge}
								</span>
							)}
						</Link>
					)
				}

				return (
					<button
						key={item.label}
						title={`${item.label} — coming soon`}
						onClick={() => toast.info(`${item.label} is coming in a later milestone`)}
						className="relative w-full h-10 rounded-r-xl flex items-center justify-center transition-colors text-muted-foreground hover:bg-accent hover-text-foreground cursor-not-allowed"
					>
						<Icon size={20} />
					</button>
				)
			})}

			<div className="flex-1" />

			<button
				title="Settings — coming soon"
				onClick={() => toast.info("Messenger settings are coming in a later milestone")}
				className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground/40 cursor-not-allowed hover:bg-accent/40 transition-colors"
			>
				<Settings size={19} />
			</button>
			<button
				title="Log out — coming soon from this rail"
				onClick={() => toast.info("Use the account menu in the top bar to log out")}
				className="w-10 h-10 rounded-full flex items-center justify-center text-destructive/40 cursor-not-allowed hover:bg-destructive/10 transition-colors"
			>
				<LogOut size={19} />
			</button>
		</nav>
	)
}
