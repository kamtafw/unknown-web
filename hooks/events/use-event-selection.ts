"use client"

import { type EventSelection, parseSelection, selectionHref } from "@/lib/events/selection"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo } from "react"

/**
 * The selected event / create form, kept in the query string so it survives a reload and is
 * deep-linkable, while the left pane (and its tab) stays where it is. Opening an event is a
 * history entry (Back closes it); closing replaces the entry so Back does not reopen it.
 */
export function useEventSelection() {
	const params = useSearchParams()
	const pathname = usePathname() ?? "/events"
	const router = useRouter()

	const selection = useMemo(() => parseSelection(params), [params])

	const hrefFor = useCallback(
		(next: EventSelection) => selectionHref(pathname, params, next),
		[pathname, params],
	)

	const go = useCallback(
		(next: EventSelection, options: { replace?: boolean } = {}) => {
			const href = selectionHref(pathname, params, next)
			if (options.replace || next.mode === "none") router.replace(href, { scroll: false })
			else router.push(href, { scroll: false })
		},
		[pathname, params, router],
	)

	return { selection, hrefFor, go }
}
