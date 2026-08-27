"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { toast } from "@/lib/toast"
import type { GroupChatHistoryData, GroupMessage } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type HistoryData = InfiniteData<GroupChatHistoryData>

/**
 * Only deleteMessage this slice — pin/forward for groups are confirmed
 * reachable via the same shared endpoints (chat_type: "group") but aren't
 * core to send+socket, deferred to the interaction-primitives follow-up.
 *
 * Delete is HTTP + socket, unlike 1:1's HTTP-only M2 implementation —
 * confirmed via mobile: other room members only learn about a deletion
 * through the group:delete emit, since there's no per-member HTTP push.
 * Reuses the SAME chats/messages/:id delete endpoint as 1:1 (chatApi.deleteMessage).
 */
export function useGroupMessageActions(groupId: number) {
	const queryClient = useQueryClient()
	const historyKey = groupKeys.history(groupId)

	const deleteMessage = useCallback(
		async (message: GroupMessage, deleteType: MessageDeleteType) => {
			try {
				await chatApi.deleteMessage(message.id, deleteType)
				queryClient.setQueryData<HistoryData>(historyKey, (old) => patchDeleted(old, message.id))
				messengerSocket.emit(GROUP_SOCKET_EVENTS.DELETE, {
					msgId: message.id,
					groupId,
					deleteType,
				})
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't delete the message — try again"))
			}
		},
		[queryClient, historyKey, groupId],
	)

	return { deleteMessage }
}

function patchDeleted(old: HistoryData | undefined, messageId: number): HistoryData | undefined {
	if (!old) return old
	return {
		...old,
		pages: old.pages.map((page) => ({
			...page,
			results: page.results.map((m) =>
				m.id === messageId ? { ...m, deleted: true, content: "" } : m,
			),
		})),
	}
}
