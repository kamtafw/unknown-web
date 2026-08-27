"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

/** Page-based, NOT cursor-based — confirmed via GroupMembersData's
 * current/total_pages shape, different pagination style from history/list. */
export function useGroupMembers(groupId: number | undefined) {
	const query = useInfiniteQuery({
		queryKey: groupKeys.members(groupId ?? 0),
		queryFn: ({ pageParam }: { pageParam: number }) =>
			groupApi.members(groupId as number, pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.current < lastPage.total_pages ? lastPage.current + 1 : undefined,
		enabled: !!groupId,
		refetchOnMount: "always",
		// staleTime: 30_000,
	})

	const members = useMemo(() => query.data?.pages.flatMap((p) => p.results) ?? [], [query.data])
	return { ...query, members }
}
