"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { useQuery } from "@tanstack/react-query"

export function useGroupDetail(groupId: number | undefined) {
	return useQuery({
		queryKey: groupKeys.detail(groupId ?? 0),
		queryFn: () => groupApi.detail(groupId as number),
		enabled: !!groupId,
		staleTime: 30_000,
	})
}
