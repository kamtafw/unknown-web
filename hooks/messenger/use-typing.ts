"use client"

import { CHAT_SOCKET_EVENTS } from "@/lib/messenger/socket-events"
import { messengerSocket } from "@/lib/messenger/socket-manager"
import { Uuid } from "@/types/messenger"
import { useCallback, useEffect, useRef, useState } from "react"

const EMIT_THROTTLE_MS = 5000 // guide: "roughly one true event every five seconds"
const REMOTE_EXPIRY_MS = 8000 // guide: "expire remote typing state locally in case a stop event is missed"

interface RemoteTypingPayload {
	senderId?: string
	userId?: string
	isTyping?: boolean
}

/** Scoped to one open direct conversation. Mount only while that
 * conversation is visible — unmounting sends a final `false`. */
export function useTyping(peerUuid: Uuid) {
	const [remoteTyping, setRemoteTyping] = useState(false)
	const lastEmitAtRef = useRef(0)
	const wasTypingRef = useRef(false)
	const expiryTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

	useEffect(() => {
		const unsubscribe = messengerSocket.on<RemoteTypingPayload>(
			CHAT_SOCKET_EVENTS.TYPING_RECEIVE,
			(payload) => {
				const senderId = payload.senderId ?? payload.userId
				if (senderId !== peerUuid) return

				setRemoteTyping(!!payload.isTyping)

				if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
				if (payload.isTyping) {
					expiryTimerRef.current = setTimeout(() => setRemoteTyping(false), REMOTE_EXPIRY_MS)
				}
			},
		)

		return () => {
			unsubscribe()
			if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
		}
	}, [peerUuid])

	const emitTyping = useCallback(
		(isTyping: boolean) => {
			const now = Date.now()
			if (isTyping && now - lastEmitAtRef.current < EMIT_THROTTLE_MS) return
			lastEmitAtRef.current = now
			wasTypingRef.current = isTyping
			messengerSocket.emit(CHAT_SOCKET_EVENTS.TYPING_EMIT, { receiverId: peerUuid, isTyping })
		},
		[peerUuid],
	)

	// stop typing on unmount, tab hidden, or blur — guide's explicit list
	useEffect(() => {
		const stopIfTyping = () => {
			if (wasTypingRef.current) {
				wasTypingRef.current = false
				messengerSocket.emit(CHAT_SOCKET_EVENTS.TYPING_EMIT, {
					receiverId: peerUuid,
					isTyping: false,
				})
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
	}, [peerUuid])

	return { remoteTyping, emitTyping }
}
