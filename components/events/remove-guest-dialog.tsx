"use client"

import { useRemoveEventGuest } from "@/hooks/events/use-remove-event-guest"
import type { EventErrorKind } from "@/lib/events/errors"
import { toast } from "@/lib/toast"
import type { EventGuest } from "@/types/events/api"
import { Loader2 } from "lucide-react"
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

/** local wording; the shared error helper maps every 404 to "event gone" and is left unchanged */
export function removeGuestErrorText(kind: EventErrorKind): string {
	switch (kind) {
		case "forbidden":
			return "Only event hosts can remove guests."
		case "not_found":
			return "This event isn't available. It may have been deleted."
		case "unauthorized":
			return "Your session has expired. Sign in again."
		case "network":
			return "Network error. Check your connection and try again."
		case "server":
			return "AppsCombo is having trouble right now. Please try again shortly."
		case "validation":
			return "That guest can't be removed."
		default:
			return "Couldn't remove this guest. Please try again."
	}
}

/**
 * Host-only "Remove" action for one guest row, with a confirmation (P3-08A). `isHost` only decides
 * whether the button is shown; the server stays authoritative. Cancel sends nothing. While the
 * request is pending the dialog cannot be dismissed and confirm is disabled.
 */
export function RemoveGuestDialog({ eventId, guest }: { eventId: string; guest: EventGuest }) {
	const [open, setOpen] = useState(false)
	const { remove, isPending, error, clearError } = useRemoveEventGuest(eventId)

	function onOpenChange(next: boolean) {
		if (isPending) return
		setOpen(next)
		if (!next) clearError()
	}

	async function confirm() {
		const result = await remove(guest.userId)
		if (result === false) return
		setOpen(false)
		toast.success(
			result === "already_removed"
				? `${guest.name} was already removed.`
				: `${guest.name} was removed.`,
		)
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogTrigger asChild>
				<button
					type="button"
					aria-label={`Remove ${guest.name}`}
					className="shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
				>
					Remove
				</button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Remove {guest.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						This removes {guest.name} from the event guest list and also deletes their comments in
						this event. This can&apos;t be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{error && (
					<p role="alert" className="text-[12.5px] font-medium text-destructive">
						{removeGuestErrorText(error)}
					</p>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending} className={secondaryButton}>
						Keep guest
					</AlertDialogCancel>
					<button
						type="button"
						onClick={() => void confirm()}
						disabled={isPending}
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-[13px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 disabled:opacity-60"
					>
						{isPending && <Loader2 size={13} aria-hidden className="animate-spin" />}
						{isPending ? "Removing…" : error ? "Try again" : "Remove guest"}
					</button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
