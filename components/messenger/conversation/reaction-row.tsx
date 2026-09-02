"use client"

import { cn } from "@/lib/utils"
import type { EmojiReactionCount } from "@/types/messenger"

interface ReactionsRowProps {
	reactions: EmojiReactionCount[] | undefined | null
	isOwn: boolean
	onOpenDialog: () => void
}

/** Every pill opens the same full reactions dialog — clicking any single
 * emoji shows the complete grouped breakdown, not just that emoji's
 * reactors. Reverts the visual from the earlier single-overlapping-badge
 * pass to individual pills inline in the bubble content, matching the
 * latest reference — interaction (dialog, remove-own) is unchanged. */
export function ReactionsRow({ reactions, isOwn, onOpenDialog }: ReactionsRowProps) {
	if (!reactions || reactions.length === 0) return null
	return (
		<div className={cn("mt-2 flex flex-wrap gap-1.5", isOwn ? "justify-end" : "justify-start")}>
			{reactions.map((r) => (
				<button
					key={r.emoji}
					onClick={onOpenDialog}
					className={cn(
						"flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors",
						isOwn ? "bg-background/60 hover:bg-background/80" : "bg-muted hover:bg-muted/80",
					)}
				>
					<span className="text-sm leading-none">{r.emoji}</span>
					<span className="font-medium text-foreground/80">{r.count}</span>
				</button>
			))}
		</div>
	)
}
