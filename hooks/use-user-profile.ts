import { userApi } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const userProfileKeys = {
	detail: (pkid: number) => ["users", "profile", pkid] as const,
}

export function useUserProfileHover(pkid: number, enabled: boolean) {
	return useQuery({
		queryKey: userProfileKeys.detail(pkid),
		queryFn: () => userApi.getUserProfile(pkid),
		enabled: enabled && !!pkid,
		staleTime: 1000 * 60 * 3,
	})
}
