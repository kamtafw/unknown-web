/**
 * Socket event names used by the Messenger web client.
 *
 * The event names and payload documentation in this file are based on the
 * current backend socket contracts.
 *
 * Direction:
 * - Client → Server: events emitted by the web client.
 * - Server → Client: events received by the web client.
 *
 * Calls, live, and community functionality are intentionally not represented
 * here because those features are excluded from the current release.
 */

/** Direct-chat socket events. */
export const CHAT_SOCKET_EVENTS = {
	/** Client → Server
	 * Payload: { receiverId: Uuid, isTyping: boolean }
	 * Notifies the recipient that the current user has started
	 * or stopped typing in a direct chat. */
	TYPING_EMIT: "chat:typing",
	/** Server → Client
	 * Payload: Server-defined acknowledgment/status payload for a sent message.
	 * Notifies the sender that their message has been accepted/processed. */
	SENT: "chat:sent",
	/** Server → Client
	 * Payload: Full incoming ChatMessage payload.
	 * Delivers a newly received direct-chat message. */
	RECEIVE: "chat:receive",
	/** Server → Client
	 * Payload: { msgId: string, status: string, senderId: Uuid, receiverId: Uuid }
	 * Reports a direct-chat message status change. */
	STATUS: "chat:status",
	/** Server → Client
	 * Payload: { senderId: Uuid, receiverId?: Uuid, isTyping: boolean }
	 * Reports another user's typing state. The wire event is the same event used
	 * for client → server typing notifications. */
	TYPING_RECEIVE: "chat:typing",
} as const

/** Group socket events. */
export const GROUP_SOCKET_EVENTS = {
	// -------------------------------------------------------------------------
	// Client → Server
	// -------------------------------------------------------------------------

	/** Payload: { groupId: number }
	 * Joins the authenticated socket to a group room. This event should be replayed after
	 * reconnecting because room membership belongs to the individual socket connection. */
	JOIN: "group:join",
	/** Payload: { groupId: number, messageType: string, message: string, nonce?: string,
	 * senderEphemeralKey?: string, collectionId?: number | string, replyTo?: number | string,
	 * excludedUsers?: number[], media?: unknown, metadata?: Record<string, unknown> }
	 * Creates and sends a new group message. */
	SEND: "group:send",
	/** Payload: { msgId: string | number, groupId: number, messageType: string, message: string,
	 * metadata?: Record<string, unknown> }
	 * Updates an existing group message. */
	UPDATE: "group:update",
	/** Payload: { msgId: string | number, groupId: number, deleteType?: "self" | "both" }
	 * Deletes a group message for the current user or for everyone. The backend retains this
	 * event for compatibility. New clients should perform deletion through the REST API. */
	DELETE: "group:delete",
	/** Payload: { groupId: number, isTyping?: boolean }
	 * Broadcasts the current user's typing state to other group members. isTyping defaults to
	 * true on the backend when omitted. */
	TYPING: "group:typing",
	/** Payload: { groupId: number, cursor?: string,
	 * order?: "asc" | "desc", status?: "all" | "sent" | "delivered" | "seen" }
	 * Requests group message history through the socket. */
	GET: "group:get",
	/** Payload: { msgId: string | number, groupId: number, status: "delivered" | "seen" }
	 * Updates a group message's delivery/read status. */
	STATUS_UPDATE: "group:status:update",
	/** Payload: { groupId: number }
	 * Marks unread messages in the group as seen. */
	MARK_SEEN: "group:mark-seen",
	/** Payload: { groupId: number, userId?: number }
	 * Leaves the group. When userId is supplied, an authorized user can remove that member from
	 * the group. */
	LEAVE: "group:leave",
	/** Payload: { groupId: number, msgId: string | number, emoji: string, action: "add" | "remove" }
	 * Adds or removes a reaction on a group message. */
	REACTION: "group:reaction",

	// -------------------------------------------------------------------------
	// Server → Client
	// -------------------------------------------------------------------------

	/** Payload: { groupId: number, room: string }
	 * Confirms that the socket successfully joined the requested group room. */
	JOINED: "group:joined",
	/** Payload: ChatMessage
	 * Delivers a newly created group message. The backend may also use this event for group call-log
	 * messages. Call functionality itself remains excluded from this release. */
	MESSAGE: "group:message",
	/** Payload: ChatMessage
	 * Delivers the latest version of an edited group message. */
	MESSAGE_UPDATED: "group:message:updated",
	/** Payload: { groupId: number, msgIds: Array<string | number>, deleteType: "both" }
	 * Reports one or more group messages that were deleted for everyone. Note that the backend contract
	 * uses msgIds (plural), not msgId. */
	MESSAGE_DELETED: "group:message:deleted",
	/** Payload: { msgIds: Array<string | number>, userId: number, deleteType: "self" }
	 * Reports messages hidden/deleted only for the current user. This event is sent only to the affected
	 * user's devices. */
	HIDDEN: "chat:hidden",
	/** Payload: { msgId: number, groupId: number, status: string, senderId: string }
	 * Reports a group message status change. */
	STATUS: "group:status",
	/** Payload: { senderId: number | string, groupId: number, isTyping: boolean }
	 * Reports another group member's typing state. The wire event is the same event used for client → server
	 * typing notifications. */
	TYPING_RECEIVE: "group:typing",
	/** Payload: Group message history API response.
	 * This is the response to a group:get request. */
	MESSAGES: "group:messages",
	/** Payload: { groupId: number, msgId: string | number, emoji: string, action: "add" | "remove",
	 * userPkid: number }
	 * Reports that a reaction was added, updated, or removed. The wire event is the same event used for
	 * client → server reactions. */
	REACTION_RECEIVE: "group:reaction",
	/** Payload: { groupId: number, msgId: string | number, pinnedByPkid: number, action: "pin" | "unpin" }
	 * Reports that a message was pinned or unpinned. */
	MESSAGE_PINNED: "group:message:pinned",
	/** Payload: { groupId: number, userIds: number[], addedByPkid: number }
	 * Reports that one or more members were added to or approved for * membership in the group. */
	MEMBER_ADDED: "group:member:added",
	/** Payload: { groupId: number, userPkid: number, removedByPkid: number }
	 * Reports that a member was removed from the group. */
	MEMBER_REMOVED: "group:member:removed",
	/** Payload: { groupId: number, userPkid: number }
	 * Reports that a member voluntarily left the group. */
	MEMBER_LEFT: "group:member:left",
	/** Payload: { groupId: number, userPkid: number, role: string, changedByPkid: number }
	 * Reports that a group member's role changed. */
	MEMBER_ROLE_CHANGED: "group:member:role:changed",
	/** Payload: { groupId: number, name: string, iconUrl: string | null, updatedByPkid: number }
	 * Reports that the group's name or icon was updated. */
	INFO_UPDATED: "group:info:updated",
	/** Payload: { groupId: number, pauseUntil: string | null, pausedByPkid: number }
	 * Reports that messaging in the group was paused. */
	PAUSED: "group:paused",
	/** Payload: { groupId: number, resumedByPkid: number }
	 * Reports that messaging in the group was resumed. */
	RESUMED: "group:resumed",
	/** Payload: { error: string, details?: unknown }
	 * Reports a failed or invalid group operation. */
	ERROR: "group:error",
} as const
