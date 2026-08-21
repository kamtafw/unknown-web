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

/** `chats/favorites` is a genuinely separate collection, not a status
 * filter on the main list — each entry wraps a `target` (user or group),
 * with its own `id` distinct from the target's own pkid. Confirmed via
 * `mobile's `FavoriteItem`/`FavoriteItemUserTarget` types.
 */
export interface FavoriteItem {
	id: number
	favorite_type: "user" | "group"
	created_at: string
	target: FavoriteUserTarget | FavoriteGroupTarget
}
export interface FavoriteUserTarget {
	id: string
	pkid: number
	username: string
	first_name: string
	last_name: string
	profile_photo: string
	unread_count: number
	last_message_preview: string
	last_message_time: string | null
}
export interface FavoriteGroupTarget {
	id: number
	name: string
	icon_url: string | null
}
export function isFavoriteUserTarget(
	target: FavoriteUserTarget | FavoriteGroupTarget,
): target is FavoriteUserTarget {
	return "pkid" in target
}

export interface CustomListItem {
	id: number
	name: string
	created_at: string
}

export interface CustomListMember {
	id: number
	type: "user" | "group"
	target_user: {
		id: string
		pkid: number
		username: string
		first_name: string
		last_name: string
		profile_photo: string
	} | null
	target_group: { id: number; name: string; icon_url: string | null } | null
	added_at: string
}

export type MessageDeleteType = "self" | "both"

export const chatApi = {
	list: (filter: ChatListFilter, search: string, cursor?: string) => {
		const params = new URLSearchParams()
		params.set('status', filter==='unread'?'unread':'all')
		if (search) params.set("search", search)
		if (cursor) params.set("cursor", cursor)
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<ChatListData>>(`/api/chats${qs ? `?${qs}` : ""}`)
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

	// Chat-list actions
	pin: (userPkid: number) => apiClient.post("/api/chats/users/pin", { user_id: userPkid }),
	unpin: (userUuid: string) => apiClient.delete(`/api/chats/users/${userUuid}/unpin`),

	mute: (userPkid: number, muteUntil?: string) =>
		apiClient.post("/api/chats/mute", {
			user_id: userPkid,
			...(muteUntil ? { mute_until: muteUntil } : {}),
		}),
	unmute: (userPkid: number) => apiClient.post("/api/chats/unmute", { user_id: userPkid }),

	archive: (userPkid: number) => apiClient.post("/api/chats/archive", { user_id: userPkid }),
	unarchive: (userPkid: number) => apiClient.post("/api/chats/unarchive", { user_id: userPkid }),
	archiveBulk: (userPkids: number[]) =>
		apiClient.post("/api/chats/archive-bulk", { user_ids: userPkids }),

	listFavorites: () =>
		apiClient
			.get<ApiResponse<{ results: FavoriteItem[] }>>("/api/chats/favorites")
			.then((r) => r.data.data.results),
	addFavorite: (targetUserPkid: number) =>
		apiClient
			.post<ApiResponse<FavoriteItem>>("/api/chats/favorites", {
				favorite_type: "user",
				target_user: targetUserPkid,
			})
			.then((r) => r.data.data),
	removeFavorite: (favoriteId: number, targetUserPkid: number) =>
		apiClient.delete(`/api/chats/favorites/${favoriteId}/remove`, {
			data: { favorite_type: "user", target_user: targetUserPkid },
		}),

	block: (userPkid: number, reason?: string) =>
		apiClient.post("/api/chats/users/block", {
			blocked_user_id: userPkid,
			...(reason ? { reason } : {}),
		}),
	unblock: (userPkid: number) =>
		apiClient.post("/api/chats/users/unblock", { blocked_user_id: userPkid }),

	clearChat: (userPkid: number) => apiClient.post(`/api/chats/users/${userPkid}/clear`, {}),
	clearBulk: (userPkids: number[]) =>
		apiClient.post("/api/chats/users/clear-bulk", { user_ids: userPkids }),

	listCustomLists: () =>
		apiClient
			.get<ApiResponse<{ lists: CustomListItem[] }>>("/api/chats/custom-lists")
			.then((r) => r.data.data.lists),
	createCustomList: (name: string, userPkids: number[] = []) =>
		apiClient
			.post<ApiResponse<CustomListItem>>("/api/chats/custom-lists", {
				name,
				user_ids: userPkids,
				group_ids: [],
			})
			.then((r) => r.data.data),
	deleteCustomList: (listId: number) => apiClient.delete(`/api/chats/custom-lists/${listId}`),
	listCustomListMembers: (listId: number, cursor?: string) => {
		const qs = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""
		return apiClient
			.get<ApiResponse<{ results: CustomListMember[]; next: string | null }>>(
				`/api/chats/custom-lists/${listId}/items${qs}`,
			)
			.then((r) => r.data.data)
	},
	addToCustomList: (listId: number, userPkids: number[]) =>
		apiClient.post(`/api/chats/custom-lists/${listId}/add-members`, { user_ids: userPkids }),
	removeFromCustomList: (listId: number, userPkids: number[]) =>
		apiClient.post(`/api/chats/custom-lists/${listId}/remove-members`, { user_ids: userPkids }),

	// Message actions
	forwardMessage: (messageId: number, targets: { type: "user"; id: number }[], comment?: string) =>
		apiClient.post("/api/chats/messages/forward", { message_id: messageId, targets, comment }),

	pinMessage: (messageId: number, targetPkid: number) =>
		apiClient.post("/api/chats/messages/pin", {
			message_id: messageId,
			chat_type: "user",
			target_id: targetPkid,
		}),
	unpinMessage: (messageId: number, targetPkid: number) =>
		apiClient.post("/api/chats/messages/unpin", {
			message_id: messageId,
			chat_type: "user",
			target_id: targetPkid,
		}),

	deleteMessage: (messageId: number, deleteType: MessageDeleteType) =>
		apiClient.post(`/api/chats/messages/${messageId}`, { delete_type: deleteType }),
}
