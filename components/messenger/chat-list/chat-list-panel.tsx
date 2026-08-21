"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBulkSelection } from "@/hooks/messenger/use-bulk-selection"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useFavorites } from "@/hooks/messenger/use-favorites"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toast } from "@/lib/toast"
import type { ChatListFilter, ChatListItem as ChatListItemType, Uuid } from "@/types/messenger"
import { Archive, CheckSquare, Heart, List, MessageSquarePlus, Search } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { AddToListDialog } from "./add-to-list-dialog"
import { BulkSelectionBar } from "./bulk-selection-bar"
import { ChatFilterChips } from "./chat-filter-chips"
import { ChatListEmptyState } from "./chat-list-empty-state"
import { ChatListItem } from "./chat-list-item"
import { CustomListsDialog } from "./custom-lists-dialog"
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
	const [listDialogChat, setListDialogChat] = useState<ChatListItemType | null>(null)
	const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
	const [listsDialogOpen, setListsDialogOpen] = useState(false)

	// Favorites is a genuinely separate collection (M2 correction — see
	// lib/messenger/api.ts), not a status filter on the main list, so it
	// goes through its own hook rather than useChatList.
	const mainList = useChatList(filter === "favorites" ? "all" : filter, debouncedSearch)
	const favoritesList = useFavorites()
	const isFavoritesTab = filter === "favorites"
	const { data, isLoading } = isFavoritesTab
		? {
				data: favoritesList.data ? { users: favoritesList.data } : undefined,
				isLoading: favoritesList.isLoading,
			}
		: mainList
	const chats = data?.users ?? []

	const bulk = useBulkSelection(chats)

	return (
		<div className="w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			{bulk.active ? (
				<BulkSelectionBar
					selectedCount={bulk.selectedCount}
					onSelectAll={bulk.selectAll}
					onCancel={bulk.stop}
					onArchive={bulk.bulkArchive}
					onClear={bulk.bulkClear}
				/>
			) : (
				<div className="flex items-center justify-between px-4 pt-4 pb-3">
					<h1 className="text-xl font-bold">Chats</h1>

					<div className="flex items-center gap-4 shrink-0">
						<button
							onClick={() => setNewChatOpen(true)}
							className="shrink-0 px-2 py-1.5 rounded-full font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
						>
							<MessageSquarePlus size={20} />
						</button>

						<DropdownMenu.Root open={headerMenuOpen} onOpenChange={setHeaderMenuOpen}>
							<DropdownMenu.Trigger asChild>
								<button className="text-muted-foreground hover:text-foreground transition-colors">
									<span className="sr-only">More options</span>⋮
								</button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Portal>
								<DropdownMenu.Content
									align="end"
									sideOffset={4}
									className="z-150 min-w-48 bg-popover border border-border rounded-2xl p-1.5 shadow-xl
										data-[state=open]:animate-in data-[state=closed]:animate-out
										data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
								>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => bulk.start()}
									>
										<CheckSquare size={16} /> Select chats
									</DropdownMenu.Item>
									<DropdownMenu.Item
										className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"
										onSelect={() => setListsDialogOpen(true)}
									>
										<List size={16} /> View lists
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					</div>
				</div>
			)}

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
				{!isFavoritesTab && (
					// Archive: real, confirmed capability, but *viewing* the
					// archived list is deferred past M2 (M2 only covers
					// archiving *from* the main list) — inert per the same
					// reasoning as M1 product decision 4.
					<button
						onClick={() => toast.info("Viewing archived chats is coming in a later milestone")}
						className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/60"
					>
						<span className="h-11 w-11 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0">
							<Archive size={18} />
						</span>
						<span className="text-sm font-medium text-muted-foreground">Archive</span>
					</button>
				)}

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

				{!isLoading && isFavoritesTab && chats.length === 0 && (
					<ChatListEmptyState
						icon={Heart}
						title="Add to favourites"
						description="Make it easy to find the people and groups that matter most across AppsCombo"
						action={{ label: "Browse chats", onClick: () => setFilter("all") }}
					/>
				)}

				{!isLoading && !isFavoritesTab && chats.length === 0 && (
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
							bulkMode={bulk.active}
							selected={bulk.selected.has(chat.id)}
							onToggleSelect={bulk.toggle}
							onAddToList={setListDialogChat}
						/>
					))}
			</ScrollArea>

			<NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
			<AddToListDialog
				open={!!listDialogChat}
				onOpenChange={(open) => !open && setListDialogChat(null)}
				chat={listDialogChat}
			/>
			<CustomListsDialog open={listsDialogOpen} onOpenChange={setListsDialogOpen} />
		</div>
	)
}
