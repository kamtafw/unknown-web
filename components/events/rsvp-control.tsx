"use client"

import { useEventRsvp } from "@/hooks/events/use-event-rsvp"
import { cn } from "@/lib/utils"
import type { EventDetails, EventRsvpStatus } from "@/types/events/api"
import { Loader2 } from "lucide-react"

const OPTIONS: { value: EventRsvpStatus; label: string }[] = [
	{ value: "going", label: "Going" },
	{ value: "interested", label: "Interested" },
	{ value: "not_going", label: "Not going" },
]

/**
 * RSVP: going / interested / not going. Not designed (no frame exists), so it is a segmented
 * radio group in the app's pill style (assumption A-13).
 *
 * RSVP is its own thing: it creates no guest row, does not join the event and does not add it to
 * My events. What the viewer's answer is can be unknown (a restricted preview omits it); unknown
 * is shown as "nothing selected, answer not shown", never as "you have not responded".
 */
export function RsvpControl({ eventId, details }: { eventId: string; details: EventDetails }) {
	const { rsvp, setRsvp, isPending, pendingStatus, error, clearError } = useEventRsvp(
		eventId,
		details,
	)
	const selected = rsvp.state === "set" ? rsvp.status : null

	const hint =
		rsvp.state === "none"
			? "You haven't responded yet."
			: rsvp.state === "unknown"
				? "Your current response isn't shown for this event. Choosing one saves it."
				: null

	return (
		<section aria-labelledby="rsvp-heading" className="flex flex-col gap-2">
			<h2 id="rsvp-heading" className="text-[13px] font-bold text-foreground">
				Your RSVP
			</h2>
			<div role="radiogroup" aria-labelledby="rsvp-heading" className="flex gap-2">
				{OPTIONS.map(({ value, label }) => {
					const checked = selected === value
					const saving = pendingStatus === value
					return (
						<button
							key={value}
							type="button"
							role="radio"
							aria-checked={checked}
							disabled={isPending}
							onClick={() => {
								if (checked) return
								clearError()
								setRsvp(value)
							}}
							className={cn(
								"inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border px-3 text-[12.5px] font-semibold transition-colors",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60",
								checked
									? "border-primary bg-primary text-primary-foreground"
									: "border-border text-foreground hover:bg-muted",
							)}
						>
							{saving && <Loader2 size={13} className="animate-spin" aria-hidden />}
							{label}
						</button>
					)
				})}
			</div>
			{hint && !error && <p className="text-[12px] text-muted-foreground">{hint}</p>}
			{error && (
				<p role="alert" className="text-[12px] font-medium text-destructive">
					{error.message}
				</p>
			)}
		</section>
	)
}
