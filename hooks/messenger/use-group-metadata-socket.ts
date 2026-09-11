"use client"

import { groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

interface GroupMetadataPayload {
	groupId: number
}

// interface GroupInfoUpdatedPayload {
// 	groupId: number
// 	name: string
// 	iconUrl: string
// 	updatedByPkid: number
// }

// interface GroupPausedPayload {
// 	groupId: number
// 	pauseUntil: string | null
// 	pausedByPkid: number
// }

// interface GroupResumedPayload {
// 	groupId: number
// 	resumedByPkid: number
// }

export function useGroupMetadataSocket() {
	const queryClient = useQueryClient()

	useEffect(() => {
		const invalidateGroup = ({ groupId }: GroupMetadataPayload) => {
			queryClient.invalidateQueries({
				queryKey: groupKeys.detail(groupId),
			})

			queryClient.invalidateQueries({
				queryKey: groupKeys.lists(),
			})
		}

		const unsubGroupInfoUpdated = messengerSocket.on<GroupMetadataPayload>(
			GROUP_SOCKET_EVENTS.INFO_UPDATED,
			(payload) => invalidateGroup(payload),
		)

		const unsubGroupPaused = messengerSocket.on<GroupMetadataPayload>(
			GROUP_SOCKET_EVENTS.PAUSED,
			(payload) => invalidateGroup(payload),
		)

		const unsubGroupResumed = messengerSocket.on<GroupMetadataPayload>(
			GROUP_SOCKET_EVENTS.RESUMED,
			(payload) => invalidateGroup(payload),
		)

		return () => {
			unsubGroupInfoUpdated()
			unsubGroupPaused()
			unsubGroupResumed()
		}
	}, [queryClient])
}
