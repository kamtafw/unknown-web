"use client"

import { groupMessageToMessage } from "@/hooks/messenger/use-group-history"
import { createOptimisticGroupMessage } from "@/hooks/messenger/use-send-group-message"
import { groupApi } from "@/lib/messenger/group-api"
import { compareMessageOrder } from "@/lib/messenger/optimistic"
import { groupKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type {
	GroupChatHistoryData,
	GroupMessage,
	GroupThreadRepliesData,
	MediaAttachment,
	Message,
	MessageType,
	ThreadReplyOrder,
} from "@/types/messenger"
import { InfiniteData, QueryKey, useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

/**
 * Read side: a group message's thread replies.
 *
 * Deliberately a plain `useQuery`, not `useInfiniteQuery` — unlike main
 * group history, no pagination contract is confirmed for this endpoint
 * (see GroupThreadRepliesData's doc comment), and a thread's reply count
 * is expected to be small. If pagination is confirmed later, only this
 * hook and `groupApi.threadReplies` need to change.
 *
 * Ordering: always re-sorted ascending via the same `compareMessageOrder`
 * the main group history uses, regardless of what `order` was requested
 * from the server. This sidesteps having to trust (or guess at) how
 * `order=desc` should be interpreted for display, and — just as
 * importantly — keeps optimistic (negative-id) replies sorting correctly
 * after every real one, exactly like the main history already does.
 */
export function useGroupThreadReplies(
	groupId: number | undefined,
	parentMessageId: number | undefined,
	order: ThreadReplyOrder = "asc",
) {
	const query = useQuery({
		queryKey: groupKeys.replies(groupId ?? 0, parentMessageId ?? 0),
		queryFn: () => groupApi.threadReplies(groupId as number, parentMessageId as number, order),
		enabled: !!groupId && !!parentMessageId,
		staleTime: 30_000,
	})

	const messages = useMemo<Message[]>(() => {
		if (!query.data) return []
		const byId = new Map<number, Message>()
		for (const raw of query.data.results) byId.set(raw.id, groupMessageToMessage(raw))
		return Array.from(byId.values()).sort(compareMessageOrder)
	}, [query.data])

	return { ...query, messages }
}

/**
 * Write side: sending into one message's thread.
 *
 * Mirrors useSendGroupMessage's queued → sending → (HTTP replaces it) /
 * failed + retry flow exactly, and reuses the same
 * `createOptimisticGroupMessage` builder — the only genuine difference
 * is WHICH cache entry gets the optimistic write (this thread's own
 * `groupKeys.replies(groupId, parentMessageId)` entry, never
 * `groupKeys.history(groupId)`) and that `reply_to` is always forced to
 * `parentMessage.id`, never caller-supplied. That's the whole
 * "don't pollute the main timeline" invariant, enforced at the one place
 * a thread reply is actually created.
 *
 * Deliberately NOT a generalized "send into any cache key" abstraction —
 * the main history cache is `InfiniteData<GroupChatHistoryData>` (paged)
 * and this one is a flat `GroupThreadRepliesData` (`{ results }`); those
 * are genuinely different shapes, so sharing one cache-mutation
 * implementation across both would either lie about the shape or need an
 * adapter layer more complex than just writing the (much shorter) flat
 * version directly.
 */
export function useSendGroupThreadReply(groupId: number, parentMessage: Message) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const threadKey: QueryKey = groupKeys.replies(groupId, parentMessage.id)
	const historyKey: QueryKey = groupKeys.history(groupId)

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
			queryClient.setQueryData<GroupThreadRepliesData>(threadKey, (old) => ({
				...(old ?? { results: [] }),
				results: [...(old?.results ?? []), message],
			}))
		},
		[queryClient, threadKey],
	)

	const replaceOptimistic = useCallback(
		(localId: number, replacement: GroupMessage) => {
			queryClient.setQueryData<GroupThreadRepliesData>(threadKey, (old) => {
				if (!old) return old
				return { ...old, results: old.results.map((m) => (m.id === localId ? replacement : m)) }
			})
		},
		[queryClient, threadKey],
	)

	const markFailed = useCallback(
		(localId: number) => {
			queryClient.setQueryData<GroupThreadRepliesData>(threadKey, (old) => {
				if (!old) return old
				return {
					...old,
					results: old.results.map((m) =>
						m.id === localId ? { ...m, status: "failed" as const } : m,
					),
				}
			})
		},
		[queryClient, threadKey],
	)

	/**
	 * `replies_count` optimistic bump on the parent, in the MAIN history
	 * cache — separate cache entry from the thread's own, patched only on
	 * confirmed success (not optimistically alongside the reply itself),
	 * since a send that ultimately fails shouldn't have moved the count.
	 * Deliberately does not touch `groupKeys.lists()` — there's no
	 * confirmed evidence a thread reply should bump the group's
	 * last-message preview the way a main-timeline send does, so this
	 * doesn't invent that behavior.
	 */
	const bumpParentRepliesCount = useCallback(() => {
		queryClient.setQueryData<InfiniteData<GroupChatHistoryData>>(historyKey, (old) => {
			if (!old) return old
			let touched = false
			const pages = old.pages.map((page) => ({
				...page,
				results: page.results.map((m) => {
					if (m.id !== parentMessage.id) return m
					touched = true
					return { ...m, replies_count: (m.replies_count ?? 0) + 1 }
				}),
			}))
			return touched ? { ...old, pages } : old
		})
	}, [queryClient, historyKey, parentMessage.id])

	const sendStructured = useCallback(
		async (
			messageType: MessageType,
			options: {
				content?: string
				media?: MediaAttachment[]
				metadata?: Record<string, unknown>
			},
		) => {
			const sender = buildSender()
			if (!sender) return

			const optimistic = createOptimisticGroupMessage(
				groupId,
				options.content ?? "",
				parentMessage,
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
					reply_to: parentMessage.id,
				})
				replaceOptimistic(optimistic.id, sent)
				bumpParentRepliesCount()
			} catch {
				markFailed(optimistic.id)
			}
		},
		[
			buildSender,
			groupId,
			parentMessage,
			upsertOptimistic,
			replaceOptimistic,
			bumpParentRepliesCount,
			markFailed,
		],
	)

	const send = useCallback(
		(content: string) => sendStructured("text", { content }),
		[sendStructured],
	)

	const sendMedia = useCallback(
		(media: MediaAttachment[], options?: { metadata?: Record<string, unknown> }) =>
			sendStructured("media", { media, metadata: options?.metadata }),
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

	/** Accepts the already-normalized `Message` shape (what ThreadPanel
	 * renders), not `GroupMessage` — unlike the main history's retry,
	 * there's no need to round-trip through `messageToGroupMessage` here
	 * since a thread reply's `reply_to` is always `parentMessage.id`
	 * regardless of what the failed message itself carried. */
	const retry = useCallback(
		async (failedMessage: Message) => {
			queryClient.setQueryData<GroupThreadRepliesData>(threadKey, (old) => {
				if (!old) return old
				return {
					...old,
					results: old.results.map((m) =>
						m.id === failedMessage.id ? { ...m, status: "sending" as const } : m,
					),
				}
			})

			try {
				const sent = await groupApi.send({
					group_id: groupId,
					message_type: failedMessage.message_type,
					content: failedMessage.content,
					reply_to: parentMessage.id,
				})
				replaceOptimistic(failedMessage.id, sent)
				bumpParentRepliesCount()
			} catch {
				markFailed(failedMessage.id)
			}
		},
		[
			queryClient,
			threadKey,
			groupId,
			parentMessage.id,
			replaceOptimistic,
			bumpParentRepliesCount,
			markFailed,
		],
	)

	return { send, sendMedia, sendContact, sendLocation, sendVoice, retry }
}
