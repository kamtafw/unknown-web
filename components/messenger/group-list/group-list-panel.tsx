"use client"

import { ChatListEmptyState } from "@/components/messenger/chat-list/chat-list-empty-state"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useGroupList } from "@/hooks/messenger/use-group-list"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Search, Users } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { CreateGroup, FAB, Schedule } from "../icons/group-list-icons"
import { ScheduledMessagesDialog } from "../schedule/scheduled-messages-dialog"
import { CreateGroupDialog } from "./create-group-dialog"
import { GroupListItem } from "./group-list-item"

interface GroupListPanelProps {
	activeGroupId: number | null
}

/**
 * Groups/Communities panel, reached from the rail's "Groups" item — see
 * DECISIONS.md. Communities and "Schedule message" on the FAB are inert
 * (Tier 3 / Tier 2 respectively, not M3) — only "New Group" is wired.
 *
 * Search is client-side over the already-fetched list — confirmed via
 * mobile's chat-search-overlay.tsx: useGetGroups() has no `search` param
 * there either, it filters the fetched groups by name in JS. Same here.
 */
export function GroupListPanel({ activeGroupId }: GroupListPanelProps) {
	const [tab, setTab] = useState<"groups" | "communities">("groups")
	const [createOpen, setCreateOpen] = useState(false)
	const [search, setSearch] = useState("")
	const { data, isLoading } = useGroupList()
	const groups = data?.groups ?? []
	const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)

	const trimmedSearch = search.trim().toLowerCase()
	const filteredGroups = trimmedSearch
		? groups.filter((g) => g.name?.toLowerCase().includes(trimmedSearch))
		: groups

	return (
		<div className="relative w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			<div className="flex items-center justify-between px-4 pt-4 pb-3">
				<h1 className="text-xl font-bold">Groups</h1>
			</div>

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

			<div className="px-4 pb-3">
				<div className="flex w-full items-center gap-1 p-1 rounded-full bg-muted">
					<button
						onClick={() => setTab("groups")}
						className={cn(
							"flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
							tab === "groups" ? "bg-background shadow-sm" : "text-muted-foreground",
						)}
					>
						Groups
					</button>
					<button
						onClick={() => {
							setTab("communities")
							toast.info("Communities are coming in a later milestone")
						}}
						className={cn(
							"flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
							tab === "communities" ? "bg-background shadow-sm" : "text-muted-foreground",
						)}
					>
						Communities
					</button>
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="w-0 min-w-full">
					{tab === "communities" ? (
						<ChatListEmptyState
							icon={Users}
							title="Communities"
							description="Communities are coming in a later milestone."
						/>
					) : isLoading ? (
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
					) : filteredGroups.length === 0 ? (
						<ChatListEmptyState
							icon={Users}
							title={trimmedSearch ? "No groups found" : "No groups yet"}
							description={
								trimmedSearch
									? "Try a different search."
									: "Groups you're added to will show up here."
							}
						/>
					) : (
						filteredGroups.map((group) => (
							<GroupListItem key={group.id} group={group} isActive={group.id === activeGroupId} />
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
						className="z-150 bg-transparent backdrop-blur-md
							border-0 px-2 shadow-none outline-none rounded-2xl
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
									<Schedule />
								</div>
							</DropdownMenu.Item>

							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => setCreateOpen(true)}
							>
								<span className="text-[13px] text-foreground">Create Group</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<CreateGroup />
								</div>
							</DropdownMenu.Item>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

			<CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />

			<ScheduledMessagesDialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen} />
		</div>
	)
}
