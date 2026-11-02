"use client"

import { useDeleteEvent } from "@/hooks/events/use-event-mutations"
import { describeEventError } from "@/lib/events/errors"
import { toast } from "@/lib/toast"
import { Info, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog"
import { destructiveButton, destructiveOutlineButton, IconBadge, secondaryButton } from "./event-ui"

export const LIVE_DELETE_MESSAGE =
	"This event is live, so it can't be deleted until its live session has ended."

/**
 * Host-only delete with confirmation. A live event, or one whose session is live, cannot be
 * deleted from here. That is a courtesy, not a security boundary: the BFF repeats the check,
 * but the backend itself does not refuse a live delete.
 */
export function DeleteEventDialog({
	eventId,
	eventName,
	liveBlocked,
	onDeleted,
}: {
	eventId: string
	eventName: string
	liveBlocked: boolean
	onDeleted: () => void
}) {
	const [open, setOpen] = useState(false)
	const del = useDeleteEvent(eventId)

	if (liveBlocked) {
		return (
			<p
				role="note"
				className="flex max-w-xs items-start gap-2 rounded-xl bg-muted/60 px-3 py-2 text-[12px] leading-relaxed text-muted-foreground"
			>
				<Info size={14} aria-hidden className="mt-0.5 shrink-0" />
				{LIVE_DELETE_MESSAGE}
			</p>
		)
	}

	const error = del.isError ? describeEventError(del.error) : null

	const confirm = () => {
		del.mutate(undefined, {
			onSuccess: () => {
				setOpen(false)
				toast.success("Event deleted")
				onDeleted()
			},
			onError: (e) => {
				// already gone: the hook has cleaned up, so leave the screen too
				if (describeEventError(e).kind === "not_found") {
					setOpen(false)
					onDeleted()
				}
			},
		})
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (del.isPending) return
				setOpen(next)
				if (!next) del.reset()
			}}
		>
			<AlertDialogTrigger asChild>
				<button type="button" className={destructiveOutlineButton}>
					<Trash2 size={13} aria-hidden />
					Delete
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent className="rounded-2xl">
				<AlertDialogHeader>
					<IconBadge tone="danger" className="mb-1 size-11 self-center sm:self-start">
						<Trash2 size={18} />
					</IconBadge>
					<AlertDialogTitle>Delete this event?</AlertDialogTitle>
					<AlertDialogDescription>
						“{eventName}” will be permanently deleted for everyone. This can&apos;t be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<p role="alert" className="text-[13px] font-medium text-destructive">
						{error.kind === "live" ? LIVE_DELETE_MESSAGE : error.message}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={del.isPending} className={secondaryButton}>
						Keep event
					</AlertDialogCancel>
					<button
						type="button"
						onClick={confirm}
						disabled={del.isPending}
						className={destructiveButton}
					>
						{del.isPending && <Loader2 size={13} className="animate-spin" aria-hidden />}
						Delete event
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
