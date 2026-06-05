import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const usersKeys = {
	list: (page: number) => ["users", "list", page] as const,
	followers: ["users", "followers"] as const,
	followings: ["users", "followings"] as const,
	friendSuggestions: ["users", "friend-suggestions"] as const,
}

export function useUsersList(page = 1) {
	return useQuery({
		queryKey: usersKeys.list(page),
		queryFn: () => userApi.getUsersList(page),
		// staleTime: 0,
		refetchOnMount: "always",
		refetchOnWindowFocus: "always",
	})
}

export function useFollowers() {
	return useQuery({
		queryKey: usersKeys.followers,
		queryFn: userApi.getFollowers,
	})
}

export function useFollowings() {
	return useQuery({
		queryKey: usersKeys.followers,
		queryFn: userApi.getFollowings,
	})
}

export function useFriendSuggestions() {
	return useQuery({
		queryKey: usersKeys.friendSuggestions,
		queryFn: userApi.getFriendSuggestions,
		staleTime: 1000 * 60 * 5, // 5 min
	})
}
