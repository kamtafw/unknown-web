"use client"

import { useEventComments } from "@/hooks/events/use-event-comments"
import type { EventErrorKind } from "@/lib/events/errors"
import type { EventComment } from "@/types/events/api"
import { formatDistanceToNowStrict } from "date-fns"
import { Loader2, Lock, MessageSquare, RefreshCw, ShieldAlert, WifiOff } from "lucide-react"
import { Avatar } from "radix-ui"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"

/** "5 minutes ago"; under a minute (or a clock slightly ahead of ours) is "just now" */
function relativeTime(createdAt: string | null): { label: string; iso: string } | null {
	if (!createdAt) return null
	const date = new Date(createdAt)
	if (Number.isNaN(date.getTime())) return null
	const label =
		Date.now() - date.getTime() < 60_000 ? "just now" : formatDistanceToNowStrict(date, { addSuffix: true })
	return { label, iso: date.toISOString() }
}

function CommentItem({ comment }: { comment: EventComment }) {
	const { author } = comment
	const name = author?.name || "Unknown user"
	const initial = name.trim().charAt(0).toUpperCase() || "?"
	const time = relativeTime(comment.createdAt)

	return (
		<li className="flex gap-3">
			<Avatar.Root className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
				{author?.photo && <Avatar.Image src={author.photo} alt="" className="size-full object-cover" />}
				<Avatar.Fallback aria-hidden>{initial}</Avatar.Fallback>
			</Avatar.Root>
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
					<span className="break-words text-[13px] font-semibold text-foreground">{name}</span>
					{author?.role === "host" && (
						<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
							Host
						</span>
					)}
					{time && (
						<time dateTime={time.iso} className="text-[12px] text-muted-foreground">
							{time.label}
						</time>
					)}
				</div>
				{/* plain text only; whitespace is kept and unbroken strings wrap instead of overflowing */}
				<p className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground [overflow-wrap:anywhere]">
					{comment.message}
				</p>
			</div>
		</li>
	)
}

function Skeleton() {
	return (
		<div aria-busy="true" aria-label="Loading comments" className="flex animate-pulse flex-col gap-4">
			{[0, 1, 2].map((i) => (
				<div key={i} className="flex gap-3">
					<div className="size-9 shrink-0 rounded-full bg-muted" />
					<div className="flex flex-1 flex-col gap-2">
						<div className="h-3 w-1/3 rounded bg-muted" />
						<div className="h-3 w-full rounded bg-muted" />
					</div>
				</div>
			))}
		</div>
	)
}

/**
 * Section-specific wording (EV-033). The backend reuses "Join this event before accessing its live
 * session." for a comments 403, and a comments 404 can mean a missing event or an invalid page, so
 * neither raw text nor the event-level "not found" message is shown here.
 */
function failureMessage(kind: EventErrorKind, phase: "initial" | "next-page" | "refresh") {
	if (kind === "forbidden") {
		return phase === "initial"
			? { title: "You can't view these comments", description: "You don't have access to this event's comments." }
			: { title: "You may no longer have access", description: "Showing the comments loaded earlier." }
	}
	if (kind === "not_found") {
		return phase === "initial"
			? {
					title: "Comments aren't available",
					description: "This event may have been deleted, or its comments can't be found.",
				}
			: phase === "next-page"
				? { title: "No more comments could be loaded", description: "Refresh to see the latest." }
				: { title: "Couldn't refresh comments", description: "Showing the comments loaded earlier." }
	}
	if (kind === "unauthorized") {
		return { title: "Your session has expired", description: "Sign in again to see these comments." }
	}
	return {
		title: phase === "initial" ? "Couldn't load comments" : "Couldn't update comments",
		description: phase === "initial" ? "Check your connection and try again." : "Showing the comments loaded earlier.",
	}
}

/**
 * The "Comments" section of a full event: a read-only thread (no composer, replies or reactions).
 * Messages and names are text, never HTML. Order is the backend's (newest first); further pages are
 * appended and de-duplicated by id. The thread is not live: it is as fresh as the last load or an
 * explicit Refresh. Mounted only for a full event's active section.
 */
export function EventCommentsSection({ eventId }: { eventId: string }) {
	const {
		comments,
		hasLoaded,
		isInitialLoading,
		error,
		phase,
		hasNextPage,
		isFetchingNextPage,
		isRefreshing,
		fetchNextPage,
		refetch,
	} = useEventComments(eventId)

	if (isInitialLoading) return <Skeleton />

	if (!hasLoaded) {
		const message = failureMessage(error ?? "unknown", "initial")
		const retryable = error !== "forbidden" && error !== "not_found" && error !== "unauthorized"
		return (
			<StateMessage
				tone="alert"
				icon={
					error === "forbidden" ? (
						<Lock size={22} aria-hidden />
					) : error === "not_found" || error === "unauthorized" ? (
						<ShieldAlert size={22} aria-hidden />
					) : (
						<WifiOff size={22} aria-hidden />
					)
				}
				title={message.title}
				description={message.description}
			>
				{retryable && <RetryButton onClick={() => void refetch()} />}
			</StateMessage>
		)
	}

	const busy = isRefreshing || isFetchingNextPage
	const failure = error && phase && phase !== "initial" ? failureMessage(error, phase) : null
	const empty = comments.length === 0 && !hasNextPage

	return (
		<section aria-labelledby="comments-heading" className="flex flex-col gap-4">
			<div className="flex items-center justify-between gap-2">
				<h2 id="comments-heading" className="text-[13px] font-bold text-foreground">
					Comments
				</h2>
				<button
					type="button"
					onClick={() => void refetch()}
					disabled={busy}
					aria-label="Refresh comments"
					className={secondaryButton}
				>
					<RefreshCw size={13} aria-hidden className={isRefreshing ? "animate-spin" : undefined} />
					{isRefreshing ? "Refreshing…" : "Refresh"}
				</button>
			</div>

			{failure && (
				<div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-2.5 text-[12.5px]">
					<p className="font-semibold text-foreground">{failure.title}</p>
					<p className="text-muted-foreground">{failure.description}</p>
				</div>
			)}

			{empty ? (
				<StateMessage
					icon={<MessageSquare size={22} aria-hidden />}
					title="No comments yet"
					description="Comments from this event's guests will appear here."
				/>
			) : (
				<>
					{comments.length > 0 && (
						<ul aria-label="Event comments" className="flex flex-col gap-4">
							{comments.map((comment) => (
								<CommentItem key={comment.id} comment={comment} />
							))}
						</ul>
					)}
					{hasNextPage && (
						<button
							type="button"
							onClick={() => void fetchNextPage()}
							disabled={busy}
							className={`${secondaryButton} self-center`}
						>
							{isFetchingNextPage && <Loader2 size={13} aria-hidden className="animate-spin" />}
							{isFetchingNextPage ? "Loading…" : phase === "next-page" ? "Try again" : "Load more"}
						</button>
					)}
				</>
			)}
		</section>
	)
}
