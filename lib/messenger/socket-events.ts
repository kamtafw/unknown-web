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

/**
 * Confirmed group socket event names — mobile's use-group-sockets.ts /
 * lib/socket/chat-socket.ts, `group:reaction` is on the wire but unused
 * until reactions are in scope.
 */
export const GROUP_SOCKET_EVENTS = {
	/** client → server: { groupId } — room join, replayed on every
	 * reconnect via messengerSocket.joinRoom (see use-group-rooms.ts) */
	JOIN: "group:join",
	/** server → client: full incoming group message */
	MESSAGE: "group:message",
	/** server → client: { msgId, groupId, deleteType } — broadcast to ALL
	 * room members after a group:delete, including the deleter */
	MESSAGE_DELETED: "group:message:deleted",
	/** server → client: { msgId, groupId, status } — delivered/seen */
	STATUS: "group:status",
	/** client ↔ server: { groupId, isTyping } out; { groupId, senderId,
	 * name?, isTyping } in */
	TYPING: "group:typing",
	/** client → server: { msgId, groupId, deleteType } — emitted AFTER the
	 * HTTP delete succeeds, so other room members find out in real time.
	 * See use-group-message-actions.ts. */
	DELETE: "group:delete",
	/** server → client: reaction added/removed — confirmed on the wire,
	 * NOT wired up; reactions are out of this scope. */
	REACTION: "group:reaction",
	/** server → client: room-scoped error (e.g. failed join) */
	ERROR: "group:error",
} as const
