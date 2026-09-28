"use client"

import { chatApi } from "@/lib/messenger/api"
import { prepareDirectMessageSendPayload } from "@/lib/messenger/e2ee/direct-message"
import {
	getDirectMessageOutboxEntry,
	removeDirectMessageOutboxEntry,
} from "@/lib/messenger/e2ee/direct-message-outbox"
import { saveLocalMessageCopy } from "@/lib/messenger/e2ee/local-message-store"
import { e2eeRuntime } from "@/lib/messenger/e2ee/runtime"
import { createOptimisticMessage, withStatus } from "@/lib/messenger/optimistic"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
	CursorPage,
	MediaAttachment,
	Message,
	MessageType,
	Pkid,
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

	const getDirectMessagePayload = useCallback(
		async (
			messageType: MessageType,
			content: string,
			options: {
				media?: MediaAttachment[]
				metadata?: Record<string, unknown>
				replyingTo?: Message | null
			},
		) => {
			if (!currentUser || !currentUser.pkid) return null

			await e2eeRuntime.activate(currentUser.pkid as Pkid)
			const identity = e2eeRuntime.getState()?.identity ?? null
			if (!identity) return null

			try {
				const bundle = await chatApi.getUserEncryptionBundle(receiverPkid)
				return prepareDirectMessageSendPayload({
					accountId: currentUser.pkid as Pkid,
					recipientId: receiverPkid,
					plaintext: content,
					senderIdentity: identity,
					bundle,
					messageType,
					media: options.media,
					metadata: options.metadata,
					reply_to: options.replyingTo ? options.replyingTo.id : undefined,
				})
			} catch {
				return null
			}
		},
		[currentUser, receiverPkid],
	)

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

			const payload = await getDirectMessagePayload(messageType, options.content ?? "", {
				media: options.media,
				metadata: options.metadata,
				replyingTo: options.replyingTo,
			})
			if (!payload) return

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
				options.content ?? "",
			)
			upsertOptimistic(optimistic)

			try {
				const sent = await chatApi.send(payload)
				const displayMessage = { ...sent, content: options.content ?? "" }

				replaceOptimistic(optimistic.id, displayMessage)

				if (sent.id > 0 && payload.metadata?.e2ee_content_hash) {
					const peerId = receiverPkid

					void saveLocalMessageCopy({
						accountId: currentUser.pkid as Pkid,
						messageId: sent.id,
						peerId,
						envelopeHash: String(payload.metadata.e2ee_content_hash),
						plaintext: options.content ?? "",
						messageType: sent.message_type,
						createdAt: sent.created_at,
					}).catch(() => undefined)
				}

				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[
			currentUser,
			getDirectMessagePayload,
			upsertOptimistic,
			replaceOptimistic,
			queryClient,
			receiverPkid,
			markFailed,
		],
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

			const payload = await getDirectMessagePayload("text", content, { replyingTo })
			if (!payload) return

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
				content,
			)
			upsertOptimistic(optimistic)

			try {
				const sent = await chatApi.send(payload)
				const displayMessage = { ...sent, content }

				replaceOptimistic(optimistic.id, displayMessage)

				if (sent.id > 0 && payload.metadata?.e2ee_content_hash) {
					const peerId = receiverPkid

					void saveLocalMessageCopy({
						accountId: currentUser.pkid as Pkid,
						messageId: sent.id,
						peerId,
						envelopeHash: String(payload.metadata.e2ee_content_hash),
						plaintext: content ?? "",
						messageType: sent.message_type,
						createdAt: sent.created_at,
					}).catch(() => undefined)
				}

				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(optimistic.id)
			}
		},
		[
			currentUser,
			getDirectMessagePayload,
			upsertOptimistic,
			replaceOptimistic,
			queryClient,
			receiverPkid,
			markFailed,
		],
	)

	const retry = useCallback(
		async (failedMessage: Message) => {
			const entry = getDirectMessageOutboxEntry(failedMessage.id)

			if (!entry || !currentUser) return

			// mark sending
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
				const payload = await getDirectMessagePayload(entry.messageType, entry.plaintext, {
					media: entry.media,
					metadata: entry.metadata,
					replyingTo: null,
				})

				if (!payload) {
					throw new Error("Unable to prepare encrypted retry")
				}

				const sent = await chatApi.send(payload)

				replaceOptimistic(failedMessage.id, {
					...sent,
					content: entry.plaintext,
					status: sent.status,
				})

				if (sent.id > 0 && payload.metadata?.e2ee_content_hash) {
					void saveLocalMessageCopy({
						accountId: entry.accountId,
						messageId: sent.id,
						peerId: entry.recipientId,
						envelopeHash: String(payload.metadata.e2ee_content_hash),
						plaintext: entry.plaintext,
						messageType: sent.message_type,
						createdAt: sent.created_at,
					}).catch(() => undefined)
				}

				removeDirectMessageOutboxEntry(failedMessage.id)

				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			} catch {
				markFailed(failedMessage.id)
			}
		},
		[currentUser, getDirectMessagePayload, historyKey, queryClient, replaceOptimistic, markFailed],
	)

	return { send, sendMedia, sendContact, sendLocation, sendVoice, retry }
}
