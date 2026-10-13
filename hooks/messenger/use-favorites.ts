"use client"

import { extractMessage } from "@/lib/api-error"
import { chatApi, FavoriteItem, isFavoriteUserTarget } from "@/lib/messenger/api"
import { clearListOverlay, projectWithOverlays, setListOverlay } from "@/lib/messenger/list-overlay"
import { resolveLocalChatPreview } from "@/lib/messenger/e2ee/local-preview"
import { resolveEncryptedPreviewFallback } from "@/lib/messenger/preview"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListItem, Pkid, Uuid } from "@/types/messenger"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useState } from "react"

const OVERLAY_KEY = "favorites"

/** Adapts a FavoriteItem (user-type only — group favorites aren't
 * renderable yet, Groups is M3) into the same ChatListItem shape the rest
 * of the chat-list UI already knows how to render, so favorites can reuse
 * <ChatListItem/> rather than needing a parallel component. */
function toChatListItem(favorite: FavoriteItem): ChatListItem | null {
	if (!isFavoriteUserTarget(favorite.target)) return null // group favorite — not yet renderable
	const t = favorite.target
	return {
		id: t.id as Uuid,
		pkid: t.pkid as Pkid,
		first_name: t.first_name,
		last_name: t.last_name,
		username: t.username,
		profile_photo: t.profile_photo,
		unread_count: t.unread_count,
		last_message_preview: t.last_message_preview,
		last_message_time: t.last_message_time,
		last_message_type: t.last_message_type,
		is_pinned: false,
		is_blocked: false,
		has_blocked_me: false,
		is_muted: false,
	}
}

export function useFavorites() {
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as Pkid) : null))
	const query = useQuery({
		queryKey: chatKeys.favorites(),
		queryFn: () => chatApi.listFavorites(),
		staleTime: 30_000,
		select: (favorites) => {
			const items = favorites.map(toChatListItem).filter((x): x is ChatListItem => x !== null)
			return projectWithOverlays<ChatListItem>(OVERLAY_KEY, items)
		},
	})
	const [previewOverrides, setPreviewOverrides] = useState<{ accountId: number; values: Map<number, { lastMessageTime: string | null; preview: string }> } | null>(null)

	useEffect(() => {
		if (!accountId || !query.data?.length) {
			setPreviewOverrides(null)
			return
		}
		let cancelled = false
		void Promise.all(query.data.map(async (user) => {
			const preview = await resolveLocalChatPreview(accountId as Pkid, user.pkid as Pkid, user.last_message_preview, user.last_message_time, user.last_message_type, user.last_message_id)
			return [user.pkid, { lastMessageTime: user.last_message_time, preview }] as const
		})).then((entries) => {
			if (!cancelled) setPreviewOverrides({ accountId, values: new Map(entries) })
		}).catch(() => {
			if (!cancelled) setPreviewOverrides({ accountId, values: new Map() })
		})
		return () => { cancelled = true }
	}, [accountId, query.data])

	return {
		...query,
		data: query.data?.map((user) => {
			const cached = previewOverrides?.accountId === accountId ? previewOverrides.values.get(user.pkid) : undefined
			const localPreview = cached?.lastMessageTime === user.last_message_time ? cached.preview : undefined
			return {
				...user,
				last_message_preview: localPreview ?? resolveEncryptedPreviewFallback(Boolean(user.last_message_preview || user.last_message_time), user.last_message_type),
			}
		}),
	}
}

export function useFavoriteActions() {
	const queryClient = useQueryClient()

	const touch = useCallback(() => {
		queryClient.setQueryData(chatKeys.favorites(), (old: FavoriteItem[] | undefined) => old ?? [])
	}, [queryClient])

	const addFavorite = useCallback(
		async (user: ChatListItem) => {
			const overlayKey = `add:${user.id}`
			setListOverlay<ChatListItem>(OVERLAY_KEY, {
				key: overlayKey,
				apply: (items) => (items.some((u) => u.id === user.id) ? items : [user, ...items]),
				isSettled: (freshItems) => freshItems.some((u) => u.id === user.id),
			})
			touch()

			try {
				await chatApi.addFavorite(user.pkid)
			} catch (err) {
				clearListOverlay(OVERLAY_KEY, overlayKey)
				touch()
				toast.error(extractMessage(err, "Couldn't add to favorites — try again"))
				throw err
			}
		},
		[touch],
	)

	const removeFavorite = useCallback(
		async (favoriteId: number, user: ChatListItem) => {
			const overlayKey = `remove:${user.id}`
			setListOverlay<ChatListItem>(OVERLAY_KEY, {
				key: overlayKey,
				apply: (items) => items.filter((u) => u.id !== user.id),
				isSettled: (freshItems) => !freshItems.some((u) => u.id === user.id),
			})
			touch()

			try {
				await chatApi.removeFavorite(favoriteId, user.pkid)
			} catch (err) {
				clearListOverlay(OVERLAY_KEY, overlayKey)
				touch()
				toast.error(extractMessage(err, "Couldn't remove from favorites — try again"))
				throw err
			}
		},
		[touch],
	)

	return { addFavorite, removeFavorite }
}
