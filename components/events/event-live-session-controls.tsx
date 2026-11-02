"use client"

import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import { useEventLiveSessionControls } from "@/hooks/events/use-event-live-session-controls"
import { toast } from "@/lib/toast"
import type { EventFullDetails } from "@/types/events/api"
import { Loader2, Radio, RefreshCw, Square } from "lucide-react"
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
import { EventLiveAudioPublisher } from "./event-live-audio-publisher"
import { LIVE_SESSION_STATUS_LABEL } from "./event-live-session-status"
import {
	destructiveButton,
	destructiveOutlineButton,
	IconBadge,
	panel,
	primaryButton,
	secondaryButton,
	sectionHeading,
	StatusPill,
} from "./event-ui"

export function EventLiveSessionControls({
	details,
	isHost,
}: {
	details: EventFullDetails
	isHost: boolean
}) {
	const [endDialogOpen, setEndDialogOpen] = useState(false)
	const controls = useEventLiveSessionControls(details.id)
	const { status, state, refetch } = useEventLiveSession(details)

	if (!isHost) return null

	const session = state?.session
	const canEnd = session?.status === "waiting" || session?.status === "live"
	const createAvailable = details.liveSessionId === null && !details.isLive && status === "disabled"

	const createSession = async () => {
		const succeeded = await controls.create()
		if (succeeded) toast.success("Live session created")
	}

	const endSession = async () => {
		const succeeded = await controls.end()
		if (succeeded) {
			setEndDialogOpen(false)
			toast.success("Live session ended")
		}
	}

	return (
		<section aria-label="Live session controls" className={`${panel} flex flex-col gap-3.5`}>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<IconBadge>
						<Radio size={16} />
					</IconBadge>
					<h2 className={sectionHeading}>Host live session</h2>
				</div>
				{status === "ready" && session && (
					<StatusPill
						tone={session.status === "live" ? "live" : "neutral"}
						dot={session.status === "live"}
						pulse={session.status === "live"}
					>
						{LIVE_SESSION_STATUS_LABEL[session.status]}
					</StatusPill>
				)}
			</div>

			{createAvailable ? (
				<>
					<p className="text-[12.5px] leading-relaxed text-muted-foreground">
						Set up a live session for this event, then go live from this browser with your
						microphone.
					</p>
					<div>
						<button
							type="button"
							onClick={() => void createSession()}
							disabled={controls.isPending}
							className={secondaryButton}
						>
							{controls.isPending && <Loader2 size={13} className="animate-spin" aria-hidden />}
							Create live session
						</button>
					</div>
				</>
			) : status === "loading" ? (
				<p role="status" aria-busy="true" className="text-[12.5px] text-muted-foreground">
					Checking live session…
				</p>
			) : status === "ready" && session ? (
				<>
					<p role="status" className="sr-only">
						Session status: {LIVE_SESSION_STATUS_LABEL[session.status]}
					</p>
					{(session.status === "waiting" || session.status === "live") && (
						<EventLiveAudioPublisher
							key={session.id}
							sessionId={session.id}
							sessionStatus={session.status}
							onStart={session.status === "waiting" ? controls.start : undefined}
						/>
					)}
					{(session.status === "ended" || session.status === "cancelled") && (
						<p className="text-[12.5px] leading-relaxed text-muted-foreground">
							{session.status === "ended"
								? "This live session has ended and can't be restarted."
								: "This live session was cancelled and can't be restarted."}
						</p>
					)}
					{canEnd && (
						<AlertDialog
							open={endDialogOpen}
							onOpenChange={(next) => {
								if (controls.isPending) return
								setEndDialogOpen(next)
								if (!next) controls.clearError()
							}}
						>
							<div className="border-t border-border pt-3.5">
								<AlertDialogTrigger asChild>
									<button
										type="button"
										disabled={controls.isPending}
										className={destructiveOutlineButton}
									>
										<Square size={12} aria-hidden className="fill-current" />
										End live session
									</button>
								</AlertDialogTrigger>
							</div>
							<AlertDialogContent className="rounded-2xl">
								<AlertDialogHeader>
									<AlertDialogTitle>End this live session?</AlertDialogTitle>
									<AlertDialogDescription>
										This ends the session for everyone. It can&apos;t be restarted afterwards.
									</AlertDialogDescription>
								</AlertDialogHeader>
								{controls.errorMessage && (
									<p role="alert" className="text-[13px] font-medium text-destructive">
										{controls.errorMessage}
									</p>
								)}
								<AlertDialogFooter>
									<AlertDialogCancel disabled={controls.isPending} className={secondaryButton}>
										Keep session
									</AlertDialogCancel>
									<button
										type="button"
										onClick={() => void endSession()}
										disabled={controls.isPending}
										className={destructiveButton}
									>
										{controls.isPending && (
											<Loader2 size={13} className="animate-spin" aria-hidden />
										)}
										End session
									</button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</>
			) : status === "error" || status === "unavailable" || status === "not_admitted" ? (
				<div role="alert" className="flex flex-col gap-3">
					<p className="text-[12.5px] leading-relaxed text-muted-foreground">
						We couldn&apos;t check the live session. Try again to see what you can do.
					</p>
					<div>
						<button type="button" onClick={() => void refetch()} className={primaryButton}>
							<RefreshCw size={12} aria-hidden />
							Retry
						</button>
					</div>
				</div>
			) : (
				<p className="text-[12.5px] text-muted-foreground">
					Live sessions aren&apos;t available for this event right now.
				</p>
			)}

			{controls.errorMessage && !endDialogOpen && (
				<p role="alert" className="text-[12.5px] font-medium text-destructive">
					{controls.errorMessage}
				</p>
			)}
		</section>
	)
}
