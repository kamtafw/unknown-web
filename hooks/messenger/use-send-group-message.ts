"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
	GroupChatHistoryData,
	GroupMessage,
	MediaAttachment,
	Message,
	MessageType,
} from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type HistoryData = InfiniteData<GroupChatHistoryData>

let optimisticCounter = 0

/**
 * Exported so use-group-thread.ts's `useSendGroupThreadReply` can build
 * an optimistic thread-reply message with the exact same shape as a
 * regular optimistic group message — the only thing that ever differs
 * between the two is which query-cache entry it gets upserted into (main
 * history vs. a thread's own cache entry), not how the optimistic
 * message itself is constructed. `reply_to` is a bare id now (see
 * chat.ts's CONTRACT CHANGE note) — `replyingTo` is still accepted as a
 * full `Message` because both call sites already have one in hand
 * (the message being replied to, or the thread's parent message).
 */
export function createOptimisticGroupMessage(
	groupId: number,
	content: string,
	replyingTo: Message | null | undefined,
	sender: GroupMessage["sender"],
	overrides?: Partial<Pick<GroupMessage, "message_type" | "media" | "metadata">>,
): GroupMessage {
	optimisticCounter -= 1
	return {
		id: optimisticCounter,
		sender,
		receiver: null,
		group: { id: groupId, name: "", icon_url: "" },
		message_type: overrides?.message_type ?? "text",
		content,
		media: overrides?.media ?? null,
		metadata: overrides?.metadata ?? null,
		is_pinned: false,
		is_deleted_for_all: false,
		is_hidden_by_me: false,
		collection_id: "",
		status: "queued",
		reply_to: replyingTo ? replyingTo.id : null,
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

	const buildSender = useCallback((): GroupMessage["sender"] | null => {
		if (!currentUser) return null
		return {
			id: currentUser.id as GroupMessage["sender"]["id"],
			pkid: currentUser.pkid as GroupMessage["sender"]["pkid"],
			username: currentUser.username,
			first_name: currentUser.first_name,
			last_name: currentUser.last_name,
			profile_photo: currentUser.profile_photo,
		}
	}, [currentUser])

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

	const sendStructured = useCallback(
		async (
			messageType: MessageType,
			options: {
				content?: string
				media?: MediaAttachment[]
				metadata?: Record<string, unknown>
				replyingTo?: Message | null
			},
		) => {
			const sender = buildSender()
			if (!sender) return

			const optimistic = createOptimisticGroupMessage(
				groupId,
				options.content ?? "",
				options.replyingTo,
				sender,
				{
					message_type: messageType,
					media: options.media,
					metadata: options.metadata,
				},
			)
			upsertOptimistic(optimistic)

			try {
				const sent = await groupApi.send({
					group_id: groupId,
					message_type: messageType,
					content: options.content,
					media: options.media,
					metadata: options.metadata,
					...(options.replyingTo ? { reply_to: options.replyingTo.id } : {}),
				})
				replaceOptimistic(optimistic.id, sent)
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[buildSender, groupId, upsertOptimistic, replaceOptimistic, markFailed, queryClient],
	)

	const sendMedia = useCallback(
		(
			media: MediaAttachment[],
			options?: { replyingTo?: Message | null; metadata?: Record<string, unknown> },
		) =>
			sendStructured("media", {
				media,
				metadata: options?.metadata,
				replyingTo: options?.replyingTo,
			}),
		[sendStructured],
	)

	const sendContact = useCallback(
		(contact: { name: string; phoneNumber?: string; email?: string }) =>
			sendStructured("contact", {
				content: contact.name,
				metadata: {
					name: contact.name,
					phone_number: contact.phoneNumber || null,
					email: contact.email || null,
				},
			}),
		[sendStructured],
	)

	const sendLocation = useCallback(
		(latitude: number, longitude: number) =>
			sendStructured("location", { content: "📍 Location", metadata: { latitude, longitude } }),
		[sendStructured],
	)

	const sendVoice = useCallback(
		(mediaUrl: string, fileName: string, duration: string) =>
			sendStructured("media", {
				content: "Voice message",
				media: [{ url: mediaUrl, type: "audio", fileName, caption: "Voice message" }],
				metadata: { duration },
			}),
		[sendStructured],
	)

	const send = useCallback(
		async (content: string, replyingTo?: Message | null) => {
			const sender = buildSender()
			if (!sender) return

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
		[buildSender, groupId, upsertOptimistic, replaceOptimistic, queryClient, markFailed],
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
					...(failedMessage.reply_to ? { reply_to: failedMessage.reply_to } : {}),
				})
				replaceOptimistic(failedMessage.id, sent)
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			} catch {
				markFailed(failedMessage.id)
			}
		},
		[queryClient, historyKey, groupId, replaceOptimistic, markFailed],
	)

	return { send, sendMedia, sendContact, sendLocation, sendVoice, retry }
}
