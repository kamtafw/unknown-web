"use client"

import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import type { EventFullDetails, EventLiveStatus } from "@/types/events/api"
import { Radio } from "lucide-react"
import { RetryButton } from "./event-list"
import { EventLiveParticipantsSection } from "./event-live-participants-section"

export const LIVE_SESSION_STATUS_LABEL: Record<EventLiveStatus, string> = {
  waiting: "Waiting to start",
  live: "Live",
  ended: "Ended",
  cancelled: "Cancelled",
}

export const LIVE_SESSION_NOT_ADMITTED =
  "Live session details are available to the host and guests who are currently in the event."

/** Status and read-only participant roster for a full event; no guest or media state is conflated. */
export function EventLiveSessionStatus({ details }: { details: EventFullDetails }) {
  const { status, state, refetch } = useEventLiveSession(details)

  if (status === "loading") {
    return (
      <div aria-busy="true" aria-label="Checking the live session" className="h-9 w-48 animate-pulse rounded-xl bg-muted" />
    )
  }

  if (status === "ready" && state) {
    const { session } = state
    const count = session.participantCount
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-[12.5px] text-foreground">
          <Radio size={14} aria-hidden className={session.status === "live" ? "text-destructive" : "text-muted-foreground"} />
          <span>
            <span className="font-semibold">Live session:</span>{" "}
            {LIVE_SESSION_STATUS_LABEL[session.status]}
            {session.status === "live" && count !== null && (
              <span className="text-muted-foreground">
                {" · "}{count} {count === 1 ? "participant" : "participants"}
              </span>
            )}
          </span>
        </p>
        {session.status === "live" && <EventLiveParticipantsSection liveState={state} />}
      </div>
    )
  }

  if (status === "not_admitted" && details.isLive) {
    return (
      <p role="note" className="rounded-xl bg-muted px-3 py-2 text-[12px] leading-relaxed text-muted-foreground">
        {LIVE_SESSION_NOT_ADMITTED}
      </p>
    )
  }

  if (status === "error") {
    return (
      <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-muted px-3 py-2 text-[12px] text-muted-foreground">
        <span>We couldn&apos;t load the live session status.</span>
        <RetryButton onClick={() => void refetch()} />
      </div>
    )
  }

  return null
}
