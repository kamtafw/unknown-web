/**
 * Centralized Messenger query-key registry.
 *
 * Convention: hierarchical arrays (`all` → `lists()` → `list(filters)`,
 * `all` → `details()` → `detail(id)`), matching TanStack Query's own
 * recommended pattern and the shape already used by `feedKeys` in
 * `hooks/use-feed.ts`.
 *
 * Scope discipline: only Tier 1 namespaces (chats, groups, statuses) are
 * defined here — these are the only features with a confirmed contract as
 * of M0. Do NOT add `schedules`, `polls`, `calls`, `live`, or `communities`
 * keys speculatively. When each of those milestones starts, add its
 * namespace here following the same pattern, grounded in that milestone's
 * confirmed contract — not before.
 */

import { ChatListFilter, Uuid } from "@/types/messenger"

export const chatKeys = {
	all: ["messenger", "chats"] as const,

	lists: () => [...chatKeys.all, "list"] as const,
	list: (filter: ChatListFilter, search?: string) =>
		[...chatKeys.lists(), { filter, search: search ?? "" }] as const,
	unreadCount: () => [...chatKeys.all, "unread-count"] as const,

	histories: () => [...chatKeys.all, "history"] as const,
	history: (userUuid: Uuid) => [...chatKeys.histories(), userUuid] as const,
	pinnedMessages: (userUuid: Uuid) => [...chatKeys.all, "pinned-messages", userUuid] as const,

	searchUsers: (search: string) => [...chatKeys.all, "search-users", search] as const,

	/** Primed client-side when a conversation is opened from search (no
	 * list entry exists yet) or read from the "all" list cache otherwise —
	 * see hooks/messenger/use-peer-profile.ts for why there's no direct
	 * fetch-by-uuid fallback. */
	peer: (userUuid: Uuid) => [...chatKeys.all, "peer", userUuid] as const,

	/** Genuinely separate collection from `lists()` */
	favorites: () => [...chatKeys.all, "favorites"] as const,

	customLists: () => [...chatKeys.all, "custom-lists"] as const,
	customListMembers: (listId: number) => [...chatKeys.customLists(), listId, "members"] as const,

	/** Dedicated profile fetch, distinct from the list/peer cache. */
	userProfile: (userUuid: Uuid) => [...chatKeys.all, "user-profile", userUuid] as const,
	attachments: (userUuid: Uuid, type: "media" | "doc" | "link") =>
		[...chatKeys.all, "attachments", userUuid, type] as const,

	reactions: (messageId: number) => [...chatKeys.all, "reactions", messageId] as const,

	pollResults: (messageId: number) => [...chatKeys.all, "poll-results", messageId] as const,
}

export const groupKeys = {
	all: ["messenger", "groups"] as const,

	lists: () => [...groupKeys.all, "list"] as const,
	list: () => [...groupKeys.lists()] as const,

	details: () => [...groupKeys.all, "detail"] as const,
	detail: (groupId: number) => [...groupKeys.details(), groupId] as const,
	members: (groupId: number) => [...groupKeys.detail(groupId), "members"] as const,

	histories: () => [...groupKeys.all, "history"] as const,
	history: (groupId: number) => [...groupKeys.histories(), groupId] as const,

	replies: (groupId: number, messageId: number) =>
		[...groupKeys.detail(groupId), "replies", messageId] as const,
}

export const statusKeys = {
	all: ["messenger", "statuses"] as const,

	feed: () => [...statusKeys.all, "feed"] as const,
	mine: () => [...statusKeys.all, "mine"] as const,
	viewers: (statusId: number) => [...statusKeys.all, "viewers", statusId] as const,
}

/** Umbrella key for "invalidate everything Messenger-related" — used
 * sparingly (e.g. on reconnect reconciliation), not as a routine
 * invalidation target. */
export const messengerRootKey = ["messenger"] as const
