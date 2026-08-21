"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
 * conversation. Deliberately does NOT branch into contacts management or
 * custom-list creation — those stay out of M1 even though "+Create" could
 * plausibly have meant either.
 */
export function NewChatDialog({ open, onOpenChange }: NewChatDialogProps) {
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const { data: results, isLoading } = useSearchUsers(debouncedSearch)
	const router = useRouter()
	const queryClient = useQueryClient()

	const handleSelect = (user: ChatListItem) => {
		// Prime the peer-profile cache so ConversationHeader has something to
		// render immediately — see hooks/messenger/use-peer-profile.ts for why
		// there's no direct fetch-by-uuid fallback.
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
					{debouncedSearch.trim().length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">
							Search for someone to start a conversation.
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

					{!isLoading && debouncedSearch.trim().length > 0 && results?.length === 0 && (
						<p className="text-sm text-muted-foreground text-center py-8">No users found.</p>
					)}

					{results?.map((user) => (
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
