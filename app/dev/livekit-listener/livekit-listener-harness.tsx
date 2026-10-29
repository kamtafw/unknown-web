"use client"

import { useEffect, useRef, useState } from "react"
import type { Room as LiveKitRoom } from "livekit-client"

type Credentials = { server_url: string; token: string; room: string; identity: string }
type State = "idle" | "connecting" | "connected" | "disconnected" | "error"

function removeAudioElements(elements: HTMLMediaElement[]) {
  for (const element of elements) {
    element.pause()
    element.srcObject = null
    element.remove()
  }
  elements.length = 0
}

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
  const audioElementsRef = useRef<HTMLMediaElement[]>([])

  function clearAudio() {
    removeAudioElements(audioElementsRef.current)
    setAudioCount(0)
    setPlaybackBlocked(false)
  }

  useEffect(() => () => {
    generationRef.current += 1
    const room = roomRef.current
    roomRef.current = null
    if (room) void room.disconnect()
    removeAudioElements(audioElementsRef.current)
  }, [])

  async function disconnect() {
    generationRef.current += 1
    const room = roomRef.current
    roomRef.current = null
    if (room) await room.disconnect()
    clearAudio()
    setState("idle")
    setMessage("Disconnected.")
    setRoomName("")
    setIdentity("")
  }

  async function retryPlayback() {
    const elements = audioElementsRef.current
    if (!elements.length) {
      setMessage("No remote audio track is attached yet.")
      return
    }
    try {
      await Promise.all(elements.map((element) => element.play()))
      setPlaybackBlocked(false)
      setMessage("Audio playback resumed.")
    } catch {
      setPlaybackBlocked(true)
      setMessage("The browser still cannot start audio playback. Check the tab's sound and autoplay permissions.")
    }
  }

  async function connect() {
    const id = sessionId.trim()
    if (!id) {
      setState("error")
      setMessage("Enter a session ID.")
      return
    }

    await disconnect()
    const generation = ++generationRef.current
    setState("connecting")
    setMessage("Requesting media credentials…")

    try {
      const response = await fetch(`/api/events/live-sessions/${encodeURIComponent(id)}/media-credentials`, {
        method: "POST",
        headers: { Accept: "application/json" },
        cache: "no-store",
      })
      const payload: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        const errorBody = payload && typeof payload === "object" ? payload as Record<string, unknown> : null
        throw new Error(typeof errorBody?.message === "string" ? errorBody.message : "Media credentials request failed.")
      }

      const credentials = payload && typeof payload === "object"
        ? payload as Partial<Credentials>
        : null
      if (!credentials || typeof credentials.server_url !== "string" || !/^wss?:\/\//i.test(credentials.server_url) ||
        typeof credentials.token !== "string" || !credentials.token ||
        typeof credentials.room !== "string" || !credentials.room ||
        typeof credentials.identity !== "string" || !credentials.identity) {
        throw new Error("The credentials response is incomplete.")
      }

      const { Room, RoomEvent, Track } = await import("livekit-client")
      if (generation !== generationRef.current) return

      const room = new Room({ adaptiveStream: true, dynacast: false })
      roomRef.current = room

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (generation !== generationRef.current || track.kind !== Track.Kind.Audio) return
        const element = track.attach()
        element.autoplay = true
        element.setAttribute("playsinline", "true")
        element.setAttribute("aria-label", `Live audio from ${participant.identity}`)
        element.dataset.trackSid = publication.trackSid
        document.body.appendChild(element)
        audioElementsRef.current.push(element)
        setAudioCount(audioElementsRef.current.length)
        void element.play().then(() => {
          if (generation === generationRef.current) setPlaybackBlocked(false)
        }).catch(() => {
          if (generation === generationRef.current) setPlaybackBlocked(true)
        })
        setMessage(`Audio track received from ${participant.identity}. Confirm that it is audible.`)
      })

      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        const detached = track.detach()
        for (const element of detached) {
          const index = audioElementsRef.current.indexOf(element)
          if (index >= 0) audioElementsRef.current.splice(index, 1)
          element.pause()
          element.srcObject = null
          element.remove()
        }
        if (generation === generationRef.current) setAudioCount(audioElementsRef.current.length)
      })

      room.on(RoomEvent.Disconnected, () => {
        if (generation !== generationRef.current) return
        roomRef.current = null
        clearAudio()
        setState("disconnected")
        setMessage("LiveKit disconnected. You can reconnect.")
      })

      await room.connect(credentials.server_url, credentials.token)
      if (generation !== generationRef.current) {
        await room.disconnect()
        return
      }
      if (room.name !== credentials.room || room.localParticipant.identity !== credentials.identity) {
        await room.disconnect()
        if (roomRef.current === room) roomRef.current = null
        throw new Error("Connected room or identity did not match the credentials response.")
      }

      setRoomName(room.name)
      setIdentity(room.localParticipant.identity)
      setState("connected")
      setMessage("Connected. Waiting for a remote audio track.")
    } catch (error) {
      if (generation !== generationRef.current) return
      const room = roomRef.current
      roomRef.current = null
      if (room) await room.disconnect()
      clearAudio()
      setState("error")
      setMessage(error instanceof Error ? error.message : "Unable to connect to LiveKit.")
    }
  }

  return (
    <section className="space-y-4 rounded-lg border p-4">
      <label className="block space-y-1 text-sm">
        <span className="font-medium">Live session ID</span>
        <input
          className="w-full rounded border px-3 py-2"
          value={sessionId}
          onChange={(event) => setSessionId(event.target.value)}
          placeholder="Mobile-created session ID"
          autoComplete="off"
          disabled={state === "connecting" || state === "connected"}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
          onClick={() => void connect()}
          disabled={state === "connecting" || state === "connected"}
        >
          {state === "connecting" ? "Connecting…" : "Connect as listener"}
        </button>
        <button
          className="rounded border px-4 py-2 disabled:opacity-50"
          onClick={() => void disconnect()}
          disabled={state === "idle"}
        >
          Disconnect
        </button>
        {playbackBlocked && (
          <button className="rounded border px-4 py-2" onClick={() => void retryPlayback()}>
            Retry audio playback
          </button>
        )}
      </div>
      <div aria-live="polite" className="space-y-1 text-sm">
        <p><strong>Status:</strong> {state}</p>
        <p>{message}</p>
        {roomName && <p><strong>Room:</strong> {roomName}</p>}
        {identity && <p><strong>Identity:</strong> {identity}</p>}
        <p><strong>Audio tracks currently attached:</strong> {audioCount}</p>
        {playbackBlocked && <p role="alert">Browser autoplay was blocked. Use “Retry audio playback” after interacting with the page.</p>}
      </div>
    </section>
  )
}
