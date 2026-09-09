"use client"

import { groupApi } from "@/lib/messenger/group-api"
import { compareMessageOrder } from "@/lib/messenger/optimistic"
import { groupKeys } from "@/lib/messenger/query-keys"
import type { GroupMessage, Message } from "@/types/messenger"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

/**
 * Normalizes a `GroupMessage` into the shared `Message` shape so M1/M2's
 * `MessageList`/`MessageBubble` can render group history without a
 * parallel renderer — per the M3 decision to reuse, not rebuild. Only
 * `group` genuinely differs in shape (`GroupInfo` object vs. `string |
 * null`); `Message` already had optional `views_count`/`replies_count`
 * fields, so nothing else needs adapting.
 */
export function groupMessageToMessage(gm: GroupMessage): Message {
	return {
		id: gm.id,
		sender: gm.sender,
		receiver: null,
		group: String(gm.group.id),
		message_type: gm.message_type,
		content: gm.content,
		media: gm.media,
		metadata: gm.metadata,
		is_deleted_for_all: gm.is_deleted_for_all,
		is_hidden_by_me: gm.is_hidden_by_me,
		is_pinned: gm.is_pinned,
		collection_id: gm.collection_id,
		status: gm.status,
		reply_to: gm.reply_to,
		forwarded_from: gm.forwarded_from,
		views_count: gm.views_count,
		replies_count: gm.replies_count,
		reactions_count: gm.reactions_count,
		emoji_reaction_counts: gm.emoji_reaction_counts,
		created_at: gm.created_at,
		updated_at: gm.updated_at,
	}
}

/**
 * Inverse of groupMessageToMessage — reconstructs enough of a GroupMessage
 * for retry/delete call sites that only have the shared `Message` shape
 * (from MessageList's callbacks) but need to call into GroupMessage-typed
 * mutation hooks. `group.name`/`group.icon_url` are placeholders — same
 * convention as createOptimisticGroupMessage, since nothing downstream of
 * this reads them. `receiver` must be explicitly set to the literal `null`
 * here, not inherited from the spread — `Message.receiver` is
 * `MessageSender | null`, `GroupMessage.receiver` is strictly `null`, and
 * spreading alone doesn't narrow that for the compiler.
 */
export function messageToGroupMessage(message: Message, groupId: number): GroupMessage {
	return {
		...message,
		receiver: null,
		group: { id: groupId, name: "", icon_url: "" },
	}
}

function extractCursor(url: string | null | undefined): string | undefined {
	if (!url) return undefined
	try {
		return new URL(url).searchParams.get("cursor") ?? url
	} catch {
		return url
	}
}

export function useGroupHistory(groupId: number | undefined) {
	const query = useInfiniteQuery({
		queryKey: groupKeys.history(groupId ?? 0),
		queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
			groupApi.history(groupId as number, pageParam),
		initialPageParam: undefined as string | undefined,
		// `next` pages toward OLDER messages on THIS endpoint — see the doc
		// comment on GroupChatHistoryData. Not `.previous`.
		getNextPageParam: (lastPage) => extractCursor(lastPage.next),
		enabled: !!groupId,
		staleTime: 60_000,
	})

	const messages = useMemo<Message[]>(() => {
		if (!query.data) return []
		const byId = new Map<number, Message>()
		for (const page of query.data.pages) {
			for (const raw of page.results) byId.set(raw.id, groupMessageToMessage(raw))
		}
		return Array.from(byId.values()).sort(compareMessageOrder)
	}, [query.data])

	return { ...query, messages }
}
