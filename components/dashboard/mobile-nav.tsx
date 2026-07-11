"use client"

import { cn } from "@/lib/utils"
import { Bookmark, Bot, Home, Plus } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CreatePostModal } from "./create-post-modal"
import { isNavItemActive } from "@/lib/nav-active"

const NAV_ITEMS = [
	{ label: "Home", icon: Home, href: "/home" },
	{ label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
	{ label: "AI", icon: Bot, href: "/ai" },
]

export function MobileNav() {
	const pathname = usePathname()
	const [createOpen, setCreateOpen] = useState(false)

	return (
		<>
			{/* Spacer so content isn't hidden behind the fixed nav */}
			<div className="h-16 lg:hidden" />

			<nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
				<div className="flex items-center justify-around h-16 px-2">
					{NAV_ITEMS.slice(0, 2).map(({ label, icon: Icon, href }) => {
						const active = isNavItemActive(pathname, href)
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
									active ? "text-primary" : "text-gray-400",
								)}
							>
								<Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
								<span className="text-[10px] font-medium">{label}</span>
							</Link>
						)
					})}

					{/* Centre create button */}
					<button
						onClick={() => setCreateOpen(true)}
						className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform"
					>
						<Plus size={22} strokeWidth={2.5} />
					</button>

					{NAV_ITEMS.slice(2).map(({ label, icon: Icon, href }) => {
						const active = isNavItemActive(pathname, href)
						return (
							<Link
								key={href}
								href={href}
								className={cn(
									"flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
									active ? "text-primary" : "text-gray-400",
								)}
							>
								<Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
								<span className="text-[10px] font-medium">{label}</span>
							</Link>
						)
					})}

					{/* Settings link */}
					<Link
						href="/settings"
						className={cn(
							"flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all",
							pathname === "/settings" ? "text-primary" : "text-gray-400",
						)}
					>
						<svg width="22" height="22" viewBox="0 0 24 24" fill="none">
							<path
								opacity="0.5"
								fillRule="evenodd"
								clipRule="evenodd"
								d="M14.2793 2.152C13.9093 2 13.4393 2 12.5003 2C11.5613 2 11.0923 2 10.7213 2.152C10.2273 2.352 9.83332 2.745 9.63132 3.235C9.53732 3.458 9.50132 3.719 9.48632 4.098C9.46532 4.656 9.17732 5.171 8.69032 5.451C8.44906 5.5851 8.17786 5.65615 7.90184 5.65754C7.62582 5.65894 7.35392 5.59065 7.11132 5.459C6.77332 5.281 6.52832 5.183 6.28632 5.151C5.7569 5.08192 5.22158 5.2242 4.79632 5.547C4.47832 5.789 4.24332 6.193 3.77432 7C3.30432 7.807 3.07032 8.21 3.01732 8.605C2.94732 9.131 3.09132 9.663 3.41732 10.084C3.56532 10.276 3.77432 10.437 4.09732 10.639C4.57432 10.936 4.88032 11.442 4.88032 12C4.88032 12.558 4.57432 13.064 4.09832 13.36C3.77432 13.563 3.56532 13.724 3.41632 13.916C3.09132 14.337 2.94732 14.869 3.01732 15.395C3.07032 15.789 3.30432 16.193 3.77432 17C4.24432 17.807 4.47832 18.21 4.79632 18.453C5.22032 18.776 5.75632 18.918 6.28632 18.849C6.52832 18.817 6.77332 18.719 7.11132 18.541C7.35404 18.4092 7.62613 18.3408 7.90234 18.3422C8.17855 18.3436 8.44994 18.4147 8.69132 18.549C9.17732 18.829 9.46532 19.344 9.48632 19.902C9.50132 20.282 9.53732 20.542 9.63132 20.765C9.83532 21.255 10.2273 21.645 10.7213 21.848C11.0913 22 11.5613 22 12.5003 22C13.4393 22 13.9093 22 14.2793 21.848C14.7733 21.648 15.1673 21.255 15.3693 20.765C15.4633 20.542 15.4993 20.282 15.5143 19.902C15.5343 19.344 15.8233 18.828 16.3103 18.549C16.5516 18.4149 16.8228 18.3439 17.0988 18.3425C17.3748 18.3411 17.6467 18.4093 17.8893 18.541C18.2273 18.719 18.4723 18.817 18.7143 18.849C19.2443 18.919 19.7803 18.776 20.2043 18.453C20.5223 18.211 20.7573 17.807 21.2263 17C21.6963 16.193 21.9303 15.79 21.9833 15.395C22.0533 14.869 21.9093 14.337 21.5833 13.916C21.4353 13.724 21.2263 13.563 20.9033 13.361C20.4263 13.064 20.1203 12.558 20.1203 12C20.1203 11.442 20.4263 10.936 20.9023 10.64C21.2263 10.437 21.4353 10.276 21.5843 10.084C21.9093 9.663 22.0533 9.131 21.9833 8.605C21.9303 8.211 21.6963 7.807 21.2263 7C20.7563 6.193 20.5223 5.79 20.2043 5.547C19.779 5.2242 19.2437 5.08192 18.7143 5.151C18.4723 5.183 18.2273 5.281 17.8893 5.459C17.6466 5.59083 17.3745 5.65922 17.0983 5.65782C16.8221 5.65642 16.5507 5.58528 16.3093 5.451C15.8233 5.171 15.5343 4.656 15.5143 4.098C15.4993 3.718 15.4633 3.458 15.3693 3.235C15.1653 2.745 14.7713 2.352 14.2793 2.152Z"
								fill="currentColor"
							/>
							<path
								d="M15.5226 12C15.5226 13.657 14.1686 15 12.4996 15C10.8306 15 9.47656 13.657 9.47656 12C9.47656 10.343 10.8296 9 12.4996 9C14.1696 9 15.5226 10.343 15.5226 12Z"
								fill="currentColor"
							/>
						</svg>
						<span className="text-[10px] font-medium">Settings</span>
					</Link>
				</div>
			</nav>

			<CreatePostModal open={createOpen} onOpenChange={setCreateOpen} />
		</>
	)
}
