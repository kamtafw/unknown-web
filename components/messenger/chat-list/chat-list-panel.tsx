"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useBulkSelection } from "@/hooks/messenger/use-bulk-selection"
import { useChatList } from "@/hooks/messenger/use-chat-list"
import { useCustomListMembers } from "@/hooks/messenger/use-custom-lists"
import { useFavorites } from "@/hooks/messenger/use-favorites"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { toast } from "@/lib/toast"
import type { ChatListItem as ChatListItemType, Uuid } from "@/types/messenger"
import { CheckSquare, List, MessageSquarePlus, Search } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { EmptyFavorites } from "../icons/chat-list-icons"
import { FAB, Schedule as ScheduleIcon } from "../icons/group-list-icons"
import { Archive } from "../icons/shared"
import { ScheduledMessagesDialog } from "../schedule/scheduled-messages-dialog"
import { AddToListDialog } from "./add-to-list-dialog"
import { BulkSelectionBar } from "./bulk-selection-bar"
import { ActiveChatFilter, ChatFilterChips } from "./chat-filter-chips"
import { ChatListEmptyState } from "./chat-list-empty-state"
import { ChatListItem } from "./chat-list-item"
import { CustomListMemberRow } from "./custom-list-member-row"
import { CustomListsDialog } from "./custom-lists-dialog"
import { NewChatDialog } from "./new-chat-dialog"

interface ChatListPanelProps {
	activeUuid: Uuid | null
	typingUuids: Set<Uuid>
}

function ChatListSkeleton() {
	return (
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
	)
}

export function ChatListPanel({ activeUuid, typingUuids }: ChatListPanelProps) {
	const [filter, setFilter] = useState<ActiveChatFilter>("all")
	const isCustomListTab = typeof filter === "object"
	const [search, setSearch] = useState("")
	const debouncedSearch = useDebouncedValue(search, 300)
	const [newChatOpen, setNewChatOpen] = useState(false)
	const [listDialogChat, setListDialogChat] = useState<ChatListItemType | null>(null)
	const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
	const [listsDialogOpen, setListsDialogOpen] = useState(false)
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

	const mainList = useChatList(
		isCustomListTab ? "all" : filter === "favorites" ? "all" : filter,
		debouncedSearch,
	)
	const favoritesList = useFavorites()
	const customListMembers = useCustomListMembers(isCustomListTab ? filter.id : null)
	const isFavoritesTab = filter === "favorites"

	const chats = isFavoritesTab ? (favoritesList.data ?? []) : (mainList.data?.users ?? [])
	const isLoading = isCustomListTab
		? customListMembers.isLoading
		: isFavoritesTab
			? favoritesList.isLoading
			: mainList.isLoading

	const bulk = useBulkSelection(isCustomListTab ? [] : chats)

	return (
		<div className="relative w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
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

						{!isCustomListTab && (
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

										{/* <DropdownMenu.Item
											className="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm transition-colors hover:bg-accent data-highlighted:bg-accent"
											onSelect={() => setListsDialogOpen(true)}
										>
											<List size={16} /> View lists
										</DropdownMenu.Item> */}
									</DropdownMenu.Content>
								</DropdownMenu.Portal>
							</DropdownMenu.Root>
						)}
					</div>
				</div>
			)}

			<div className="px-4 pb-3">
				<div className="relative">
					<Input
						placeholder="What are you looking for"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pr-11 rounded-full bg-muted border-transparent"
					/>
					<div className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-primary">
						<Search size={14} className="text-primary-foreground" />
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 px-2 pb-1">
				<div className="flex-1 min-w-0">
					<ChatFilterChips value={filter} onChange={setFilter} />
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="w-0 min-w-full">
					{!isFavoritesTab && (
						<button
							onClick={() => toast.info("Viewing archived chats is coming in a later milestone")}
							className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors border-b border-border/60"
						>
							<span className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
								<Archive />
							</span>
							<span className="text-sm font-medium text-muted-foreground">Archive</span>
						</button>
					)}

					{isLoading ? (
						<ChatListSkeleton />
					) : isCustomListTab ? (
						(() => {
							const members = (customListMembers.data?.results ?? []).filter(
								(
									m,
								): m is typeof m & {
									target_user: NonNullable<typeof m.target_user>
								} => m.type === "user" && !!m.target_user,
							)

							return members.length === 0 ? (
								<ChatListEmptyState
									icon={List}
									title="No members yet"
									description="Add chats to this list from a chat's “Add to list” action."
								/>
							) : (
								members.map((member) => <CustomListMemberRow key={member.id} member={member} />)
							)
						})()
					) : isFavoritesTab && chats.length === 0 ? (
						<ChatListEmptyState
							icon={EmptyFavorites}
							title="Add to favorites"
							description="Make it easy to find the people and groups that matter most across AppsCombo"
							action={{ label: "Browse chats", onClick: () => setFilter("all") }}
						/>
					) : !isFavoritesTab && chats.length === 0 ? (
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
					) : (
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
						))
					)}
				</div>
			</ScrollArea>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<button
						title="New"
						className="absolute bottom-7 right-7 h-14 w-14 rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
					>
						<FAB />
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content
						align="end"
						side="top"
						sideOffset={10}
						className="z-150 bg-transparent backdrop-blur-md border-0 px-2 shadow-none outline-none rounded-2xl
							data-[state=open]:animate-in data-[state=closed]:animate-out
							data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
							data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					>
						<div className="flex flex-col items-end gap-2">
							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => setScheduleDialogOpen(true)}
							>
								<span className="text-[13px] text-foreground">Schedule</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<ScheduleIcon />
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => setNewChatOpen(true)}
							>
								<span className="text-[13px] text-foreground">Start conversation</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg">
									<MessageSquarePlus size={18} className="text-primary-foreground" />
								</div>
							</DropdownMenu.Item>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

			<NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
			<AddToListDialog
				open={!!listDialogChat}
				onOpenChange={(open) => !open && setListDialogChat(null)}
				chat={listDialogChat}
			/>
			<CustomListsDialog open={listsDialogOpen} onOpenChange={setListsDialogOpen} />

			<ScheduledMessagesDialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen} />
		</div>
	)
}
