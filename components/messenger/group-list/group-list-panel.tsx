"use client"

import { ChatListEmptyState } from "@/components/messenger/chat-list/chat-list-empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useGroupList } from "@/hooks/messenger/use-group-list"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { FAB } from "../icons/group-list-icons"
import { CreateGroupDialog } from "./create-group-dialog"
import { GroupListItem } from "./group-list-item"

interface GroupListPanelProps {
	activeGroupId: number | null
}

const menuItemClass =
	"flex items-center px-3 py-2 rounded-xl cursor-pointer select-none outline-none text-sm font-medium transition-colors hover:bg-accent data-highlighted:bg-accent"

/**
 * Groups/Communities panel, reached from the rail's "Groups" item — see
 * DECISIONS.md. Communities and "Schedule message" on the FAB are inert
 * (Tier 3 / Tier 2 respectively, not M3) — only "New Group" is wired.
 *
 * No search input on the list itself: mobile's `useGetGroups` only
 * accepts a cursor param, no `search`.
 */
export function GroupListPanel({ activeGroupId }: GroupListPanelProps) {
	const [tab, setTab] = useState<"groups" | "communities">("groups")
	const [createOpen, setCreateOpen] = useState(false)
	const { data, isLoading } = useGroupList()
	const groups = data?.groups ?? []

	return (
		<div className="relative w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			<div className="flex items-center justify-between px-4 pt-4 pb-3">
				<h1 className="text-xl font-bold">Groups</h1>
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
					) : groups.length === 0 ? (
						<ChatListEmptyState
							icon={Users}
							title="No groups yet"
							description="Groups you're added to will show up here."
						/>
					) : (
						groups.map((group) => (
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
						className="z-150 min-w-52 bg-popover border border-border rounded-2xl p-1.5 shadow-xl
							data-[state=open]:animate-in data-[state=closed]:animate-out
							data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
							data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					>
						<DropdownMenu.Item className={menuItemClass} onSelect={() => setCreateOpen(true)}>
							New Group
						</DropdownMenu.Item>
						<DropdownMenu.Item
							className={menuItemClass}
							onSelect={() => toast.info("Communities are coming in a later milestone")}
						>
							New Community
						</DropdownMenu.Item>
						<DropdownMenu.Item
							className={menuItemClass}
							onSelect={() => toast.info("Scheduled messages are coming in a later milestone")}
						>
							Schedule message
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

			<CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	)
}
