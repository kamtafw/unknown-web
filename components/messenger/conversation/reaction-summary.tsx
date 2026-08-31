"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { EmojiReactionCount } from "@/types/messenger"
import { Avatar } from "radix-ui"
import { useEffect, useMemo, useState } from "react"

export interface ReactorEntry {
	pkid: number
	name: string
	avatarUrl?: string | null
	emoji: string
}

interface ReactionSummaryProps {
	reactions: EmojiReactionCount[] | undefined | null
	isOwn: boolean
	currentUserPkid: number
	fetchReactors: () => Promise<ReactorEntry[]>
	onRemoveOwnReaction: (emoji: string) => void
}

const MAX_BADGE_EMOJIS = 3

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/)
	const a = parts[0]?.charAt(0) ?? ""
	const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
	return (a + b || "?").toUpperCase()
}

/**
 * WhatsApp-style combined badge (top emojis + total count as ONE
 * clickable pill) that opens a popover with the full grouped breakdown.
 * Self-contained — owns its open state via Popover, so parent views
 * don't need dialog-open state for this anymore.
 */
export function ReactionSummary({
	reactions,
	isOwn,
	currentUserPkid,
	fetchReactors,
	onRemoveOwnReaction,
}: ReactionSummaryProps) {
	const [open, setOpen] = useState(false)
	const [reactors, setReactors] = useState<ReactorEntry[] | null>(null)
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		if (!open) {
			setReactors(null)
			return
		}
		let cancelled = false
		setLoading(true)
		void fetchReactors().then((result) => {
			if (!cancelled) {
				setReactors(result)
				setLoading(false)
			}
		})
		return () => {
			cancelled = true
		}
	}, [open, fetchReactors])

	const grouped = useMemo(() => {
		if (!reactors) return []
		const byEmoji = new Map<string, ReactorEntry[]>()
		for (const r of reactors) {
			const list = byEmoji.get(r.emoji) ?? []
			list.push(r)
			byEmoji.set(r.emoji, list)
		}
		return Array.from(byEmoji.entries()).map(([emoji, entries]) => ({
			emoji,
			entries: [...entries].sort((a, b) =>
				a.pkid === currentUserPkid ? -1 : b.pkid === currentUserPkid ? 1 : 0,
			),
		}))
	}, [reactors, currentUserPkid])

	if (!reactions || reactions.length === 0) return null
	const total = reactions.reduce((sum, r) => sum + r.count, 0)
	const topEmojis = [...reactions].sort((a, b) => b.count - a.count).slice(0, MAX_BADGE_EMOJIS)

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					className={cn(
						"flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 shadow-sm hover:bg-accent transition-colors",
						isOwn ? "flex-row-reverse" : "flex-row",
					)}
				>
					<span className="flex items-center -space-x-1 text-sm leading-none">
						{topEmojis.map((r) => (
							<span key={r.emoji}>{r.emoji}</span>
						))}
					</span>
					<span className="text-[11px] text-muted-foreground font-medium">{total}</span>
				</button>
			</PopoverTrigger>

			<PopoverContent
				side="top"
				align={isOwn ? "end" : "start"}
				className="w-72 max-h-80 overflow-y-auto p-0"
			>
				<div className="px-4 pt-3 pb-2 border-b border-border">
					<p className="text-sm font-semibold">
						{total} reaction{total === 1 ? "" : "s"}
					</p>
				</div>

				{loading ? (
					<p className="text-sm text-muted-foreground text-center py-6">Loading…</p>
				) : grouped.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-6">No reactions yet</p>
				) : (
					<div className="py-1">
						{grouped.map(({ emoji, entries }) => (
							<div key={emoji} className="px-2 py-1">
								<p className="px-2 py-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
									<span className="text-sm leading-none">{emoji}</span> {entries.length}
								</p>
								{entries.map((entry) => {
									const isMe = entry.pkid === currentUserPkid
									return (
										<button
											key={entry.pkid}
											onClick={() => {
												if (!isMe) return
												setOpen(false)
												onRemoveOwnReaction(emoji)
											}}
											disabled={!isMe}
											className="w-full flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors enabled:hover:bg-accent disabled:cursor-default"
										>
											<Avatar.Root className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
												<Avatar.Image
													src={entry.avatarUrl ?? undefined}
													alt={entry.name}
													className="h-full w-full object-cover"
												/>
												<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
													{initialsFromName(entry.name)}
												</Avatar.Fallback>
											</Avatar.Root>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium truncate">{isMe ? "You" : entry.name}</p>
												{isMe && (
													<p className="text-xs text-destructive">Click to remove reaction</p>
												)}
											</div>
											<span className="text-sm leading-none shrink-0">{emoji}</span>
										</button>
									)
								})}
							</div>
						))}
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}
