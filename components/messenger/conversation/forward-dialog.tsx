"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchUsers } from "@/hooks/messenger/use-search-users"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import type { ChatListItem, Message, Uuid } from "@/types/messenger"
import { Check, Search } from "lucide-react"
import { Avatar } from "radix-ui"
import { useState } from "react"

interface ForwardDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	message: Message | null
	onForward: (targets: { type: "user"; id: number }[], targetUuids: Uuid[]) => void
}

export function ForwardDialog({ open, onOpenChange, message, onForward }: ForwardDialogProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const { data: results, isLoading } = useSearchUsers(debouncedSearch)
	const [selected, setSelected] = useState<Map<number, ChatListItem>>(new Map())

	const toggle = (user: ChatListItem) => {
		setSelected((prev) => {
			const next = new Map(prev)
			if (next.has(user.pkid)) next.delete(user.pkid)
			else next.set(user.pkid, user)
			return next
		})
	}

	const handleForward = () => {
		if (selected.size === 0 || !message) return
		const items = Array.from(selected.values())
		onForward(
			items.map((u) => ({ type: "user" as const, id: u.pkid })),
			items.map((u) => u.id),
		)
		setSelected(new Map())
		setSearch("")
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Forward message</DialogTitle>
				</DialogHeader>

				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						autoFocus
						placeholder="Search by name or username"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="max-h-72 overflow-y-auto -mx-2">
					{isLoading && (
						<div className="space-y-1 px-2">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-center gap-3 px-2 py-2">
									<Skeleton className="h-10 w-10 rounded-full" />
									<Skeleton className="h-4 w-32" />
								</div>
							))}
						</div>
					)}

					{!isLoading && debouncedSearch.trim().length > 0 && results?.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
					)}

					{results?.map((user) => {
						const isSelected = selected.has(user.pkid)
						return (
							<button
								key={user.id}
								onClick={() => toggle(user)}
								className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors text-left"
							>
								<Avatar.Root className="h-10 w-10 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
									<Avatar.Image
										src={user.profile_photo}
										alt={getDisplayName(user)}
										className="h-full w-full object-cover"
									/>
									<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
										{getInitials(user.first_name, user.last_name)}
									</Avatar.Fallback>
								</Avatar.Root>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium truncate">{getDisplayName(user)}</p>
									<p className="text-xs text-muted-foreground truncate">@{user.username}</p>
								</div>
								{isSelected && (
									<span className="shrink-0 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
										<Check size={12} />
									</span>
								)}
							</button>
						)
					})}
				</div>

				<button
					onClick={handleForward}
					disabled={selected.size === 0}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					Forward{selected.size > 0 ? ` (${selected.size})` : ""}
				</button>
			</DialogContent>
		</Dialog>
	)
}
