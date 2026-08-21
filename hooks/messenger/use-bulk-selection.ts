"use client"

import { chatApi } from "@/lib/messenger/api"
import { chatKeys } from "@/lib/messenger/query-keys"
import { toast } from "@/lib/toast"
import type { ChatListItem, Pkid, Uuid } from "@/types/messenger"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

/** "Select All" mode for the chat list (Jira APPC-6/7). Local UI state —
 * doesn't need to survive a remount, so plain useState rather than a
 * store, per the "one store per genuine need" rule. */
export function useBulkSelection(visibleChats: ChatListItem[]) {
	const queryClient = useQueryClient()
	const [active, setActive] = useState(false)
	const [selected, setSelected] = useState<Set<Uuid>>(new Set())

	const toggle = useCallback((uuid: Uuid) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(uuid)) next.delete(uuid)
			else next.add(uuid)
			return next
		})
	}, [])

	const selectAll = useCallback(() => {
		setSelected(new Set(visibleChats.map((c) => c.id)))
	}, [visibleChats])

	const start = useCallback((uuid?: Uuid) => {
		setActive(true)
		if (uuid) setSelected(new Set([uuid]))
	}, [])

	const stop = useCallback(() => {
		setActive(false)
		setSelected(new Set())
	}, [])

	const selectedItems = visibleChats.filter((c) => selected.has(c.id))
	const selectedPkids = selectedItems.map((c) => c.pkid) as Pkid[]

	const bulkArchive = useCallback(async () => {
		if (selectedPkids.length === 0) return
		try {
			await chatApi.archiveBulk(selectedPkids)
			queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			toast.success(`Archived ${selectedPkids.length} chat${selectedPkids.length > 1 ? "s" : ""}`)
			stop()
		} catch {
			toast.error("Couldn't archive the selected chats — try again.")
		}
	}, [selectedPkids, queryClient, stop])

	const bulkClear = useCallback(async () => {
		if (selectedPkids.length === 0) return
		try {
			await chatApi.clearBulk(selectedPkids)
			queryClient.invalidateQueries({ queryKey: chatKeys.lists() })
			toast.success(`Cleared ${selectedPkids.length} chat${selectedPkids.length > 1 ? "s" : ""}`)
			stop()
		} catch {
			toast.error("Couldn't clear the selected chats — try again.")
		}
	}, [selectedPkids, queryClient, stop])

	return {
		active,
		selected,
		selectedCount: selected.size,
		toggle,
		selectAll,
		start,
		stop,
		bulkArchive,
		bulkClear,
	}
}
