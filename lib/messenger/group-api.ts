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
import { Group, GroupChatHistoryData, GroupListData } from "@/types/messenger"
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
}
