"use client"

import { cn } from "@/lib/utils"
import type { Room as LiveKitRoom } from "livekit-client"
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import {
	StatusPill,
	buttonLarge,
	destructiveOutlineButton,
	primaryButton,
	secondaryButton,
} from "./event-ui"
import { useEventsSocket } from "./events-socket-provider"

type PublisherStatus = "idle" | "connecting" | "publishing" | "muted" | "error" | "ended"

const PUBLISHER_LABEL: Record<PublisherStatus, string> = {
	idle: "Not connected",
	connecting: "Connecting",
	publishing: "On air",
	muted: "Muted",
	error: "Couldn't connect",
	ended: "Ended",
}

const PUBLISHER_TONE: Record<
	PublisherStatus,
	"neutral" | "live" | "success" | "warning" | "danger"
> = {
	idle: "neutral",
	connecting: "warning",
	publishing: "live",
	muted: "warning",
	error: "danger",
	ended: "neutral",
}

type Credentials = {
	server_url: string
	token: string
	room: string
	identity: string
	permissions: {
		can_subscribe: boolean
		can_publish_microphone: boolean
	}
}

function parseCredentials(value: unknown): Credentials | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null
	const data = value as Record<string, unknown>
	const permissions = data.permissions
	if (!permissions || typeof permissions !== "object" || Array.isArray(permissions)) return null
	const permissionData = permissions as Record<string, unknown>
	if (
		typeof data.server_url !== "string" ||
		!/^wss?:\/\//i.test(data.server_url) ||
		typeof data.token !== "string" ||
		!data.token ||
		typeof data.room !== "string" ||
		!data.room ||
		typeof data.identity !== "string" ||
		!data.identity ||
		typeof permissionData.can_subscribe !== "boolean" ||
		typeof permissionData.can_publish_microphone !== "boolean"
	)
		return null
	return {
		server_url: data.server_url,
		token: data.token,
		room: data.room,
		identity: data.identity,
		permissions: {
			can_subscribe: permissionData.can_subscribe,
			can_publish_microphone: permissionData.can_publish_microphone,
		},
	}
}

