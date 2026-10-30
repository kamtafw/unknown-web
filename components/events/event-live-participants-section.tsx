"use client"

import { useEventLiveParticipants } from "@/hooks/events/use-event-live-participants"
import { useEventLiveRoom } from "@/hooks/events/use-event-live-room"
import type { EventLiveSessionState, LiveParticipant } from "@/types/events/api"
import Image from "next/image"
import { RetryButton } from "./event-list"

function ParticipantRow({ participant }: { participant: LiveParticipant }) {
  const { user } = participant
  const initial = (user.name || user.username || "?").trim().charAt(0).toUpperCase()
  const role = participant.role.replace("_", " ")

  return (
    <li className="flex items-start gap-3 rounded-xl border border-border px-3 py-3">
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {user.photo ? (
          <Image src={user.photo} alt="" fill unoptimized sizes="40px" className="object-cover" />
        ) : initial}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[13px] font-semibold text-foreground">{user.name}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
            {role}
          </span>
        </div>
        {user.username && <p className="truncate text-[11px] text-muted-foreground">@{user.username}</p>}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
          <span aria-label={participant.isActive ? "Application presence active" : "Application presence inactive"}>
            App: {participant.isActive ? "Active" : "Inactive"}
          </span>
          <span aria-label={participant.mediaConnected ? "Media connected" : "Media not connected"}>
            Media: {participant.mediaConnected ? "Connected" : "Not connected"}
          </span>
          <span>
            Microphone: {participant.microphonePublished ? "Published" : "Not published"}
            {participant.isMuted ? " · Muted" : ""}
          </span>
          <span>Camera: {participant.cameraPublished ? "Published" : "Not published"}</span>
        </div>
      </div>
    </li>
  )
}

/** Read-only live roster. It never substitutes event guests or media connections for app presence. */
export function EventLiveParticipantsSection({ liveState }: { liveState: EventLiveSessionState }) {
  useEventLiveRoom(liveState)
  const query = useEventLiveParticipants(liveState)

  if (liveState.session.status !== "live" || !query.enabled) return null

  return (
    <section aria-labelledby="live-participants-heading" className="flex flex-col gap-3 rounded-xl bg-card">
      <header className="flex items-center justify-between gap-3">
        <h2 id="live-participants-heading" className="text-[13px] font-bold text-foreground">
          Participants
        </h2>
        {liveState.session.participantCount !== null && (
          <span className="text-[11px] text-muted-foreground">
            {liveState.session.participantCount} total
          </span>
        )}
      </header>

      {query.isInitialLoading && (
        <div aria-label="Loading participants" aria-busy="true" className="flex flex-col gap-2">
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        </div>
      )}

      {query.error && !query.hasLoaded && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-muted px-3 py-3 text-[12px] text-muted-foreground">
          <span>We couldn&apos;t load the live participants.</span>
          <RetryButton onClick={() => void query.refetch()} />
        </div>
      )}

      {query.hasLoaded && query.participants.length === 0 && (
        <p className="rounded-xl bg-muted px-3 py-3 text-[12px] text-muted-foreground">
          No participants to display yet.
        </p>
      )}

      {query.participants.length > 0 && (
        <ul aria-label="Live participants" className="flex flex-col gap-2">
          {query.participants.map((participant) => (
            <ParticipantRow key={participant.user.userId} participant={participant} />
          ))}
        </ul>
      )}

      {query.error && query.hasLoaded && (
        <p role="alert" className="text-[11px] text-muted-foreground">
          The roster could not be refreshed. Previously loaded participants are still shown.
        </p>
      )}

      {query.hasNextPage && (
        <button
          type="button"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
          className="self-start rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-foreground disabled:opacity-50"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more participants"}
        </button>
      )}
    </section>
  )
}
