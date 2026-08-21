"use client"

import { chatApi, FavoriteItem, isFavoriteUserTarget } from "@/lib/messenger/api"
import { clearListOverlay, projectWithOverlays, setListOverlay } from "@/lib/messenger/list-overlay"
import { chatKeys } from "@/lib/messenger/query-keys"
import type { ChatListItem, Pkid, Uuid } from "@/types/messenger"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

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
		is_pinned: false,
		is_blocked: false,
		has_blocked_me: false,
		is_muted: false,
	}
}

export function useFavorites() {
	return useQuery({
		queryKey: chatKeys.favorites(),
		queryFn: () => chatApi.listFavorites(),
		staleTime: 30_000,
		select: (favorites) => {
			const items = favorites.map(toChatListItem).filter((x): x is ChatListItem => x !== null)
			// Same confirmed lag as mobile documents for this exact endpoint
			// (see lib/messenger/list-overlay.ts) — reconciled here the same
			// way useChatList reconciles pin/mute/archive/block overlays.
			return projectWithOverlays<ChatListItem>(OVERLAY_KEY, items)
		},
	})
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
				throw err
			}
		},
		[touch],
	)

	return { addFavorite, removeFavorite }
}
