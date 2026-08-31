"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateSchedule, useSchedule, useUpdateSchedule } from "@/hooks/messenger/use-schedule"
import {
	buildScheduleBundles,
	mergeDateAndTime,
	SCHEDULE_MESSAGE_MAX_CHARS,
	scheduleRecipientName,
	scheduleRecipientPhoto,
	type ScheduleRecipientDraft,
} from "@/lib/messenger/schedule"
import { toast } from "@/lib/toast"
import { useEffect, useState } from "react"

interface ScheduleComposeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	recipients: ScheduleRecipientDraft[]
	scheduleId?: number
}

/** Edit mode doesn't allow changing recipients — same as mobile, which
 * reuses `existing.recipients` untouched. Message-only, no media: Slice
 * C's upload hook isn't something I have visibility into yet — additive
 * once confirmed, same field either way (`recipient_bundles[].media`). */
export function ScheduleComposeDialog({
	open,
	onOpenChange,
	recipients,
	scheduleId,
}: ScheduleComposeDialogProps) {
	const isEditing = scheduleId != null
	const { data: existing } = useSchedule(scheduleId ?? null)
	const createSchedule = useCreateSchedule()
	const updateSchedule = useUpdateSchedule()

	const [content, setContent] = useState("")
	const [date, setDate] = useState("")
	const [time, setTime] = useState("")
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		if (!open) {
			setContent("")
			setDate("")
			setTime("")
			setHydrated(false)
		}
	}, [open])

	useEffect(() => {
		if (!isEditing || hydrated || !existing) return
		setContent(existing.content || existing.recipient_bundles[0]?.encrypted_content || "")
		const d = new Date(existing.scheduled_at)
		if (!Number.isNaN(d.getTime())) {
			setDate(d.toISOString().slice(0, 10))
			setTime(d.toTimeString().slice(0, 5))
		}
		setHydrated(true)
	}, [isEditing, hydrated, existing])

	const effectiveRecipients: ScheduleRecipientDraft[] = isEditing
		? (existing?.recipients ?? []).map((r) => ({
				type: r.type,
				id: r.type === "user" ? r.pkid : r.id,
				name: scheduleRecipientName(r),
				photo: scheduleRecipientPhoto(r),
			}))
		: recipients

	const isPending = createSchedule.isPending || updateSchedule.isPending

	const handleSubmit = async () => {
		const trimmed = content.trim()
		if (!trimmed) return toast.error("Write a message")
		if (!date || !time) return toast.error("Pick a date and time")

		const scheduledAt = mergeDateAndTime(
			new Date(`${date}T00:00:00`),
			new Date(`1970-01-01T${time}:00`),
		)
		if (scheduledAt.getTime() <= Date.now()) return toast.error("Schedule must be in the future")
		if (effectiveRecipients.length === 0) return toast.error("No recipient selected")

		const payload = {
			schedule_type: "message" as const,
			scheduled_at: scheduledAt.toISOString(),
			recipient_bundles: buildScheduleBundles(effectiveRecipients, trimmed),
		}

		if (isEditing && scheduleId) {
			await updateSchedule.mutateAsync({ scheduleId, payload })
		} else {
			await createSchedule.mutateAsync(payload)
		}
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit scheduled message" : "Schedule message"}</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div>
						<p className="mb-1.5 text-sm font-medium">To</p>
						<div className="flex flex-wrap gap-2">
							{effectiveRecipients.map((r) => (
								<span
									key={`${r.type}-${r.id}`}
									className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
								>
									{r.name}
								</span>
							))}
						</div>
					</div>

					<div>
						<div className="mb-1.5 flex items-center justify-between">
							<p className="text-sm font-medium">Message</p>
							<span className="text-xs text-muted-foreground">
								{content.length}/{SCHEDULE_MESSAGE_MAX_CHARS}
							</span>
						</div>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value.slice(0, SCHEDULE_MESSAGE_MAX_CHARS))}
							rows={3}
							placeholder="Write your message"
							className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
						/>
					</div>

					<div className="flex gap-3">
						<div className="flex-1">
							<p className="mb-1.5 text-sm font-medium">Date</p>
							<input
								type="date"
								value={date}
								min={new Date().toISOString().slice(0, 10)}
								onChange={(e) => setDate(e.target.value)}
								className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
							/>
						</div>
						<div className="flex-1">
							<p className="mb-1.5 text-sm font-medium">Time</p>
							<input
								type="time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
							/>
						</div>
					</div>

					<button
						onClick={handleSubmit}
						disabled={isPending}
						className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
					>
						{isPending ? "Saving…" : isEditing ? "Save changes" : "Schedule message"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
