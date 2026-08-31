"use client"

import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useArchiveList } from "@/hooks/messenger/use-archive-list"
import { Archive, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArchiveRow, resolveArchiveTargetName } from "./archive-row"
import { ChatListEmptyState } from "./chat-list-empty-state"

/**
 * Reached from ChatListPanel's "Archive" row. Full panel swap via
 * /messenger/archive — MessengerShell branches by pathname, same
 * mechanism as the Chats↔Groups split, not a dialog (matches the
 * screenshot's full-column layout with its own back arrow).
 */
export function ArchiveListPanel() {
	const [search, setSearch] = useState("")
	const { items, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useArchiveList()

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase()
		if (!q) return items
		return items.filter((entry) => resolveArchiveTargetName(entry.target).toLowerCase().includes(q))
	}, [items, search])

	return (
		<div className="w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			<div className="flex items-center gap-2 px-4 pt-4 pb-3">
				<Link
					href="/messenger"
					className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
				>
					<ArrowLeft size={18} />
				</Link>
				<h1 className="text-xl font-bold">Archive</h1>
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

			<ScrollArea className="flex-1">
				<div className="w-0 min-w-full">
					{isLoading ? (
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
					) : filtered.length === 0 ? (
						<ChatListEmptyState
							icon={Archive}
							title={search ? "No results" : "No archived chats"}
							description={
								search
									? "Try a different name or username."
									: "Chats you archive will show up here."
							}
						/>
					) : (
						filtered.map((entry) => <ArchiveRow key={entry.id} entry={entry} />)
					)}

					{hasNextPage && (
						<button
							onClick={() => fetchNextPage()}
							disabled={isFetchingNextPage}
							className="w-full py-3 text-xs font-medium text-primary"
						>
							{isFetchingNextPage ? "Loading…" : "Load more"}
						</button>
					)}
				</div>
			</ScrollArea>
		</div>
	)
}
