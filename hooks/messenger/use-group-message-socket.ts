"use client"

import { chatApi } from "@/lib/messenger/api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { removeActorFromEmoji, setActorReaction } from "@/lib/messenger/reactions"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useAuthStore } from "@/stores/auth-store"
import { useMessengerConnectionStore } from "@/stores/messenger-connection.store"
import type {
	EmojiReactionCount,
	GroupChatHistoryData,
	GroupListData,
	GroupListItem,
	GroupMessage,
} from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { patchGroupMessageReaction } from "./use-group-message-actions"

type HistoryData = InfiniteData<GroupChatHistoryData>

interface GroupStatusPayload {
	msgId?: number
	groupId?: number
	status?: GroupMessage["status"]
}

interface GroupDeletePayload {
	groupId?: number
	msgIds?: number[]
	deleteType?: "both"
}

interface HiddenMessagesPayload {
	msgIds?: number[]
	userId?: string
	deleteType?: "self"
}

interface GroupReactionPayload {
	groupId?: number
	msgId?: number
	emoji?: string
	action?: "add" | "remove" | "update"
	userPkid?: number
}

interface GroupMessagePinnedPayload {
	groupId?: number
	msgId?: number
	pinnedByPkid?: number
	action?: "pin" | "unpin"
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
export function useGroupMessageSocket(activeGroupId: number | null, currentUserId: string | undefined) {
	const queryClient = useQueryClient()
	const currentUserPkid = useAuthStore((s) => s.user?.pkid)
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

		const patchEditedListPreview = (message: GroupMessage) => {
			queryClient.setQueriesData<InfiniteData<GroupListData>>(
				{ queryKey: groupKeys.lists() },
				(old) => {
					if (!old) return old

					let changed = false

					const pages = old.pages.map((page) => {
						const groups = page.groups.map((group) => {
							if (
								group.id !== message.group.id ||
								!sameTimestamp(group.last_message_time, message.created_at)
							) {
								return group
							}

							changed = true

							return {
								...group,
								last_message_preview: message.content || null,
								last_message_type: message.message_type,
							}
						})
						return { ...page, groups }
					})
					return changed ? { ...old, pages } : old
				},
			)
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

		const unsubStatus = messengerSocket.on<GroupStatusPayload>(
			GROUP_SOCKET_EVENTS.STATUS,
			(payload) => {
				if (payload.msgId == null || payload.groupId == null || payload.status == null) return
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
			},
		)

		const unsubMessageDeleted = messengerSocket.on<GroupDeletePayload>(
			GROUP_SOCKET_EVENTS.MESSAGE_DELETED,
			(payload) => {
				if (!payload.msgIds?.length || payload.groupId == null) return

				const ids = new Set(payload.msgIds.map(Number))

				queryClient.setQueryData<HistoryData>(groupKeys.history(payload.groupId), (old) => {
					if (!old) return old

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							results: page.results.map((message) =>
								ids.has(message.id)
									? { ...message, is_deleted_for_all: true, content: "" }
									: message,
							),
						})),
					}
				})

				queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
			},
		)

		const unsubMessageHidden = messengerSocket.on<HiddenMessagesPayload>(
			GROUP_SOCKET_EVENTS.HIDDEN,
			(payload) => {
				if (!payload.msgIds?.length) return

				const ids = new Set(payload.msgIds.map(Number))

				queryClient.setQueriesData<HistoryData>({ queryKey: groupKeys.histories() }, (old) => {
					if (!old) return old

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							results: page.results.map((message) =>
								ids.has(message.id) ? { ...message, is_hidden_by_me: true } : message,
							),
						})),
					}
				})
			},
		)

		const unsubMessageUpdated = messengerSocket.on<GroupMessage>(
			GROUP_SOCKET_EVENTS.MESSAGE_UPDATED,
			(message) => {
				if (!message?.group?.id || message.id == null) return

				upsertMessage(message)
				patchEditedListPreview(message)
			},
		)

		const unsubReaction = messengerSocket.on<GroupReactionPayload>(
			GROUP_SOCKET_EVENTS.REACTION,
			(payload) => {
				const groupId = Number(payload.groupId)
				const msgId = Number(payload.msgId)
				const emoji = payload.emoji
				const action = payload.action
				if (!Number.isFinite(groupId) || !Number.isFinite(msgId) || !emoji) return
				if (action !== "add" && action !== "remove" && action !== "update") return

				// Broadcast goes to every member including the actor — skip our own,
				// already applied optimistically in reactToMessage.
				if (currentUserPkid != null && payload.userPkid === currentUserPkid) return

				const actorId = payload.userPkid != null ? String(payload.userPkid) : ""
				if (!actorId) return

				const transform =
					action === "remove"
						? (counts: EmojiReactionCount[]) => removeActorFromEmoji(counts, actorId, emoji)
						: (counts: EmojiReactionCount[]) => setActorReaction(counts, actorId, emoji)

				queryClient.setQueryData<HistoryData>(groupKeys.history(groupId), (old) =>
					patchGroupMessageReaction(old, msgId, transform),
				)
			},
		)

		const unsubMessagePinned = messengerSocket.on<GroupMessagePinnedPayload>(
			GROUP_SOCKET_EVENTS.MESSAGE_PINNED,
			(payload) => {
				if (payload.groupId == null || payload.msgId == null) return
				if (payload.action !== "pin" && payload.action !== "unpin") return

				queryClient.setQueryData<HistoryData>(groupKeys.history(payload.groupId), (old) => {
					if (!old) return old

					return {
						...old,
						pages: old.pages.map((page) => ({
							...page,
							results: page.results.map((message) =>
								message.id === payload.msgId
									? { ...message, is_pinned: payload.action === "pin" }
									: message,
							),
						})),
					}
				})
			},
		)

		return () => {
			unsubMessage()
			unsubStatus()
			unsubMessageDeleted()
			unsubMessageHidden()
			unsubMessageUpdated()
			unsubReaction()
			unsubMessagePinned()
		}
	}, [queryClient, currentUserId, currentUserPkid])
}

function dedupeAppend(existing: GroupMessage[], incoming: GroupMessage): GroupMessage[] {
	if (existing.some((m) => m.id === incoming.id)) {
		return existing.map((m) => (m.id === incoming.id ? incoming : m))
	}
	return [...existing, incoming]
}

function sameTimestamp(a: string | null, b: string): boolean {
	if (!a) return false

	const aTime = Date.parse(a)
	const bTime = Date.parse(b)

	return Number.isFinite(aTime) && aTime === bTime
}
