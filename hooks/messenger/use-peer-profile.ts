"use client"

import { chatKeys } from "@/lib/messenger/query-keys"
import type { PeerDisplay } from "@/lib/messenger/user-display"
import type { ChatListItem, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

interface ChatListData {
	users: ChatListItem[]
	metadata: { next: string | null }
}

/**
 * KNOWN GAP: there is no confirmed HTTP endpoint to fetch a single user's
 * profile by UUID. `chats/users/:pkid/profile` exists but is PKID-keyed,
 * and history/conversation routing is deliberately UUID-keyed (guide's ID
 * rule). So this reads from whatever's already in the query cache instead
 * of fetching:
 *
 * 	1. a cache entry primed by NewChatDialog at selection time, or by
 * 		 ConversationView deriving one from message history (see
 * 		 derivePeerFromMessages) — covers refresh on any conversation that
 * 		 has at least one message, which is the common case
 *  2. the "all" chat list cache, if this is an existing conversation
 *
 * Real gap: refreshing the browser on a brand-new, message-less
 * conversation started via "Start New Chat" — before either side has sent
 * anything — has nothing to read from either source. ConversationHeader 
 * falls back to a generic placeholder rather than a crash. Flagged in 
 * MESSENGER.md as needing either a uuid-keyed profile endpoint or 
 * confirmation that the PKID one also accepts a UUID — that's the real 
 * fix for this narrow remaining case, not something fixable client-side.
 */
export function usePeerProfile(userUuid: Uuid | null): PeerDisplay | null {
	const queryClient = useQueryClient()

	return useMemo(() => {
		if (!userUuid) return null

		const primed = queryClient.getQueryData<ChatListItem>(chatKeys.peer(userUuid))
		if (primed) return primed

		const listData = queryClient.getQueryData<ChatListData>(chatKeys.list("all", ""))
		const fromList = listData?.users.find((u) => u.id === userUuid)
		if (fromList) return fromList

		return null
	}, [queryClient, userUuid])
}
