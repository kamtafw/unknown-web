import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const usersKeys = {
	usersList: ["users", "list"] as const,
}

export function useUsersList() {
	return useQuery({
		queryKey: usersKeys.usersList,
		queryFn: () => userApi.getUsersList(),
		staleTime: 1000 * 60 * 5, // 5 min
	})
}
