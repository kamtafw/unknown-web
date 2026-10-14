"use client"

import { chatApi } from "@/lib/messenger/api"
import { resolveLocalChatPreview } from "@/lib/messenger/e2ee/local-preview"
import { resolveEncryptedPreviewFallback } from "@/lib/messenger/preview"
import { projectWithOverlays } from "@/lib/messenger/list-overlay"
import { resolveEncryptedPreviewFallback } from "@/lib/messenger/preview"
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

<<<<<<< HEAD
	const [previewOverrides, setPreviewOverrides] = useState<{ accountId: number; values: Map<number, { lastMessageTime: string | null; lastMessageId: number | null | undefined; preview: string }> } | null>(null)
=======
	const [previewOverrides, setPreviewOverrides] = useState<{
		accountId: number
		values: Map<
			number,
			{ lastMessageTime: string | null; lastMessageId: number | null | undefined; preview: string }
		>
	} | null>(null)
>>>>>>> 843d8dae80065628be944cc7076945906d94641a

	useEffect(() => {
		if (!accountId || !query.data?.users.length) {
			setPreviewOverrides(null)
			return
		}

		let cancelled = false

		void Promise.all(
			query.data.users
<<<<<<< HEAD
				.filter((user) => user.last_message_preview || user.last_message_time || user.last_message_type || user.last_message_id != null)
=======
				.filter(
					(user) =>
						user.last_message_preview ||
						user.last_message_time ||
						user.last_message_type ||
						user.last_message_id != null,
				)
>>>>>>> 843d8dae80065628be944cc7076945906d94641a
				.map(async (user) => {
					const preview = await resolveLocalChatPreview(
						accountId as Pkid,
						user.pkid as Pkid,
						user.last_message_preview,
						user.last_message_time,
						user.last_message_type,
						user.last_message_id,
					)

<<<<<<< HEAD
					return [user.pkid, { lastMessageTime: user.last_message_time, lastMessageId: user.last_message_id, preview }] as const
				}),
		).then((entries) => {
			if (cancelled) return
			setPreviewOverrides({ accountId, values: new Map(entries) })
		}).catch(() => {
			if (!cancelled) setPreviewOverrides({ accountId, values: new Map() })
		})
=======
					return [
						user.pkid,
						{
							lastMessageTime: user.last_message_time,
							lastMessageId: user.last_message_id,
							preview,
						},
					] as const
				}),
		)
			.then((entries) => {
				if (cancelled) return
				setPreviewOverrides({ accountId, values: new Map(entries) })
			})
			.catch(() => {
				if (!cancelled) setPreviewOverrides({ accountId, values: new Map() })
			})
>>>>>>> 843d8dae80065628be944cc7076945906d94641a

		return () => {
			cancelled = true
		}
	}, [accountId, query.data?.users])

	const data = query.data
		? {
				...query.data,
				users: query.data.users.map((user) => {
<<<<<<< HEAD
					const cached = previewOverrides?.accountId === accountId ? previewOverrides.values.get(user.pkid) : undefined
					const localPreview = cached?.lastMessageTime === user.last_message_time && cached.lastMessageId === user.last_message_id ? cached.preview : undefined
					return {
						...user,
						last_message_preview: localPreview ?? resolveEncryptedPreviewFallback(Boolean(user.last_message_preview || user.last_message_time || user.last_message_type || user.last_message_id != null), user.last_message_type),
=======
					const cached =
						previewOverrides?.accountId === accountId
							? previewOverrides.values.get(user.pkid)
							: undefined
					const localPreview =
						cached?.lastMessageTime === user.last_message_time &&
						cached.lastMessageId === user.last_message_id
							? cached.preview
							: undefined
					return {
						...user,
						last_message_preview:
							localPreview ??
							resolveEncryptedPreviewFallback(
								Boolean(
									user.last_message_preview ||
									user.last_message_time ||
									user.last_message_type ||
									user.last_message_id != null,
								),
								user.last_message_type,
							),
>>>>>>> 843d8dae80065628be944cc7076945906d94641a
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
