"use client"

import { chatApi } from "@/lib/messenger/api"
import { compareMessageOrder } from "@/lib/messenger/optimistic"
import { chatKeys } from "@/lib/messenger/query-keys"
import type { Message, Uuid } from "@/types/messenger"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

/**
 * FLAGGED ASSUMPTION — see MESSENGER.md open items.
 *
 * Mobile's `useGetChatHistory` (hooks/messenger/use-chats.ts) is
 * commented "no cursor = oldest, next = newer messages", and only ever
 * calls forward using `data.next`. It never uses `data.previous`, even
 * though the confirmed response schema (`ChatHistoryData`) includes it.
 *
 * Taking that comment literally would mean a freshly opened conversation
 * on web — with no local SQLite cache to fall back on the way mobile has —
 * would show the OLDEST messages first, which is wrong for a chat UI.
 * `previous` existing in the schema only makes sense if the intended
 * design is no cursor → latest page, `previous` → step to older messages"
 * — the standard shape for this kind of endpoint.
 *
 * This hook assumes the standard shape (no cursor = latest, paginate
 * older via `previous`) rather than the mobile code comment. If that
 * turns out to be wrong, only this file's cursor wiring needs to change —
 * nothing downstream (MessageList, Composer) depends on which assumption
 * is correct. Worth a quick empirical check against the real dev backend.
 */
function extractCursor(url: string | null | undefined): string | undefined {
	if (!url) return undefined
	try {
		return new URL(url).searchParams.get("cursor") ?? url
	} catch {
		return url
	}
}

export function useChatHistory(userUuid: Uuid | undefined) {
	const query = useInfiniteQuery({
		queryKey: chatKeys.history(userUuid ?? ("" as Uuid)),
		queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
			chatApi.history(userUuid as string, pageParam),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => extractCursor(lastPage.previous),
		enabled: !!userUuid,
		staleTime: 60_000,
	})

	// Flatten + normalize regardless of per-page ordering: dedupe by server
	// message ID (guide's explicit rule). Real messages sort ascending by
	// ID (a monotonic surrogate for creation order that doesn't depend on
	// trusting any page's internal ordering). Optimistic messages use
	// synthetic NEGATIVE ids (lib/messenger/optimistic.ts) — a plain
	// numeric sort put those first, which is the exact bug where a message
	// you just sent appeared at the top of the conversation instead of the
	// bottom until the server confirmed it. Optimistic messages always sort
	// after every real message, and among themselves by send order.
	const messages = useMemo<Message[]>(() => {
		if (!query.data) return []
		const byId = new Map<number, Message>()
		for (const page of query.data.pages) {
			for (const message of page.results) byId.set(message.id, message)
		}
		return Array.from(byId.values()).sort(compareMessageOrder)
	}, [query.data])

	return { ...query, messages }
}
