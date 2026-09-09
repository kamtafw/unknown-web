"use client"

import { chatApi } from "@/lib/messenger/api"
import { projectWithOverlays } from "@/lib/messenger/list-overlay"
import { chatKeys } from "@/lib/messenger/query-keys"
import type { ChatListFilter, ChatListItem } from "@/types/messenger"
import { useQuery } from "@tanstack/react-query"

export function useChatList(filter: ChatListFilter, search: string) {
	return useQuery({
		queryKey: chatKeys.list(filter, search),
		queryFn: () => chatApi.list(filter, search),
		staleTime: 30_000,
		// Field-toggle and list-membership mutations (pin/mute/archive/
		// block) register an overlay against the single "chat-list" bucket
		// — deliberately not scoped per filter/search variant, so pinning
		// or archiving a row while on "All" is reflected immediately on
		// "Unread" too, not just whichever tab was open when the action
		// happened. See hooks/messenger/use-chat-list-actions.ts and
		// lib/messenger/list-overlay.ts `select` re-runs on every fresh
		// fetch, which is exactly when overlays need to reconcile.
		select: (data) => ({
			...data,
			users: projectWithOverlays<ChatListItem>("chat-list", data.users),
		}),
	})
}

export function useUnreadChatCount() {
	return useQuery({
		queryKey: chatKeys.unreadCount(),
		queryFn: () => chatApi.unreadCount(),
		staleTime: 30_000,
	})
}
