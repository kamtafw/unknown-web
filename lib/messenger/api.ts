/**
 * Chat HTTP calls, following the same `xApi = { method: () => apiClient... }`
 * convention as `userApi`/`socialApi` in lib/api.ts — kept in lib/messenger/
 * instead, per the M0 module-structure decision to keep Messenger code
 * discoverable in one place rather than append to the shared file.
 *
 * Every call here hits an `app/api/chats/...` BFF route (D-001), never
 * Django directly.
 */

import { ApiResponse } from "@/types/api"
import {
	ChatListFilter,
	ChatListItem,
	CursorPage,
	Message,
	MessageStatus,
	SendMessagePayload,
} from "@/types/messenger"
import { apiClient } from "../axios"

interface ChatHistoryData extends CursorPage<Message> {
	previous: string | null
	/** true when the other participant has blocked the current user */
	has_blocked_me?: boolean
}

interface ChatListData {
	users: ChatListItem[]
	metadata: { next: string | null }
}

export const chatApi = {
	list: (filter: ChatListFilter, search: string, cursor?: string) => {
		const params = new URLSearchParams()
		if (filter !== "all") params.set("status", filter === "favorites" ? "pinned" : filter)
		if (search) params.set("search", search)
		if (cursor) params.set("search", cursor)
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<ChatListData>>(`/api/chats${qs ? `${qs}` : ""}`)
			.then((r) => r.data.data)
	},

	unreadCount: () =>
		apiClient
			.get<ApiResponse<{ unread_count: number }>>("/api/chats/unread-count")
			.then((r) => r.data.data.unread_count),

	/**
	 * cursorDirection distinguishes the two confirmed cursor fields
	 * (`next`/`previous`) on the real response. See code comment in
	 * use-chat-history.ts for why "no cursor → most recent page, `previous`
	 * → older" is an assumption, not a fully confirmed contract
	 */
	history: (userUuid: string, cursor?: string) => {
		const params = new URLSearchParams()
		if (cursor) params.set("cursor", cursor)
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<ChatHistoryData>>(`/api/chats/history/${userUuid}${qs ? `?${qs}` : ""}`)
			.then((r) => r.data.data)
	},

	send: (payload: SendMessagePayload) =>
		apiClient.post<ApiResponse<Message>>("/api/chats/messages", payload).then((r) => r.data.data),

	updateStatus: (messageId: number, status: Extract<MessageStatus, "delivered" | "seen">) =>
		apiClient.patch(`/api/chats/messages/${messageId}/status`, { status }),

	markSeen: (userUuid: string) => apiClient.post(`/api/chats/history/${userUuid}/seen`, {}),

	searchUsers: (search: string) =>
		apiClient
			.get<ApiResponse<{ results: ChatListItem[] }>>(
				`/api/chats/users?search=${encodeURIComponent(search)}`,
			)
			.then((r) => r.data.data.results),
}
