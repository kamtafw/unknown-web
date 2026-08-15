"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toast } from "@/lib/toast"
import type { ChatListFilter,Uuid } from "@/types/messenger"
import { Archive,Heart,MessageSquarePlus,Search } from "lucide-react"
import { useState } from "react"
import { ChatFilterChips } from "./chat-filter-chips"
import { ChatListEmptyState } from "./chat-list-empty-state"
import { ChatListItem } from "./chat-list-item"
import { NewChatDialog } from "./new-chat-dialog"

interface ChatListPanelProps {
	activeUuid: Uuid | null
	typingUuids: Set<Uuid>
}

export function ChatListPanel({ activeUuid, typingUuids }: ChatListPanelProps) {
	const [filter, setFilter] = useState<ChatListFilter>("all")
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const [newChatOpen, setNewChatOpen] = useState(false)

	const { data, isLoading } = useChatList(filter, debouncedSearch)
	const chats = data?.users ?? []

	return (
		<div className="w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			<div className="flex items-center justify-between px-4 pt-4 pb-3">
				<h1 className="text-xl font-bold">Chats</h1>

				<div className="flex items-center gap-4 shrink-0">
					<button
						onClick={() => setNewChatOpen(true)}
						className="shrink-0 px-2 py-1.5 rounded-full font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
					>
						<MessageSquarePlus size={20} />
					</button>
					<button
						title="More options — coming soon"
						onClick={() => toast.info("Chat list options are coming in a later milestone")}
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<span className="sr-only">More options</span>⋮
					</button>
				</div>
			</div>

			<div className="px-4 pb-3">
				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						placeholder="What are you looking for"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 rounded-full bg-muted border-transparent"
					/>
				</div>
			</div>

			<div className="flex items-center gap-2 px-2 pb-1">
				<div className="flex-1 min-w-0">
					<ChatFilterChips value={filter} onChange={setFilter} />
				</div>
			</div>

			<ScrollArea className="flex-1">
				{/* Archive: real, confirmed capability (chats/archive), but
				 * viewing archived chats is chat-list *behavior* deferred to M2
				 * — rendered as a static, inert row rather than wired or
				 * omitted, per M1 product decision 4. */}
				<button
					onClick={() => toast.info("Archive is coming in a later milestone")}
					className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/60"
				>
					<span className="h-11 w-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
						<Archive size={18} />
					</span>
					<span className="text-sm font-medium text-muted-foreground">Archive</span>
				</button>

				{isLoading && (
					<div className="px-4 py-2 space-y-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="flex items-center gap-3">
								<Skeleton className="h-11 w-11 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-3.5 w-2/3" />
									<Skeleton className="h-3 w-1/2" />
								</div>
							</div>
						))}
					</div>
				)}

				{!isLoading && filter === "favorites" && chats.length === 0 && (
					<ChatListEmptyState
						icon={Heart}
						title="Add to favourites"
						description="Make it easy to find the people and groups that matter most across AppsCombo"
						action={{
							label: "Create list",
							onClick: () => toast.info("Coming in a later milestone"),
						}}
					/>
				)}

				{!isLoading && filter !== "favorites" && chats.length === 0 && (
					<ChatListEmptyState
						icon={MessageSquarePlus}
						title={debouncedSearch ? "No results" : "No conversations yet"}
						description={
							debouncedSearch
								? "Try a different name or username."
								: "Start a new chat to get your first conversation going."
						}
						action={
							debouncedSearch
								? undefined
								: { label: "Start new chat", onClick: () => setNewChatOpen(true) }
						}
					/>
				)}

				{!isLoading &&
					chats.map((chat) => (
						<ChatListItem
							key={chat.id}
							chat={chat}
							isActive={chat.id === activeUuid}
							isTyping={typingUuids.has(chat.id)}
						/>
					))}
			</ScrollArea>

			<NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
		</div>
	)
}
