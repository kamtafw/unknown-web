"use client"

import { useEffect, useRef, useState } from "react"
import type { Room as LiveKitRoom, Track as LiveKitTrack } from "livekit-client"

type ListenerStatus = "connecting" | "connected" | "disconnected" | "error"

export function EventLiveAudioListener({ sessionId }: { sessionId: number }) {
  const [status, setStatus] = useState<ListenerStatus>("connecting")
  const [message, setMessage] = useState("Requesting live audio access…")
  const [tracks, setTracks] = useState(0)
  const [playbackBlocked, setPlaybackBlocked] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const roomRef = useRef<LiveKitRoom | null>(null)
  const generation = useRef(0)
  const audio = useRef(new Map<string, HTMLMediaElement>())

  useEffect(() => {
    const current = ++generation.current
    let cancelled = false
    let room: LiveKitRoom | null = null

    const removeAudio = (key?: string) => {
      if (key) {
        const element = audio.current.get(key)
        if (element) {
          element.pause()
          element.srcObject = null
          element.remove()
          audio.current.delete(key)
        }
      } else {
        for (const element of audio.current.values()) {
          element.pause()
          element.srcObject = null
          element.remove()
        }
        audio.current.clear()
      }
      setTracks(audio.current.size)
    }

    async function start() {
      setStatus("connecting")
      setMessage("Requesting live audio access…")
      setPlaybackBlocked(false)
      setTracks(0)
      try {
        const response = await fetch(`/api/events/live-sessions/${sessionId}/media-credentials`, {
          method: "POST",
          headers: { Accept: "application/json" },
          cache: "no-store",
        })
        const body = await response.json().catch(() => null)
        if (!response.ok) {
          if (response.status === 401) throw new Error("Sign in to listen to this event.")
          if (response.status === 403) throw new Error("You don't have access to this live audio.")
          throw new Error("Could not request live audio access.")
        }
        const credentials = body?.data ?? body
        if (!credentials || typeof credentials.server_url !== "string" || typeof credentials.token !== "string" ||
          typeof credentials.room !== "string" || typeof credentials.identity !== "string") {
          throw new Error("The live audio credentials response was incomplete.")
        }

        const { Room, RoomEvent, Track } = await import("livekit-client")
        if (cancelled || current !== generation.current) return
        room = new Room({ adaptiveStream: true, dynacast: false })
        roomRef.current = room

        room.on(RoomEvent.TrackSubscribed, (track: LiveKitTrack, _publication, participant) => {
          if (cancelled || current !== generation.current || track.kind !== Track.Kind.Audio) return
          const key = `${participant.identity}:${track.sid}`
          removeAudio(key)
          const element = track.attach()
          element.autoplay = true
          element.setAttribute("playsinline", "true")
          element.setAttribute("aria-label", "Live event audio")
          document.body.appendChild(element)
          audio.current.set(key, element)
          setTracks(audio.current.size)
          void element.play().then(() => {
            if (!cancelled && current === generation.current) setPlaybackBlocked(false)
          }).catch(() => {
            if (!cancelled && current === generation.current) {
              setPlaybackBlocked(true)
              setMessage("Audio is ready, but your browser blocked playback. Select Play audio to start listening.")
            }
          })
          setMessage("Audio received. You're listening live.")
        })

        room.on(RoomEvent.TrackUnsubscribed, (track: LiveKitTrack, _publication, participant) => {
          if (cancelled || current !== generation.current || track.kind !== Track.Kind.Audio) return
          const key = `${participant.identity}:${track.sid}`
          track.detach().forEach((element) => element.remove())
          removeAudio(key)
          if (audio.current.size === 0) setMessage("Connected. Waiting for live audio.")
        })

        room.on(RoomEvent.Disconnected, () => {
          if (cancelled || current !== generation.current) return
          removeAudio()
          setStatus("disconnected")
          setMessage("The live audio connection ended. You can try reconnecting.")
        })

        await room.connect(credentials.server_url, credentials.token)
        if (cancelled || current !== generation.current) {
          await room.disconnect()
          return
        }
        if (room.name !== credentials.room || room.localParticipant.identity !== credentials.identity) {
          await room.disconnect()
          roomRef.current = null
          throw new Error("Connected room did not match the issued credentials.")
        }
        setStatus("connected")
        setMessage("Connected. Waiting for live audio.")
      } catch (error) {
        if (cancelled || current !== generation.current) return
        await room?.disconnect()
        roomRef.current = null
        removeAudio()
        setStatus("error")
        setMessage(error instanceof Error ? error.message : "Unable to connect to live audio.")
      }
    }

    void start()
    return () => {
      cancelled = true
      generation.current += 1
      const activeRoom = roomRef.current
      roomRef.current = null
      if (activeRoom) void activeRoom.disconnect()
      removeAudio()
    }
  }, [sessionId, attempt])

  async function retryPlayback() {
    const elements = [...audio.current.values()]
    try {
      await Promise.all(elements.map((element) => element.play()))
      setPlaybackBlocked(false)
      setMessage("Audio playback started.")
    } catch {
      setPlaybackBlocked(true)
      setMessage("Your browser is still blocking audio. Check the browser's site sound settings and try again.")
    }
  }

  return (
    <section aria-label="Live audio listener" className="flex flex-col gap-2 rounded-xl border border-border p-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-semibold text-foreground">Live audio</h2>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] capitalize">{status}</span>
      </div>
      <p role="status" aria-live="polite" className="text-[12px] leading-relaxed text-muted-foreground">{message}</p>
      <p className="text-[12px] text-muted-foreground">Audio tracks playing: {tracks}</p>
      {playbackBlocked && (
        <button type="button" onClick={() => void retryPlayback()} className="self-start rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-foreground">
          Play audio
        </button>
      )}
      {(status === "error" || status === "disconnected") && (
        <button type="button" onClick={() => setAttempt((value) => value + 1)} className="self-start rounded-lg border border-border px-3 py-2 text-[12px] font-medium text-foreground">
          Reconnect
        </button>
      )}
    </section>
  )
}
