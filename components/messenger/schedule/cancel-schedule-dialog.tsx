"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ScheduleType } from "@/types/messenger"

interface CancelScheduleDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	type: ScheduleType | null
	onConfirm: () => void
	isPending?: boolean
}

/**
 * The DELETE endpoint cancels a schedule rather than destroying a record
 * (the backend's own description: "Schedule cancelled.") — the copy here
 * reflects that semantics regardless of which trash/cancel icon triggered it.
 */
export function CancelScheduleDialog({
	open,
	onOpenChange,
	type,
	onConfirm,
	isPending,
}: CancelScheduleDialogProps) {
	const isReminder = type === "reminder"

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>{isReminder ? "Cancel reminder?" : "Cancel scheduled message?"}</DialogTitle>
				</DialogHeader>

				<p className="text-sm text-muted-foreground">
					{isReminder
						? "This reminder won't trigger."
						: "This message won't be sent to the selected recipients."}
				</p>

				<div className="mt-2 flex justify-end gap-2">
					<button
						onClick={() => onOpenChange(false)}
						disabled={isPending}
						className="px-4 py-2 rounded-full text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
					>
						{isReminder ? "Keep reminder" : "Keep schedule"}
					</button>
					<button
						onClick={onConfirm}
						disabled={isPending}
						className="px-4 py-2 rounded-full text-sm font-medium bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						{isPending ? "Cancelling…" : isReminder ? "Cancel reminder" : "Cancel schedule"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
