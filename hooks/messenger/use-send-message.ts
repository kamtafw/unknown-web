"use client"

import { chatApi } from "@/lib/messenger/api"
import { createOptimisticMessage, withStatus } from "@/lib/messenger/optimistic"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
	CursorPage,
	MediaAttachment,
	Message,
	MessageType,
	Pkid,
	SendMessagePayload,
	Uuid,
} from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

type HistoryPage = CursorPage<Message> & { previous: string | null }
type HistoryData = InfiniteData<HistoryPage>

/**
 * Implements the guide's S~"Sending a message" flow exactly:
 * queued → sending → (HTTP response replaces it) sent, or failed + retry.
 * Never treats a socket event as the send acknowledgement — only the HTTP
 * response is authoritative, per the guide.
 */
export function useSendMessage(receiverUuid: Uuid, receiverPkid: Pkid) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const historyKey = chatKeys.history(receiverUuid)
	// encryption-related variables — their values are random at the
	// moment as encryption isn't functional yet.
	const NONCE = "NONCE"
	const SENDER_EPHEMERAL_KEY = "SENDER_EPHEMERAL_KEY"

	const upsertOptimistic = useCallback(
		(message: Message) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				const page: HistoryPage = old?.pages[old.pages.length - 1] ?? {
					results: [],
					next: null,
					previous: null,
				}
				const nextPage: HistoryPage = { ...page, results: [...page.results, message] }
				if (!old) {
					return { pages: [nextPage], pageParams: [undefined] }
				}
				return { ...old, pages: [...old.pages.slice(0, -1), nextPage] }
			})
		},
		[queryClient, historyKey],
	)

	const replaceOptimistic = useCallback(
		(localId: number, replacement: Message) => {
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
						results: page.results.map((m) => (m.id === localId ? withStatus(m, "failed") : m)),
					})),
				}
			})
		},
		[queryClient, historyKey],
	)

	/** Shared by text and every structured type (media/contact/location). */
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
			if (!currentUser) return

			const payload: SendMessagePayload = {
				receiver_id: receiverPkid,
				message_type: messageType,
				content: options.content,
				media: options.media,
				metadata: options.metadata,
				...(options.replyingTo ? { reply_to: options.replyingTo.id } : {}),
				nonce: NONCE,
				sender_ephemeral_key: SENDER_EPHEMERAL_KEY,
			}

			const optimistic = createOptimisticMessage(
				payload,
				{
					id: currentUser.id as Uuid,
					pkid: currentUser.pkid as Pkid,
					username: currentUser.username,
					first_name: currentUser.first_name,
					last_name: currentUser.last_name,
					profile_photo: currentUser.profile_photo,
				},
				options.replyingTo,
			)
			upsertOptimistic(optimistic)

			try {
				const sent = await chatApi.send(payload)
				replaceOptimistic(optimistic.id, sent)
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[currentUser, receiverPkid, upsertOptimistic, replaceOptimistic, markFailed, queryClient],
	)

	/** Caption lives on `media[].caption`, not `content` — confirmed via
	 * mobile's `handleMediaSend`: `content` is never set for media sends. */
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

	/** Manual entry, not a native picker — no reliable cross-browser
	 * Contacts API. Payload shape matches mobile's PickedContact metadata
	 * exactly; `avatar_uri` omitted, no source for a photo here. */
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
			if (!currentUser) return

			const payload: SendMessagePayload = {
				receiver_id: receiverPkid,
				message_type: "text",
				content,
				...(replyingTo ? { reply_to: replyingTo.id } : {}),
				nonce: NONCE,
				sender_ephemeral_key: SENDER_EPHEMERAL_KEY,
			}

			const optimistic = createOptimisticMessage(
				payload,
				{
					id: currentUser.id as Uuid,
					pkid: currentUser.pkid as Pkid,
					username: currentUser.username,
					first_name: currentUser.first_name,
					last_name: currentUser.last_name,
					profile_photo: currentUser.profile_photo,
				},
				replyingTo,
			)
			upsertOptimistic(optimistic)

			try {
				const sent = await chatApi.send(payload)
				replaceOptimistic(optimistic.id, sent)
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[currentUser, receiverPkid, upsertOptimistic, replaceOptimistic, markFailed, queryClient],
	)

	const retry = useCallback(
		async (failedMessage: Message) => {
			queryClient.setQueryData<HistoryData>(historyKey, (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) =>
							m.id === failedMessage.id ? withStatus(m, "sending") : m,
						),
					})),
				}
			})

			try {
				const sent = await chatApi.send({
					receiver_id: receiverPkid,
					message_type: failedMessage.message_type,
					content: failedMessage.content,
					...(failedMessage.reply_to ? { reply_to: failedMessage.reply_to } : {}),
				})
				replaceOptimistic(failedMessage.id, sent)
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(failedMessage.id)
			}
		},
		[queryClient, historyKey, receiverPkid, replaceOptimistic, markFailed],
	)

	return { send, sendMedia, sendContact, sendLocation, sendVoice, retry }
}
