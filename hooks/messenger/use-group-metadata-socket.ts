"use client"

import { groupKeys } from "@/lib/messenger/query-keys"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import type { Group, GroupListData } from "@/types/messenger"
import type { InfiniteData } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

interface GroupInfoUpdatedPayload {
	groupId: number
	name: string
	iconUrl: string
	updatedByPkid: number
}

interface GroupPausedPayload {
	groupId: number
	pauseUntil: string | null
	pausedByPkid: number
}

interface GroupResumedPayload {
	groupId: number
	resumedByPkid: number
}

export function useGroupMetadataSocket() {
	const queryClient = useQueryClient()

	useEffect(() => {
		const patchGroupDetail = (groupId: number, patch: Partial<Group>) => {
			queryClient.setQueryData<Group>(groupKeys.detail(groupId), (old) =>
				old ? { ...old, ...patch } : old,
			)
		}

		const patchGroupList = (groupId: number, patch: Partial<GroupListData["groups"][number]>) => {
			queryClient.setQueriesData<InfiniteData<GroupListData>>(
				{ queryKey: groupKeys.lists() },
				(old) => {
					if (!old) return old

					let found = false

					const pages = old.pages.map((page) => {
						let pageChanged = false

						const groups = page.groups.map((group) => {
							if (group.id !== groupId) return group

							found = true
							pageChanged = true

							return {
								...group,
								...patch,
							}
						})

						return pageChanged ? { ...page, groups } : page
					})

					return found ? { ...old, pages } : old
				},
			)
		}

		const unsubGroupInfoUpdated = messengerSocket.on<GroupInfoUpdatedPayload>(
			GROUP_SOCKET_EVENTS.INFO_UPDATED,
			(payload) => {
				patchGroupDetail(payload.groupId, {
					name: payload.name,
					icon_url: payload.iconUrl,
				})

				patchGroupList(payload.groupId, {
					name: payload.name,
					icon_url: payload.iconUrl,
				})
			},
		)

		const unsubGroupPaused = messengerSocket.on<GroupPausedPayload>(
			GROUP_SOCKET_EVENTS.PAUSED,
			(payload) => {
				patchGroupDetail(payload.groupId, {
					is_paused: true,
					pause_until: payload.pauseUntil,
				})

				patchGroupList(payload.groupId, {
					is_paused: true,
					pause_until: payload.pauseUntil,
				})
			},
		)

		const unsubGroupResumed = messengerSocket.on<GroupResumedPayload>(
			GROUP_SOCKET_EVENTS.RESUMED,
			(payload) => {
				patchGroupDetail(payload.groupId, {
					is_paused: false,
					pause_until: null,
				})

				patchGroupList(payload.groupId, {
					is_paused: false,
					pause_until: null,
				})
			},
		)

		return () => {
			unsubGroupInfoUpdated()
			unsubGroupPaused()
			unsubGroupResumed()
		}
	}, [queryClient])
}
