"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteSchedule, useSchedules } from "@/hooks/messenger/use-schedule"
import type { ScheduleRecipientDraft } from "@/lib/messenger/schedule"
import { cn } from "@/lib/utils"
import type { Schedule, ScheduleType } from "@/types/messenger"
import { AlertCircle, ArrowLeft, Bell } from "lucide-react"
import Link from "next/link"
import { DropdownMenu } from "radix-ui"
import { useState } from "react"
import { ChatListEmptyState } from "../chat-list/chat-list-empty-state"
import { FAB, Schedule as ScheduleIcon } from "../icons/group-list-icons"
import { CancelScheduleDialog } from "./cancel-schedule-dialog"
import { ReminderComposeDialog } from "./reminder-compose-dialog"
import { ScheduleComposeDialog } from "./schedule-compose-dialog"
import { ScheduleRecipientPickerDialog } from "./schedule-recipient-picker-dialog"
import { ScheduleRow } from "./schedule-row"

const TABS: { type: ScheduleType; label: string }[] = [
	{ type: "message", label: "Messages" },
	{ type: "reminder", label: "Reminder" },
]

function ScheduleListSkeleton() {
	return (
		<div className="px-4 py-2 space-y-4">
			{[...Array(5)].map((_, i) => (
				<div key={i} className="flex items-start gap-3">
					<Skeleton className="h-11 w-11 shrink-0 rounded-full" />
					<div className="flex-1 space-y-2 pt-1">
						<Skeleton className="h-3.5 w-2/3" />
						<Skeleton className="h-3 w-4/5" />
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * Routed Schedule screen — the equivalent of ArchiveListPanel for the
 * Schedule feature. Reached only via the Chats/Groups FAB, never via the
 * rail (same as Archive). Call scheduling is deliberately not exposed
 * anywhere here: TABS only lists message/reminder, and every list fetch
 * below is explicit about which type it wants — see DECISIONS.md.
 */
export function SchedulePanel() {
	const [tab, setTab] = useState<ScheduleType>("message")
	const { data: schedules, isLoading, isError, refetch } = useSchedules(tab)

	const [pickerOpen, setPickerOpen] = useState(false)
	const [composeRecipients, setComposeRecipients] = useState<ScheduleRecipientDraft[] | null>(null)
	const [editMessageId, setEditMessageId] = useState<number | null>(null)
	const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
	const [editReminderId, setEditReminderId] = useState<number | null>(null)
	const [cancelTarget, setCancelTarget] = useState<Schedule | null>(null)

	const deleteSchedule = useDeleteSchedule()

	const handleEdit = (schedule: Schedule) => {
		if (schedule.schedule_type === "reminder") {
			setEditReminderId(schedule.id)
			setReminderDialogOpen(true)
		} else {
			setEditMessageId(schedule.id)
		}
	}

	const handleConfirmCancel = () => {
		if (!cancelTarget) return
		deleteSchedule.mutate(
			{ scheduleId: cancelTarget.id, type: cancelTarget.schedule_type },
			{ onSuccess: () => setCancelTarget(null) },
		)
	}

	const items = schedules ?? []
	const isMessagesTab = tab === "message"

	return (
		<div className="relative w-full sm:w-90 shrink-0 border-r border-border flex flex-col h-full bg-background">
			<div className="flex items-center gap-2 px-4 pt-4 pb-3">
				<Link
					href="/messenger"
					className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
				>
					<ArrowLeft size={18} />
				</Link>
				<h1 className="text-xl font-bold">Schedule</h1>
			</div>

			<div className="px-4 pb-3">
				<div className="flex w-full items-center gap-1 p-1 rounded-full bg-muted">
					{TABS.map((t) => (
						<button
							key={t.type}
							onClick={() => setTab(t.type)}
							className={cn(
								"flex-1 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
								tab === t.type ? "bg-background shadow-sm" : "text-muted-foreground",
							)}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			<ScrollArea className="flex-1">
				<div className="w-0 min-w-full">
					{isLoading ? (
						<ScheduleListSkeleton />
					) : isError ? (
						<div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
							<AlertCircle size={28} className="text-muted-foreground" />
							<p className="text-sm text-muted-foreground">Unable to load your schedules.</p>
							<button
								onClick={() => refetch()}
								className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
							>
								Try again
							</button>
						</div>
					) : items.length === 0 ? (
						<ChatListEmptyState
							icon={isMessagesTab ? ScheduleIcon : Bell}
							title={isMessagesTab ? "No scheduled messages" : "No reminders yet"}
							description={
								isMessagesTab
									? "Schedule a message to a chat or group and it'll be sent automatically."
									: "Create a reminder and it'll show up here until it's due."
							}
							action={{
								label: isMessagesTab ? "Schedule a message" : "Add a reminder",
								onClick: () => (isMessagesTab ? setPickerOpen(true) : setReminderDialogOpen(true)),
							}}
						/>
					) : (
						items.map((schedule) => (
							<ScheduleRow
								key={schedule.id}
								schedule={schedule}
								onEdit={() => handleEdit(schedule)}
								onCancel={() => setCancelTarget(schedule)}
							/>
						))
					)}
				</div>
			</ScrollArea>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<button
						title="New"
						className="absolute bottom-7 right-7 h-14 w-14 rounded-full flex items-center justify-center text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
					>
						<FAB />
					</button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Portal>
					<DropdownMenu.Content
						align="end"
						side="top"
						sideOffset={10}
						className="z-150 bg-transparent backdrop-blur-md border-0 px-2 shadow-none outline-none rounded-2xl
							data-[state=open]:animate-in data-[state=closed]:animate-out
							data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
							data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
					>
						<div className="flex flex-col items-end gap-2">
							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => setReminderDialogOpen(true)}
							>
								<span className="text-[13px] text-foreground">Add reminder</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<Bell size={18} className="text-primary" />
								</div>
							</DropdownMenu.Item>

							<DropdownMenu.Item
								className="flex items-center gap-2 outline-none"
								onSelect={() => setPickerOpen(true)}
							>
								<span className="text-[13px] text-foreground">Schedule message</span>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-lg">
									<ScheduleIcon />
								</div>
							</DropdownMenu.Item>
						</div>
					</DropdownMenu.Content>
				</DropdownMenu.Portal>
			</DropdownMenu.Root>

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

			{editMessageId != null && (
				<ScheduleComposeDialog
					open={editMessageId != null}
					onOpenChange={(o) => !o && setEditMessageId(null)}
					recipients={[]}
					scheduleId={editMessageId}
				/>
			)}

			<ReminderComposeDialog
				open={reminderDialogOpen}
				onOpenChange={(o) => {
					setReminderDialogOpen(o)
					if (!o) setEditReminderId(null)
				}}
				scheduleId={editReminderId}
			/>

			<CancelScheduleDialog
				open={!!cancelTarget}
				onOpenChange={(o) => !o && setCancelTarget(null)}
				type={cancelTarget?.schedule_type ?? null}
				onConfirm={handleConfirmCancel}
				isPending={deleteSchedule.isPending}
			/>
		</div>
	)
}
