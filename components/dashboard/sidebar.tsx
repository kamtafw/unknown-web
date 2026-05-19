"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Add, AI, Bookmark, Home, Invite, Logout, Settings } from "./icons"
import { useLogout } from "@/hooks/use-auth"

const NAV_ITEMS = [
	{ label: "Home", icon: Home, href: "/dashboard" },
	{ label: "Settings", icon: Settings, href: "/settings" },
	{ label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
	{ label: "AppsCombo AI", icon: AI, href: "/ai" },
	{ label: "Invite a friend", icon: Invite, href: "/invite" },
]

export function Sidebar() {
	const pathname = usePathname()
	const logout = useLogout()

	return (
		<aside className="w-80 shrink-0 flex flex-col bg-white rounded-2xl overflow-hidden mb-5">
			{/* Nav */}
			<nav className="flex flex-col p-3 gap-3 flex-1">
				{NAV_ITEMS.map(({ label, icon: Icon, href }) => {
					const active = pathname === href
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-150",
								active
									? "bg-primary text-white shadow-sm shadow-primary/25"
									: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
							)}
						>
							<Icon />
							{label}
						</Link>
					)
				})}
			</nav>

			<div className="mx-4 border-t border-gray-100" />

			{/* Create Post */}
			<div className="mt-3 p-3 flex-1">
				<button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary font-semibold text-sm py-3 px-5 rounded-full transition-colors">
					<Add color="#6A88D1" />
					Create Post
				</button>
			</div>

			<div className="mx-4 border-t border-gray-100" />

			{/* Logout */}
			<div className="p-3">
				<button
					onClick={() => logout.mutate()}
					className="w-full flex items-center gap-3 px-5 py-3 text-sm font-normal text-destructive hover:bg-red-50 rounded-2xl transition-colors"
				>
					<Logout />
					Logout
				</button>
			</div>
		</aside>
	)
}
