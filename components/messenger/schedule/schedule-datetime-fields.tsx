"use client"

import { cn } from "@/lib/utils"
import { Calendar, ChevronDown, Clock } from "lucide-react"

interface ScheduleDateTimeFieldsProps {
	date: string
	time: string
	onDateChange: (value: string) => void
	onTimeChange: (value: string) => void
	minDate?: string
}

/**
 * Styled pill date/time pickers matching the Schedule designs. Wraps the
 * native `<input type="date"/"time">` (transparent, stretched full-size
 * over the pill) rather than building a bespoke calendar widget — no
 * calendar/date-picker component exists anywhere else in this codebase
 * to reuse, and a hand-rolled one is more complexity than this feature
 * needs. The native control still owns all interaction (click opens the
 * platform picker, it's directly typeable, and it's screen-reader/
 * keyboard accessible on its own) — only its appearance is replaced.
 */
export function ScheduleDateTimeFields({
	date,
	time,
	onDateChange,
	onTimeChange,
	minDate,
}: ScheduleDateTimeFieldsProps) {
	const displayDate = date
		? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
		: "DD - MM - YYYY"

	const displayTime = time
		? new Date(`1970-01-01T${time}:00`).toLocaleTimeString(undefined, {
				hour: "numeric",
				minute: "2-digit",
			})
		: "--:--"

	return (
		<div className="flex gap-3">
			<div className="flex-1">
				<p className="mb-1.5 text-sm font-medium">Date</p>
				<div className="relative flex w-full items-center gap-2 rounded-full bg-muted px-4 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary">
					<Calendar size={16} className="pointer-events-none shrink-0 text-muted-foreground" />
					<span
						className={cn(
							"pointer-events-none truncate text-sm",
							date ? "text-foreground" : "text-muted-foreground",
						)}
					>
						{displayDate}
					</span>
					<ChevronDown
						size={14}
						className="pointer-events-none ml-auto shrink-0 text-muted-foreground"
					/>
					<input
						type="date"
						value={date}
						min={minDate}
						onChange={(e) => onDateChange(e.target.value)}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label="Schedule date"
					/>
				</div>
			</div>

			<div className="flex-1">
				<p className="mb-1.5 text-sm font-medium">Time</p>
				<div className="relative flex w-full items-center gap-2 rounded-full bg-muted px-4 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary">
					<Clock size={16} className="pointer-events-none shrink-0 text-muted-foreground" />
					<span
						className={cn(
							"pointer-events-none truncate text-sm",
							time ? "text-foreground" : "text-muted-foreground",
						)}
					>
						{displayTime}
					</span>
					<ChevronDown
						size={14}
						className="pointer-events-none ml-auto shrink-0 text-muted-foreground"
					/>
					<input
						type="time"
						value={time}
						onChange={(e) => onTimeChange(e.target.value)}
						className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						aria-label="Schedule time"
					/>
				</div>
			</div>
		</div>
	)
}
