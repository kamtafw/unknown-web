"use client"

import {
	formatScheduleDateTime,
	schedulePreview,
	scheduleRecipientName,
	scheduleRecipientPhoto,
	scheduleRecipientsSummary,
} from "@/lib/messenger/schedule"
import { cn } from "@/lib/utils"
import type { Schedule } from "@/types/messenger"
import { AlertCircle, Bell, CheckCircle2, Pencil, Trash2, Users, XCircle } from "lucide-react"
import { Avatar } from "radix-ui"

interface ScheduleRowProps {
	schedule: Schedule
	onEdit: () => void
	onCancel: () => void
}

const STATUS_META: Record<
	Exclude<Schedule["status"], "pending">,
	{ label: string; icon: typeof CheckCircle2; className: string }
> = {
	sent: { label: "Sent", icon: CheckCircle2, className: "text-emerald-600" },
	failed: { label: "Failed", icon: AlertCircle, className: "text-destructive" },
	cancelled: { label: "Cancelled", icon: XCircle, className: "text-muted-foreground" },
}

function MessageLeading({ schedule }: { schedule: Schedule }) {
	const { primary } = scheduleRecipientsSummary(schedule)
	if (!primary) {
		return (
			<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<Users size={18} />
			</span>
		)
	}
	const name = scheduleRecipientName(primary)
	const photo = scheduleRecipientPhoto(primary)
	return (
		<Avatar.Root className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted flex items-center justify-center">
			<Avatar.Image src={photo ?? undefined} alt={name} className="h-full w-full object-cover" />
			<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
				{name.charAt(0).toUpperCase()}
			</Avatar.Fallback>
		</Avatar.Root>
	)
}

export function ScheduleRow({ schedule, onEdit, onCancel }: ScheduleRowProps) {
	const isReminder = schedule.schedule_type === "reminder"
	const isPending = schedule.status === "pending"
	const preview = schedulePreview(schedule)
	const dateTimeLabel = formatScheduleDateTime(schedule.scheduled_at)

	const { primary, extraCount } = scheduleRecipientsSummary(schedule)
	const recipientLabel = primary
		? `${scheduleRecipientName(primary)}${extraCount > 0 ? ` +${extraCount}` : ""}`
		: null

	const statusMeta = !isPending
		? STATUS_META[schedule.status as Exclude<Schedule["status"], "pending">]
		: null

	return (
		<div
			className={cn(
				"group flex items-start gap-3 px-4 py-3 border-b border-border/60 transition-colors",
				isPending && "hover:bg-accent/40",
			)}
		>
			{isReminder ? (
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
					<Bell size={18} />
				</span>
			) : (
				<MessageLeading schedule={schedule} />
			)}

			<div className="min-w-0 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<span className="font-semibold text-sm truncate">
						{isReminder ? dateTimeLabel : (recipientLabel ?? "Unknown recipient")}
					</span>
					{!isReminder && (
						<span className="text-xs text-muted-foreground shrink-0">{dateTimeLabel}</span>
					)}
				</div>

				<p className="mt-0.5 text-sm text-muted-foreground line-clamp-2 wrap-break-word">
					{preview}
				</p>

				{statusMeta && (
					<span
						className={cn(
							"mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
							statusMeta.className,
						)}
					>
						<statusMeta.icon size={12} />
						{statusMeta.label}
					</span>
				)}
			</div>

			{isPending && (
				<div className="flex shrink-0 items-center gap-1">
					<button
						onClick={onEdit}
						title={isReminder ? "Edit reminder" : "Edit scheduled message"}
						aria-label={isReminder ? "Edit reminder" : "Edit scheduled message"}
						className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
					>
						<Pencil size={15} />
					</button>
					<button
						onClick={onCancel}
						title={isReminder ? "Cancel reminder" : "Cancel scheduled message"}
						aria-label={isReminder ? "Cancel reminder" : "Cancel scheduled message"}
						className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
					>
						<Trash2 size={15} />
					</button>
				</div>
			)}
		</div>
	)
}
