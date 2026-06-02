"use client"

import { useAuthStore } from "@/stores/auth-store"
import { ChevronRight, Search, X } from "lucide-react"
import Image from "next/image"
import { Avatar } from "radix-ui"
import { useState } from "react"
import { Bell, Event, Marketplace, Message, Social } from "./icons"

const CATEGORY_ICONS = [
	{ label: "Social", icon: Social },
	{ label: "Messenger", icon: Message },
	{ label: "Event", icon: Event },
	{ label: "Marketplace", icon: Marketplace },
]

function getInitials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function TopBar() {
	const user = useAuthStore((s) => s.user)
	const [searchOpen, setSearchOpen] = useState(false)

	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-[0_1px_0_0_#f0f0f0]">
			<div className="h-14 sm:h-20 flex items-center px-3 sm:px-8 gap-3 sm:gap-6">
				{/* Logo */}
				<Image
					src="/logo-2.svg"
					alt="Appscombo logo"
					width={36}
					height={30}
					className="object-contain shrink-0 w-8 h-7 sm:w-10 sm:h-8"
					priority
				/>

				{/* Search — desktop always visible, mobile hidden when not active */}
				<div className={`relative shrink-0 ${searchOpen ? "hidden" : "hidden sm:block"} sm:w-60`}>
					<Search
						size={14}
						className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
					/>
					<input
						type="text"
						placeholder="What are you looking for?"
						className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8892C4]/25 focus:border-[#8892C4] transition-all"
					/>
				</div>

				{/* Mobile search trigger */}
				<button
					onClick={() => setSearchOpen(true)}
					className="sm:hidden p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
				>
					<Search size={20} />
				</button>

				{/* Category icons — hidden on mobile */}
				<nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
					{CATEGORY_ICONS.map(({ label, icon: Icon }) => (
						<button
							key={label}
							title={label}
							className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-gray-500 border-[1.5px] border-gray-100 hover:bg-gray-100 hover:text-primary transition-colors"
						>
							<Icon />
						</button>
					))}
				</nav>

				{/* Spacer on mobile so user info hugs right */}
				<div className="flex-1 md:hidden" />

				{/* User info */}
				<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
					<button className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
						<Bell size={19} />
					</button>

					<button className="flex items-center gap-2 px-1 py-1 rounded-full hover:bg-gray-50 transition-colors">
						<Avatar.Root className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
							<Avatar.Image
								src={user?.profile_photo}
								alt={user ? `${user.first_name} ${user.last_name}` : ""}
								className="w-full h-full object-cover"
							/>
							<Avatar.Fallback className="w-full h-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
								{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
							</Avatar.Fallback>
						</Avatar.Root>
						{/* Name only on sm+ */}
						<div className="hidden sm:block text-left">
							<p className="text-sm font-semibold text-gray-900 leading-tight max-w-30 truncate">
								{user ? `${user.first_name} ${user.last_name}` : "Loading…"}
							</p>
							<p className="text-xs text-gray-500 leading-tight max-w-30 truncate">
								@{user?.username ?? ""}
							</p>
						</div>
						<ChevronRight size={13} className="hidden sm:block text-gray-400 shrink-0" />
					</button>
				</div>
			</div>

			{/* Mobile full-width search overlay */}
			{searchOpen && (
				<div className="sm:hidden absolute inset-x-0 top-0 h-14 bg-white z-10 flex items-center gap-2 px-3 border-b border-gray-100">
					<Search size={16} className="text-gray-400 shrink-0" />
					<input
						type="text"
						placeholder="What are you looking for?"
						autoFocus
						className="flex-1 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
					/>
					<button onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-400">
						<X size={18} />
					</button>
				</div>
			)}
		</header>
	)
}
