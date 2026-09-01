"use client"

import { cn } from "@/lib/utils"
import type { EmojiReactionCount } from "@/types/messenger"

interface ReactionsRowProps {
	reactions: EmojiReactionCount[] | undefined | null
	isOwn: boolean
	onOpenDialog: () => void
}

/** Every pill opens the same full reactions dialog — clicking any single
 * emoji shows the complete grouped list, not just that emoji's reactors. */
export function ReactionsRow({ reactions, isOwn, onOpenDialog }: ReactionsRowProps) {
	if (!reactions || reactions.length === 0) return null
	return (
		<div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
			{reactions.map((r) => (
				<button
					key={r.emoji}
					onClick={onOpenDialog}
					className="flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-xs hover:bg-accent transition-colors"
				>
					<span className="text-sm leading-none">{r.emoji}</span>
					<span className="text-muted-foreground font-medium">{r.count}</span>
				</button>
			))}
		</div>
	)
}
