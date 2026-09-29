"use client"

import { chatApi } from "@/lib/messenger/api"
import { resolveLocalChatPreview } from "@/lib/messenger/e2ee/local-preview"
import { projectWithOverlays } from "@/lib/messenger/list-overlay"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListFilter, ChatListItem, Pkid } from "@/types/messenger"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export function useChatList(filter: ChatListFilter, search: string) {
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as number) : null))

	const query = useQuery({
		queryKey: chatKeys.list(filter, search),
		queryFn: () => chatApi.list(filter, search),
		staleTime: 30_000,
		// Field-toggle and list-membership mutations (pin/mute/archive/
		// block) register an overlay against the single "chat-list" bucket
		// — deliberately not scoped per filter/search variant, so pinning
		// or archiving a row while on "All" is reflected immediately on
		// "Unread" too, not just whichever tab was open when the action
		// happened. See hooks/messenger/use-chat-list-actions.ts and
		// lib/messenger/list-overlay.ts `select` re-runs on every fresh
		// fetch, which is exactly when overlays need to reconcile.
		select: (data) => ({
			...data,
			users: projectWithOverlays<ChatListItem>("chat-list", data.users),
		}),
	})

	const [previewOverrides, setPreviewOverrides] = useState<Map<number, string>>(new Map())

	useEffect(() => {
		if (!accountId || !query.data?.users.length) {
			setPreviewOverrides(new Map())
			return
		}

		let cancelled = false

		void Promise.all(
			query.data.users
				.filter((user) => user.last_message_preview)
				.map(async (user) => {
					const preview = await resolveLocalChatPreview(
						accountId as Pkid,
						user.pkid as Pkid,
						user.last_message_preview,
					)

					return [user.pkid, preview] as const
				}),
		).then((entries) => {
			if (cancelled) return
			setPreviewOverrides(new Map(entries))
		})

		return () => {
			cancelled = true
		}
	}, [accountId, query.data?.users])

	const data = query.data
		? {
				...query.data,
				users: query.data.users.map((user) => ({
					...user,
					last_message_preview:
						previewOverrides.get(user.pkid) ??
						(user.last_message_preview ? "Encrypted message" : null),
				})),
			}
		: query.data

	return { ...query, data }
}

export function useUnreadChatCount() {
	return useQuery({
		queryKey: chatKeys.unreadCount(),
		queryFn: () => chatApi.unreadCount(),
		staleTime: 30_000,
	})
}
