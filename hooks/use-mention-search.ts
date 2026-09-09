import { socialApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const mentionSearchKeys = {
	list: (query: string) => ["mentions", "search", query] as const,
}

export function useMentionSearch(query: string, enabled: boolean) {
	return useQuery({
		queryKey: mentionSearchKeys.list(query),
		queryFn: () => socialApi.searchPeople(query),
		enabled: enabled && query.trim().length > 0,
		staleTime: 1000 * 30,
		placeholderData: (prev) => prev,
	})
}
