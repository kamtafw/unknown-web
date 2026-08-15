"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useQuery } from "@tanstack/react-query"

/** Backs "+Create → Start New Chat" (M1 product decision). Confirmed
 * endpoint via mobile's `useSearchUsers`, not documented in the guide. */
export function useSearchUsers(search: string) {
	return useQuery({
		queryKey: chatKeys.searchUsers(search),
		queryFn: () => chatApi.searchUsers(search),
		enabled: search.trim().length > 0,
		staleTime: 30_000,
	})
}
