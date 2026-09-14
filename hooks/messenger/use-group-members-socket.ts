"use client"

import { groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

interface GroupMemberAddedPayload {
	groupId?: number
	userIds?: number[]
	addedByPkid?: number
}

interface GroupMemberRemovedPayload {
	groupId?: number
	userPkid?: number
	removedByPkid?: number
}

interface GroupMemberLeftPayload {
	groupId?: number
	userPkid?: number
}

interface GroupMemberRoleChangedPayload {
	groupId?: number
	userPkid?: number
	role?: string
	changedByPkid?: number
}

export function useGroupMembersSocket() {
	const queryClient = useQueryClient()

	useEffect(() => {
		const invalidateGroupMembership = (groupId?: number) => {
			if (groupId == null) return

			void queryClient.invalidateQueries({
				queryKey: groupKeys.members(groupId),
			})

			void queryClient.invalidateQueries({
				queryKey: groupKeys.detail(groupId),
			})

			void queryClient.invalidateQueries({
				queryKey: groupKeys.lists(),
			})
		}

		const unsubAdded = messengerSocket.on<GroupMemberAddedPayload>(
			GROUP_SOCKET_EVENTS.MEMBER_ADDED,
			(payload) => {
				invalidateGroupMembership(payload.groupId)
			},
		)

		const unsubRemoved = messengerSocket.on<GroupMemberRemovedPayload>(
			GROUP_SOCKET_EVENTS.MEMBER_REMOVED,
			(payload) => {
				invalidateGroupMembership(payload.groupId)
			},
		)

		const unsubLeft = messengerSocket.on<GroupMemberLeftPayload>(
			GROUP_SOCKET_EVENTS.MEMBER_LEFT,
			(payload) => {
				invalidateGroupMembership(payload.groupId)
			},
		)

		const unsubRoleChanged = messengerSocket.on<GroupMemberRoleChangedPayload>(
			GROUP_SOCKET_EVENTS.MEMBER_ROLE_CHANGED,
			(payload) => {
				invalidateGroupMembership(payload.groupId)
			},
		)

		return () => {
			unsubAdded()
			unsubRemoved()
			unsubLeft()
			unsubRoleChanged()
		}
	}, [queryClient])
}
