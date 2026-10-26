"use client"

import { chatApi } from "@/lib/messenger/api"
import { clearListOverlay, setListOverlay } from "@/lib/messenger/list-overlay"
import { chatKeys } from "@/lib/messenger/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { ChatListItem, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

const overlayListKeyForSession = (accountId: number | null, sessionGeneration: number) => `chat-list:${accountId ?? "anonymous"}:${sessionGeneration}`

/** Forces every currently-cached chat-list query variant (all filters,
 * all search terms) to re-run its `select` immediately, so a freshly
 * registered overlay shows up without waiting for a refetch. */
function touchListQueries(queryClient: ReturnType<typeof useQueryClient>) {
	queryClient.setQueriesData<{ users: ChatListItem[]; metadata: { next: string | null } }>(
		{ queryKey: chatKeys.lists() },
		(old) => (old ? { ...old } : old),
	)
}

/** Shared shape for the four boolean-field toggles (pin/mute/block) — row
 * stays in the list, one field flips. Archive is handled separately below
 * since it changes list *membership*, not just a field. */
function useFieldToggle<TField extends keyof ChatListItem>(field: TField, accountId: number | null, sessionGeneration: number) {
	const queryClient = useQueryClient()

	return useCallback(
		async (userUuid: Uuid, value: ChatListItem[TField], request: () => Promise<unknown>) => {
			if (accountId === null) throw new Error("Cannot mutate chat list without an active account")
			const listOverlayKey = overlayListKeyForSession(accountId, sessionGeneration)
			const overlayKey = `${field as string}:${userUuid}`
			setListOverlay<ChatListItem>(listOverlayKey, {
				key: overlayKey,
				apply: (items) => items.map((u) => (u.id === userUuid ? { ...u, [field]: value } : u)),
				isSettled: (freshItems) => {
					const fresh = freshItems.find((u) => u.id === userUuid)
					return !fresh || fresh[field] === value
				},
			})
			touchListQueries(queryClient)

			try {
				await request()
			} catch (err) {
				// Roll back immediately on a confirmed failure rather than
				// waiting for the next fetch to (eventually) disagree.
				clearListOverlay(listOverlayKey, overlayKey)
				touchListQueries(queryClient)
				throw err
			}
		},
		[accountId, field, queryClient, sessionGeneration],
	)
}

export function useChatListActions() {
	const queryClient = useQueryClient()
	const accountId = useAuthStore((s) => (s.user ? (s.user.pkid as number) : null))
	const sessionGeneration = useAuthStore((s) => s.sessionGeneration)
	const togglePinned = useFieldToggle("is_pinned", accountId, sessionGeneration)
	const toggleMuted = useFieldToggle("is_muted", accountId, sessionGeneration)
	const toggleBlocked = useFieldToggle("is_blocked", accountId, sessionGeneration)

	const pin = useCallback(
		(userUuid: Uuid, userPkid: Pkid) => togglePinned(userUuid, true, () => chatApi.pin(userPkid)),
		[togglePinned],
	)

	const unpin = useCallback(
		(userUuid: Uuid, userPkid:Pkid) => togglePinned(userUuid, false, () => chatApi.unpin(userPkid)),
		[togglePinned],
	)

	const mute = useCallback(
		(userUuid: Uuid, userPkid: Pkid) => toggleMuted(userUuid, true, () => chatApi.mute(userPkid)),
		[toggleMuted],
	)

	const unmute = useCallback(
		(userUuid: Uuid, userPkid: Pkid) =>
			toggleMuted(userUuid, false, () => chatApi.unmute(userPkid)),
		[toggleMuted],
	)

	const block = useCallback(
		(userUuid: Uuid, userPkid: Pkid) =>
			toggleBlocked(userUuid, true, () => chatApi.block(userPkid)),
		[toggleBlocked],
	)

	const unblock = useCallback(
		(userUuid: Uuid, userPkid: Pkid) =>
			toggleBlocked(userUuid, false, () => chatApi.unblock(userPkid)),
		[toggleBlocked],
	)

	/** Archive changes list *membership* (the row disappears from
	 * chats/lists entirely — mobile confirms this via a dedicated
	 * `chats/archive-list` endpoint for viewing archived chats separately)
	 * rather than flipping a visible field, so it uses a remove-projection
	 * instead of useFieldToggle's patch-projection. Settled once the row
	 * is genuinely absent from a fresh response. */
	const archive = useCallback(
		async (userUuid: Uuid, userPkid: Pkid) => {
			if (accountId === null) throw new Error("Cannot mutate chat list without an active account")
			const listOverlayKey = overlayListKeyForSession(accountId, sessionGeneration)
			const overlayKey = `archive:${userUuid}`
			setListOverlay<ChatListItem>(listOverlayKey, {
				key: overlayKey,
				apply: (items) => items.filter((u) => u.id !== userUuid),
				isSettled: (freshItems) => !freshItems.some((u) => u.id === userUuid),
			})
			touchListQueries(queryClient)

			try {
				await chatApi.archive(userPkid)
			} catch (err) {
				clearListOverlay(listOverlayKey, overlayKey)
				touchListQueries(queryClient)
				throw err
			}
		},
		[accountId, queryClient, sessionGeneration],
	)

	/** Unarchive is the inverse — no overlay needed. The row doesn't exist
	 * in any currently-cached `chats/list` projection to optimistically
	 * re-insert (we don't know its full ChatListItem shape without a
	 * fetch), so this just invalidates and lets the next fetch pick it up.
	 * Acceptable: unarchiving is a rarer, more deliberate action than the
	 * others, and a brief "still shows in the archive list for a moment"
	 * is a much smaller cost than fabricating a row's data. */
	const unarchive = useCallback(
		async (userPkid: Pkid) => {
			await chatApi.unarchive(userPkid)
			queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
		},
		[queryClient],
	)

	const clearChat = useCallback(
		async (userUuid: Uuid, userPkid: Pkid) => {
			await chatApi.clearChat(userPkid)
			queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			queryClient.invalidateQueries({ queryKey: chatKeys.history(userUuid) })
		},
		[queryClient],
	)

	return { pin, unpin, mute, unmute, block, unblock, archive, unarchive, clearChat }
}