"use client"

import { useCustomLists } from "@/hooks/messenger/use-custom-lists"
import { cn } from "@/lib/utils"
import type { ChatListFilter } from "@/types/messenger"
import { Plus } from "lucide-react"

/** Base filters stay string-typed (drives useChatList's querystring
 * directly); a selected custom list is a distinct shape since it doesn't
 * map to a `status` filter at all — it's a separate members endpoint. */
export type ActiveChatFilter = ChatListFilter | { type: "list"; id: number; name: string }

interface ChatFilterChipsProps {
	value: ActiveChatFilter
	onChange: (filter: ActiveChatFilter) => void
}

const BASE_FILTERS: { value: ChatListFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "unread", label: "Unread" },
	{ value: "favorites", label: "Favorites" },
]

function isActive(value: ActiveChatFilter, candidate: ChatListFilter | number): boolean {
	if (typeof candidate === "number") return typeof value === "object" && value.id === candidate
	return value === candidate
}

export function ChatFilterChips({ value, onChange }: ChatFilterChipsProps) {
	const { data: lists } = useCustomLists()

	return (
		<div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
			{BASE_FILTERS.map((filter) => (
				<button
					key={filter.value}
					onClick={() => onChange(filter.value)}
					className={cn(
						"px-3 py-0.5 rounded-full text-sm font-regular shrink-0 transition-colors",
						isActive(value, filter.value)
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground hover:bg-accent",
					)}
				>
					{filter.label}
				</button>
			))}

			{lists?.map((list) => (
				<button
					key={list.id}
					onClick={() => onChange({ type: "list", id: list.id, name: list.name })}
					className={cn(
						"px-3 py-0.5 rounded-full text-sm font-regular shrink-0 transition-colors",
						isActive(value, list.id)
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground hover:bg-accent",
					)}
				>
					{list.name}
				</button>
			))}

			<button
				title="Groups — coming in a later milestone"
				onClick={() => {}}
				className="
				flex items-center gap-0.5 bg-muted text-accent-foreground hover-bg-accent
				px-3 py-0.5 rounded-full text-sm font-regular shrink-0 transition-colors
				"
			>
				<Plus size={14} className="text-primary font-semibold" />
				Create
			</button>
		</div>
	)
}
