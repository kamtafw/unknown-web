"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePollResults } from "@/hooks/messenger/use-poll-actions"
import { Loader2, Star } from "lucide-react"
import { Avatar } from "radix-ui"

interface PollResultsDialogProps {
	messageId: number | null
	onOpenChange: (open: boolean) => void
}

/** Web port of mobile's poll-votes.tsx screen, as a dialog instead of a
 * route — single fetch on open, no polling (see "no realtime results"). */
export function PollResultsDialog({ messageId, onOpenChange }: PollResultsDialogProps) {
	const { data: results, isLoading, isError } = usePollResults(messageId)

	return (
		<Dialog open={!!messageId} onOpenChange={(open) => !open && onOpenChange(false)}>
			<DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{results?.is_anonymous ? "Poll Votes (Anonymous)" : "Poll Votes"}
					</DialogTitle>
				</DialogHeader>

				{isLoading ? (
					<div className="flex items-center justify-center py-10">
						<Loader2 size={20} className="animate-spin text-muted-foreground" />
					</div>
				) : isError || !results ? (
					<p className="py-8 text-center text-sm text-muted-foreground">
						Couldn&apos;t load poll results. Try again.
					</p>
				) : (
					<div className="flex flex-col gap-5">
						<p className="text-sm">{results.question}</p>
						{results.options.map((option) => (
							<div key={option.id}>
								<div className="mb-2 flex items-start justify-between gap-3">
									<p className="flex-1 text-sm">{option.text}</p>
									<span className="flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
										{option.vote_count} Votes
										<Star size={13} className="text-amber-500 fill-amber-500" />
									</span>
								</div>

								{results.is_anonymous ? (
									<div className="flex items-center gap-3">
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full bg-primary"
												style={{ width: `${option.percentage}%` }}
											/>
										</div>
										<span className="w-10 shrink-0 text-right text-xs font-medium text-muted-foreground">
											{Math.round(option.percentage)}%
										</span>
									</div>
								) : (option.voters ?? []).length === 0 ? (
									<p className="text-sm text-muted-foreground">No votes</p>
								) : (
									<div className="flex flex-col gap-2">
										{(option.voters ?? []).map((voter) => {
											const name =
												[voter.first_name, voter.last_name].filter(Boolean).join(" ") ||
												voter.username ||
												"User"
											return (
												<div key={voter.pkid} className="flex items-center gap-2.5">
													<Avatar.Root className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
														<Avatar.Image
															src={voter.profile_photo}
															alt={name}
															className="h-full w-full object-cover"
														/>
														<Avatar.Fallback className="text-xs font-medium text-muted-foreground">
															{name.charAt(0).toUpperCase()}
														</Avatar.Fallback>
													</Avatar.Root>
													<span className="text-sm">{name}</span>
												</div>
											)
										})}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</DialogContent>
		</Dialog>
	)
}
