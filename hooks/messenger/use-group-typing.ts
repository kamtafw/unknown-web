"use client"

import { GROUP_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { useCallback, useEffect, useRef, useState } from "react"

const EMIT_THROTTLE_MS = 5000
const REMOTE_EXPIRY_MS = 8000

interface GroupTypingPayload {
	groupId?: number
	senderId?: string
	isTyping?: boolean
}

/**
 * Per-open-group typing — mirrors use-typing.ts's contract exactly except
 * the payload is groupId-scoped and multiple people can type at once.
 * Collapsed to a single boolean here since MessageList/TypingIndicator
 * only render a boolean; per-name display isn't in M3 scope.
 */
export function useGroupTyping(groupId: number) {
	const [remoteTyping, setRemoteTyping] = useState(false)
	const lastEmitAtRef = useRef(0)
	const wasTypingRef = useRef(false)
	const typingSendersRef = useRef<Set<string>>(new Set())
	const expiryTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

	useEffect(() => {
		const unsubscribe = messengerSocket.on<GroupTypingPayload>(
			GROUP_SOCKET_EVENTS.TYPING,
			(payload) => {
				if (payload.groupId !== groupId || !payload.senderId) return
				const senderId = payload.senderId

				const existingTimer = expiryTimersRef.current.get(senderId)
				if (existingTimer) clearTimeout(existingTimer)

				if (payload.isTyping) {
					typingSendersRef.current.add(senderId)
					expiryTimersRef.current.set(
						senderId,
						setTimeout(() => {
							typingSendersRef.current.delete(senderId)
							setRemoteTyping(typingSendersRef.current.size > 0)
						}, REMOTE_EXPIRY_MS),
					)
				} else {
					typingSendersRef.current.delete(senderId)
				}
				setRemoteTyping(typingSendersRef.current.size > 0)
			},
		)

		return () => {
			unsubscribe()
			for (const timer of expiryTimersRef.current.values()) clearTimeout(timer)
		}
	}, [groupId])

	const emitTyping = useCallback(
		(isTyping: boolean) => {
			const now = Date.now()
			if (isTyping && now - lastEmitAtRef.current < EMIT_THROTTLE_MS) return
			lastEmitAtRef.current = now
			wasTypingRef.current = isTyping
			messengerSocket.emit(GROUP_SOCKET_EVENTS.TYPING, { groupId, isTyping })
		},
		[groupId],
	)

	useEffect(() => {
		const stopIfTyping = () => {
			if (wasTypingRef.current) {
				wasTypingRef.current = false
				messengerSocket.emit(GROUP_SOCKET_EVENTS.TYPING, { groupId, isTyping: false })
			}
		}
		const onVisibilityChange = () => {
			if (document.visibilityState === "hidden") stopIfTyping()
		}
		document.addEventListener("visibilitychange", onVisibilityChange)
		return () => {
			document.removeEventListener("visibilitychange", onVisibilityChange)
			stopIfTyping()
		}
	}, [groupId])

	return { remoteTyping, emitTyping }
}
