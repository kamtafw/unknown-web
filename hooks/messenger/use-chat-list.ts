"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import type { ChatListFilter } from "@/types/messenger"
import { useQuery } from "@tanstack/react-query"

export function useChatList(filter: ChatListFilter, search: string) {
	return useQuery({
		queryKey: chatKeys.list(filter, search),
		queryFn: () => chatApi.list(filter, search),
		staleTime: 30_000,
	})
}

export function useUnreadChatCount() {
	return useQuery({
		queryKey: chatKeys.unreadCount(),
		queryFn: () => chatApi.unreadCount(),
		staleTime: 30_000,
	})
}
