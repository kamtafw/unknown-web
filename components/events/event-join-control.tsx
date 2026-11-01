"use client"

import { useEventGuests } from "@/hooks/events/use-event-guests"
import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import { useJoinEvent } from "@/hooks/events/use-join-event"
import { useLeaveEvent } from "@/hooks/events/use-leave-event"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import { cn } from "@/lib/utils"
import type { EventDetails } from "@/types/events/api"
import { CheckCircle2, Loader2, LogOut, Radio } from "lucide-react"
import { useState } from "react"
import { EventLiveAudioListener } from "./event-live-audio-listener"
import {
	IconBadge,
	buttonLarge,
	fieldInput,
	panel,
	primaryButton,
	secondaryButton,
	sectionHeading,
} from "./event-ui"

export function EventJoinControl({ details }: { details: EventDetails }) {
	const eventId = details.id
	const [passcode, setPasscode] = useState("")
	const [joinedLocally, setJoinedLocally] = useState(false)
	const [leftLocally, setLeftLocally] = useState(false)
	const [localSessionId, setLocalSessionId] = useState<number | null>(null)
	const liveSession = useEventLiveSession(details)
	// The guest-list endpoint is available only to hosts and viewers with a persistent guest row.
	// A successful read therefore confirms membership even when no live session is active.
	const guestList = useEventGuests(eventId, EVENTS_PAGE_SIZE, details.kind === "full")
	const hasGuestRecord =
		details.kind === "full" && guestList.hasLoaded && guestList.error !== "forbidden"
	const sessionId =
		localSessionId ?? (liveSession.state?.session.isJoined ? liveSession.state.session.id : null)
	const isLiveEvent =
		details.isLive || (details.kind === "full" && details.liveSessionStatus === "live")
	const canLeave =
		!leftLocally &&
		(joinedLocally ||
			liveSession.state?.session.isJoined === true ||
			(hasGuestRecord && !isLiveEvent))
	const {
		join,
		isPending: isJoining,
		errorMessage: joinError,
		clearError: clearJoinError,
	} = useJoinEvent(eventId)
	const {
		leave,
		isPending: isLeaving,
		errorMessage: leaveError,
		clearError: clearLeaveError,
	} = useLeaveEvent(eventId, sessionId)

	async function submit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		clearJoinError()
		const result = await join(details.isLocked ? passcode : undefined)
		if (result !== false) {
			setPasscode("")
			setLeftLocally(false)
			setJoinedLocally(true)
			setLocalSessionId(result)
		}
	}

	async function submitLeave() {
		clearLeaveError()
		const success = await leave()
		if (success) {
			// The audio listener unmounts immediately; the backend leave has already succeeded.
			setJoinedLocally(false)
			setLocalSessionId(null)
			setLeftLocally(true)
		}
	}

	if (canLeave) {
		return (
			<div className="flex flex-col gap-3">
				<div
					role="status"
					className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-[13px] text-foreground"
				>
					<IconBadge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
						<CheckCircle2 size={17} />
					</IconBadge>
					<p className="leading-snug">
						{sessionId !== null
							? "You've joined the event. Connecting to live audio…"
							: "You're on the guest list for this event."}
					</p>
				</div>
				{sessionId !== null && <EventLiveAudioListener sessionId={sessionId} />}
				{leaveError && (
					<p role="alert" className="text-[12px] text-destructive">
						{leaveError}
					</p>
				)}
				<div>
					<button
						type="button"
						onClick={() => void submitLeave()}
						disabled={isLeaving}
						className={secondaryButton}
					>
						{isLeaving ? (
							<Loader2 size={13} className="animate-spin" aria-hidden />
						) : (
							<LogOut size={13} aria-hidden />
						)}
						{isLeaving ? "Leaving…" : "Leave event"}
					</button>
				</div>
			</div>
		)
	}

	if (!isLiveEvent) return null

	return (
		<form onSubmit={submit} className={cn(panel, "flex flex-col gap-4")}>
			<div className="flex items-center gap-3">
				<IconBadge tone="danger">
					<Radio size={16} />
				</IconBadge>
				<div className="min-w-0">
					<h2 className={sectionHeading}>Join this live event</h2>
					<p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
						Join the event before connecting to live audio.
					</p>
				</div>
			</div>
			{details.isLocked && (
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor={`event-${eventId}-passcode`}
						className="text-[12.5px] font-semibold text-foreground"
					>
						Four-digit passcode
					</label>
					<input
						id={`event-${eventId}-passcode`}
						name="passcode"
						type="password"
						inputMode="numeric"
						autoComplete="one-time-code"
						pattern="[0-9]{4}"
						maxLength={4}
						minLength={4}
						required
						value={passcode}
						onChange={(event) => {
							setPasscode(event.target.value.replace(/[^0-9]/g, "").slice(0, 4))
							if (joinError) clearJoinError()
						}}
						aria-invalid={Boolean(joinError)}
						className={cn(fieldInput, "w-36 text-center text-[15px] tracking-[0.45em]")}
						placeholder="0000"
					/>
				</div>
			)}
			{joinError && (
				<p role="alert" className="text-[12px] text-destructive">
					{joinError}
				</p>
			)}
			<button
				type="submit"
				disabled={isJoining || (details.isLocked && !/^\d{4}$/.test(passcode))}
				className={cn(primaryButton, buttonLarge, "w-full sm:w-auto sm:self-start")}
			>
				{isJoining && <Loader2 size={14} className="animate-spin" aria-hidden />}
				{isJoining ? "Joining…" : "Join event"}
			</button>
		</form>
	)
}
