"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, MessageDeleteType } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import {
	isReactionRemoval,
	toggleActorReaction,
	totalReactionCount,
} from "@/lib/messenger/reactions"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { EmojiReactionCount, Message, Pkid, Uuid } from "@/types/messenger"
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

	const reactToMessage = useReactToMessage(peerUuid)

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
				await chatApi.pinMessage(message.id, "user", peerPkid)
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
				await chatApi.unpinMessage(message.id, "user", peerPkid)
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
				const patch: Partial<Message> =
					deleteType === "both" ? { is_deleted_for_all: true } : { is_hidden_by_me: true }
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, { ...patch, content: "" }),
				)
			} catch (err) {
				toast.error(extractMessage(err, "Couldn't delete the message — try again"))
			}
		},
		[queryClient, historyKey],
	)

	return { forward, reactToMessage, pinMessage, unpinMessage, deleteMessage }
}

/**
 * Separate from useMessageActions since it's a read, not an action — kept
 * in this file rather than a new one, tightly coupled to same domain.
 *
 * NOT wired up for direct/user chats — confirmed via mobile
 * (chat/[id].tsx: "the dedicated /chats/messages/pinned:id endpoint
 * 404s on this backend or returns empty") that chat_type=user is
 * unreliable here. Direct chats derive pinned messages from loaded
 * history instead (see ConversationView). Retained for chat_type=group,
 * which mobile's useGetPinnedChatMessages does call successfully.
 */
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

function readMessageReactionCounts(old: unknown, messageId: number): EmojiReactionCount[] {
	const data = old as { pages?: Array<{ results: Message[] }> } | undefined
	if (!data?.pages) return []
	for (const page of data.pages) {
		const found = page.results.find((m) => m.id === messageId)
		if (found) return found.emoji_reaction_counts ?? []
	}
	return []
}

/** No socket path for 1:1 (confirmed absent from mobile's chat socket) —
 * HTTP + optimistic path + invalidate-on-success only, so a concurrent
 * reactor's count still converges without a realtime push. */
export function useReactToMessage(peerUuid: Uuid) {
	const queryClient = useQueryClient()
	const currentUser = useAuthStore((s) => s.user)
	const historyKey = chatKeys.history(peerUuid)

	return useCallback(
		async (message: Message, emoji: string) => {
			if (!currentUser) return
			const actorId = String(currentUser.pkid)
			const previousCounts = readMessageReactionCounts(
				queryClient.getQueryData(historyKey),
				message.id,
			)
			const isRemoval = isReactionRemoval(previousCounts, actorId, emoji)
			const nextCounts = toggleActorReaction(previousCounts, actorId, emoji)

			queryClient.setQueryData(historyKey, (old: unknown) =>
				patchMessageInHistory(old, message.id, {
					emoji_reaction_counts: nextCounts,
					reactions_count: totalReactionCount(nextCounts),
				}),
			)

			try {
				if (isRemoval) {
					await chatApi.removeReaction(message.id)
				} else {
					await chatApi.reactToMessage(message.id, emoji)
				}
				queryClient.invalidateQueries({ queryKey: historyKey })
			} catch (err) {
				queryClient.setQueryData(historyKey, (old: unknown) =>
					patchMessageInHistory(old, message.id, {
						emoji_reaction_counts: previousCounts,
						reactions_count: totalReactionCount(previousCounts),
					}),
				)
				toast.error(extractMessage(err, "Couldn't react to the message — try again"))
			}
		},
		[queryClient, historyKey, currentUser],
	)
}

/** Confirmed endpoint, lazy (only called when a reaction
 * pill's popover is opened). */
export function useMessageReactions(messageId: number | null) {
	return useQuery({
		queryKey: chatKeys.reactions(messageId ?? 0),
		queryFn: () => chatApi.listMessageReactions(messageId as number),
		enabled: !!messageId && messageId > 0,
		staleTime: 15_000,
	})
}
