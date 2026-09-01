"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useGroupList } from "@/hooks/messenger/use-group-list"
import type { ScheduleRecipientDraft } from "@/lib/messenger/schedule"
import { Check, Users } from "lucide-react"
import { useMemo, useState } from "react"

interface SchedulePickerProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (recipients: ScheduleRecipientDraft[]) => void
}

const TABS = ["Contacts", "Groups"] as const

/** Recipients come from existing chats/groups, not a fresh user search —
 * confirmed via mobile's select-recipient.tsx. Group filtering is
 * client-side, same as the D1 group-search fix. */
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

	const users = useMemo(() => {
		const list = chatList?.users ?? []
		if (!trimmedSearch) return list
		return list.filter((u) =>
			`${u.first_name ?? ""} ${u.last_name ?? ""} ${u.username}`
				.toLowerCase()
				.includes(trimmedSearch),
		)
	}, [chatList, trimmedSearch])

	const groups = useMemo(() => {
		const list = groupData?.groups ?? []
		if (!trimmedSearch) return list
		return list.filter((g) => g.name.toLowerCase().includes(trimmedSearch))
	}, [groupData, trimmedSearch])

	const toggle = (draft: ScheduleRecipientDraft) => {
		setSelected((prev) => {
			const key = `${draft.type}-${draft.id}`
			const next = new Map(prev)
			if (next.has(key)) next.delete(key)
			else next.set(key, draft)
			return next
		})
	}

	const handleConfirm = () => {
		onConfirm(Array.from(selected.values()))
		setSelected(new Map())
		setSearch("")
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Schedule message</DialogTitle>
				</DialogHeader>

				<Input
					placeholder="Search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="rounded-full bg-muted border-transparent"
				/>

				<div className="flex gap-2 border-b border-border">
					{TABS.map((t) => (
						<button
							key={t}
							onClick={() => setTab(t)}
							className={`px-1 pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}
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
										className="w-full flex items-center gap-3 px-2 py-2.5 text-left hover:bg-accent/50 rounded-lg transition-colors"
									>
										<span className="h-10 w-10 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center text-sm font-medium text-muted-foreground">
											{u.profile_photo ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={u.profile_photo}
													alt={name}
													className="h-full w-full object-cover"
												/>
											) : (
												name.charAt(0).toUpperCase()
											)}
										</span>
										<span className="flex-1 min-w-0 text-sm font-medium truncate">{name}</span>
										<span
											className={`h-5 w-5 rounded shrink-0 flex items-center justify-center border-2 ${isSelected ? "bg-primary border-primary" : "border-border"}`}
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
									className="w-full flex items-center gap-3 px-2 py-2.5 text-left hover:bg-accent/50 rounded-lg transition-colors"
								>
									<span className="h-10 w-10 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center">
										{g.icon_url ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={g.icon_url} alt={g.name} className="h-full w-full object-cover" />
										) : (
											<Users size={16} className="text-muted-foreground" />
										)}
									</span>
									<span className="flex-1 min-w-0 text-sm font-medium truncate">{g.name}</span>
									<span
										className={`h-5 w-5 rounded shrink-0 flex items-center justify-center border-2 ${isSelected ? "bg-primary border-primary" : "border-border"}`}
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
					Next {selected.size > 0 ? `(${selected.size})` : ""}
				</button>
			</DialogContent>
		</Dialog>
	)
}
