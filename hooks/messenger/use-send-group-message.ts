"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { GroupChatHistoryData, GroupMessage, Message } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type HistoryData = InfiniteData<GroupChatHistoryData>

let optimisticCounter = 0

function createOptimisticGroupMessage(
	groupId: number,
	content: string,
	replyingTo: Message | null | undefined,
	sender: GroupMessage["sender"],
): GroupMessage {
	optimisticCounter -= 1
	return {
		id: optimisticCounter,
		sender,
		receiver: null,
		group: { id: groupId, name: "", icon_url: "" },
		message_type: "text",
		content,
		media: null,
		metadata: null,
		is_pinned: false,
		collection_id: "",
		status: "queued",
		reply_to: replyingTo
			? {
					id: replyingTo.id,
					sender_id: replyingTo.sender.id,
					content: replyingTo.content,
					message_type: replyingTo.message_type,
					created_at: replyingTo.created_at,
				}
			: null,
		forwarded_from: null,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
}

/**
 * Mirrors use-send-message.ts's flow exactly (queued → sending → HTTP
 * response replaces it, or failed + retry), operating on the RAW
 * GroupMessage cache shape so use-group-history.ts's existing
 * groupMessageToMessage adapter picks it up with zero changes there.
 *
 * Sends via the shared SendMessagePayload (chat.ts) with `group_id` set,
 * not the narrower SendGroupMessagePayload — see the OPEN ITEM comment on
 * that type in types/messenger/group.ts: this is needed for `reply_to` to
 * work, mirroring how 1:1 already sends successfully with `receiver_id`
 * swapped for `group_id`. Flagged for verification against the live
 * backend, not assumed proven.
 */
export function useSendGroupMessage(groupId: number) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const historyKey = groupKeys.history(groupId)

	const upsertOptimistic = useCallback(
		(message: GroupMessage) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				const page = old?.pages[old.pages.length - 1] ?? {
					next: null,
					previous: null,
					results: [],
				}
				const nextPage = { ...page, results: [...page.results, message] }
				if (!old) return { pages: [nextPage], pageParams: [undefined] }
				return { ...old, pages: [...old.pages.slice(0, -1), nextPage] }
			})
		},
		[queryClient, historyKey],
	)

	const replaceOptimistic = useCallback(
		(localId: number, replacement: GroupMessage) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) => (m.id === localId ? replacement : m)),
					})),
				}
			})
		},
		[queryClient, historyKey],
	)

	const markFailed = useCallback(
		(localId: number) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) =>
							m.id === localId ? { ...m, status: "failed" as const } : m,
						),
					})),
				}
			})
		},
		[queryClient, historyKey],
	)

	const send = useCallback(
		async (content: string, replyingTo?: Message | null) => {
			if (!currentUser) return

			const sender: GroupMessage["sender"] = {
				id: currentUser.id as GroupMessage["sender"]["id"],
				pkid: currentUser.pkid as GroupMessage["sender"]["pkid"],
				username: currentUser.username,
				first_name: currentUser.first_name,
				last_name: currentUser.last_name,
				profile_photo: currentUser.profile_photo,
			}
			const optimistic = createOptimisticGroupMessage(groupId, content, replyingTo, sender)
			upsertOptimistic(optimistic)

			try {
				const sent = await groupApi.send({
					group_id: groupId,
					message_type: "text",
					content,
					...(replyingTo ? { reply_to: replyingTo.id } : {}),
				})
				replaceOptimistic(optimistic.id, sent)
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[currentUser, groupId, upsertOptimistic, replaceOptimistic, markFailed, queryClient],
	)

	const retry = useCallback(
		async (failedMessage: GroupMessage) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) =>
							m.id === failedMessage.id ? { ...m, status: "sending" as const } : m,
						),
					})),
				}
			})

			try {
				const sent = await groupApi.send({
					group_id: groupId,
					message_type: failedMessage.message_type,
					content: failedMessage.content,
					...(failedMessage.reply_to ? { reply_to: failedMessage.reply_to.id } : {}),
				})
				replaceOptimistic(failedMessage.id, sent)
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			} catch {
				markFailed(failedMessage.id)
			}
		},
		[queryClient, historyKey, groupId, replaceOptimistic, markFailed],
	)

	return { send, retry }
}
