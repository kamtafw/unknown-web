"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useGroupList } from "@/hooks/messenger/use-group-list"
import type { ScheduleRecipientDraft } from "@/lib/messenger/schedule"
import { cn } from "@/lib/utils"
import { Check, Search, Users } from "lucide-react"
import { Avatar } from "radix-ui"
import { useMemo, useState } from "react"

interface SchedulePickerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (recipients: ScheduleRecipientDraft[]) => void
}

const TABS = ["Contacts", "Groups"] as const

/** Recipients come from existing chats/groups, not a fresh user search —
 * confirmed via mobile's select-recipient.tsx. Group filtering is
 * client-side, same as the D1 group-search fix.
 *
 * Design note: the supplied mockup shows a phone-number line under each
 * contact's name. `ChatListItem` (the actual source of this list) has no
 * `phone_number` field — only `username` is confirmed present — so this
 * shows `@username` instead of fabricating a phone number, matching every
 * other recipient picker already in this codebase (NewChatDialog,
 * ForwardDialog, AddGroupMembersDialog). */
export function ScheduleRecipientPickerDialog({
	open,
	onOpenChange,
	onConfirm,
}: SchedulePickerProps) {
	const [tab, setTab] = useState<(typeof TABS)[number]>("Contacts")
	const [search, setSearch] = useState("")
	const [selected, setSelected] = useState<Map<string, ScheduleRecipientDraft>>(new Map())

	const { data: chatList, isLoading: chatsLoading } = useChatList("all", "")
	const { data: groupData, isLoading: groupsLoading } = useGroupList()

	const trimmedSearch = search.trim().toLowerCase()

	const allUsers = useMemo(() => chatList?.users ?? [], [chatList?.users])
	const allGroups = useMemo(() => groupData?.groups ?? [], [groupData?.groups])

	const users = useMemo(() => {
		if (!trimmedSearch) return allUsers
		return allUsers.filter((u) =>
			`${u.first_name ?? ""} ${u.last_name ?? ""} ${u.username}`
				.toLowerCase()
				.includes(trimmedSearch),
		)
	}, [allUsers, trimmedSearch])

	const groups = useMemo(() => {
		if (!trimmedSearch) return allGroups
		return allGroups.filter((g) => g.name.toLowerCase().includes(trimmedSearch))
	}, [allGroups, trimmedSearch])

	const toggle = (draft: ScheduleRecipientDraft) => {
		setSelected((prev) => {
			const key = `${draft.type}-${draft.id}`
			const next = new Map(prev)
			if (next.has(key)) next.delete(key)
			else next.set(key, draft)
			return next
		})
	}

	const handleOpenChange = (o: boolean) => {
		onOpenChange(o)
		if (!o) {
			setSelected(new Map())
			setSearch("")
			setTab("Contacts")
		}
	}

	const handleConfirm = () => {
		onConfirm(Array.from(selected.values()))
		setSelected(new Map())
		setSearch("")
		onOpenChange(false)
	}

	const subtitle = tab === "Contacts" ? `${allUsers.length} Contacts` : `${allGroups.length} Groups`

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Message schedule</DialogTitle>
					<p className="-mt-1 text-xs text-muted-foreground">{subtitle}</p>
				</DialogHeader>

				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder="Search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 rounded-full bg-muted border-transparent"
					/>
				</div>

				<div className="flex w-full items-center gap-1 rounded-full bg-muted p-1">
					{TABS.map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={cn(
								"flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
								tab === t ? "bg-background shadow-sm" : "text-muted-foreground",
							)}
						>
							{t}
						</button>
					))}
				</div>

				<div className="flex-1 overflow-y-auto -mx-2 px-2">
					{tab === "Contacts" ? (
						chatsLoading ? (
							<p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
						) : users.length === 0 ? (
							<p className="py-8 text-center text-sm text-muted-foreground">No contacts found</p>
						) : (
							users.map((u) => {
								const key = `user-${u.pkid}`
								const isSelected = selected.has(key)
								const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username
								return (
									<button
										key={key}
										onClick={() =>
											toggle({ type: "user", id: u.pkid, name, photo: u.profile_photo || null })
										}
										className="w-full flex items-center gap-3 px-2 py-3 text-left hover:bg-accent/50 rounded-lg transition-colors"
									>
										<Avatar.Root className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
											<Avatar.Image
												src={u.profile_photo}
												alt={name}
												className="h-full w-full object-cover"
											/>
											<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
												{name.charAt(0).toUpperCase()}
											</Avatar.Fallback>
										</Avatar.Root>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold truncate">{name}</p>
											<p className="text-xs text-muted-foreground truncate">@{u.username}</p>
										</div>
										<span
											className={cn(
												"h-5 w-5 rounded shrink-0 flex items-center justify-center border-2 transition-colors",
												isSelected ? "bg-primary border-primary" : "border-border",
											)}
										>
											{isSelected && <Check size={12} className="text-primary-foreground" />}
										</span>
									</button>
								)
							})
						)
					) : groupsLoading ? (
						<p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
					) : groups.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">No groups found</p>
					) : (
						groups.map((g) => {
							const key = `group-${g.id}`
							const isSelected = selected.has(key)
							return (
								<button
									key={key}
									onClick={() =>
										toggle({ type: "group", id: g.id, name: g.name, photo: g.icon_url || null })
									}
									className="w-full flex items-center gap-3 px-2 py-3 text-left hover:bg-accent/50 rounded-lg transition-colors"
								>
									<Avatar.Root className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
										<Avatar.Image
											src={g.icon_url ?? undefined}
											alt={g.name}
											className="h-full w-full object-cover"
										/>
										<Avatar.Fallback className="text-muted-foreground">
											<Users size={18} />
										</Avatar.Fallback>
									</Avatar.Root>
									<span className="flex-1 min-w-0 text-sm font-semibold truncate">{g.name}</span>
									<span
										className={cn(
											"h-5 w-5 rounded shrink-0 flex items-center justify-center border-2 transition-colors",
											isSelected ? "bg-primary border-primary" : "border-border",
										)}
									>
										{isSelected && <Check size={12} className="text-primary-foreground" />}
									</span>
								</button>
							)
						})
					)}
				</div>

				<button
					onClick={handleConfirm}
					disabled={selected.size === 0}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					Continue {selected.size > 0 ? `(${selected.size})` : ""}
				</button>
			</DialogContent>
		</Dialog>
	)
}
