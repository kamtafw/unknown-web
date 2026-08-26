"use client"

import { chatApi } from "@/lib/messenger/api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useMessengerConnectionStore } from "@/stores/messenger-connection.store"
import type {
	GroupChatHistoryData,
	GroupListData,
	GroupListItem,
	GroupMessage,
} from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

type HistoryData = InfiniteData<GroupChatHistoryData>

interface GroupDeletePayload {
	msgId?: number
	groupId?: number
}

/**
 * Mount once at the Messenger shell level, alongside useChatSocket and
 * useGroupRoomSubscription. `activeGroupId`/`currentUserId` identify the
 * open group and "me" so unread/ack logic can tell own-vs-other messages
 * apart — unconfirmed whether `group:message` is sender-inclusive, so
 * this guards against inflating your own unread count either way.
 *
 * Status acks reuse the SAME chats/messages/:id/status endpoint as 1:1
 * (confirmed via mobile — group messages ack through the shared endpoint,
 * not a group-specific one).
 *
 * Duplicate-id safety: a message appearing twice in a page's raw results
 * (e.g. a socket echo landing just before the HTTP send response replaces
 * the optimistic entry) is already collapsed at read time — see
 * use-group-history.ts's Map-keyed reduction. No extra guard needed here.
 */
export function useGroupSocket(activeGroupId: number | null, currentUserId: string | undefined) {
	const queryClient = useQueryClient()
	const connectionStatus = useMessengerConnectionStore((s) => s.status)
	const activeGroupIdRef = useRef(activeGroupId)
	useEffect(() => {
		activeGroupIdRef.current = activeGroupId
	}, [activeGroupId])

	// Reconciliation on genuine reconnect only — same rationale as
	// useChatSocket's reconnect-only guard (visibility-change reconciliation
	// raced optimistic updates there; the same risk applies here).
	const prevStatusRef = useRef(connectionStatus)
	useEffect(() => {
		const reconnected = prevStatusRef.current !== "connected" && connectionStatus === "connected"
		prevStatusRef.current = connectionStatus
		if (!reconnected) return

		queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
		if (activeGroupIdRef.current) {
			queryClient.invalidateQueries({ queryKey: groupKeys.history(activeGroupIdRef.current) })
		}
	}, [connectionStatus, queryClient])

	useEffect(() => {
		const upsertMessage = (message: GroupMessage) => {
			queryClient.setQueryData<HistoryData>(groupKeys.history(message.group.id), (old) => {
				if (!old) return old
				const pages = old.pages.map((page, i) =>
					i === old.pages.length - 1
						? { ...page, results: dedupeAppend(page.results, message) }
						: page,
				)
				return { ...old, pages }
			})
		}

		const bumpListPreview = (message: GroupMessage, isOpen: boolean): boolean => {
			let found = false
			queryClient.setQueriesData<InfiniteData<GroupListData>>(
				{ queryKey: groupKeys.lists() },
				(old) => {
					if (!old) return old
					const pages = old.pages.map((page) => {
						const idx = page.groups.findIndex((g) => g.id === message.group.id)
						if (idx === -1) return page
						found = true
						const existing = page.groups[idx]
						const updated: GroupListItem = {
							...existing,
							last_message_preview: message.content || null,
							last_message_type: message.message_type,
							last_message_time: message.created_at,
							unread_count: isOpen ? existing.unread_count : (existing.unread_count ?? 0) + 1,
						}
						const groups = [...page.groups]
						groups[idx] = updated
						return { ...page, groups }
					})
					return found ? { ...old, pages } : old
				},
			)
			return found
		}

		const unsubMessage = messengerSocket.on<GroupMessage>(
			GROUP_SOCKET_EVENTS.MESSAGE,
			(message) => {
				if (!message?.group?.id) {
					queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
					return
				}

				const isOwn = currentUserId != null && message.sender.id === currentUserId
				const isOpen = activeGroupIdRef.current === message.group.id

				upsertMessage(message)
				const patchedList = bumpListPreview(message, isOpen || isOwn)
				if (!patchedList) {
					queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
				}

				if (isOwn) return // don't ack our own message

				void chatApi.updateStatus(message.id, "delivered").catch(() => undefined)
				if (isOpen && document.visibilityState === "visible") {
					void chatApi.updateStatus(message.id, "seen").catch(() => undefined)
				}
			},
		)

		const unsubStatus = messengerSocket.on<{
			msgId?: number
			groupId?: number
			status?: GroupMessage["status"]
		}>(GROUP_SOCKET_EVENTS.STATUS, (payload) => {
			if (!payload.msgId || !payload.groupId || !payload.status) return
			queryClient.setQueryData<HistoryData>(groupKeys.history(payload.groupId), (old) => {
				if (!old) return old
				return {
					...old,
					pages: old.pages.map((page) => ({
						...page,
						results: page.results.map((m) =>
							m.id === payload.msgId ? { ...m, status: payload.status! } : m,
						),
					})),
				}
			})
		})

		// group:message:deleted is broadcast to ALL room members after a
		// group:delete, including the deleter — see
		// use-group-message-actions.ts. Patches via the shared {deleted,
		// content: ""} convention M2 already established for 1:1 delete,
		// not mobile's own internal "overwrite content with literal text"
		// representation — keeps MessageBubble's existing deleted-state
		// rendering the single source of truth.
		const unsubDeleted = messengerSocket.on<GroupDeletePayload>(
			GROUP_SOCKET_EVENTS.MESSAGE_DELETED,
			(payload) => {
				if (!payload.msgId || !payload.groupId) return
				queryClient.setQueryData<HistoryData>(groupKeys.history(payload.groupId), (old) => {
					if (!old) return old
					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							results: page.results.map((m) =>
								m.id === payload.msgId ? { ...m, deleted: true, content: "" } : m,
							),
						})),
					}
				})
				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			},
		)

		return () => {
			unsubMessage()
			unsubStatus()
			unsubDeleted()
		}
	}, [queryClient, currentUserId])
}

function dedupeAppend(existing: GroupMessage[], incoming: GroupMessage): GroupMessage[] {
	if (existing.some((m) => m.id === incoming.id)) {
		return existing.map((m) => (m.id === incoming.id ? incoming : m))
	}
	return [...existing, incoming]
}
