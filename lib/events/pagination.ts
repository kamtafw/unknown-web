import type { EventsPage } from "@/types/events/api"
import { MAX_EMPTY_PAGE_ADVANCE, MAX_SEARCH_SCAN_PAGES } from "./constants"

/** consecutive pages with no events at the END of the loaded pages */
export function trailingEmptyPages(pages: EventsPage[] | undefined): number {
	if (!pages) return 0
	let count = 0
	for (let i = pages.length - 1; i >= 0 && pages[i].events.length === 0; i--) count++
	return count
}

/**
 * Nearby removes expired/orphan events AFTER paginating, so a page can be empty
 * while `next` is still set. Keep going in that case — an empty page alone is
 * never the end — but stop after MAX_EMPTY_PAGE_ADVANCE in a row so a
 * misbehaving backend cannot loop forever.
 */
export function shouldAdvancePastEmptyPage(args: {
	pages: EventsPage[] | undefined
	hasNextPage: boolean
	isFetching: boolean
	fetchFailed: boolean
}): boolean {
	const { pages, hasNextPage, isFetching, fetchFailed } = args
	if (!pages || !hasNextPage || isFetching || fetchFailed) return false
	const empty = trailingEmptyPages(pages)
	return empty > 0 && empty < MAX_EMPTY_PAGE_ADVANCE
}

export type SearchCoverage =
	/** no search active */
	| "inactive"
	/** every nearby page has been searched */
	| "complete"
	/** remaining pages are still being fetched */
	| "scanning"
	/** stopped early (page cap or a failed fetch): only loaded pages were searched */
	| "partial"

/**
 * Nearby search is local (there is no server-side nearby search), so "no
 * matches" is only honest once every nearby page is loaded. This reports how
 * much of the nearby set the current search covered.
 */
export function searchCoverage(args: {
	active: boolean
	hasNextPage: boolean
	pagesLoaded: number
	fetchFailed: boolean
}): SearchCoverage {
	const { active, hasNextPage, pagesLoaded, fetchFailed } = args
	if (!active) return "inactive"
	if (!hasNextPage) return "complete"
	if (fetchFailed || pagesLoaded >= MAX_SEARCH_SCAN_PAGES) return "partial"
	return "scanning"
}

/** whether the search should pull the next nearby page right now */
export function shouldScanForSearch(args: {
	coverage: SearchCoverage
	isFetching: boolean
}): boolean {
	return args.coverage === "scanning" && !args.isFetching
}