export function EventLiveAudioPublisher({
	sessionId,
	sessionStatus,
	onStart,
}: {
	sessionId: number
	sessionStatus: "waiting" | "live"
	onStart?: () => Promise<boolean>
}) {
	const { manager } = useEventsSocket()
	const [status, setStatus] = useState<PublisherStatus>("idle")
	const [message, setMessage] = useState(
		sessionStatus === "waiting"
			? "Start the session and connect your microphone to go live."
			: "Connect your microphone to broadcast.",
	)
	const [hasStarted, setHasStarted] = useState(sessionStatus === "live")
	const [isBusy, setIsBusy] = useState(false)
	const roomRef = useRef<LiveKitRoom | null>(null)
	const generation = useRef(0)
	const sessionEnded = useRef(false)

	useEffect(() => {
		if (sessionStatus === "live") setHasStarted(true)
	}, [sessionStatus])

	useEffect(() => {
		return () => {
			sessionEnded.current = true
			generation.current += 1
			const room = roomRef.current
			roomRef.current = null
			if (room) void room.disconnect()
		}
	}, [])

	useEffect(() => {
		if (!manager) return
		const stopForServerEnd = (message: string) => (payload: unknown) => {
			if (!payload || typeof payload !== "object" || Array.isArray(payload)) return
			if ((payload as Record<string, unknown>).session_id !== sessionId) return

			// Invalidate in-flight credential/connect work as well as disconnecting
			// an established LiveKit room before the HTTP state refetch completes.
			sessionEnded.current = true
			generation.current += 1
			const room = roomRef.current
			roomRef.current = null
			setIsBusy(false)
			setStatus("ended")
			setMessage(message)
			if (room) void room.disconnect()
		}
		const offEnded = manager.on(
			"live:session:ended",
			stopForServerEnd("The live session has ended."),
		)
		const offCancelled = manager.on(
			"live:session:cancelled",
			stopForServerEnd("The live session was cancelled."),
		)
		return () => {
			offEnded()
			offCancelled()
		}
	}, [manager, sessionId])

	async function disconnect() {
		const room = roomRef.current
		roomRef.current = null
		if (room) await room.disconnect()
		setStatus("idle")
		setMessage("Microphone disconnected.")
	}

	async function connectAndPublish() {
		if (sessionEnded.current || isBusy || roomRef.current) return
		setIsBusy(true)
		const current = ++generation.current
		let room: LiveKitRoom | null = null
		setStatus("connecting")
		setMessage("Requesting host media permissions…")
		try {
			if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
				throw new Error(
					"Microphone access requires a secure connection (HTTPS) and a supported browser.",
				)
			}
			const response = await fetch(`/api/events/live-sessions/${sessionId}/media-credentials`, {
				method: "POST",
				headers: { Accept: "application/json" },
				cache: "no-store",
			})
			const body = await response.json().catch(() => null)
			if (!response.ok) {
				if (response.status === 401) throw new Error("Sign in again to broadcast.")
				if (response.status === 403)
					throw new Error("You are not currently admitted to this live session.")
				if (response.status === 400) throw new Error("Live audio isn't set up for this session.")
				throw new Error("Could not retrieve live audio permissions. Try again.")
			}
			const credentials = parseCredentials(body?.data ?? body)
			if (!credentials) throw new Error("Couldn't start live audio. Please try again.")
			if (!credentials.permissions.can_publish_microphone) {
				throw new Error(
					"Your current live-session role does not have microphone publishing permission.",
				)
			}

			const { Room, RoomEvent } = await import("livekit-client")
			if (current !== generation.current) return
			room = new Room({ adaptiveStream: false, dynacast: true })
			roomRef.current = room
			room.on(RoomEvent.Disconnected, () => {
				if (current !== generation.current) return
				roomRef.current = null
				setStatus("idle")
				setMessage("The live audio connection ended. Reconnect to continue broadcasting.")
			})
			await room.connect(credentials.server_url, credentials.token, {
				autoSubscribe: credentials.permissions.can_subscribe,
			})
			if (current !== generation.current) {
				await room.disconnect()
				return
			}
			if (
				room.name !== credentials.room ||
				room.localParticipant.identity !== credentials.identity
			) {
				throw new Error("Couldn't connect to the live audio room. Please try again.")
			}
			await room.localParticipant.setMicrophoneEnabled(true)
			if (current !== generation.current) {
				await room.disconnect()
				return
			}
			setStatus("publishing")
			setMessage("You are live. Your microphone is broadcasting.")
		} catch (error) {
			if (current === generation.current) {
				if (room) await room.disconnect()
				if (roomRef.current === room) roomRef.current = null
				setStatus("error")
				setMessage(
					error instanceof Error ? error.message : "Unable to start microphone broadcasting.",
				)
			}
		} finally {
			if (current === generation.current) setIsBusy(false)
		}
	}

	async function toggleMicrophone() {
		const room = roomRef.current
		if (!room || isBusy) return
		setIsBusy(true)
		try {
			const enabled = status === "muted"
			await room.localParticipant.setMicrophoneEnabled(enabled)
			setStatus(enabled ? "publishing" : "muted")
			setMessage(enabled ? "Your microphone is broadcasting." : "Your microphone is muted.")
		} catch {
			setMessage(
				"Could not change your microphone state. Check your browser's microphone permission.",
			)
		} finally {
			setIsBusy(false)
		}
	}

	async function handleStart() {
		if (!hasStarted && onStart) {
			setIsBusy(true)
			const started = await onStart()
			setIsBusy(false)
			if (!started || sessionEnded.current) return
			setHasStarted(true)
		}
		await connectAndPublish()
	}

	const busy = isBusy || status === "connecting"
	const on = status === "publishing"

	return (
		<div className="flex flex-col gap-3 rounded-xl bg-muted/60 p-3.5">
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-2.5">
					<span
						aria-hidden
						className={cn(
							"flex size-8 items-center justify-center rounded-full",
							on
								? "bg-destructive/10 text-destructive"
								: "bg-card text-muted-foreground shadow-xs ring-1 ring-border",
						)}
					>
						{status === "muted" ? <MicOff size={15} /> : <Mic size={15} />}
					</span>
					<span className="text-[13px] font-semibold text-foreground">Host microphone</span>
				</div>
				<StatusPill tone={PUBLISHER_TONE[status]} dot={on} pulse={on}>
					{PUBLISHER_LABEL[status]}
				</StatusPill>
			</div>
			<p
				role="status"
				aria-live="polite"
				className="text-[12.5px] leading-relaxed text-muted-foreground"
			>
				{message}
			</p>
			<div className="flex flex-wrap gap-2">
				{status === "ended" ? null : status === "publishing" || status === "muted" ? (
					<>
						<button
							type="button"
							onClick={() => void toggleMicrophone()}
							disabled={isBusy}
							className={secondaryButton}
						>
							{status === "muted" ? (
								<Mic size={13} aria-hidden />
							) : (
								<MicOff size={13} aria-hidden />
							)}
							{status === "muted" ? "Unmute microphone" : "Mute microphone"}
						</button>
						<button
							type="button"
							onClick={() => void disconnect()}
							disabled={isBusy}
							className={destructiveOutlineButton}
						>
							<PhoneOff size={13} aria-hidden />
							Disconnect
						</button>
					</>
				) : (
					<button
						type="button"
						onClick={() => void handleStart()}
						disabled={busy}
						className={cn(primaryButton, buttonLarge)}
					>
						{busy ? (
							<Loader2 size={14} className="animate-spin" aria-hidden />
						) : (
							<Mic size={14} aria-hidden />
						)}
						{busy ? "Connecting…" : hasStarted ? "Connect microphone" : "Start session and go live"}
					</button>
				)}
			</div>
		</div>
	)
}
