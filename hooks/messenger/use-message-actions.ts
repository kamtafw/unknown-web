"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { Message, Pkid, Uuid } from "@/types/messenger"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useMessageActions(peerUuid: Uuid, peerPkid: Pkid) {
	const queryClient = useQueryClient()
	const historyKey = chatKeys.history(peerUuid)
	const pinnedKey = chatKeys.pinnedMessages(peerUuid)

	const forward = useCallback(
		async (
			message: Message,
			targets: { type: "user"; id: number }[],
			targetUuids: Uuid[],
			comment?: string,
		) => {
			try {
				await chatApi.forwardMessage(message.id, targets, comment)
				toast.success("Message forwarded")
				// Forward doesn't come back through the HTTP response the way
				// a normal send does (it can go to multiple targets), so
				// there's no single "insert this message" cache write to
				// make. Invalidating is the correct move here, not an
				// optimistic patch: we don't know the created message's real
				// ID for each target without a fetch
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

	const pinMessage = useCallback(
		async (message: Message) => {
			// Optimistic — this is a single message's boolean field within an
			// already-cached, bounded history list, not a list-membership or
			// cross-view consistency problem like the chat-list overlay
			// handles, so a direct cache patch is proportionate here rather
			// than routing through list-overlay.ts.
			queryClient.setQueryData(historyKey, (old: unknown) =>
				patchMessageInHistory(old, message.id, { is_pinned: true }),
			)
			try {
				await chatApi.pinMessage(message.id, peerPkid)
				queryClient.invalidateQueries({ queryKey: pinnedKey })
			} catch (err) {
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { is_pinned: false }),
				)
				toast.error(extractMessage(err, "Couldn't pin the message — try again"))
			}
		},
		[queryClient, historyKey, peerPkid, pinnedKey],
	)

	const unpinMessage = useCallback(
		async (message: Message) => {
			queryClient.setQueryData(historyKey, (old: unknown) =>
				patchMessageInHistory(old, message.id, { is_pinned: false }),
			)
			try {
				await chatApi.unpinMessage(message.id, peerPkid)
				queryClient.invalidateQueries({ queryKey: pinnedKey })
			} catch (err) {
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { is_pinned: true }),
				)
				toast.error(extractMessage(err, "Couldn't pin the message — try again"))
			}
		},
		[queryClient, historyKey, peerPkid, pinnedKey],
	)

	const deleteMessage = useCallback(
		async (message: Message, deleteType: MessageDeleteType) => {
			// "both" removes it for the other party too — no undo, so no
			// optimistic hide-then-rollback; wait for confirmation.
			try {
				await chatApi.deleteMessage(message.id, deleteType)
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { deleted: true, content: "" }),
				)
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't delete the message — try again"))
			}
		},
		[queryClient, historyKey],
	)

	return { forward, pinMessage, unpinMessage, deleteMessage }
}

/** Separate from useMessageActions since it's a read, not an action — kept
 * in this file rather than a new one, tightly coupled to same domain. */
export function usePinnedMessages(
	chatType: "user" | "group" = "user",
	targetPkid: Pkid,
	peerUuid: Uuid,
) {
	return useQuery({
		queryKey: chatKeys.pinnedMessages(peerUuid),
		queryFn: () => chatApi.listPinnedMessages(chatType, targetPkid),
		staleTime: 30_000,
	})
}

interface HistoryDataShape {
	pages: Array<{ results: Message[] }>
}

function patchMessageInHistory(old: unknown, messageId: number, patch: Partial<Message>): unknown {
	const data = old as HistoryDataShape | undefined
	if (!data?.pages) return old
	return {
		...data,
		pages: data.pages.map((page) => ({
			...page,
			results: page.results.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
		})),
	}
}
