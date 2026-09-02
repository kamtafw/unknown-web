"use client"

import { extractMessage } from "@/lib/api-error"
import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type {
	GroupRole,
	PauseGroupPayload,
	Pkid,
	UpdateGroupPermissionsPayload,
} from "@/types/messenger"
import { useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * No optimistic patching here, unlike the chat-list toggles. Mobile only
 * optimistically patches sync/remove/role (via a raw snapshot/restore,
 * not the list-overlay mechanism — that stays scoped to
 * favorites/pin/mute/block/archive, per its own doc comment), and
 * permissions/pause don't optimistically patch at all on mobile either.
 * These are low-frequency, deliberate admin actions, not high-frequency
 * toggles — invalidate-on-success is proportionate for a first cut.
 * Revisit only if testing shows the round-trip latency actually feels
 * bad here.
 */

function invalidateGroupAdmin(queryClient: ReturnType<typeof useQueryClient>, groupId: number) {
	queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
	queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
	queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
}

/**
 * WARNING: `chats/groups/:id/members/sync` REPLACES the group's non-admin
 * roster with exactly `userIds` — it is not an append, despite the UI
 * calling it "add members". Callers MUST include every existing
 * non-admin member's pkid, or they get silently removed. See
 * AddGroupMembersDialog for how the full list is assembled safely.
 */
export function useSyncGroupMembers(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userIds: Pkid[]) => groupApi.syncMembers(groupId, userIds),
		onSuccess: () => {
			toast.success("Group members updated")
			invalidateGroupAdmin(queryClient, groupId)
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to update group members")),
	})
}

export function useRemoveGroupMember(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userPkid: Pkid) => groupApi.removeMember(groupId, userPkid),
		onSuccess: () => {
			toast.success("Member removed")
			invalidateGroupAdmin(queryClient, groupId)
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to remove member")),
	})
}

export function useLeaveGroup(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: () => groupApi.leave(groupId),
		onSuccess: () => {
			toast.success("Left group")
			queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to leave group")),
	})
}

export function useManageGroupMemberRole(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ userPkid, role }: { userPkid: Pkid; role: GroupRole }) =>
			groupApi.updateMemberRole(groupId, userPkid, role),
		onSuccess: () => {
			toast.success("Member role updated")
			invalidateGroupAdmin(queryClient, groupId)
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to update role")),
	})
}

export function useUpdateGroupPermissions(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: UpdateGroupPermissionsPayload) =>
			groupApi.updatePermissions(groupId, payload),
		onSuccess: () => {
			toast.success("Group permissions updated")
			queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
			queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to update group permissions")),
	})
}

export function usePauseGroup(groupId: number) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (payload: PauseGroupPayload) => groupApi.pause(groupId, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
			queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
		},
		onError: (err) => toast.error(extractMessage(err, "Failed to update group")),
	})
}
