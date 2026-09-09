import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const userProfileKeys = {
	detail: (id: string) => ["users", "profile", id] as const,
}

export function useUserProfileHover(id: string, enabled: boolean) {
	return useQuery({
		queryKey: userProfileKeys.detail(id),
		queryFn: () => userApi.getUserProfile(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 3,
	})
}

export function useUserProfile(id: string, enabled: boolean) {
	return useQuery({
		queryKey: userProfileKeys.detail(id),
		queryFn: () => userApi.getUserProfile(id),
		enabled: enabled && !!id,
		staleTime: 1000 * 60 * 3,
	})
}
