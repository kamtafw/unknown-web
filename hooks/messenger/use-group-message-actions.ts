"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys, groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { toast } from "@/lib/toast"
import type { GroupChatHistoryData, GroupMessage, Uuid } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type HistoryData = InfiniteData<GroupChatHistoryData>

/**
 * Delete stays HTTP + socket (other room members only learn about a
 * deletion through group:delete — no per-member HTTP push).
 *
 * Pin/unpin/forward added this slice. No new HTTP surface introduced:
 * pin/unpin reuse chatApi.pinMessage/unpinMessage with chat_type:"group"
 * (confirmed reachable — see api.ts), forward reuses chatApi.forwardMessage
 * unchanged since its `targets` contract is user-only regardless of
 * whether the forwarded message originated in a group or a DM.
 */
export function useGroupMessageActions(groupId: number) {
	const queryClient = useQueryClient()
	const historyKey = groupKeys.history(groupId)

	const patch = useCallback(
		(messageId: number, fields: Partial<GroupMessage>) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) => (m.id === messageId ? { ...m, ...fields } : m)),
					})),
				}
			})
		},
		[queryClient, historyKey],
	)

	const deleteMessage = useCallback(
		async (message: GroupMessage, deleteType: MessageDeleteType) => {
			try {
				await chatApi.deleteMessage(message.id, deleteType)
				patch(message.id, { deleted: true, content: "" })
				messengerSocket.emit(GROUP_SOCKET_EVENTS.DELETE, {
					msgId: message.id,
					groupId,
					deleteType,
				})
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't delete the message — try again"))
			}
		},
		[patch, groupId],
	)

	const pinMessage = useCallback(
		async (message: GroupMessage) => {
			patch(message.id, { is_pinned: true })
			try {
				await chatApi.pinMessage(message.id, "group", groupId)
			} catch (err) {
				patch(message.id, { is_pinned: false })
				toast.error(extractMessage(err, "Couldn't pin the message — try again"))
			}
		},
		[patch, groupId],
	)

	const unpinMessage = useCallback(
		async (message: GroupMessage) => {
			patch(message.id, { is_pinned: false })
			try {
				await chatApi.unpinMessage(message.id, "group", groupId)
			} catch (err) {
				patch(message.id, { is_pinned: true })
				toast.error(extractMessage(err, "Couldn't unpin the message — try again"))
			}
		},
		[patch, groupId],
	)

	const forwardMessage = useCallback(
		async (
			message: GroupMessage,
			targets: { type: "user" | "group"; id: number }[],
			targetUuids: Uuid[],
			comment?: string,
		) => {
			try {
				await chatApi.forwardMessage(message.id, targets, comment)
				toast.success("Message forwarded")
				/**
				 * TODO: including group to forward target type allows user to forward to
				 * groups they belong to. This implementation currently doesn't refresh
				 * group history and preview to enable changes to reflect to list, This is
				 * cos groups use `pkid`. Need to find a way around this.
				 */
				for (const targetUuid of targetUuids) {
					queryClient.invalidateQueries({ queryKey: chatKeys.history(targetUuid) })
				}
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't forward the message — try again"))
			}
		},
		[queryClient],
	)

	return { deleteMessage, pinMessage, unpinMessage, forwardMessage }
}
