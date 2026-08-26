"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { projectWithOverlays } from "@/lib/messenger/list-overlay"
import { groupKeys } from "@/lib/messenger/query-keys"
import type { GroupListItem } from "@/types/messenger"
import { useInfiniteQuery } from "@tanstack/react-query"
export const GROUP_LIST_OVERLAY_KEY = "group-list"

/**
 * `created_at` isn't available on GroupListItem (confirmed absent from
 * the actual payload — only Group's DETAIL endpoint has it), so a true
 * "created-then-last-message" sort isn't possible from this response
 * alone without an extra per-group detail fetch, which isn't worth it
 * here. As a proxy: groups with no messages yet sort ABOVE groups that
 * do have one (instead of the previous epoch-0 fallback sending them to
 * the very bottom), with Array.sort's stability preserving whatever
 * order the backend already returned them in among themselves. This is
 * a mitigation, not the literal fix requested — documented as a known
 * limitation in MESSENGER.md.
 */
function byLastMessageDesc(a: GroupListItem, b: GroupListItem): number {
	if (!a.last_message_time && !b.last_message_time) return 0
	if (!a.last_message_time) return -1
	if (!b.last_message_time) return 1
	return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
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
			groups: projectWithOverlays<GroupListItem>(
				GROUP_LIST_OVERLAY_KEY,
				data.pages.flatMap((page) => page.groups).sort(byLastMessageDesc),
			),
		}),
		staleTime: 30_000,
	})
}
