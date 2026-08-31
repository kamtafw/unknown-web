"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Avatar } from "radix-ui"
import { useEffect, useMemo, useState } from "react"

export interface ReactorEntry {
	pkid: string
	name: string
	avatarUrl?: string | null
	emoji: string
}

interface ReactionsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentUserPkid: string
	fetchReactors: () => Promise<ReactorEntry[]>
	onRemoveOwnReaction: (emoji: string) => void
}

function initialsFromName(name: string): string {
	const parts = name.trim().split(/\s+/)
	const a = parts[0]?.charAt(0) ?? ""
	const b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ""
	return (a + b || "?").toUpperCase()
}

/**
 * Full "who reacted" dialog — replaces the old per-pill text popover.
 * Every reaction pill opens this same dialog showing everyone, grouped
 * by emoji, rather than filtering to just the clicked emoji.
 *
 * Removal reuses the existing reactToMessage toggle logic as-is: calling
 * it again with the emoji the user already reacted with is already
 * detected as a removal (isReactionRemoval) and routes to the confirmed
 * DELETE endpoint — no new mutation path needed here, just a new
 * entrypoint into the existing one.
 */
export function ReactionsDialog({
	open,
	onOpenChange,
	currentUserPkid,
	fetchReactors,
	onRemoveOwnReaction,
}: ReactionsDialogProps) {
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
			// Current user's own row sorts first within its own emoji group.
			entries: [...entries].sort((a, b) =>
				a.pkid === currentUserPkid ? -1 : b.pkid === currentUserPkid ? 1 : 0,
			),
		}))
	}, [reactors, currentUserPkid])

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm max-h-[70vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Reactions</DialogTitle>
				</DialogHeader>

				{loading ? (
					<div className="flex items-center justify-center py-10">
						<Loader2 size={20} className="animate-spin text-muted-foreground" />
					</div>
				) : grouped.length === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8">No reactions yet</p>
				) : (
					<div className="flex flex-col gap-4">
						{grouped.map(({ emoji, entries }) => (
							<div key={emoji}>
								<p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
									<span className="text-base leading-none">{emoji}</span> {entries.length}
								</p>
								<div className="flex flex-col gap-1">
									{entries.map((entry) => {
										const isMe = entry.pkid === currentUserPkid
										return (
											<button
												key={entry.pkid}
												onClick={() => isMe && onRemoveOwnReaction(emoji)}
												disabled={!isMe}
												className="flex items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors enabled:hover:bg-accent disabled:cursor-default"
											>
												<Avatar.Root className="h-8 w-8 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
													<Avatar.Image src={entry.avatarUrl ?? undefined} alt={entry.name} className="h-full w-full object-cover" />
													<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
														{initialsFromName(entry.name)}
													</Avatar.Fallback>
												</Avatar.Root>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium truncate">{isMe ? "You" : entry.name}</p>
													{isMe && <p className="text-xs text-destructive">Click to remove reaction</p>}
												</div>
											</button>
										)
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}