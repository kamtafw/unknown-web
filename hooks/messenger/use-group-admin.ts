"use client"

import { extractMessage } from "@/lib/api-error"
import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type {
	GroupListData,
	GroupRole,
	PauseGroupPayload,
	Pkid,
	UpdateGroupPermissionsPayload,
} from "@/types/messenger"
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query"

function invalidateGroupAdmin(queryClient: ReturnType<typeof useQueryClient>, groupId: number) {
	queryClient.invalidateQueries({ queryKey: groupKeys.members(groupId) })
	queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) })
	queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
}

function removeGroupFromLists(queryClient: ReturnType<typeof useQueryClient>, groupId: number) {
	queryClient.setQueriesData<InfiniteData<GroupListData>>(
		{ queryKey: groupKeys.lists() },
		(old) => {
			if (!old) return old

			let found = false

			const pages = old.pages.map((page) => {
				const groups = page.groups.filter((group) => {
					const keep = group.id !== groupId
					if (!keep) found = true
					return keep
				})

				return groups.length === page.groups.length ? page : { ...page, groups }
			})

			return found ? { ...old, pages } : old
		},
	)
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

			removeGroupFromLists(queryClient, groupId)
			queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) })
			queryClient.removeQueries({ queryKey: groupKeys.members(groupId) })
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
