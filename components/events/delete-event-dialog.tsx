"use client"

import { useDeleteEvent } from "@/hooks/events/use-event-mutations"
import { describeEventError } from "@/lib/events/errors"
import { toast } from "@/lib/toast"
import { Loader2, Trash2 } from "lucide-react"
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
import { secondaryButton } from "./event-list"

export const LIVE_DELETE_MESSAGE =
	"This event is live, so it can't be deleted. Ending a live session isn't available in the web app yet."

/**
 * Host-only delete with confirmation (no design exists: assumption A-14). A live event, or one
 * whose session is live, cannot be deleted from here. That is a courtesy, not a security
 * boundary: the BFF repeats the check, but the backend itself does not refuse a live delete
 * (EV-025). Ending a session is Pass 4, so the message says it is not available yet.
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
				className="max-w-xs rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground"
			>
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
				<button
					type="button"
					className={`${secondaryButton} border-destructive/40 text-destructive hover:bg-destructive/10`}
				>
					<Trash2 size={13} aria-hidden />
					Delete
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
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
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-[12.5px] font-semibold text-white transition-all hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-60"
					>
						{del.isPending && <Loader2 size={13} className="animate-spin" aria-hidden />}
						Delete event
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
