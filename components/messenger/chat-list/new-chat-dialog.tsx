"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useSearchUsers } from "@/hooks/messenger/use-search-users"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { chatKeys } from "@/lib/messenger/query-keys"
import { getDisplayName, getInitials } from "@/lib/messenger/user-display"
import type { ChatListItem, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar } from "radix-ui"
import { useState } from "react"

interface NewChatDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Scope per the M1 product decision: search/select a user, open a direct
 * conversation. Doesn't branch into contacts management or custom-list
 * creation.
 *
 * Default (empty-search) view shows existing conversations instead of a
 * blank prompt — reuses useChatList (same hook/query as the chat-list
 * panel and the schedule recipient picker). Typing switches to
 * useSearchUsers (global search) for people not in your chat list yet.
 */
export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const isSearching = debouncedSearch.trim().length > 0

	const { data: searchResults, isLoading: searchLoading } = useSearchUsers(debouncedSearch)
	const { data: chatList, isLoading: chatListLoading } = useChatList("all", "")

	const router = useRouter()
	const queryClient = useQueryClient()

	const results = isSearching ? searchResults : chatList?.users
	const isLoading = isSearching ? searchLoading : chatListLoading

	const handleSelect = (user: ChatListItem) => {
		queryClient.setQueryData(chatKeys.peer(user.id as Uuid), user)
		onOpenChange(false)
		setSearch("")
		router.push(`/messenger/${user.id}`)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Start new chat</DialogTitle>
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

				<div className="max-h-80 overflow-y-auto -mx-2">
					{!isSearching && !chatListLoading && (chatList?.users.length ?? 0) > 0 && (
						<p className="px-4 pb-1 text-xs font-medium text-muted-foreground">
							Recent conversations
						</p>
					)}

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

					{!isLoading && isSearching && results?.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
					)}

					{!isLoading && !isSearching && (chatList?.users.length ?? 0) === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							Search for someone to start a conversation.
						</p>
					)}

					{!isLoading &&
						results?.map((user) => (
							<button
								key={user.id}
								onClick={() => handleSelect(user)}
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
								<div className="min-w-0">
									<p className="text-sm font-medium truncate">{getDisplayName(user)}</p>
									<p className="text-xs text-muted-foreground truncate">@{user.username}</p>
								</div>
							</button>
						))}
				</div>
			</DialogContent>
		</Dialog>
	)
}
