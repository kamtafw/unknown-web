"use client"

import { useJoinEvent } from "@/hooks/events/use-join-event"
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
  const [showPasscode, setShowPasscode] = useState(false)
  const [joined, setJoined] = useState(false)
  const { join, isPending, errorMessage, clearError } = useJoinEvent(eventId)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    const success = await join(isLocked ? passcode : undefined)
    if (success) {
      setPasscode("")
      setJoined(true)
      setShowPasscode(false)
    }
  }

  if (joined) {
    return (
      <p role="status" className="rounded-xl border border-border px-3.5 py-3 text-[13px] text-foreground">
        You&apos;ve joined the event. Refreshing your access…
      </p>
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
      {showPasscode && <span className="sr-only">Passcode required</span>}
    </form>
  )
}
