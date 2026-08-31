"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useDeleteSchedule, useSchedules } from "@/hooks/messenger/use-schedule"
import {
	schedulePreview,
	scheduleRecipientName,
	scheduleRecipientPhoto,
	type ScheduleRecipientDraft,
} from "@/lib/messenger/schedule"
import type { Schedule } from "@/types/messenger"
import { Calendar, Loader2, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { ScheduleComposeDialog } from "./schedule-compose-dialog"
import { ScheduleRecipientPickerDialog } from "./schedule-recipient-picker-dialog"

interface ScheduledMessagesDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ScheduledMessagesDialog({ open, onOpenChange }: ScheduledMessagesDialogProps) {
	const { data: schedules, isLoading } = useSchedules()
	const deleteSchedule = useDeleteSchedule()

	const [pickerOpen, setPickerOpen] = useState(false)
	const [composeRecipients, setComposeRecipients] = useState<ScheduleRecipientDraft[] | null>(null)
	const [editId, setEditId] = useState<number | null>(null)
	const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null)

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
					<DialogHeader>
						<DialogTitle>Scheduled messages</DialogTitle>
					</DialogHeader>

					<button
						onClick={() => setPickerOpen(true)}
						className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-3 text-left hover:bg-accent/50 transition-colors"
					>
						<span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
							<Calendar size={16} className="text-primary-foreground" />
						</span>
						<span className="text-sm font-medium">New scheduled message</span>
					</button>

					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="flex items-center justify-center py-10">
								<Loader2 size={20} className="animate-spin text-muted-foreground" />
							</div>
						) : !schedules || schedules.length === 0 ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No scheduled messages yet
							</p>
						) : (
							schedules.map((s) => {
								const recipient = s.recipients[0]
								const extraCount = Math.max(0, s.recipients.length - 1)
								const name = recipient ? scheduleRecipientName(recipient) : "Unknown"
								const photo = recipient ? scheduleRecipientPhoto(recipient) : null
								const scheduledAt = new Date(s.scheduled_at)
								return (
									<div key={s.id} className="border-b border-border py-3">
										<div className="flex items-center gap-3">
											<span className="h-10 w-10 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center text-sm font-medium text-muted-foreground">
												{photo ? (
													// eslint-disable-next-line @next/next/no-img-element
													<img src={photo} alt={name} className="h-full w-full object-cover" />
												) : (
													name.charAt(0).toUpperCase()
												)}
											</span>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium truncate">
													{name}
													{extraCount > 0 ? ` +${extraCount}` : ""}
												</p>
												<p className="text-xs text-muted-foreground">
													{scheduledAt.toLocaleDateString(undefined, {
														weekday: "short",
														day: "2-digit",
														month: "short",
														year: "numeric",
													})}
													,{" "}
													{scheduledAt.toLocaleTimeString(undefined, {
														hour: "numeric",
														minute: "2-digit",
													})}
												</p>
											</div>
											<div className="flex items-center gap-3 shrink-0">
												<button
													onClick={() => setEditId(s.id)}
													title="Edit"
													className="text-muted-foreground hover:text-foreground"
												>
													<Pencil size={16} />
												</button>
												<button
													onClick={() => setDeleteTarget(s)}
													title="Delete"
													className="text-muted-foreground hover:text-destructive"
												>
													<Trash2 size={16} />
												</button>
											</div>
										</div>
										<p className="mt-2 text-sm line-clamp-2">{schedulePreview(s)}</p>
									</div>
								)
							})
						)}
					</div>
				</DialogContent>
			</Dialog>

			<ScheduleRecipientPickerDialog
				open={pickerOpen}
				onOpenChange={setPickerOpen}
				onConfirm={(recipients) => setComposeRecipients(recipients)}
			/>

			{composeRecipients && (
				<ScheduleComposeDialog
					open={!!composeRecipients}
					onOpenChange={(o) => !o && setComposeRecipients(null)}
					recipients={composeRecipients}
				/>
			)}

			{editId != null && (
				<ScheduleComposeDialog
					open={editId != null}
					onOpenChange={(o) => !o && setEditId(null)}
					recipients={[]}
					scheduleId={editId}
				/>
			)}

			<Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete scheduled message?</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">This can&apos;t be undone.</p>
					<div className="flex justify-end gap-2 mt-2">
						<button
							onClick={() => setDeleteTarget(null)}
							className="px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={() => {
								if (deleteTarget) deleteSchedule.mutate(deleteTarget.id)
								setDeleteTarget(null)
							}}
							className="px-4 py-2 rounded-full text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
						>
							Delete
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
