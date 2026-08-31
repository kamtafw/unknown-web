"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys, groupKeys } from "@/lib/messenger/query-keys"
import {
	isReactionRemoval,
	toggleActorReaction,
	totalReactionCount,
} from "@/lib/messenger/reactions"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type {
	EmojiReactionCount,
	GroupChatHistoryData,
	GroupMessage,
	Uuid,
} from "@/types/messenger"
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
	const currentUser = useAuthStore((s) => s.user)

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
				patch(message.id, { is_deleted_for_all: true, content: "" })
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

	const reactToMessage = useCallback(
		async (message: GroupMessage, emoji: string) => {
			if (!currentUser) return
			const actorId = String(currentUser.pkid)
			const snapshot = message.emoji_reaction_counts ?? []
			const isRemoval = isReactionRemoval(snapshot, actorId, emoji)

			queryClient.setQueryData<HistoryData>(historyKey, (old) =>
				patchGroupMessageReaction(old, message.id, (counts) =>
					toggleActorReaction(counts, actorId, emoji),
				),
			)

			try {
				if (isRemoval) {
					await chatApi.removeReaction(message.id)
				} else {
					await chatApi.reactToMessage(message.id, emoji)
				}
			} catch (err) {
				queryClient.setQueryData<HistoryData>(historyKey, (old) =>
					patchGroupMessageReaction(old, message.id, () => snapshot),
				)
				toast.error(extractMessage(err, "Couldn't react to the message — try again"))
			}
		},
		[queryClient, historyKey, currentUser],
	)

	return { deleteMessage, pinMessage, unpinMessage, forwardMessage, reactToMessage }
}

/** Exported so use-group-socket.ts's `group:reaction` handler reuses the
 * exact same patcher — mirrors mobile's patchGroupHistoryReaction. */
export function patchGroupMessageReaction(
	old: HistoryData | undefined,
	messageId: number,
	transform: (counts: EmojiReactionCount[]) => EmojiReactionCount[],
): HistoryData | undefined {
	if (!old) return old
	let mutated = false
	const pages = old.pages.map((page) => {
		const idx = page.results.findIndex((m) => m.id === messageId)
		if (idx === -1) return page
		mutated = true
		const target = page.results[idx]
		const nextCounts = transform(target.emoji_reaction_counts ?? [])
		const results = [...page.results]
		results[idx] = {
			...target,
			emoji_reaction_counts: nextCounts,
			reactions_count: totalReactionCount(nextCounts),
		}
		return { ...page, results }
	})
	return mutated ? { ...old, pages } : old
}
