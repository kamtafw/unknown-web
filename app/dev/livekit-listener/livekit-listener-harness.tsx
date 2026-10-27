"use client"

import { useEffect, useRef, useState } from "react"
import type { Room as LiveKitRoom } from "livekit-client"

type Credentials = { server_url: string; token: string; room: string; identity: string }
type State = "idle" | "connecting" | "connected" | "error"

export function LiveKitListenerHarness() {
	const [sessionId, setSessionId] = useState("")
	const [state, setState] = useState<State>("idle")
	const [message, setMessage] = useState("Enter a mobile-created session ID to begin.")
	const [roomName, setRoomName] = useState("")
	const [identity, setIdentity] = useState("")
	const [audioCount, setAudioCount] = useState(0)
	const [playbackBlocked, setPlaybackBlocked] = useState(false)
	const roomRef = useRef<LiveKitRoom | null>(null)
	const generationRef = useRef(0)

	useEffect(() => () => {
		generationRef.current += 1
		void roomRef.current?.disconnect()
		roomRef.current = null
	}, [])

	async function disconnect() {
		generationRef.current += 1
		const room = roomRef.current
		roomRef.current = null
		if (room) await room.disconnect()
		setState("idle")
		setMessage("Disconnected.")
		setRoomName("")
		setIdentity("")
		setAudioCount(0)
		setPlaybackBlocked(false)
	}

	async function connect() {
		const id = sessionId.trim()
		if (!id) { setState("error"); setMessage("Enter a session ID."); return }
		await disconnect()
		const generation = ++generationRef.current
		setState("connecting")
		setMessage("Requesting media credentials…")
		try {
			const response = await fetch(`/api/events/live-sessions/${encodeURIComponent(id)}/media-credentials`, {
				method: "POST", headers: { Accept: "application/json" }, cache: "no-store",
			})
			const payload = await response.json().catch(() => null)
			if (!response.ok) throw new Error(typeof payload?.message === "string" ? payload.message : "Media credentials request failed.")
			const credentials = payload as Credentials
			if (typeof credentials.server_url !== "string" || typeof credentials.token !== "string" ||
				typeof credentials.room !== "string" || typeof credentials.identity !== "string") {
				throw new Error("The credentials response is incomplete.")
			}
			const { Room, RoomEvent, Track } = await import("livekit-client")
			if (generation !== generationRef.current) return
			const room = new Room({ adaptiveStream: true, dynacast: false })
			roomRef.current = room
			room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
				if (generation !== generationRef.current || track.kind !== Track.Kind.Audio) return
				setAudioCount((count) => count + 1)
				const element = track.attach()
				element.autoplay = true
				element.setAttribute("playsinline", "true")
				document.body.appendChild(element)
				void element.play().catch(() => setPlaybackBlocked(true))
				setMessage(`Audio track received from ${participant.identity}. Confirm that it is audible.`)
			})
			room.on(RoomEvent.Disconnected, () => {
				if (generation === generationRef.current) { setState("error"); setMessage("LiveKit disconnected.") }
			})
			await room.connect(credentials.server_url, credentials.token)
			if (generation !== generationRef.current) { await room.disconnect(); return }
			if (room.name !== credentials.room || room.localParticipant.identity !== credentials.identity) {
				await room.disconnect()
				roomRef.current = null
				throw new Error("Connected room or identity did not match the credentials response.")
			}
			setRoomName(room.name)
			setIdentity(room.localParticipant.identity)
			setState("connected")
			setMessage("Connected. Waiting for a remote audio track.")
		} catch (error) {
			if (generation !== generationRef.current) return
			await roomRef.current?.disconnect()
			roomRef.current = null
			setState("error")
			setMessage(error instanceof Error ? error.message : "Unable to connect to LiveKit.")
		}
	}

	return (
		<section className="space-y-4 rounded-lg border p-4">
			<label className="block space-y-1 text-sm">
				<span className="font-medium">Live session ID</span>
				<input className="w-full rounded border px-3 py-2" value={sessionId}
					onChange={(event) => setSessionId(event.target.value)} placeholder="Mobile-created session ID"
					autoComplete="off" disabled={state === "connecting" || state === "connected"} />
			</label>
			<div className="flex gap-2">
				<button className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
					onClick={() => void connect()} disabled={state === "connecting" || state === "connected"}>
					{state === "connecting" ? "Connecting…" : "Connect as listener"}
				</button>
				<button className="rounded border px-4 py-2 disabled:opacity-50" onClick={() => void disconnect()} disabled={state === "idle"}>
					Disconnect
				</button>
			</div>
			<div aria-live="polite" className="space-y-1 text-sm">
				<p><strong>Status:</strong> {state}</p><p>{message}</p>
				{roomName && <p><strong>Room:</strong> {roomName}</p>}
				{identity && <p><strong>Identity:</strong> {identity}</p>}
				<p><strong>Audio tracks received:</strong> {audioCount}</p>
				{playbackBlocked && <p role="alert">Browser autoplay was blocked. Interact with the page and retry.</p>}
			</div>
		</section>
	)
}
