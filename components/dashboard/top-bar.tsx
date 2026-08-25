"use client"

import { useUnreadChatCount } from "@/hooks/messenger/use-chat-list"
import { useLinkedAccounts, useSwitchAccount } from "@/hooks/use-linked-accounts"
import { authApi } from "@/lib/api"
import { resolveMediaUrl } from "@/lib/server-config"
import { useAuthStore } from "@/stores/auth-store"
import * as Dialog from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Loader2, LogOut, Plus, Search, UserPlus, X } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Avatar, DropdownMenu } from "radix-ui"
import { useState } from "react"
import { Bell, Event, Marketplace, Message, Social } from "./icons"

const CATEGORY_ICONS = [
	{ label: "Social", icon: Social, href: "/home" },
	{ label: "Messenger", icon: Message, href: "/messenger" },
	{ label: "Event", icon: Event },
	{ label: "Marketplace", icon: Marketplace },
]

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
	const router = useRouter()
	const queryClient = useQueryClient()
	const logoutStore = useAuthStore((s) => s.logout)
	const [pending, setPending] = useState(false)

	const handleLogout = async () => {
		setPending(true)
		try {
			await authApi.logout()
		} catch {}
		logoutStore()
		queryClient.clear()
		router.push("/sign-in")
	}

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 z-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="
						fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-200
						w-[calc(100%-2rem)] max-w-88
						bg-card border border-border rounded-3xl shadow-2xl p-6
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<Dialog.Close asChild>
						<button className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors">
							<X size={14} />
						</button>
					</Dialog.Close>

					<div className="flex justify-center mb-5">
						<div className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
							<LogOut size={22} className="text-destructive" strokeWidth={1.75} />
						</div>
					</div>

					<Dialog.Title className="text-[16px] font-bold text-foreground text-center mb-2">
						Log out?
					</Dialog.Title>
					<Dialog.Description className="text-[13px] text-muted-foreground leading-relaxed text-center mb-7">
						You&apos;ll need to sign in again to access AppsCombo.
					</Dialog.Description>

					<div className="flex gap-2.5">
						<Dialog.Close asChild>
							<button className="flex-1 h-11 rounded-xl border border-border text-[13px] font-semibold text-foreground hover:bg-accent active:scale-[0.98] transition-all cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>
						<button
							onClick={handleLogout}
							disabled={pending}
							className="flex-1 h-11 rounded-xl bg-destructive text-white text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
						>
							{pending ? (
								<>
									<Loader2 size={13} className="animate-spin" /> Logging out…
								</>
							) : (
								"Log out"
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export function TopBar() {
	const user = useAuthStore((s) => s.user)
	const logoutStore = useAuthStore((s) => s.logout)
	const router = useRouter()
	const queryClient = useQueryClient()

	const { data: linkedData, isLoading: accountsLoading } = useLinkedAccounts()
	const switchAccount = useSwitchAccount()
	const [switchingId, setSwitchingId] = useState<number | null>(null)

	const [searchOpen, setSearchOpen] = useState(false)
	const [logoutOpen, setLogoutOpen] = useState(false)

	const { data: unreadCount } = useUnreadChatCount()

	const displayName = user
		? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username
		: "Loading…"

	const allAccounts = linkedData?.data?.accounts ?? []
	const otherAccounts = allAccounts.filter(
		(a) => a.email !== user?.email && a.username !== user?.username,
	)

	const handleCreateAccount = async () => {
		try {
			await authApi.logout()
		} catch {}
		logoutStore()
		queryClient.clear()
		router.push("/sign-up")
	}

	const handleSwitchAccount = (id: number) => {
		setSwitchingId(id)
		switchAccount.mutate(String(id), {
			onSettled: () => setSwitchingId(null),
		})
	}

	return (
		<>
			<header className="sticky top-0 z-50 bg-card backdrop-blur-md border-b border-border">
				<div className="h-14 sm:h-16 flex items-center px-3 sm:px-8 gap-3 sm:gap-6">
					{/* Logo */}
					<Image
						src="/logo-2.svg"
						alt="Appscombo logo"
						width={36}
						height={30}
						className="object-contain shrink-0 w-8 h-7 sm:w-9 sm:h-8"
						priority
					/>

					{/* Search — desktop */}
					<div className={`relative shrink-0 ${searchOpen ? "hidden" : "hidden sm:block"} sm:w-60`}>
						<Search
							size={14}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
						/>
						<input
							type="text"
							placeholder="What are you looking for?"
							className="w-full h-10 pl-9 pr-4 bg-muted border border-border rounded-full text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary focus:bg-card transition-all"
						/>
					</div>

					{/* Search — mobile trigger */}
					<button
						onClick={() => setSearchOpen(true)}
						className="sm:hidden p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors"
					>
						<Search size={20} />
					</button>

					{/* Category nav */}
					<nav className="hidden md:flex items-center gap-1.5 flex-1 justify-center">
						{CATEGORY_ICONS.map(({ label, icon: Icon, href }) => (
							<button
								key={label}
								title={label}
								onClick={href ? () => router.push(href) : undefined}
								className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-muted-foreground border border-border hover:bg-accent hover:text-primary transition-colors"
							>
								<Icon />
								{label === "Messenger" && !!unreadCount && (
									<span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
										{unreadCount > 99 ? "99+" : unreadCount}
									</span>
								)}
							</button>
						))}
					</nav>

					<div className="flex-1 md:hidden" />

					{/* Right actions */}
					<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
						<button className="relative w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors">
							<Bell size={19} />
						</button>

						<DropdownMenu.Root>
							<DropdownMenu.Trigger asChild>
								<button className="group flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
									<Avatar.Root className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
										<Avatar.Image
											src={user?.profile_photo}
											alt={displayName}
											className="w-full h-full object-cover"
										/>
										<Avatar.Fallback className="w-full h-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
											{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
										</Avatar.Fallback>
									</Avatar.Root>
									<div className="hidden sm:block text-left">
										<p className="text-sm font-semibold text-foreground leading-tight max-w-28 truncate">
											{displayName}
										</p>
										<p className="text-xs text-muted-foreground leading-tight max-w-28 truncate">
											@{user?.username ?? ""}
										</p>
									</div>
									<ChevronDown
										size={13}
										className="hidden sm:block text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
									/>
								</button>
							</DropdownMenu.Trigger>

							<DropdownMenu.Portal>
								<DropdownMenu.Content
									align="end"
									sideOffset={8}
									collisionPadding={12}
									className="z-150 min-w-64 bg-popover border border-border rounded-2xl p-1.5
										shadow-xl
										data-[state=open]:animate-in data-[state=closed]:animate-out
										data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
										data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
										origin-top-right"
								>
									{/* Current user */}
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 pt-2.5 pb-2 rounded-xl cursor-pointer select-none outline-none transition-colors hover:bg-accent data-highlighted:bg-accent data-disabled:opacity-50 data-disabled:cursor-default"
										onSelect={() => router.push(`/profile/${user?.id}`)}
									>
										<Avatar.Root className="w-9 h-9 rounded-full overflow-hidden shrink-0">
											<Avatar.Image
												src={user?.profile_photo}
												alt={displayName}
												className="w-full h-full object-cover"
											/>
											<Avatar.Fallback className="w-full h-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
												{user ? getInitials(user.first_name ?? "", user.last_name ?? "") : "?"}
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<p className="text-[13px] font-bold text-foreground truncate leading-snug">
												{displayName}
											</p>
											<p className="text-[11px] text-muted-foreground truncate">
												@{user?.username ?? ""}
											</p>
										</div>
										<span className="text-[9.5px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full leading-none shrink-0 dark:bg-green-950 dark:border-green-800 dark:text-green-400">
											Active
										</span>
									</DropdownMenu.Item>

									{/* Other linked accounts */}
									{accountsLoading ? (
										<div className="flex items-center justify-center py-2.5">
											<Loader2 size={14} className="animate-spin text-muted-foreground" />
										</div>
									) : (
										otherAccounts.length > 0 && (
											<>
												<DropdownMenu.Separator className="h-px bg-border -mx-1.5 my-1" />
												{otherAccounts.map((account) => {
													const name =
														[account.first_name, account.last_name].filter(Boolean).join(" ") ||
														account.username
													const isPending = switchingId === account.id
													return (
														<DropdownMenu.Item
															key={account.id}
															onSelect={() => handleSwitchAccount(account.id)}
															disabled={isPending || switchAccount.isPending}
															className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none transition-colors hover:bg-accent data-highlighted:bg-accent data-disabled:opacity-50 data-disabled:cursor-default"
														>
															<Avatar.Root className="w-8 h-8 rounded-full overflow-hidden shrink-0">
																<Avatar.Image
																	src={resolveMediaUrl(account.profile_photo)}
																	alt={name}
																	className="w-full h-full object-cover"
																/>
																<Avatar.Fallback className="w-full h-full bg-primary/20 text-primary text-[11px] font-bold flex items-center justify-center">
																	{getInitials(account.first_name, account.last_name)}
																</Avatar.Fallback>
															</Avatar.Root>
															<div className="flex-1 min-w-0">
																<p className="text-[13px] font-semibold text-foreground truncate leading-snug">
																	{name}
																</p>
																<p className="text-[11px] text-muted-foreground truncate">
																	@{account.username}
																</p>
															</div>
															{isPending ? (
																<Loader2
																	size={13}
																	className="animate-spin text-muted-foreground shrink-0"
																/>
															) : (
																<div className="w-4 h-4 rounded-full border-2 border-border shrink-0" />
															)}
														</DropdownMenu.Item>
													)
												})}
											</>
										)
									)}

									<DropdownMenu.Separator className="h-px bg-border -mx-1.5 my-1" />

									{/* Account actions */}
									<DropdownMenu.Item
										onSelect={() => router.push("/settings")}
										className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] cursor-pointer select-none outline-none transition-colors hover:bg-accent data-highlighted:bg-accent"
									>
										<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
											<UserPlus size={13} className="text-muted-foreground" />
										</div>
										<span className="text-foreground">Add existing account</span>
									</DropdownMenu.Item>

									<DropdownMenu.Item
										onSelect={handleCreateAccount}
										className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] cursor-pointer select-none outline-none transition-colors hover:bg-accent data-highlighted:bg-accent"
									>
										<div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
											<Plus size={13} className="text-muted-foreground" />
										</div>
										<span className="text-foreground">Create new account</span>
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					</div>
				</div>

				{/* mobile full-width search overlay */}
				{searchOpen && (
					<div className="sm:hidden absolute inset-x-0 top-0 h-14 bg-background/95 backdrop-blur-md z-10 flex items-center gap-2 px-3 border-b border-border">
						<Search size={16} className="text-muted-foreground shrink-0" />
						<input
							type="text"
							placeholder="What are you looking for?"
							autoFocus
							className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
						/>
						<button
							onClick={() => setSearchOpen(false)}
							className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors"
						>
							<X size={18} />
						</button>
					</div>
				)}
			</header>

			<LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
		</>
	)
}
