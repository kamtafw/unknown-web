"use client"

import { useAuthStore } from "@/stores/auth-store"
import { ChevronRight, Search } from "lucide-react"
import { Avatar } from "radix-ui"
import Image from "next/image"
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
	return (
		<header className="sticky top-0 z-50 bg-white border-b border-gray-100 h-20 flex items-center px-8 gap-6 shadow-[0_1px_0_0_#f0f0f0]">
			{/* Logo */}
			<Image
				src="/logo-2.svg"
				alt="Appscombo logo"
				width={40}
				height={33}
				className="object-contain"
				priority
			/>

			{/* Search */}
			<div className="relative w-60 shrink-0">
				<Search
					size={14}
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
				/>
				<input
					type="text"
					placeholder="What are you looking for?"
					className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-full text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8892C4]/25 focus:border-[#8892C4] transition-all"
				/>
				{/* <button className="absolute right-0 top-0 h-full w-10 flex items-center justify-center bg-[#8892C4] hover:bg-[#7780b8] rounded-full transition-colors">
					<Search size={14} className="text-white" />
				</button> */}
			</div>

			{/* Category icons */}
			<nav className="flex items-center gap-1.5 flex-1 justify-center">
				{CATEGORY_ICONS.map(({ label, icon: Icon }) => (
					<button
						key={label}
						title={label}
						className="w-11.5 h-11.5 rounded-full flex items-center justify-center text-gray-500 border-[1.5px] border-gray-100 hover:bg-gray-100 hover:text-primary transition-colors"
					>
						<Icon />
					</button>
				))}
			</nav>

			{/* User info */}
			<div className="flex items-center gap-2 shrink-0">
				<button className="relative w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
					<Bell />
					<span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
						2
					</span>
				</button>

				<button className="flex items-center gap-2.5 px-1 py-1 rounded-full hover:bg-gray-50 transition-colors">
					<Avatar.Root className="w-9 h-9 rounded-full overflow-hidden shrink-0">
						<Avatar.Image
							src={user?.profile_photo}
							alt={user ? `${user.first_name} ${user.last_name}` : ""}
							className="w-full h-full object-cover"
						/>
						<Avatar.Fallback className="w-full h-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
							{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
						</Avatar.Fallback>
					</Avatar.Root>
					<div className="text-left">
						<p className="text-sm font-semibold text-gray-900 leading-tight max-w-30 truncate">
							{user ? `${user.first_name} ${user.last_name}` : "Loading…"}
						</p>
						<p className="text-xs text-gray-500 leading-tight max-w-30 truncate">
							@{user?.username ?? ""}
						</p>
					</div>
					<ChevronRight size={14} className="text-gray-400 shrink-0" />
				</button>
			</div>
		</header>
	)
}
