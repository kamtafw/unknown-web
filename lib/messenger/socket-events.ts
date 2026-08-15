/**
 * Confirmed a direct-chat socket event names — messenger-web-implementation-guide.md
 * SN"Direct-chat socket events". Group/call/live events added here when their
 * milestones start.
 */
export const CHAT_SOCKET_EVENTS = {
	/** client → server: {receiverId: Uuid, isTyping: boolean } */
	TYPING_EMIT: "chat:typing",
	/** server → client: send acknowledgment/status update */
	SENT: "chat:sent",
	/** server → client: full incoming message */
	RECEIVE: "chat:receive",
	/** server → client: { msgId, status, senderId, receiverId } */
	STATUS: "chat:status",
	/** server → client: typing state for a UUID (same event as the emit) */
	TYPING_RECEIVE: "chat:typing",
} as const
