"use client"

import { ChatListEmptyState } from "@/components/messenger/chat-list/chat-list-empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useGroupList } from "@/hooks/messenger/use-group-list"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"
import { useState } from "react"
import { GroupListItem } from "./group-list-item"

interface GroupListPanelProps {
	activeGroupId: number | null
}

/**
 * Groups/Communities panel, reached from the rail's "Groups" item — a
 * top-level section distinct from the direct-chat list, not a filter
 * chip within it (resolves M1's open "Contacts/Lists" question — see
 * DECISIONS.md). Communities is Tier 3 — inert here.
 *
 * No search input: mobile's `useGetGroups` only accepts a cursor param,
 * no `search` — unlike `chatApi.list`. Not building a client-only search
 * box with no backend behind it. Flagged in MESSENGER.md.
 */
export function GroupListPanel({ activeGroupId }: GroupListPanelProps) {
	const [tab, setTab] = useState<"groups" | "communities">("groups")
	const { data, isLoading } = useGroupList()
	const groups = data?.groups ?? []

	return (
		<div className="w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
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
		</div>
	)
}
