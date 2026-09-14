"use client"

import { EmojiPopup } from "@/components/ui/EmojiPicker"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { usePendingAttachment } from "@/hooks/messenger/use-media-attachment"
import { useCreateSchedule, useSchedule, useUpdateSchedule } from "@/hooks/messenger/use-schedule"
import {
	SCHEDULE_MAX_IMAGES,
	SCHEDULE_MESSAGE_MAX_CHARS,
	buildScheduleBundles,
	isScheduleDateTimeValid,
	mergeDateAndTime,
	scheduleMediaUrls,
	scheduleRecipientName,
	scheduleRecipientPhoto,
	type ScheduleRecipientDraft,
} from "@/lib/messenger/schedule"
import { toast } from "@/lib/toast"
import type { Schedule } from "@/types/messenger"
import { AlertCircle, Info, Loader2, Plus, RotateCcw, Smile, Trash2 } from "lucide-react"
import { useState } from "react"
import { ScheduleDateTimeFields } from "./schedule-datetime-fields"

interface ScheduleComposeDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	recipients: ScheduleRecipientDraft[]
	scheduleId?: number
}

interface ScheduleComposeFormProps {
	scheduleId: number | null
	recipients: ScheduleRecipientDraft[]
	existing: Schedule | null
	onDone: () => void
}

/**
 * Edit mode doesn't allow changing recipients — same as mobile, which
 * reuses `existing.recipients` untouched. Media is scoped to images only,
 * matching the supplied design ("Add Images (5 Max)") — the composer
 * doesn't expose video/audio/voice for scheduled messages.
 *
 * Form state is initialized lazily from `existing`/`recipients` rather
 * than hydrated or reset via `useEffect` — this form is only ever
 * rendered by ScheduleComposeDialog while conditionally mounted at the
 * call site (schedule-panel.tsx renders it inside `{composeRecipients &&
 * ...}` / `{editMessageId != null && ...}`), so every open is already a
 * fresh mount with fresh state; there's nothing to reactively reset.
 */
