"use client"

import { extractMessage } from "@/lib/api-error"
import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

export interface CreatePollInput {
	question: string
	options: string[]
	allowMultiple: boolean
	isAnonymous: boolean
	durationMinutes?: number
}

/**
 * Poll creation is not a dedicated endpoint — confirmed via mobile's
 * create-poll.tsx: it's the ordinary group send (`message_type: "poll"`,
 * `metadata`). Group-only, matching mobile's attachment sheet. No
 * optimistic bubble — mobile doesn't show one either (navigates back on
 * success); just invalidate. Sending is gated by the same
 * `can_members_send_messages` permission the composer already enforces —
 * no separate "who can create polls" permission exists on the confirmed
 * contract, so no new gating logic is added here.
 */
export function useCreatePoll(groupId: number) {
	const queryClient = useQueryClient()
	const [isPending, setIsPending] = useState(false)

	const createPoll = useCallback(
		async (input: CreatePollInput) => {
			const metadata = {
				question: input.question,
				options: input.options.map((text, i) => ({ id: i + 1, text })),
				allow_multiple_answers: input.allowMultiple,
				is_anonymous: input.isAnonymous,
				...(input.durationMinutes ? { duration_minutes: input.durationMinutes } : {}),
			}

			setIsPending(true)
			try {
				await groupApi.send({
					group_id: groupId,
					message_type: "poll",
					content: input.question,
					metadata,
				})
				queryClient.invalidateQueries({ queryKey: groupKeys.history(groupId) })
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
				toast.success("Poll created")
				return true
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't create the poll — try again"))
				return false
			} finally {
				setIsPending(false)
			}
		},
		[groupId, queryClient],
	)

	return { createPoll, isPending }
}
