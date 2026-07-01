"use client"

import { cn } from "@/lib/utils"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CreatePostModal } from "./create-post-modal"
import { Add, AI, Bookmark, Home, Invite, Settings } from "./icons"

const NAV_ITEMS = [
	{ label: "Home", icon: Home, href: "/home" },
	{ label: "Settings", icon: Settings, href: "/settings" },
	{ label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
	{ label: "AppsCombo AI", icon: AI, href: "/ai" },
	{ label: "Invite a friend", icon: Invite, href: "/invite" },
]

export function Sidebar() {
	const pathname = usePathname()
	const { resolvedTheme, setTheme } = useTheme()
	const [createOpen, setCreateOpen] = useState(false)

	const isDark = resolvedTheme === "dark"

	return (
		<aside className="w-80 shrink-0 flex flex-col bg-card rounded-2xl overflow-hidden mb-5 border border-border">
			<nav className="flex flex-col p-3 gap-1 flex-1">
				{NAV_ITEMS.map(({ label, icon: Icon, href }) => {
					const active = pathname === href
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-150",
								active
									? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
									: "text-muted-foreground hover:bg-accent hover:text-foreground",
							)}
						>
							<Icon color={active ? "currentColor" : undefined} />
							{label}
						</Link>
					)
				})}
			</nav>

			<div className="mx-4 border-t border-border" />

			<div className="mt-3 p-3 flex-1">
				<button
					onClick={() => setCreateOpen(true)}
					className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/80 text-primary font-semibold text-sm py-3 px-5 rounded-full transition-colors cursor-pointer"
				>
					<Add color="#6A88D1" />
					Create Post
				</button>
			</div>

			<CreatePostModal open={createOpen} onOpenChange={setCreateOpen} />

			<div className="mx-4 border-t border-border" />

			<div className="p-3">
				<button
					onClick={() => setTheme(isDark ? "light" : "dark")}
					className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl transition-colors cursor-pointer group"
				>
					<span className="flex-1 text-left">{isDark ? "Dark mode" : "Light mode"}</span>

					<div
						className={cn(
							"w-12 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0",
							isDark ? "bg-primary" : "bg-muted-foreground/30",
						)}
					>
						{isDark ? (
							<Moon
								size={18}
								className="text-primary p-0.5 rounded-full bg-primary-foreground shadow-sm transition-transform duration-200 translate-x-6"
							/>
						) : (
							<Sun
								size={18}
								className="text-muted-foreground p-0.5 rounded-full bg-muted shadow-sm transition-transform duration-200 translate-x-0"
							/>
						)}
					</div>
				</button>
			</div>
		</aside>
	)
}
