"use client"

import { useJoinEvent } from "@/hooks/events/use-join-event"
import { EventLiveAudioListener } from "./event-live-audio-listener"
import { useState } from "react"
import { secondaryButton } from "./event-list"

export function EventJoinControl({
  eventId,
  isLocked,
}: {
  eventId: string
  isLocked: boolean
}) {
  const [passcode, setPasscode] = useState("")
  const [joined, setJoined] = useState(false)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const { join, isPending, errorMessage, clearError } = useJoinEvent(eventId)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    const result = await join(isLocked ? passcode : undefined)
    if (result !== false) {
      setPasscode("")
      setJoined(true)
      setSessionId(result)
    }
  }

  if (joined) {
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground">
          You&apos;ve joined the event. Your event access is being refreshed.
        </p>
        {sessionId !== null && <EventLiveAudioListener sessionId={sessionId} />}
        {sessionId === null && <p className="text-[12px] text-muted-foreground">You were admitted, but the live audio session could not be found. Refresh the event and try again.</p>}
        
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-border p-3.5">
      <div>
        <h2 className="text-[13px] font-semibold text-foreground">Join this live event</h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
          Join the event before connecting to live audio.
        </p>
      </div>
      {isLocked && (
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
              if (errorMessage) clearError()
            }}
            aria-invalid={Boolean(errorMessage)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="0000"
          />
        </div>
      )}
      {errorMessage && <p role="alert" className="text-[12px] text-destructive">{errorMessage}</p>}
      <button type="submit" disabled={isPending || (isLocked && !/^\d{4}$/.test(passcode))} className={secondaryButton}>
        {isPending ? "Joining…" : "Join event"}
      </button>
    </form>
  )
}
