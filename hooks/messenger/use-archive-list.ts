"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { ArchiveListData } from "@/types/messenger"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

/** Page-based, like use-group-members.ts — NOT cursor-based like the main
 * chat list. `chats/archive-list` confirmed 2026-08-31 (page/limit,
 * current/total_pages). No `search` param confirmed, so search on this
 * screen is client-side over loaded pages only. */
export function useArchiveList() {
	const query = useInfiniteQuery({
		queryKey: chatKeys.archiveList(),
		queryFn: ({ pageParam }: { pageParam: number }): Promise<ArchiveListData> =>
			chatApi.listArchived(pageParam),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.current < lastPage.total_pages ? lastPage.current + 1 : undefined,
		staleTime: 30_000,
	})

	const items = useMemo(() => query.data?.pages.flatMap((p) => p.results) ?? [], [query.data])
	return { ...query, items }
}
