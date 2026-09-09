"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useSyncGroupMembers } from "@/hooks/messenger/use-group-admin"
import { useGroupMembers } from "@/hooks/messenger/use-group-members"
import { useSearchUsers } from "@/hooks/messenger/use-search-users"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import type { ChatListItem, Pkid } from "@/types/messenger"
import { Check, Search } from "lucide-react"
import { Avatar } from "radix-ui"
import { useEffect, useMemo, useState } from "react"

interface AddGroupMembersDialogProps {
	groupId: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * WARNING, confirmed via mobile: `chats/groups/:id/members/sync` REPLACES
 * the group's non-admin membership with exactly the `user_ids` sent — it
 * is not an append, despite the UI being framed as "add members". Every
 * existing non-admin member's pkid must be included alongside the newly
 * selected ones, or they get silently removed from the group.
 *
 * Correctness safeguard: `useGroupMembers` is page-based, so this eagerly
 * fetches every member page before enabling Add — submitting with only
 * page 1 loaded would silently drop any un-fetched members from the sync
 * payload. Not needed anywhere else members are only being displayed,
 * only here where an incomplete list is destructive.
 */
export function AddGroupMembersDialog({ groupId, open, onOpenChange }: AddGroupMembersDialogProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const isSearchActive = debouncedSearch.trim().length > 0

	const {
		members: groupMembers,
		hasNextPage,
		fetchNextPage,
		isFetchingNextPage,
		isLoading: membersLoading,
	} = useGroupMembers(open ? groupId : undefined)

	useEffect(() => {
		if (open && hasNextPage && !isFetchingNextPage) fetchNextPage()
	}, [open, hasNextPage, isFetchingNextPage, fetchNextPage])

	const allMembersLoaded = !membersLoading && !hasNextPage

	const { data: chatListData, isLoading: chatListLoading } = useChatList("all", debouncedSearch)
	const { data: searchResults, isLoading: searchLoading } = useSearchUsers(debouncedSearch)

	const [selected, setSelected] = useState<Map<number, ChatListItem>>(new Map())

	const existingMemberPkids = useMemo(
		() => new Set(groupMembers.map((m) => m.pkid)),
		[groupMembers],
	)
	const existingNonAdminPkids = useMemo(
		() => groupMembers.filter((m) => m.role !== "admin").map((m) => m.pkid),
		[groupMembers],
	)

	const candidates = (isSearchActive ? (searchResults ?? []) : (chatListData?.users ?? [])).filter(
		(u) => !existingMemberPkids.has(u.pkid),
	)
	const isLoading = isSearchActive ? searchLoading : chatListLoading

	const toggle = (user: ChatListItem) => {
		setSelected((prev) => {
			const next = new Map(prev)
			if (next.has(user.pkid)) next.delete(user.pkid)
			else next.set(user.pkid, user)
			return next
		})
	}

	const syncMembers = useSyncGroupMembers(groupId)

	const handleAdd = async () => {
		if (selected.size === 0 || !allMembersLoaded) return
		const nextUserIds = Array.from(
			new Set<Pkid>([...existingNonAdminPkids, ...(Array.from(selected.keys()) as Pkid[])]),
		)
		await syncMembers.mutateAsync(nextUserIds)
		setSelected(new Map())
		setSearch("")
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Add members</DialogTitle>
				</DialogHeader>

				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						autoFocus
						placeholder="Search your chats or find someone new"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>

				<div className="max-h-72 overflow-y-auto -mx-2">
					{(isLoading || !allMembersLoaded) && (
						<div className="space-y-1 px-2">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="flex items-center gap-3 px-2 py-2">
									<Skeleton className="h-10 w-10 rounded-full" />
									<Skeleton className="h-4 w-32" />
								</div>
							))}
						</div>
					)}

					{allMembersLoaded && !isLoading && candidates.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							{isSearchActive
								? "No users found."
								: "Everyone in your chats is already in this group."}
						</p>
					)}

					{allMembersLoaded &&
						!isLoading &&
						candidates.map((user) => {
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
					onClick={handleAdd}
					disabled={selected.size === 0 || !allMembersLoaded || syncMembers.isPending}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					{syncMembers.isPending
						? "Adding…"
						: `Add${selected.size > 0 ? ` (${selected.size})` : ""}`}
				</button>
			</DialogContent>
		</Dialog>
	)
}
