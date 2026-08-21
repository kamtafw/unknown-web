"use client"

import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { Message, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useMessageActions(peerUuid: Uuid, peerPkid: Pkid) {
	const queryClient = useQueryClient()
	const historyKey = chatKeys.history(peerUuid)

	const forward = useCallback(
		async (message: Message, targets: { type: "user"; id: number }[], comment?: string) => {
			try {
				await chatApi.forwardMessage(message.id, targets, comment)
				toast.success("Message forwarded")
			} catch {
				toast.error("Couldn't forward the message — try again")
			}
		},
		[],
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
			} catch {
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { is_pinned: false }),
				)
				toast.error("Couldn't pin the message — try again")
			}
		},
		[queryClient, historyKey, peerPkid],
	)

	const unpinMessage = useCallback(
		async (message: Message) => {
			queryClient.setQueryData(historyKey, (old: unknown) =>
				patchMessageInHistory(old, message.id, { is_pinned: false }),
			)
			try {
				await chatApi.unpinMessage(message.id, peerPkid)
			} catch {
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { is_pinned: true }),
				)
				toast.error("Couldn't unpin the message — try again")
			}
		},
		[queryClient, historyKey, peerPkid],
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
			} catch {
				toast.error("Couldn't delete the message — try again")
			}
		},
		[queryClient, historyKey],
	)

	return { forward, pinMessage, unpinMessage, deleteMessage }
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
