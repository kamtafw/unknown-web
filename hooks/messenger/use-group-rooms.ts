"use client"

import { useGroupList } from "@/hooks/messenger/use-group-list"
import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useAuthStore } from "@/stores/auth-store"
import { useEffect, useMemo, useRef } from "react"

function roomKey(groupId: number): string {
	return `group:${groupId}`
}

/**
 * Joins every group room the current user is a member of, so the shared
 * socket actually receives `group:*` broadcasts. Confirmed via mobile's
 * `useGroupRoomSubscription`: the backend's group broadcaster uses
 * Socket.IO rooms (`io.to('group:<id>')`), a per-socket opt-in — unlike
 * the 1:1 `chat:*` events, which route by user id and need no join.
 *
 * Reuses `messengerSocket.joinRoom`, which already replays every
 * registered room on reconnect (socket-manager.ts, M0) — no bespoke
 * reconnect wiring needed here, unlike mobile's raw socket.on("connect")
 * plumbing.
 *
 * Mount once, alongside useChatSocket/useGroupSocket, at the Messenger
 * shell level — not per conversation. See `useActiveGroupRoom` for the
 * per-conversation safety net covering a group not yet in the list.
 */
export function useGroupRoomSubscription() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
	const { data } = useGroupList()

	const groupIds = useMemo(() => {
		return Array.from(new Set((data?.groups ?? []).map((g) => g.id))).sort((a, b) => a - b)
	}, [data?.groups])

	const joinedRef = useRef<Set<number>>(new Set())

	useEffect(() => {
		if (!isAuthenticated) return

		const next = new Set(groupIds)
		for (const groupId of groupIds) {
			if (joinedRef.current.has(groupId)) continue
			messengerSocket.joinRoom(GROUP_SOCKET_EVENTS.JOIN, { groupId }, roomKey(groupId))
		}
		for (const groupId of joinedRef.current) {
			if (!next.has(groupId)) messengerSocket.leaveRoom(roomKey(groupId))
		}
		joinedRef.current = next
	}, [isAuthenticated, groupIds])
}

/**
 * Ensures the group currently open on screen is joined even if it isn't
 * (yet) in the paginated group list `useGroupRoomSubscription` reads from
 * — e.g. a just-created group. Shares the same room key, so this is a
 * no-op once the list-based subscription catches up on its own. No
 * leave-on-unmount, matching mobile's own `useActiveGroupRoom` — room
 * membership isn't torn down just because the screen closed.
 */
export function useActiveGroupRoom(groupId: number | null) {
	useEffect(() => {
		if (!groupId) return
		messengerSocket.joinRoom(GROUP_SOCKET_EVENTS.JOIN, { groupId }, roomKey(groupId))
	}, [groupId])
}
