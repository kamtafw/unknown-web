"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { eventsApi } from "@/lib/events/api"
import { attachLiveSessionSocketHandlers } from "@/lib/events/live-socket-events"
import { useLiveSessionComments, usePostLiveSessionComment } from "@/hooks/events/use-live-session-comments"
import { useLiveSessionReactions } from "@/hooks/events/use-live-session-reactions"
import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails } from "@/types/events/api"
import { LIVE_REACTION_EMOJIS } from "@/types/events/live"
import { useEventsSocket } from "./events-socket-provider"
import { secondaryButton } from "./event-list"

function authorName(user: { firstName: string; lastName: string; username: string }) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || (user.username ? `@${user.username}` : "Event participant")
}

export function EventLiveSessionRoom({ details }: { details: EventFullDetails }) {
  const { status, state } = useEventLiveSession(details)
  const { manager } = useEventsSocket()
  const client = useQueryClient()
  const accountId = useAuthStore((s) => s.user?.pkid ?? null)
  const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
  const session = state?.session
  const sessionId = session?.id ?? 0
  const admitted = status === "ready" && !!session?.isJoined && session.status === "live"
  const descriptor = state?.socket ?? null
  const [roomError, setRoomError] = useState<{ sessionId: number; message: string } | null>(null)\n  const activeRoomError = roomError?.sessionId === sessionId ? roomError.message : null
  const comments = useLiveSessionComments(admitted ? sessionId : 0)
  const posting = usePostLiveSessionComment(admitted ? sessionId : 0)
  const reactions = useLiveSessionReactions(admitted ? sessionId : 0)
  const [content, setContent] = useState("")

  useEffect(() => {
    if (!admitted || !manager || !descriptor || accountId === null) return
    let active = true
    setRoomError(null)
    const revalidate = async () => {
      const latest = await eventsApi.getEventLiveSession(details.id)
      return latest.eventId === details.id && latest.session.id === sessionId && latest.session.isJoined
    }
    void manager.connect().then(() => manager.joinRoom(descriptor, revalidate)).catch((error: unknown) => {
      if (active) setRoomError({ sessionId, message: error instanceof Error ? error.message : "Could not join the live room." })
    })
    return () => {
      active = false
      manager.leaveRoom(sessionId)
    }
  }, [admitted, manager, descriptor, accountId, sessionGeneration, details.id, sessionId])

  useEffect(() => {
    if (!admitted || !manager || accountId === null) return
    return attachLiveSessionSocketHandlers(manager, client, {
      accountId, sessionGeneration, sessionId,
    })
  }, [admitted, manager, client, accountId, sessionGeneration, sessionId])

  const orderedReactions = useMemo(
    () => LIVE_REACTION_EMOJIS.map((emoji) => ({ emoji, count: reactions.reactionCounts[emoji] ?? 0 })),
    [reactions.reactionCounts],
  )

  if (status === "loading") return null
  if (status !== "ready" || !session || session.status !== "live") return null
  if (!session.isJoined) {
    return (
      <section aria-label="Live discussion" className="rounded-xl border border-border p-3.5">
        <h2 className="text-[13px] font-bold">Live discussion</h2>
        <p className="mt-2 text-[12px] text-muted-foreground">Join this event to view live comments and reactions.</p>
      </section>
    )
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = content
    if (!value.trim() || posting.isPending) return
    const succeeded = await posting.post(value)
    if (succeeded) setContent("")
  }

  return (
    <section aria-label="Live discussion" className="flex flex-col gap-4 rounded-xl border border-border p-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-bold text-foreground">Live discussion</h2>
        <span className="text-[11px] text-muted-foreground">Live session</span>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Send a reaction">
        {orderedReactions.map(({ emoji, count }) => (
          <button key={emoji} type="button" onClick={() => reactions.sendReaction(emoji)}
            disabled={reactions.isSending || !!activeRoomError}
            aria-label={`React with ${emoji}; ${count} total`}
            className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[13px] disabled:opacity-50">
            <span>{emoji}</span><span className="text-[11px] text-muted-foreground">{count}</span>
          </button>
        ))}
      </div>
      {reactions.error && <p role="alert" className="text-[12px] text-destructive">{reactions.error}</p>}

      <div className="flex flex-col gap-3">
        <div className="max-h-72 overflow-y-auto" aria-live="polite" aria-label="Live comments">
          {comments.isInitialLoading ? (
            <p role="status" className="py-4 text-[12px] text-muted-foreground">Loading live comments…</p>
          ) : comments.comments.length === 0 ? (
            <p className="py-4 text-[12px] text-muted-foreground">No comments yet. Start the conversation.</p>
          ) : (
            <ol className="flex flex-col gap-3">
              {comments.comments.map((comment) => (
                <li key={comment.id} className="flex flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] font-semibold text-foreground">{authorName(comment.user)}</span>
                    <time dateTime={comment.createdAt} className="shrink-0 text-[10px] text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </time>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-[12px] leading-relaxed text-foreground">{comment.content}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        {comments.hasNextPage && (
          <button type="button" className={secondaryButton} disabled={comments.isFetchingNextPage}
            onClick={() => void comments.fetchNextPage()}>
            {comments.isFetchingNextPage ? "Loading…" : "Load more comments"}
          </button>
        )}
        {comments.error && (
          <div role="alert" className="flex flex-wrap items-center gap-2 text-[12px] text-destructive">
            <span>Could not load comments.</span>
            <button type="button" className={secondaryButton} onClick={() => void comments.refetch()}>Retry</button>
          </div>
        )}
      </div>

      {activeRoomError ? <p role="alert" className="text-[12px] text-destructive">Live updates are unavailable: {activeRoomError}</p> : admitted && !descriptor ? <p role="note" className="text-[12px] text-muted-foreground">Realtime updates are not available for this session. Comments can still be refreshed from the server.</p> : null}
      <form onSubmit={(event) => void submit(event)} className="flex items-end gap-2">
        <label className="sr-only" htmlFor={`live-comment-${sessionId}`}>Write a live comment</label>
        <textarea id={`live-comment-${sessionId}`} value={content} onChange={(event) => setContent(event.target.value)}
          rows={2} placeholder="Write a comment…" className="min-h-10 flex-1 resize-y rounded-xl border border-border bg-background px-3 py-2 text-[12px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary" />
        <button type="submit" disabled={!content.trim() || posting.isPending}
          className="rounded-full bg-primary px-4 py-2 text-[12px] font-semibold text-primary-foreground disabled:opacity-50">
          {posting.isPending ? "Sending…" : "Send"}
        </button>
      </form>
      {posting.error && <p role="alert" className="text-[12px] text-destructive">Your comment could not be sent. Please try again.</p>}
    </section>
  )
}
