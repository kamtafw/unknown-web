"use client"

import { useEventLiveSessionControls } from "@/hooks/events/use-event-live-session-controls"
import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import { EventLiveAudioPublisher } from "./event-live-audio-publisher"
import { toast } from "@/lib/toast"
import type { EventFullDetails } from "@/types/events/api"
import { Loader2, Radio } from "lucide-react"
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
	const createAvailable =
		details.liveSessionId === null && !details.isLive && status === "disabled"

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
		<section
			aria-label="Live session controls"
			className="flex flex-col gap-3 rounded-xl border border-border p-3.5"
		>
			<div className="flex items-center gap-2">
				<Radio size={15} className="text-primary" aria-hidden />
				<h2 className="text-[13px] font-bold text-foreground">Host live session</h2>
			</div>

			{createAvailable ? (
				<>
					<p className="text-[12.5px] leading-relaxed text-muted-foreground">
						Create a waiting session, then start it and grant microphone access to broadcast from this browser.
					</p>
					<button
						type="button"
						onClick={() => void createSession()}
						disabled={controls.isPending}
						className={secondaryButton}
					>
						{controls.isPending && <Loader2 size={13} className="animate-spin" aria-hidden />}
						Create live session
					</button>
				</>
			) : status === "loading" ? (
				<p role="status" aria-busy="true" className="text-[12.5px] text-muted-foreground">
					Checking live session…
				</p>
			) : status === "ready" && session ? (
				<>
					<p role="status" className="text-[12.5px] text-foreground">
						Session status: <span className="font-semibold">{session.status}</span>
					</p>
					{(session.status === "waiting" || session.status === "live") && (
						<EventLiveAudioPublisher
							sessionId={session.id}
							sessionStatus={session.status}
							onStart={session.status === "waiting" ? controls.start : undefined}
						/>
					)}
					{(session.status === "ended" || session.status === "cancelled") && (
						<p className="text-[12.5px] leading-relaxed text-muted-foreground">
							This session cannot be restarted. The backend does not recreate an ended attached
							session; a new-session workflow needs separate support.
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
							<AlertDialogTrigger asChild>
								<button
									type="button"
									disabled={controls.isPending}
									className={`${secondaryButton} border-destructive/40 text-destructive hover:bg-destructive/10`}
								>
									End live session
								</button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>End this live session?</AlertDialogTitle>
									<AlertDialogDescription>
										This ends the session for everyone. The attached session cannot be restarted.
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
										className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-[12.5px] font-semibold text-white transition-all hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:opacity-60"
									>
										{controls.isPending && <Loader2 size={13} className="animate-spin" aria-hidden />}
										End session
									</button>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					)}
				</>
			) : status === "error" || status === "unavailable" || status === "not_admitted" ? (
				<div className="flex flex-wrap items-center gap-3">
					<p role="alert" className="text-[12.5px] text-muted-foreground">
						We couldn&apos;t confirm the live session state. No lifecycle action is available until
						the state can be checked.
					</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className={secondaryButton}
					>
						Retry
					</button>
				</div>
			) : (
				<p className="text-[12.5px] text-muted-foreground">
					No live-session controls are available for the current event state.
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
