"use client"

import { extractMessage } from "@/lib/api-error"
import { groupApi } from "@/lib/messenger/group-api"
import { setListOverlay } from "@/lib/messenger/list-overlay"
import { groupKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { GroupListItem } from "@/types/messenger"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { GROUP_LIST_OVERLAY_KEY } from "./use-group-list"

/**
 * Same confirmed backend quirk as favorites (list-overlay.ts): a
 * just-created group is occasionally absent from the very next GET
 * chats/groups/lists. Optimistically insert it and let the overlay
 * self-clear once a fresh response actually includes it — same
 * mechanism already proven for favorites/pin/mute, not a new one.
 *
 * This smooths over the same-session experience only. A literal hard
 * refresh clears this in-memory overlay too and will still show the
 * backend's lagging state until it genuinely catches up — that part
 * isn't client-fixable, same limitation as the favorites case.
 */
export function useCreateGroup() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: groupApi.create,
		onSuccess: (created) => {
			toast.success("Group created")

			const optimisticItem: GroupListItem = {
				id: created.id,
				name: created.group_name,
				icon_url: created.icon_url,
				unread_count: 0,
				last_message_preview: null,
				last_message_time: null,
				last_message_type: null,
				is_paused: false,
				pause_until: null,
				is_muted: false,
			}
			setListOverlay<GroupListItem>(GROUP_LIST_OVERLAY_KEY, {
				key: `create:${created.id}`,
				apply: (items) =>
					items.some((g) => g.id === created.id) ? items : [optimisticItem, ...items],
				isSettled: (freshItems) => freshItems.some((g) => g.id === created.id),
			})
			queryClient.invalidateQueries({ queryKey: groupKeys.lists() })
		},
		onError: (err) => {
			toast.error(extractMessage(err, "Failed to create group"))
		},
	})
}
