"use client"

import { useJoinEvent } from "@/hooks/events/use-join-event"
import { useLeaveEvent } from "@/hooks/events/use-leave-event"
import { useEventGuests } from "@/hooks/events/use-event-guests"
import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import { EVENTS_PAGE_SIZE } from "@/lib/events/constants"
import type { EventDetails } from "@/types/events/api"
import { EventLiveAudioListener } from "./event-live-audio-listener"
import { useState } from "react"
import { secondaryButton } from "./event-list"

export function EventJoinControl({
  details,
}: {
  details: EventDetails
}) {
  const eventId = details.id
  const [passcode, setPasscode] = useState("")
  const [joinedLocally, setJoinedLocally] = useState(false)
  const [leftLocally, setLeftLocally] = useState(false)
  const [localSessionId, setLocalSessionId] = useState<number | null>(null)
  const liveSession = useEventLiveSession(details)
  // The guest-list endpoint is available only to hosts and viewers with a persistent guest row.
  // A successful read therefore confirms membership even when no live session is active.
  const guestList = useEventGuests(eventId, EVENTS_PAGE_SIZE, details.kind === "full")
  const hasGuestRecord = details.kind === "full" && guestList.hasLoaded && guestList.error !== "forbidden"
  const sessionId = localSessionId ?? (
    liveSession.state?.session.isJoined ? liveSession.state.session.id : null
  )
  const isLiveEvent = details.isLive || (
    details.kind === "full" && details.liveSessionStatus === "live"
  )
  const canLeave = !leftLocally && (
    joinedLocally ||
    liveSession.state?.session.isJoined === true ||
    (hasGuestRecord && !isLiveEvent)
  )
  const { join, isPending: isJoining, errorMessage: joinError, clearError: clearJoinError } = useJoinEvent(eventId)
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
        <p role="status" className="rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground">
          {sessionId !== null
            ? "You've joined the event. Connecting to live audio…"
            : "You're on the guest list for this event."}
        </p>
        {sessionId !== null && <EventLiveAudioListener sessionId={sessionId} />}
        {leaveError && <p role="alert" className="text-[12px] text-destructive">{leaveError}</p>}
        <button type="button" onClick={() => void submitLeave()} disabled={isLeaving} className={secondaryButton}>
          {isLeaving ? "Leaving…" : "Leave event"}
        </button>
      </div>
    )
  }

  if (!isLiveEvent) return null

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-border p-3.5">
      <div>
        <h2 className="text-[13px] font-semibold text-foreground">Join this live event</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Join the event before connecting to live audio.
        </p>
      </div>
      {details.isLocked && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`event-${eventId}-passcode`} className="text-[12px] font-medium text-foreground">
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
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="0000"
          />
        </div>
      )}
      {joinError && <p role="alert" className="text-[12px] text-destructive">{joinError}</p>}
      <button type="submit" disabled={isJoining || (details.isLocked && !/^\d{4}$/.test(passcode))} className={secondaryButton}>
        {isJoining ? "Joining…" : "Join event"}
      </button>
    </form>
  )
}
