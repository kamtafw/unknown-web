"use client"

import { usePostEventComment } from "@/hooks/events/use-post-event-comment"
import type { EventErrorKind } from "@/lib/events/errors"
import { normalizeCommentMessage } from "@/lib/events/validation"
import { Loader2, Send } from "lucide-react"
import { useId, useState } from "react"
import { primaryButton } from "./event-list"

/**
 * What a rejected post means, in this flow's own words (EV-033). The backend reuses live-session
 * text for some 403s and uses a 404 for "has not joined", so neither raw text nor "event not
 * found" is shown. Every message says the text is kept, because it always is.
 */
function failureText(kind: EventErrorKind): string {
	switch (kind) {
		case "validation":
			return "Your comment couldn't be posted. Check it and try again."
		case "forbidden":
			return "You don't have permission to comment on this event."
		case "not_found":
			return "Only people who have joined this event can post comments"
		case "too_large":
			return "Your comment was too large to send. Your text is still here."
		case "unauthorized":
			return "Your session has expired. Your text is still here; sign in again to post it."
		case "network":
			return "Network error. Check your connection and try again. Your text is still here."
		default:
			return "Couldn't post your comment. Try again. Your text is still here."
	}
}

/**
 * Comment composer for a full event's thread. It is shown to every viewer of a full event: who may
 * post is the backend's decision (D-3), so it is never hidden or disabled by host status, the guest
 * list or inferred membership. Blank input is rejected here (and again by the BFF). There is no
 * length limit and no `maxLength` (EV-030). The text is cleared only after the server accepted the
 * post and is kept on every failure. The new comment appears when the thread is refetched.
 * The composer has no attachments, emoji or other interactions.
 */
export function EventCommentComposer({ eventId }: { eventId: string }) {
	const { post, isPending, error, clearError } = usePostEventComment(eventId)
	const [text, setText] = useState("")
	const [blank, setBlank] = useState(false)
	const fieldId = useId()
	const messageId = useId()

	async function submit(event: React.FormEvent) {
		event.preventDefault()
		if (isPending) return
		if (normalizeCommentMessage(text) === null) {
			setBlank(true)
			return
		}
		setBlank(false)
		if (await post(text)) setText("")
	}

	const problem = blank ? "Write a comment before posting." : error ? failureText(error) : null

	return (
		<form onSubmit={submit} className="flex flex-col gap-2" noValidate>
			<label htmlFor={fieldId} className="sr-only">
				Write a comment
			</label>
			<textarea
				id={fieldId}
				value={text}
				onChange={(e) => {
					setText(e.target.value)
					if (blank) setBlank(false)
					if (error) clearError()
				}}
				readOnly={isPending}
				rows={3}
				placeholder="Write a comment…"
				aria-invalid={problem ? true : undefined}
				aria-describedby={problem ? messageId : undefined}
				className="w-full resize-y rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
			/>
			{problem && (
				<p id={messageId} role="alert" className="text-[12.5px] text-destructive">
					{problem}
				</p>
			)}
			<button type="submit" disabled={isPending} className={`${primaryButton} self-end`}>
				{isPending ? <Loader2 size={13} aria-hidden className="animate-spin" /> : <Send size={13} aria-hidden />}
				{isPending ? "Posting…" : "Post comment"}
			</button>
		</form>
	)
}
