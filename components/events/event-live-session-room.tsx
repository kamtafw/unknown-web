"use client"

import { useEventLiveSession } from "@/hooks/events/use-event-live-session"
import {
	useLiveSessionComments,
	usePostLiveSessionComment,
} from "@/hooks/events/use-live-session-comments"
import { useLiveSessionReactions } from "@/hooks/events/use-live-session-reactions"
import { eventsApi } from "@/lib/events/api"
import { attachLiveSessionSocketHandlers } from "@/lib/events/live-socket-events"
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails } from "@/types/events/api"
import { LIVE_REACTION_EMOJIS } from "@/types/events/live"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2, MessageCircle, RefreshCw, Send } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useEventsSocket } from "./events-socket-provider"
import {
	IconBadge,
	StatusPill,
	avatarShell,
	fieldTextarea,
	ghostDestructiveButton,
	panel,
	primaryButton,
	secondaryButton,
	sectionHeading,
} from "./event-ui"

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
	const [roomError, setRoomError] = useState<{ sessionId: number; message: string } | null>(null)
	const [joinAttempt, setJoinAttempt] = useState(0)
	const activeRoomError = roomError?.sessionId === sessionId ? roomError.message : null
	const comments = useLiveSessionComments(admitted ? sessionId : 0)
	const posting = usePostLiveSessionComment(admitted ? sessionId : 0)
	const reactions = useLiveSessionReactions(admitted ? sessionId : 0)
	const [content, setContent] = useState("")

	useEffect(() => {
		if (!admitted || !manager || !descriptor || accountId === null) return
		let active = true
		const revalidate = async () => {
			const latest = await eventsApi.getEventLiveSession(details.id)
			return (
				latest.eventId === details.id && latest.session.id === sessionId && latest.session.isJoined
			)
		}
		void manager
			.connect()
			.then(() => manager.joinRoom(descriptor, revalidate))
			.catch((error: unknown) => {
				if (active) {
					setRoomError({
						sessionId,
						message: error instanceof Error ? error.message : "Could not join the live room.",
					})
				}
			})
		return () => {
			active = false
			manager.leaveRoom(sessionId)
		}
	}, [
		admitted,
		manager,
		descriptor,
		accountId,
		sessionGeneration,
		details.id,
		sessionId,
		joinAttempt,
	])

	useEffect(() => {
		if (!admitted || !manager || accountId === null) return
		return attachLiveSessionSocketHandlers(manager, client, {
			accountId,
			sessionGeneration,
			sessionId,
		})
	}, [admitted, manager, client, accountId, sessionGeneration, sessionId])

	if (status === "loading") return null
	if (status !== "ready" || !session || session.status !== "live") return null
	if (!session.isJoined) {
		return (
			<section aria-label="Live discussion" className={panel}>
				<div className="flex items-center gap-3">
					<IconBadge>
						<MessageCircle size={16} />
					</IconBadge>
					<div className="min-w-0">
						<h2 className={sectionHeading}>Live discussion</h2>
						<p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
							Join this event to view live comments and reactions.
						</p>
					</div>
				</div>
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
		<section aria-label="Live discussion" className={cn(panel, "flex flex-col gap-4")}>
			<div className="flex items-center justify-between gap-3">
				<h2 className={sectionHeading}>Live discussion</h2>
				<StatusPill tone="live" dot pulse>
					Live session
				</StatusPill>
			</div>

			<div className="flex flex-wrap gap-2" role="group" aria-label="Send a reaction">
				{LIVE_REACTION_EMOJIS.map((emoji) => {
					const count = reactions.reactionCounts[emoji]
					const countLabel =
						typeof count === "number" ? count : reactions.isLoadingCounts ? "…" : "—"
					return (
						<button
							key={emoji}
							type="button"
							onClick={() => reactions.sendReaction(emoji)}
							disabled={reactions.isSending}
							aria-label={`React with ${emoji}; ${typeof count === "number" ? `${count} total` : "count unavailable"}`}
							className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[14px] transition-[background-color,transform] duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 disabled:pointer-events-none disabled:opacity-50"
						>
							<span aria-hidden>{emoji}</span>
							<span
								aria-hidden
								className="min-w-3 text-[12px] font-semibold tabular-nums text-muted-foreground"
							>
								{countLabel}
							</span>
						</button>
					)
				})}
			</div>
			{reactions.countsError && (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
				>
					<span>Could not load current reaction totals.</span>
					<button
						type="button"
						className={cn(ghostDestructiveButton, "ml-auto")}
						onClick={() => void reactions.refetchCounts()}
					>
						Retry
					</button>
				</div>
			)}
			{reactions.error && (
				<p role="alert" className="text-[12px] text-destructive">
					{reactions.error}
				</p>
			)}

			<div className="flex flex-col gap-3">
				<div
					className="max-h-80 overflow-y-auto rounded-xl bg-muted/40 px-3 py-2"
					aria-live="polite"
					aria-label="Live comments"
				>
					{comments.isInitialLoading ? (
						<p role="status" className="py-6 text-center text-[12px] text-muted-foreground">
							Loading live comments…
						</p>
					) : comments.comments.length === 0 ? (
						<p className="py-6 text-center text-[12px] text-muted-foreground">
							No comments yet. Start the conversation.
						</p>
					) : (
						<ol className="flex flex-col gap-3 py-1">
							{comments.comments.map((comment) => {
								const name = authorName(comment.user)
								return (
									<li key={comment.id} className="flex gap-2.5">
										<span aria-hidden className={cn(avatarShell, "size-7 text-[11px]")}>
											{name.replace(/^@/, "").trim().charAt(0).toUpperCase() || "?"}
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex items-baseline justify-between gap-2">
												<span className="truncate text-[12px] font-semibold text-foreground">
													{name}
												</span>
												<time
													dateTime={comment.createdAt}
													className="shrink-0 text-[11px] text-muted-foreground"
												>
													{new Date(comment.createdAt).toLocaleTimeString([], {
														hour: "numeric",
														minute: "2-digit",
													})}
												</time>
											</div>
											<p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
												{comment.content}
											</p>
										</div>
									</li>
								)
							})}
						</ol>
					)}
				</div>
				{comments.hasNextPage && (
					<button
						type="button"
						className={cn(secondaryButton, "self-center")}
						disabled={comments.isFetchingNextPage}
						onClick={() => void comments.fetchNextPage()}
					>
						{comments.isFetchingNextPage && (
							<Loader2 size={13} aria-hidden className="animate-spin" />
						)}
						{comments.isFetchingNextPage ? "Loading…" : "Load more comments"}
					</button>
				)}
				{comments.error && (
					<div
						role="alert"
						className="flex flex-wrap items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
					>
						<span>Could not load comments.</span>
						<button
							type="button"
							className={cn(ghostDestructiveButton, "ml-auto")}
							onClick={() => void comments.refetch()}
						>
							Retry
						</button>
					</div>
				)}
			</div>

			{activeRoomError ? (
				<div
					role="alert"
					className="flex flex-wrap items-center gap-2 rounded-xl bg-destructive/5 px-3 py-2 text-[12px] text-destructive"
				>
					<span>Live updates are unavailable: {activeRoomError}</span>
					<button
						type="button"
						className={cn(ghostDestructiveButton, "ml-auto")}
						onClick={() => {
							setRoomError(null)
							setJoinAttempt((value) => value + 1)
						}}
					>
						<RefreshCw size={12} aria-hidden />
						Reconnect
					</button>
				</div>
			) : admitted && !descriptor ? (
				<p role="note" className="text-[12px] text-muted-foreground">
					Live updates aren&apos;t available for this session right now.
				</p>
			) : null}
			<form onSubmit={(event) => void submit(event)} className="flex items-end gap-2">
				<label className="sr-only" htmlFor={`live-comment-${sessionId}`}>
					Write a live comment
				</label>
				<textarea
					id={`live-comment-${sessionId}`}
					value={content}
					onChange={(event) => setContent(event.target.value)}
					rows={2}
					placeholder="Write a comment…"
					className={cn(fieldTextarea, "min-h-11 flex-1")}
				/>
				<button
					type="submit"
					disabled={!content.trim() || posting.isPending}
					className={cn(primaryButton, "h-11")}
				>
					{posting.isPending ? (
						<Loader2 size={14} aria-hidden className="animate-spin" />
					) : (
						<Send size={14} aria-hidden />
					)}
					{posting.isPending ? "Sending…" : "Send"}
				</button>
			</form>
			{posting.error && (
				<p role="alert" className="text-[12px] text-destructive">
					Your comment could not be sent. Please try again.
				</p>
			)}
		</section>
	)
}
