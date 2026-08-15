"use client"

import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { CircleDot, LogOut, MessageCircle, Phone, Radio, Settings, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface RailItem {
	label: string
	icon: typeof MessageCircle
	href?: string
	badge?: number
}

const RAIL_ITEMS: RailItem[] = [
	{ label: "Chat", icon: MessageCircle, href: "/messenger" },
	{ label: "Contacts", icon: Users },
	{ label: "Lists", icon: Radio },
	{ label: "Status", icon: CircleDot },
	{ label: "Calls", icon: Phone },
]

/**
 * Only "Chat" is wired — every other destination belongs to a later
 * milestone (Contacts/Lists — unconfirmed which mobile capability they
 * map to; Status — M5; Calls — M8). Rendered present-but-inert rather
 * than omitted, matching the M1 decision to keep the intended visual
 * structure while only implementing M1's interactions.
 */
export function MessengerRail() {
	const pathname = usePathname()

	return (
		<nav className="w-14 sm:w-16 shrink-0 border-r border-border bg-card flex flex-col items-center py-3 gap-1">
			{RAIL_ITEMS.map((item) => {
				const isActive = item.href ? pathname.startsWith(item.href) : false
				const Icon = item.icon

				if (item.href) {
					return (
						<Link
							key={item.label}
							href={item.href}
							title={item.label}
							className={cn(
								"relative w-10 h-10 rounded-full flex items-center justify-center transition-colors",
								isActive
									? "bg-primary/10 text-primary"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							<Icon size={19} />
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
						className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground/40 cursor-not-allowed hover:bg-accent/40 transition-colors"
					>
						<Icon size={19} />
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
