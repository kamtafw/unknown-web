"use client"

import { EmojiPopup } from "@/components/ui/EmojiPicker"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCreateSchedule, useSchedule, useUpdateSchedule } from "@/hooks/messenger/use-schedule"
import {
	SCHEDULE_REMINDER_MAX_CHARS,
	isScheduleDateTimeValid,
	mergeDateAndTime,
} from "@/lib/messenger/schedule"
import { toast } from "@/lib/toast"
import type { Schedule } from "@/types/messenger"
import { Smile } from "lucide-react"
import { useState } from "react"
import { ScheduleDateTimeFields } from "./schedule-datetime-fields"

interface ReminderComposeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	scheduleId?: number | null
}

interface ReminderComposeFormProps {
	scheduleId: number | null
	existing: Schedule | null
	onDone: () => void
}

/**
 * Deliberately independent of recipient selection and media — a reminder
 * is just `content` + `scheduled_at` on the wire (see
 * CreateReminderSchedulePayload). Reusing the message composer's
 * recipient/media plumbing here would only add irrelevant UI for a flow
 * that doesn't need it.
 *
 * Form state is initialized lazily from `existing` rather than hydrated
 * via a `useEffect` — Radix's Dialog.Content unmounts on close by
 * default (no `forceMount` here), so every fresh open already gets a
 * fresh component instance; there's nothing left to reset or hydrate
 * reactively. The outer `key` below (scheduleId) makes that explicit
 * rather than relying on it implicitly.
 */
function ReminderComposeForm({ scheduleId, existing, onDone }: ReminderComposeFormProps) {
	const isEditing = scheduleId != null
	const createSchedule = useCreateSchedule()
	const updateSchedule = useUpdateSchedule()

	const [content, setContent] = useState(existing?.content ?? "")
	const [date, setDate] = useState(() => {
		if (!existing) return ""
		const d = new Date(existing.scheduled_at)
		return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10)
	})
	const [time, setTime] = useState(() => {
		if (!existing) return ""
		const d = new Date(existing.scheduled_at)
		return Number.isNaN(d.getTime()) ? "" : d.toTimeString().slice(0, 5)
	})
	const [emojiOpen, setEmojiOpen] = useState(false)

	const isPending = createSchedule.isPending || updateSchedule.isPending

	const handleSubmit = async () => {
		const trimmed = content.trim()
		if (!trimmed) return toast.error("Write a reminder")
		if (!date || !time) return toast.error("Pick a date and time")

		const scheduledAt = mergeDateAndTime(
			new Date(`${date}T00:00:00`),
			new Date(`1970-01-01T${time}:00`),
		)
		if (!isScheduleDateTimeValid(scheduledAt)) return toast.error("Reminder must be in the future")

		if (isEditing && scheduleId) {
			await updateSchedule.mutateAsync({
				scheduleId,
				type: "reminder",
				payload: { scheduled_at: scheduledAt.toISOString(), content: trimmed },
			})
		} else {
			await createSchedule.mutateAsync({
				schedule_type: "reminder",
				scheduled_at: scheduledAt.toISOString(),
				content: trimmed,
			})
		}
		onDone()
	}

	return (
		<div className="flex flex-col gap-5">
			<div>
				<p className="mb-2 text-sm font-semibold">Self message</p>
				<div className="rounded-2xl border border-border px-3.5 pt-3 pb-2">
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value.slice(0, SCHEDULE_REMINDER_MAX_CHARS))}
						rows={4}
						placeholder="Write your reminder"
						className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
					/>
					<div className="mt-1 flex items-center justify-between border-t border-border pt-2">
						<Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
							<PopoverTrigger asChild>
								<button
									type="button"
									aria-label="Add emoji"
									className="text-muted-foreground hover:text-foreground transition-colors"
								>
									<Smile size={18} />
								</button>
							</PopoverTrigger>
							<PopoverContent side="top" align="start" className="p-0 w-auto">
								<EmojiPopup
									onSelect={(emoji) =>
										setContent((prev) => (prev + emoji).slice(0, SCHEDULE_REMINDER_MAX_CHARS))
									}
									onClose={() => setEmojiOpen(false)}
								/>
							</PopoverContent>
						</Popover>
						<span className="text-xs text-muted-foreground">
							{content.length}/{SCHEDULE_REMINDER_MAX_CHARS}
						</span>
					</div>
				</div>
			</div>

			<ScheduleDateTimeFields
				date={date}
				time={time}
				onDateChange={setDate}
				onTimeChange={setTime}
				minDate={new Date().toISOString().slice(0, 10)}
			/>

			<button
				onClick={handleSubmit}
				disabled={isPending}
				className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
			>
				{isPending ? "Saving…" : isEditing ? "Save changes" : "Create schedule"}
			</button>
		</div>
	)
}

export function ReminderComposeDialog({
	open,
	onOpenChange,
	scheduleId,
}: ReminderComposeDialogProps) {
	const isEditing = scheduleId != null
	const { data: existing, isLoading: existingLoading } = useSchedule(scheduleId ?? null)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Reminder</DialogTitle>
				</DialogHeader>

				{isEditing && existingLoading ? (
					<p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
				) : (
					<ReminderComposeForm
						key={scheduleId ?? "new"}
						scheduleId={scheduleId ?? null}
						existing={isEditing ? (existing ?? null) : null}
						onDone={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
