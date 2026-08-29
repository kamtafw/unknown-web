"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useQuery } from "@tanstack/react-query"
import { useCallback } from "react"

/**
 * Vote is message-id-scoped only (no chat_type/target_id, unlike pin) —
 * confirmed via mobile. One shared hook covers DM and group message
 * lists; the caller invalidates whichever history query it owns after a
 * successful vote. No optimistic tally patch: there's no confirmed shape
 * for how the server echoes updated counts into a message's `metadata`,
 * and mobile itself doesn't attempt one either (its own counts only
 * update on the next full fetch) — see "no realtime results" note.
 */
export function useVotePoll() {
	return useCallback(async (messageId: number, optionIds: number[]) => {
		try {
			await chatApi.votePoll(messageId, optionIds)
			return true
		} catch (err) {
			toast.error(extractMessage(err, "Couldn't submit your vote — try again"))
			return false
		}
	}, [])
}

/** `GET chats/messages/:id/polls/results`, fetched lazily — only when the
 * results dialog is open. Mirrors mobile's useGetPollResults exactly: a
 * single fetch, no polling — mobile doesn't do live results either, so
 * this isn't a regression relative to the reference app. */
export function usePollResults(messageId: number | null) {
	return useQuery({
		queryKey: chatKeys.pollResults(messageId ?? 0),
		queryFn: () => chatApi.getPollResults(messageId as number),
		enabled: !!messageId,
	})
}
