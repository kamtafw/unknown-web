/**
 * Group HTTP calls — read path only for this M3 slice (list/detail/
 * history/mark-seen). Admin actions (pause/permissions/members/roles) and
 * message send/delete are confirmed contracts (types/messenger/group.ts)
 * but deliberately not wired here — that's the composer/admin-surfaces
 * slice, per the M3 sequencing decision.
 *
 * Same `app/api/chats/...` BFF convention as lib/messenger/api.ts (D-001).
 */

import { ApiResponse } from "@/types/api"
import {
	CreateGroupPayload,
	CreateGroupResponse,
	Group,
	GroupChatHistoryData,
	GroupListData,
	GroupMembersData,
	GroupMessage,
	GroupRole,
	ManageGroupMemberRolePayload,
	PauseGroupPayload,
	Pkid,
	RemoveGroupMemberPayload,
	SendMessagePayload,
	SyncGroupMembersPayload,
	UpdateGroupPermissionsPayload,
} from "@/types/messenger"
import { apiClient } from "../axios"

export const groupApi = {
	list: (cursor?: string) => {
		const params = new URLSearchParams()
		if (cursor) params.set("cursor", cursor)
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<GroupListData>>(`/api/chats/groups${qs ? `?${qs}` : ""}`)
			.then((r) => r.data.data)
	},

	detail: (groupId: number) =>
		apiClient.get<ApiResponse<Group>>(`/api/chats/groups/${groupId}`).then((r) => r.data.data),

	/**
	 * `next` pages toward OLDER messages here — opposite naming from 1:1's
	 * `previous`. See the doc comment on `GroupChatHistoryData`. Do not
	 * "fix" this to match use-chat-history.ts's cursor field name.
	 */
	history: (groupId: number, cursor?: string) => {
		const params = new URLSearchParams()
		if (cursor) params.set("cursor", cursor)
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<GroupChatHistoryData>>(
				`/api/chats/groups/${groupId}/history${qs ? `?${qs}` : ""}`,
			)
			.then((r) => r.data.data)
	},

	markSeen: (groupId: number) => apiClient.post(`/api/chats/groups/${groupId}/seen`, {}),

	/**
	 * Same endpoint as chatApi.send(`/api/chats/messages`). Typed separately
	 * because the real response for a group send comes back GroupMessage-shaped
	 * (`group: GroupInfo` object), not Message-shaped (`group: string | null`)
	 * — reusing chatApi.send's return type here would silently lie about the shape.
	 */
	send: (payload: SendMessagePayload) =>
		apiClient
			.post<ApiResponse<GroupMessage>>("/api/chats/messages", payload)
			.then((r) => r.data.data),

	create: (payload: CreateGroupPayload) =>
		apiClient
			.post<ApiResponse<CreateGroupResponse>>("/api/chats/groups", payload)
			.then((r) => r.data.data),

	members: (groupId: number, page?: number) => {
		const params = new URLSearchParams()
		if (page) params.set("page", String(page))
		const qs = params.toString()
		return apiClient
			.get<ApiResponse<GroupMembersData>>(
				`/api/chats/groups/${groupId}/members${qs ? `?${qs}` : ""}`,
			)
			.then((r) => r.data.data)
	},

	/** See MESSENGER.md — this is a REPLACE of the full non-admin roster,
	 * not an append. Callers must include existing non-admin members. */
	syncMembers: (groupId: number, userIds: Pkid[]) =>
		apiClient.post(`/api/chats/groups/${groupId}/members/sync`, {
			user_ids: userIds,
		} satisfies SyncGroupMembersPayload),

	removeMember: (groupId: number, userPkid: Pkid) =>
		apiClient.post(`/api/chats/groups/${groupId}/members/remove`, {
			user_id: userPkid,
		} satisfies RemoveGroupMemberPayload),

	leave: (groupId: number) => apiClient.post(`/api/chats/groups/${groupId}/members/leave`),

	updateMemberRole: (groupId: number, userPkid: Pkid, role: GroupRole) =>
		apiClient.post(`/api/chats/groups/${groupId}/members/role`, {
			user_id: userPkid,
			role,
		} satisfies ManageGroupMemberRolePayload),

	updatePermissions: (groupId: number, payload: UpdateGroupPermissionsPayload) =>
		apiClient
			.patch<ApiResponse<Group>>(`/api/chats/groups/${groupId}/permissions`, payload)
			.then((r) => r.data.data),

	pause: (groupId: number, payload: PauseGroupPayload) =>
		apiClient.post(`/api/chats/groups/${groupId}/pause`, payload),
}
