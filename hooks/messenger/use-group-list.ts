"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { groupKeys } from "@/lib/messenger/query-keys"
import type { GroupListItem } from "@/types/messenger"
import { useInfiniteQuery } from "@tanstack/react-query"

/** Confirmed via mobile's `useGetGroups`: the server returns correct
 * `last_message_time` values but doesn't reliably order by them, so a
 * just-messaged group can sit in its stale slot until the next refetch.
 * This client-side sort is mobile's actual fix for a confirmed backend
 * quirk, not an invented enrichment — carried over as-is. */
function byLastMessageDesc(a: GroupListItem, b: GroupListItem): number {
	const aMs = a.last_message_time ? new Date(a.last_message_time).getTime() : 0
	const bMs = b.last_message_time ? new Date(b.last_message_time).getTime() : 0
	return bMs - aMs
}

export function useGroupList() {
	return useInfiniteQuery({
		queryKey: groupKeys.list(),
		queryFn: ({ pageParam }: { pageParam: string | undefined }) => groupApi.list(pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => lastPage.metadata.next ?? undefined,
		select: (data) => ({
			pages: data.pages,
			pageParams: data.pageParams,
			groups: data.pages.flatMap((page) => page.groups).sort(byLastMessageDesc),
		}),
		staleTime: 30_000,
	})
}
