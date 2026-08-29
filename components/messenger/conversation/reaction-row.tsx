"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { EmojiReactionCount } from "@/types/messenger"
import { useEffect, useState } from "react"

interface ReactionsRowProps {
	reactions: EmojiReactionCount[] | undefined | null
	isOwn: boolean
	onFetchReactors: (emoji: string) => Promise<string[]>
}

/** Product requirement: clicking a pill shows who reacted with THAT
 * emoji — it does not toggle your own reaction; that's ReactionPicker's
 * job. Names are fetched lazily, only when a given pill is opened. */
export function ReactionsRow({ reactions, isOwn, onFetchReactors }: ReactionsRowProps) {
	if (!reactions || reactions.length === 0) return null
	return (
		<div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
			{reactions.map((r) => (
				<ReactionPill
					key={r.emoji}
					emoji={r.emoji}
					count={r.count}
					onFetchReactors={onFetchReactors}
				/>
			))}
		</div>
	)
}

function ReactionPill({
	emoji,
	count,
	onFetchReactors,
}: {
	emoji: string
	count: number
	onFetchReactors: (emoji: string) => Promise<string[]>
}) {
	const [open, setOpen] = useState(false)
	const [names, setNames] = useState<string[] | null>(null)

	useEffect(() => {
		if (!open) return
		let cancelled = false
		setNames(null)
		void onFetchReactors(emoji).then((result) => {
			if (!cancelled) setNames(result)
		})
		return () => {
			cancelled = true
		}
	}, [open, emoji, onFetchReactors])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button className="flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-xs hover:bg-accent transition-colors">
					<span className="text-sm leading-none">{emoji}</span>
					<span className="text-muted-foreground font-medium">{count}</span>
				</button>
			</PopoverTrigger>
			<PopoverContent side="top" align="center" className="w-auto max-w-56 py-2 px-3">
				<p className="text-xs text-muted-foreground">
					{names === null ? "Loading…" : names.length > 0 ? names.join(", ") : "No one yet"}
				</p>
			</PopoverContent>
		</Popover>
	)
}
