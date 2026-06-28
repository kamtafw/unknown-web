"use client"

import { useLogout } from "@/hooks/use-auth"
import { useAuthStore } from "@/stores/auth-store"
import * as Dialog from "@radix-ui/react-dialog"
import {
	Check,
	ChevronDown,
	ChevronRight,
	LogOut,
	Monitor,
	Moon,
	Search,
	Sun,
	User,
	X,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Avatar, DropdownMenu } from "radix-ui"
import { useState } from "react"
import { Bell, Event, Marketplace, Message, Social } from "./icons"

const CATEGORY_ICONS = [
	{ label: "Social", icon: Social },
	{ label: "Messenger", icon: Message },
	{ label: "Event", icon: Event },
	{ label: "Marketplace", icon: Marketplace },
]

const THEME_OPTIONS = [
	{ value: "system", label: "System", icon: Monitor, hint: "Follow device" },
	{ value: "light", label: "Light", icon: Sun, hint: "Always light" },
	{ value: "dark", label: "Dark", icon: Moon, hint: "Always dark" },
] as const

function getInitials(firstName: string, lastName: string) {
	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function LogoutDialog({
	open,
	onOpenChange,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const logout = useLogout()

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="
						fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-200
						w-[calc(100%-2rem)] max-w-88
						bg-white rounded-3xl shadow-2xl p-6
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					{/* Close */}
					<Dialog.Close asChild>
						<button className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
							<X size={14} />
						</button>
					</Dialog.Close>

					{/* Icon */}
					<div className="flex justify-center mb-5">
						<div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
							<LogOut size={22} className="text-destructive" strokeWidth={1.75} />
						</div>
					</div>

					<Dialog.Title className="text-[16px] font-bold text-gray-900 text-center mb-2">
						Log out?
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-gray-500 leading-relaxed text-center mb-7">
						You&apos;ll need to sign in again to access AppsCombo.
					</Dialog.Description>

					<div className="flex gap-2.5">
						<Dialog.Close asChild>
							<button className="flex-1 h-11 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={() => logout.mutate()}
							disabled={logout.isPending}
							className="flex-1 h-11 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
						>
							{logout.isPending ? "Logging out…" : "Log out"}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export function TopBar() {
	const user = useAuthStore((s) => s.user)
	const [searchOpen, setSearchOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)
	const { theme, setTheme } = useTheme()

	const displayName = user
		? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
		: "Loading…"

	const currentOpt = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[0]
	const ThemeIcon = currentOpt.icon

	return (
		<>
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

					{/* Search — desktop */}
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

					{/* Search — mobile */}
					<button
						onClick={() => setSearchOpen(true)}
						className="sm:hidden p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
					>
						<Search size={20} />
					</button>

					{/* Category nav */}
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

					<div className="flex-1 md:hidden" />

					{/* User info */}
					<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
						<button className="relative w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
							<Bell size={19} />
						</button>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="group flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
									<Avatar.Root className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
										<Avatar.Image
											src={user?.profile_photo}
											alt={displayName}
											className="w-full h-full object-cover"
										/>
										<Avatar.Fallback className="w-full h-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
											{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
										</Avatar.Fallback>
									</Avatar.Root>
									<div className="hidden sm:block text-left">
										<p className="text-sm font-semibold text-gray-900 leading-tight max-w-28 truncate">
											{displayName}
										</p>
										<p className="text-xs text-gray-500 leading-tight max-w-28 truncate">
											@{user?.username ?? ""}
										</p>
									</div>
									<ChevronDown
										size={13}
										className="hidden sm:block text-gray-400 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
									/>
								</button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Portal>
								<DropdownMenu.Content
									align="end"
									sideOffset={8}
									collisionPadding={12}
									className="z-150 min-w-54 bg-white rounded-2xl p-1.5
										shadow-[0_12px_40px_rgba(0,0,0,0.13)] border border-gray-100
										data-[state=open]:animate-in data-[state=closed]:animate-out
										data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
										data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
										origin-top-right"
								>
									{/* User header — non-interactive */}
									<div className="flex items-center gap-2.5 px-3 pt-2.5 pb-2 mb-0.5 pointer-events-none select-none">
										<Avatar.Root className="w-8 h-8 rounded-full overflow-hidden shrink-0">
											<Avatar.Image
												src={user?.profile_photo}
												alt={displayName}
												className="w-full h-full object-cover"
											/>
											<Avatar.Fallback className="w-full h-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
												{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0">
											<p className="text-[13px] font-bold text-gray-900 truncate leading-snug">
												{displayName}
											</p>
											<p className="text-[11px] text-gray-400 truncate">@{user?.username ?? ""}</p>
										</div>
									</div>

									<DropdownMenu.Separator className="h-px bg-gray-100 -mx-1.5 my-1" />

									{/* My Profile — disabled */}
									<DropdownMenu.Item
										disabled
										className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-gray-400 select-none outline-none cursor-default"
									>
										<User size={14} className="shrink-0 text-gray-300" />
										<span className="flex-1">My Profile</span>
										<span className="text-[9.5px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-semibold tracking-wide uppercase leading-none">
											Soon
										</span>
									</DropdownMenu.Item>

									{/* Appearance — submenu */}
									<DropdownMenu.Sub>
										<DropdownMenu.SubTrigger className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-gray-700 cursor-pointer select-none outline-none transition-colors hover:bg-gray-50 data-highlighted:bg-gray-50 data-[state=open]:bg-gray-50 w-full">
											<ThemeIcon size={14} className="shrink-0 text-gray-500" />
											<span className="flex-1 text-left">Appearance</span>
											<div className="flex items-center gap-1 text-gray-400">
												<span className="text-[11.5px]">{currentOpt.label}</span>
												<ChevronRight size={12} className="shrink-0" />
											</div>
										</DropdownMenu.SubTrigger>

										<DropdownMenu.Portal>
											<DropdownMenu.SubContent
												sideOffset={8}
												alignOffset={-6}
												className="z-150 min-w-46 bg-white rounded-2xl p-1.5
													shadow-[0_12px_40px_rgba(0,0,0,0.13)] border border-gray-100
													data-[state=open]:animate-in data-[state=closed]:animate-out
													data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
													data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
													origin-top-left"
											>
												<p className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest select-none">
													Theme
												</p>

												{THEME_OPTIONS.map((opt) => {
													const active = theme === opt.value
													return (
														<DropdownMenu.Item
															key={opt.value}
															onSelect={() => setTheme(opt.value)}
															className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] cursor-pointer select-none outline-none transition-colors hover:bg-gray-50 data-highlighted:bg-gray-50"
														>
															<div
																className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
																	active ? "bg-primary/10" : "bg-gray-50"
																}`}
															>
																<opt.icon
																	size={13}
																	className={active ? "text-primary" : "text-gray-400"}
																	strokeWidth={active ? 2.5 : 1.75}
																/>
															</div>
															<div className="flex-1 min-w-0">
																<p
																	className={`text-[13px] leading-tight ${active ? "font-semibold text-primary" : "text-gray-800"}`}
																>
																	{opt.label}
																</p>
																<p className="text-[11px] text-gray-400 leading-tight mt-0.5">
																	{opt.hint}
																</p>
															</div>
															{active && (
																<Check
																	size={13}
																	className="text-primary shrink-0"
																	strokeWidth={2.5}
																/>
															)}
														</DropdownMenu.Item>
													)
												})}
											</DropdownMenu.SubContent>
										</DropdownMenu.Portal>
									</DropdownMenu.Sub>

									<DropdownMenu.Separator className="h-px bg-gray-100 -mx-1.5 my-1" />

									{/* Log out */}
									<DropdownMenu.Item
										onSelect={() => setLogoutOpen(true)}
										className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-destructive cursor-pointer select-none outline-none transition-colors hover:bg-red-50 data-highlighted:bg-red-50 mb-0.5"
									>
										<LogOut size={14} className="shrink-0" strokeWidth={1.75} />
										<span>Log out</span>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
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

			<LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
		</>
	)
}
