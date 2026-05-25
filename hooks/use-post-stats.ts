import { useQuery } from "@tanstack/react-query"
import { socialApi } from "@/lib/api"

export const postStatsKey = (postId: string) => {
	return ["post", "stat", postId]
}

export function usePostStats(postId: string, enabled = true) {
	return useQuery({
		queryKey: postStatsKey(postId),
		queryFn: () => socialApi.getPostStats(postId),
		staleTime: 1000 * 60 * 3,
		enabled,
	})
}