function ScheduleComposeForm({
	scheduleId,
	recipients,
	existing,
	onDone,
}: ScheduleComposeFormProps) {
	const isEditing = scheduleId != null
	const createSchedule = useCreateSchedule()
	const updateSchedule = useUpdateSchedule()

	const effectiveRecipients: ScheduleRecipientDraft[] = isEditing
		? (existing?.recipients ?? []).map((r) => ({
				type: r.type,
				id: r.type === "user" ? r.pkid : r.id,
				name: scheduleRecipientName(r),
				photo: scheduleRecipientPhoto(r),
			}))
		: recipients

	const [content, setContent] = useState(
		() => existing?.content || existing?.recipient_bundles?.[0]?.encrypted_content || "",
	)
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
	// Pre-existing remote image URLs when editing — kept separate from
	// newly-picked local files so we don't re-upload media that's already
	// hosted, and so each can be removed independently.
	const [existingMedia, setExistingMedia] = useState(() =>
		existing ? scheduleMediaUrls(existing) : [],
	)

	const { attachments, addFiles, retryUpload, removeAttachment } = usePendingAttachment(
		"chat",
		SCHEDULE_MAX_IMAGES,
	)

	const totalImageCount = existingMedia.length + attachments.length
	const remainingSlots = Math.max(0, SCHEDULE_MAX_IMAGES - totalImageCount)
	const isPending = createSchedule.isPending || updateSchedule.isPending
	const isImageUploading = attachments.some((a) => a.uploading)

	const handleAddFiles = (files: FileList) => {
		if (remainingSlots <= 0) {
			toast.info(`You can attach up to ${SCHEDULE_MAX_IMAGES} images`)
			return
		}
		addFiles(Array.from(files).slice(0, remainingSlots))
	}

	const handleSubmit = async () => {
		const trimmed = content.trim()
		if (!trimmed) return toast.error("Write a message")
		if (!date || !time) return toast.error("Pick a date and time")

		const scheduledAt = mergeDateAndTime(
			new Date(`${date}T00:00:00`),
			new Date(`1970-01-01T${time}:00`),
		)
		if (!isScheduleDateTimeValid(scheduledAt)) return toast.error("Schedule must be in the future")
		if (effectiveRecipients.length === 0) return toast.error("No recipient selected")
		if (isImageUploading) return toast.info("Wait for images to finish uploading")
		if (attachments.some((a) => a.error))
			return toast.error("Remove or retry the failed image first")

		const mediaUrls = [
			...existingMedia,
			...attachments.filter((a) => a.uploadedUrl).map((a) => a.uploadedUrl as string),
		]

		if (isEditing && scheduleId) {
			await updateSchedule.mutateAsync({
				scheduleId,
				type: "message",
				payload: {
					scheduled_at: scheduledAt.toISOString(),
					recipient_bundles: buildScheduleBundles(effectiveRecipients, trimmed, mediaUrls),
				},
			})
		} else {
			await createSchedule.mutateAsync({
				schedule_type: "message",
				scheduled_at: scheduledAt.toISOString(),
				recipient_bundles: buildScheduleBundles(effectiveRecipients, trimmed, mediaUrls),
			})
		}
		onDone()
	}

	return (
		<div className="flex flex-col gap-5">
			<div>
				<p className="mb-1.5 text-xs font-medium text-muted-foreground">To</p>
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
				<p className="mb-2 text-sm font-semibold">Compose message</p>
				<div className="rounded-2xl border border-border px-3.5 pt-3 pb-2">
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value.slice(0, SCHEDULE_MESSAGE_MAX_CHARS))}
						rows={4}
						placeholder="Write your message"
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
										setContent((prev) => (prev + emoji).slice(0, SCHEDULE_MESSAGE_MAX_CHARS))
									}
									onClose={() => setEmojiOpen(false)}
								/>
							</PopoverContent>
						</Popover>
						<span className="text-xs text-muted-foreground">
							{content.length}/{SCHEDULE_MESSAGE_MAX_CHARS}
						</span>
					</div>
				</div>
			</div>

			<div>
				<div className="mb-2 flex items-center gap-1.5">
					<p className="text-sm font-semibold">Add Images ({SCHEDULE_MAX_IMAGES} Max)</p>
					<Info size={13} className="text-muted-foreground" aria-hidden="true" />
					<span className="sr-only">
						You can attach up to {SCHEDULE_MAX_IMAGES} images to this scheduled message.
					</span>
				</div>

				<div className="grid grid-cols-4 gap-2">
					{existingMedia.map((url, i) => (
						<div
							key={`existing-${url}-${i}`}
							className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={url} alt="" className="h-full w-full object-cover" />
							<button
								type="button"
								onClick={() => setExistingMedia((prev) => prev.filter((u) => u !== url))}
								aria-label="Remove image"
								className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors hover:bg-black/40 hover:text-white"
							>
								<span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45">
									<Trash2 size={14} />
								</span>
							</button>
						</div>
					))}

					{attachments.map((a) => (
						<div key={a.id} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={a.preview} alt="" className="h-full w-full object-cover" />

							{a.uploading && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/60">
									<Loader2 size={16} className="animate-spin text-muted-foreground" />
								</div>
							)}
							{a.error ? (
								<button
									type="button"
									onClick={() => retryUpload(a.id)}
									className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/85"
								>
									<AlertCircle size={16} className="text-destructive" />
									<span className="flex items-center gap-1 text-[10px] font-medium text-primary">
										<RotateCcw size={10} /> Retry
									</span>
								</button>
							) : (
								!a.uploading && (
									<button
										type="button"
										onClick={() => removeAttachment(a.id)}
										aria-label="Remove image"
										className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-colors hover:bg-black/40 hover:text-white"
									>
										<span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/45">
											<Trash2 size={14} />
										</span>
									</button>
								)
							)}
						</div>
					))}

					{remainingSlots > 0 && (
						<label className="flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
							<Plus size={18} />
							<input
								type="file"
								accept="image/*"
								multiple
								className="hidden"
								onChange={(e) => {
									if (e.target.files) handleAddFiles(e.target.files)
									e.target.value = ""
								}}
							/>
						</label>
					)}
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
				disabled={isPending || isImageUploading}
				className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
			>
				{isPending
					? "Saving…"
					: isImageUploading
						? "Uploading images…"
						: isEditing
							? "Save changes"
							: "Create schedule"}
			</button>
		</div>
	)
}

export function ScheduleComposeDialog({
	open,
	onOpenChange,
	recipients,
	scheduleId,
}: ScheduleComposeDialogProps) {
	const isEditing = scheduleId != null
	const { data: existing, isLoading: existingLoading } = useSchedule(scheduleId ?? null)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Message schedule</DialogTitle>
				</DialogHeader>

				{isEditing && existingLoading ? (
					<p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
				) : (
					<ScheduleComposeForm
						key={scheduleId ?? "new"}
						scheduleId={scheduleId ?? null}
						recipients={recipients}
						existing={isEditing ? (existing ?? null) : null}
						onDone={() => onOpenChange(false)}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
