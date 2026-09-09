"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { CHAT_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useMessengerConnectionStore } from "@/stores/messenger-connection.store"
import type { ChatListItem, CursorPage, Message, Uuid } from "@/types/messenger"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"

type HistoryPage = CursorPage<Message> & { previous: string | null }
type HistoryData = InfiniteData<HistoryPage>
interface ChatListData {
	users: ChatListItem[]
	metadata: { next: string | null }
}

interface ChatStatusPayload {
	msgId?: number
	status?: Message["status"]
	senderId?: string
	receiverId?: string
}

/**
 * Mount exactly once, at the Messenger layout level — not per conversation.
 * `activeUuid` is the currently open direct conversation (from the route),
 * or null when only the list is showing. Implements the guides's S~3/S~4
 * rules: upsert-by-ID, suppress unread while open, ack delivered always,
 * ack seen only while visible+open, and reconcile after reconnect or the
 * tab becoming visible again — socket delivery is not replacement for
 * HTTP sync.
 */
export function useChatSocket(activeUuid: Uuid | null) {
	const queryClient = useQueryClient()
	const connectionStatus = useMessengerConnectionStore((s) => s.status)
	const activeUuidRef = useRef(activeUuid)
	useEffect(() => {
		activeUuidRef.current = activeUuid
	}, [activeUuid])
	const [typingUuids, setTypingUuids] = useState<Set<Uuid>>(new Set())
	const typingTimersRef = useRef<Map<Uuid, ReturnType<typeof setTimeout>>>(new Map())

	// Reconciliation happens ONLY on a genuine reconnect (the connection
	// actually dropped and came back), not on every tab-visibility change.
	//
	// BUG FIX (2026-08-15): this used to also invalidate on every simple
	// visibility change (tab/app switch), which raced with optimistic
	// updates elsewhere (mark-seen on opening a conversation, the unread
	// badge increment below) — if the backend hadn't finished processing
	// the underlying action yet, the resulting refetch could return STALE
	// data and stomp a just-applied optimistic update, which is exactly
	// the cause of "badge persists until I switch tabs and back" symptom
	// (the fix *looked* like it needed a second visibility change to take
	// effect, because that second change happened to land after the
	// backend had caught up — not because a second change was actually
	// required). A genuinely dropped-and-restored socket connection is the
	// only case where events could actually have been missed; visibility
	// alone doesn't imply that.
	const prevStatusRef = useRef(connectionStatus)
	useEffect(() => {
		const reconnected = prevStatusRef.current !== "connected" && connectionStatus === "connected"
		prevStatusRef.current = connectionStatus
		if (!reconnected) return

		queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
		queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
		if (activeUuidRef.current) {
			queryClient.invalidateQueries({ queryKey: chatKeys.history(activeUuidRef.current) })
		}
	}, [connectionStatus, queryClient])

	// isVisible is no longer read here — the earlier version had a
	// visibility-triggered invalidation effect (removed above). The
	// chat:receive handler's own "only ack seen while visible" check reads
	// `document.visibilityState` directly as a one-off DOM check, not
	// through this hook's reactive state — so useDocumentVisible() isn't
	// needed in this file anymore.

	useEffect(() => {
		const upsertMessage = (message: Message) => {
			const senderUuid = message.sender.id
			queryClient.setQueryData<HistoryData>(chatKeys.history(senderUuid), (old) => {
				if (!old) return old // no cache for this conversation yet — list refetch covers preview
				const pages = old.pages.map((page, i) =>
					i === old.pages.length - 1
						? { ...page, results: dedupeAppend(page.results, message) }
						: page,
				)
				return { ...old, pages }
			})
		}

		/** Returns whether it actually found and patched a cached row. */
		const bumpListPreview = (message: Message, isOpen: boolean): boolean => {
			let found = false
			queryClient.setQueriesData<ChatListData>({ queryKey: chatKeys.lists() }, (old) => {
				if (!old) return old
				const idx = old.users.findIndex((u) => u.id === message.sender.id)
				if (idx === -1) return old
				found = true
				const existing = old.users[idx]
				const updated: ChatListItem = {
					...existing,
					last_message_preview: message.content || null,
					last_message_type: message.message_type,
					last_message_time: message.created_at,
					unread_count: isOpen ? existing.unread_count : existing.unread_count + 1,
				}
				const rest = old.users.filter((_, i) => i !== idx)
				return { ...old, users: [updated, ...rest] }
			})
			return found
		}

		const unsubReceive = messengerSocket.on<Message>(CHAT_SOCKET_EVENTS.RECEIVE, (rawMessage) => {
			// Defensive normalization: the guide only describes this event as
			// a table entry, not an exact JSON schema, and it's never been
			// verified against a real payload from this environment. If the
			// real event nests sender differently than the REST `Message`
			// shape (e.g. a flat `senderId` instead of `sender.id`), silently
			// trusting `message.sender.id` would break both
			const message = rawMessage
			if (process.env.NODE_ENV !== "production") {
				console.debug("[messenger] chat:receive payload", rawMessage)
			}

			// BUG FIX (2026-08-15): this branch used to invalidate and then
			// fall through into `message.sender.id` anyway — a missing
			// `return` meant a malformed payload could throw here instead of
			// degrading gracefully to a refetch
			if (!message?.sender?.id) {
				if (process.env.NODE_ENV !== "production") {
					console.warn(
						"[messenger] chat:receive arrived without a usable sender.id — ",
						+"see the console.debug above and check MESSENGER.md's open items.",
					)
				}
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
				queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
				return
			}

			const isOpen = activeUuidRef.current === message.sender.id
			upsertMessage(message)
			const patchedList = bumpListPreview(message, isOpen)

			// BUG FIX (2026-08-15): this condition was inverted
			// (`if (patchedList)`), which is very likely the main cause of
			// the cross-browser badge inconsistency. As written before, it
			// forced a refetch every time the optimistic patch *succeeded*
			// (racing that fresh, correct update against a possibly-stale
			// server response) and did nothing when the patch *failed*
			// (leaving the badge silently wrong with no fallback at all —
			// the exact "message shows in the list but no badge" symptom).
			// Different browsers' focus/throttling timing made the race
			// land differently, which is why it looked browser-specific
			// rather than a clean always-fails bug.
			if (!patchedList) {
				queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			}
			if (!isOpen) {
				// The TopBar total is a separate cached number, not derived
				// from the list — always refresh it on an unread-producing
				// event rather than trying to keep a local counter in sync.
				queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
			}

			// Always ack delivered; only ack seen while the conversation is
			// actually open and the tab is visible — a socket connection
			// alone is never enough to mark something seen (guide, S~4).
			void chatApi.updateStatus(message.id, "delivered").catch(() => undefined)
			if (isOpen && document.visibilityState === "visible") {
				void chatApi.updateStatus(message.id, "seen").catch(() => undefined)
			}
		})

		// BUG FIX (2026-08-15): previously resolved a single "peerUuid" from
		// `payload.senderId ?? payload.receiverId` and wrote directly to
		// `chatKeys.history(peerUuid)`. That's ambiguous by construction —
		// senderId/receiverId describe the ORIGINAL MESSAGE's participants,
		// not "which one is me", so whenever the current user IS the
		// sender (exactly the "my sent message just got seen" case), this
		// resolved to the sender's OWN uuid — a cache key that never
		// exists, since conversations are always keyed by the OTHER
		// party's uuid. The write silently went nowhere. This is likely
		// the whole explanation for "blue ticks only appear after reload":
		// the real-time chat:status update for a message I sent was
		// being written to cache entry nothing reads. Fixed by matching
		// `unsubSent`'s pattern below: search every cached history instead
		// of trying to resolve which uuid it belongs to.
		const unsubStatus = messengerSocket.on<ChatStatusPayload>(
			CHAT_SOCKET_EVENTS.STATUS,
			(payload) => {
				if (!payload.msgId || !payload.status) return
				queryClient.setQueriesData<HistoryData>({ queryKey: chatKeys.histories() }, (old) => {
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

		// `chat:sent` shares its shape with `chat:receive` on the mobile
		// contract (a status update, not a distinct payload) — the HTTP
		// response is still the authoritative send acknowledgment per the
		// guide, so this is a safety-net patch only, not the primary path.
		const unsubSent = messengerSocket.on<ChatStatusPayload>(CHAT_SOCKET_EVENTS.SENT, (payload) => {
			if (!payload.msgId || !payload.status) return
			queryClient.setQueriesData<HistoryData>({ queryKey: chatKeys.histories() }, (old) => {
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

		// Powers the chat-list "Typing a message..." live preview (screenshot
		// evidence) for ANY conversation, not just the currently open one —
		// distinct from use-typing.ts, which only cares about the open peer
		const unsubTyping = messengerSocket.on<{
			senderId?: string
			userId?: string
			isTyping?: boolean
		}>(CHAT_SOCKET_EVENTS.TYPING_RECEIVE, (payload) => {
			const uuid = (payload.senderId ?? payload.userId) as Uuid | undefined
			if (!uuid) return

			const existingTimer = typingTimersRef.current.get(uuid)
			if (existingTimer) clearTimeout(existingTimer)

			if (payload.isTyping) {
				setTypingUuids((prev) => new Set(prev).add(uuid))
				typingTimersRef.current.set(
					uuid,
					setTimeout(() => {
						setTypingUuids((prev) => {
							const next = new Set(prev)
							next.delete(uuid)
							return next
						})
					}, 8000),
				)
			} else {
				setTypingUuids((prev) => {
					const next = new Set(prev)
					next.delete(uuid)
					return next
				})
			}
		})

		return () => {
			unsubReceive()
			unsubStatus()
			unsubSent()
			unsubTyping()
			// Deliberately reads the ref's live value here, not a snapshot
			// captured at effect setup — this Map accumulates timers for the
			// whole effect lifetime and cleanup needs to clear whatever
			// currently exists, not what existed when the effect first ran.
			for (const timer of typingTimersRef.current.values()) clearTimeout(timer)
		}
	}, [queryClient])

	return { typingUuids }
}

function dedupeAppend(existing: Message[], incoming: Message): Message[] {
	if (existing.some((m) => m.id === incoming.id)) {
		return existing.map((m) => (m.id === incoming.id ? incoming : m))
	}
	return [...existing, incoming]
}
