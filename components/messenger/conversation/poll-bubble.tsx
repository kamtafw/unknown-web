"use client"

import { pollCountdownLabel, resolvePoll } from "@/lib/messenger/poll"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/auth-store"
import type { Message } from "@/types/messenger"
import { Check, Clock } from "lucide-react"
import { Avatar } from "radix-ui"
import { useState } from "react"

interface PollBubbleProps {
	message: Message
	onVote?: (optionId: number) => void
	onViewResults?: () => void
}

/**
 * Matched to the Figma reference pixel-for-pixel. Unlike the rest of
 * MessageContent, this does NOT inherit currentColor from an own/other
 * bubble — the reference shows polls on a neutral card with fixed accent
 * colors regardless of sender. The wrapping MessageBubble/
 * GroupMessageBubble needs to render `message_type === "poll"` on a
 * neutral background (e.g. bg-card/border) instead of the usual
 * primary-tinted own-message bubble, or this will clash — that's a
 * one-level-up change, not something fixable here.
 *
 * Per-option voter avatar preview (non-anonymous case) needs
 * `metadata.options[].voters`. Confirmed present on the dedicated
 * poll-results endpoint; NOT confirmed present on the lighter inline
 * message metadata — the one real payload I've inspected had zero votes,
 * so this was never actually observable. Read defensively; falls back to
 * a plain vote-count label if absent, rather than fetching results per
 * rendered bubble.
 */
export function PollBubble({ message, onVote, onViewResults }: PollBubbleProps) {
	const currentUser = useAuthStore((s) => s.user)
	const poll = resolvePoll(message)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		() => new Set(poll?.selectedOptionIds ?? []),
	)
	if (!poll) return null

	const isOwn = currentUser?.id === message.sender.id

	const toggleOption = (optionId: number) => {
		if (poll.isExpired) return

		setSelectedIds((prev) => {
			const next = new Set(prev)

			if (poll.isMultiple) {
				if (next.has(optionId)) {
					next.delete(optionId)
				} else {
					next.add(optionId)
				}
			} else {
				if (next.has(optionId)) return prev

				next.clear()
				next.add(optionId)
			}

			onVote?.(optionId)
			return next
		})
	}

	return (
		<div className="min-w-64 max-w-80 text-foreground">
			<p className="mb-3 text-[15px] leading-snug wrap-break-word">{poll.question}</p>

			<div className={cn("mb-3 flex items-center justify-between gap-2")}>
				{poll.isExpired ? (
					<span className="flex items-center gap-1 text-xs text-muted-foreground">
						<Clock size={12} /> Poll ended
					</span>
				) : (
					<>
						<span className="text-[13px] font-medium text-primary">
							{poll.isMultiple ? "Select one or more" : "Select one"}
						</span>
						{poll.expiresAt && (
							<span className="flex items-center gap-1 text-xs text-muted-foreground">
								<Clock size={12} /> {pollCountdownLabel(poll.expiresAt)}
							</span>
						)}
					</>
				)}
			</div>

			<div className="flex flex-col gap-5">
				{poll.options.map((option) => {
					const isSelected = selectedIds.has(option.id)
					const percentage =
						poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0

					return (
						<button
							key={option.id}
							type="button"
							onClick={() => toggleOption(option.id)}
							disabled={poll.isExpired}
							className="flex w-full items-start gap-2.5 text-left disabled:cursor-default"
						>
							<span
								className={`mt-0.5 h-5 w-5 shrink-0 flex items-center justify-center border-2 transition-colors ${
									poll.isMultiple ? "rounded-[6px]" : "rounded-full"
								} ${isSelected ? "bg-primary border-primary" : isOwn ? "border-foreground" : "border-border"}`}
							>
								{isSelected &&
									(poll.isMultiple ? (
										<Check size={12} strokeWidth={3} className="text-primary-foreground" />
									) : (
										<span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
									))}
							</span>

							<span className="min-w-0 flex-1">
								<span className="flex items-start justify-between gap-3">
									<span className="text-sm wrap-break-word">{option.text}</span>

									{poll.isAnonymous ? (
										<span className="shrink-0 whitespace-nowrap text-xs font-medium text-emerald-600">
											{percentage}% ({option.voteCount} Votes)
										</span>
									) : option.voterPreview && option.voterPreview.length > 0 ? (
										<span className="flex shrink-0 items-center gap-1">
											<span className="flex -space-x-2">
												{option.voterPreview.slice(0, 2).map((voter, i) => (
													<Avatar.Root
														key={i}
														className="h-5 w-5 rounded-full ring-2 ring-background overflow-hidden bg-muted flex items-center justify-center"
													>
														<Avatar.Image
															src={voter.photo ?? undefined}
															alt={voter.name}
															className="h-full w-full object-cover"
														/>
														<Avatar.Fallback className="text-[9px] font-medium text-muted-foreground">
															{voter.name.charAt(0).toUpperCase()}
														</Avatar.Fallback>
													</Avatar.Root>
												))}
											</span>
											{option.voteCount > 2 && (
												<span className="text-xs text-muted-foreground">{option.voteCount}+</span>
											)}
										</span>
									) : option.voteCount > 0 ? (
										<span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
											{option.voteCount} votes
										</span>
									) : null}
								</span>

								<span className="mt-2 block h-1.5 w-full rounded-full bg-muted">
									<span
										className="block h-full rounded-full bg-primary transition-[width]"
										style={{ width: `${percentage}%` }}
									/>
								</span>
							</span>
						</button>
					)
				})}
			</div>

			{onViewResults && (
				<button
					type="button"
					onClick={onViewResults}
					className="mt-4 w-full border-t border-border pt-3 text-center text-sm font-semibold text-primary underline-offset-2 hover:underline"
				>
					View Votes
				</button>
			)}
		</div>
	)
}
