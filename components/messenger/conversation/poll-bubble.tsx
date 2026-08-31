"use client"

import { pollCountdownLabel, resolvePoll } from "@/lib/messenger/poll"
import type { Message } from "@/types/messenger"
import { Check, Clock } from "lucide-react"
import { useState } from "react"

interface PollBubbleProps {
	message: Message
	onVote?: (optionId: number) => void
	onViewResults?: () => void
}

/** Web port of mobile's PollBubble. Text has no hardcoded foreground
 * classes — it inherits the bubble's own/other color since this renders
 * inside either a primary-colored (own) or card-colored (other) bubble,
 * same approach as the rest of MessageContent's cases. Vote counts come
 * from `message.metadata` as last loaded; no realtime broadcast for
 * votes (documented gap), so they can lag until the next refetch — same
 * limitation mobile itself has. */
export function PollBubble({ message, onVote, onViewResults }: PollBubbleProps) {
	const poll = resolvePoll(message)
	const [selectedIds, setSelectedIds] = useState<Set<number>>(
		() => new Set(poll?.selectedOptionIds ?? []),
	)
	if (!poll) return null

	const toggleOption = (optionId: number) => {
		if (poll.isExpired) return
		setSelectedIds((prev) => {
			const next = new Set(prev)
			if (next.has(optionId)) {
				next.delete(optionId)
			} else {
				if (!poll.isMultiple) next.clear()
				next.add(optionId)
			}
			onVote?.(optionId)
			return next
		})
	}

	return (
		<div className="min-w-52">
			<p className="mb-2 text-sm font-medium wrap-break-word">{poll.question}</p>

			<div className="mb-3 flex items-center justify-between gap-2 opacity-80">
				{poll.isExpired ? (
					<span className="flex items-center gap-1 text-xs">
						<Clock size={12} /> Poll ended
					</span>
				) : (
					<>
						<span className="text-xs font-medium">
							{poll.isMultiple ? "Select one or more" : "Select one"}
						</span>
						{poll.expiresAt && (
							<span className="flex items-center gap-1 text-xs">
								<Clock size={12} /> {pollCountdownLabel(poll.expiresAt)}
							</span>
						)}
					</>
				)}
			</div>

			<div className="flex flex-col gap-3">
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
							className="flex items-start gap-2.5 text-left disabled:cursor-default"
						>
							<span
								className={`mt-0.5 h-4 w-4 shrink-0 flex items-center justify-center border-2 ${
									poll.isMultiple ? "rounded-lg" : "rounded-full"
								} ${isSelected ? "bg-primary border-primary" : "border-current/40"}`}
							>
								{isSelected && <Check size={10} className="text-primary-foreground" />}
							</span>
							<span className="min-w-0 flex-1">
								<span className="block text-sm wrap-break-word">{option.text}</span>
								<span className="mt-1.5 block h-1.5 w-full rounded-full bg-current/15">
									<span
										className="block h-full rounded-full bg-primary"
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
					className="mt-3 w-full border-t border-current/15 pt-2.5 text-center text-sm font-semibold underline-offset-2 hover:underline"
				>
					View Votes
				</button>
			)}
		</div>
	)
}
