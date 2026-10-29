"use client"

import { useEffect, useRef, useState } from "react"
import type { Room as LiveKitRoom } from "livekit-client"

export function EventLiveAudioListener({ sessionId }: { sessionId: number }) {
  const [status, setStatus] = useState("connecting")
  const [message, setMessage] = useState("Requesting live audio access…")
  const [tracks, setTracks] = useState(0)
  const roomRef = useRef<LiveKitRoom | null>(null)
  const generation = useRef(0)
  const audio = useRef<HTMLMediaElement[]>([])

  useEffect(() => {
    const current = ++generation.current
    let cancelled = false
    async function start() {
      try {
        const response = await fetch(`/api/events/live-sessions/${sessionId}/media-credentials`, {
          method: "POST", headers: { Accept: "application/json" }, cache: "no-store",
        })
        const body = await response.json().catch(() => null)
        if (!response.ok) throw new Error(response.status === 403 ? "Live audio access was denied." : "Could not request live audio access.")
        const credentials = body?.data ?? body
        if (!credentials || typeof credentials.server_url !== "string" || typeof credentials.token !== "string" ||
          typeof credentials.room !== "string" || typeof credentials.identity !== "string") {
          throw new Error("The live audio credentials response was incomplete.")
        }
        const { Room, RoomEvent, Track } = await import("livekit-client")
        if (cancelled || current !== generation.current) return
        const room = new Room({ adaptiveStream: true, dynacast: false })
        roomRef.current = room
        room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
          if (cancelled || current !== generation.current || track.kind !== Track.Kind.Audio) return
          const element = track.attach()
          element.autoplay = true
          element.setAttribute("playsinline", "true")
          document.body.appendChild(element)
          audio.current.push(element)
          setTracks((count) => count + 1)
          void element.play().catch(() => setMessage("Audio received, but browser playback needs user interaction."))
          setMessage(`Audio track received from ${participant.identity}.`)
        })
        room.on(RoomEvent.Disconnected, () => {
          if (!cancelled && current === generation.current) { setStatus("disconnected"); setMessage("Live audio disconnected.") }
        })
        await room.connect(credentials.server_url, credentials.token)
        if (cancelled || current !== generation.current) { await room.disconnect(); return }
        if (room.name !== credentials.room || room.localParticipant.identity !== credentials.identity) {
          await room.disconnect()
          roomRef.current = null
          throw new Error("Connected room did not match the issued credentials.")
        }
        setStatus("connected")
        setMessage("Connected. Waiting for a remote audio track.")
      } catch (error) {
        if (cancelled || current !== generation.current) return
        await roomRef.current?.disconnect()
        roomRef.current = null
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Unable to connect to live audio.")
      }
    }
    void start()
    return () => {
      cancelled = true
      generation.current += 1
      const room = roomRef.current
      roomRef.current = null
      if (room) void room.disconnect()
      audio.current.forEach((element) => element.remove())
      audio.current = []
    }
  }, [sessionId])

  return <section aria-label="Live audio listener" className="flex flex-col gap-2 rounded-xl border border-border p-3.5">
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-semibold text-foreground">Live audio</h2>
      <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] capitalize">{status}</span>
    </div>
    <p role="status" aria-live="polite" className="text-[12px] leading-relaxed text-muted-foreground">{message}</p>
    <p className="text-[12px] text-muted-foreground">Audio tracks received: {tracks}</p>
  </section>
}
