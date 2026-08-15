"use client"

import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { ChatListFilter } from "@/types/messenger"

interface ChatFilterChipsProps {
	value: ChatListFilter
	onChange: (filter: ChatListFilter) => void
}

const FILTERS: { value: ChatListFilter; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "unread", label: "Unread" },
	{ value: "favorites", label: "Favorites" },
]

export function ChatFilterChips({ value, onChange }: ChatFilterChipsProps) {
	return (
		<div className="flex items-center gap-2 px-4 pb-3 overflow-x-auto">
			{FILTERS.map((filter) => (
				<button
					key={filter.value}
					onClick={() => onChange(filter.value)}
					className={cn(
						"px-3 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors",
						value === filter.value
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground hover:bg-accent",
					)}
				>
					{filter.label}
				</button>
			))}

			{/* Groups: real backend/mobile capability, but M1 excludes group
			 * functionality (M3). Rendered per the approved design rather than
			 * omitted — see MESSENGER.md open items / product decision 1. */}
			<button
				title="Groups — coming in a later milestone"
				onClick={() => toast.info("Groups are coming in a later milestone")}
				className="px-3 py-1.5 rounded-full text-sm font-medium shrink-0 bg-muted text-muted-foreground/40 cursor-not-allowed"
			>
				Groups
			</button>
		</div>
	)
}
