"use client"

import { chatApi } from "@/lib/messenger/api"
import { fetchForChatListSession, StaleChatListSessionError } from "@/lib/messenger/chat-list-session"
import { resolveLocalChatPreview } from "@/lib/messenger/e2ee/local-preview"
import { resolveEncryptedPreviewFallback } from "@/lib/messenger/preview"
import { projectWithOverlays } from "@/lib/messenger/list-overlay"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListFilter, ChatListItem, Pkid } from "@/types/messenger"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export function useChatList(filter: ChatListFilter, search: string) {
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))
	const overlayListKey = accountId === null ? "chat-list:anonymous" : `chat-list:${accountId}`

	const query = useQuery({
		queryKey: chatKeys.list(filter, search, accountId),
		enabled: accountId !== null,
		queryFn: () =>
			fetchForChatListSession(
				accountId,
				() => useAuthStore.getState().user?.pkid ?? null,
				() => chatApi.list(filter, search),
			),
		retry: (failureCount, error) =>
			!(error instanceof StaleChatListSessionError) && failureCount < 3,
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
			users: projectWithOverlays<ChatListItem>(overlayListKey, data.users),
		}),
	})

	const [previewOverrides, setPreviewOverrides] = useState<{ accountId: number; values: Map<number, { lastMessageTime: string | null; lastMessageId: number | null | undefined; preview: string }> } | null>(null)

	useEffect(() => {
		if (!accountId || !query.data?.users.length) {
			setPreviewOverrides(null)
			return
		}

		let cancelled = false

		void Promise.all(
			query.data.users
				.filter((user) => user.last_message_preview || user.last_message_time || user.last_message_type || user.last_message_id != null)
				.map(async (user) => {
					const preview = await resolveLocalChatPreview(
						accountId as Pkid,
						user.pkid as Pkid,
						user.last_message_preview,
						user.last_message_time,
						user.last_message_type,
						user.last_message_id,
					)

					return [user.pkid, { lastMessageTime: user.last_message_time, lastMessageId: user.last_message_id, preview }] as const
				}),
		).then((entries) => {
			if (cancelled) return
			setPreviewOverrides({ accountId, values: new Map(entries) })
		}).catch(() => {
			if (!cancelled) setPreviewOverrides({ accountId, values: new Map() })
		})

		return () => {
			cancelled = true
		}
	}, [accountId, query.data?.users])

	const data = query.data
		? {
				...query.data,
				users: query.data.users.map((user) => {
					const cached = previewOverrides?.accountId === accountId ? previewOverrides.values.get(user.pkid) : undefined
					const localPreview = cached?.lastMessageTime === user.last_message_time && cached.lastMessageId === user.last_message_id ? cached.preview : undefined
					return {
						...user,
						last_message_preview: localPreview ?? resolveEncryptedPreviewFallback(Boolean(user.last_message_preview || user.last_message_time || user.last_message_type || user.last_message_id != null), user.last_message_type),
					}
				}),
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
