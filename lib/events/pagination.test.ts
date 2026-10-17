import type { EventCard, EventsPage } from "@/types/events/api"
import { describe, expect, it } from "vitest"
import { MAX_EMPTY_PAGE_ADVANCE, MAX_SEARCH_SCAN_PAGES } from "./constants"
import {
	searchCoverage,
	shouldAdvancePastEmptyPage,
	shouldScanForSearch,
	trailingEmptyPages,
} from "./pagination"

const ev = { id: "e1" } as EventCard
const page = (n: number, events: EventCard[], hasNext = true): EventsPage => ({
	events,
	page: n,
	hasNext,
})

describe("trailingEmptyPages", () => {
	it("is 0 for no pages or a non-empty last page", () => {
		expect(trailingEmptyPages(undefined)).toBe(0)
		expect(trailingEmptyPages([page(1, [])] .concat(page(2, [ev])))).toBe(0)
	})

	it("counts only the empty pages at the end", () => {
		expect(trailingEmptyPages([page(1, [ev]), page(2, []), page(3, [])])).toBe(2)
		expect(trailingEmptyPages([page(1, [])])).toBe(1)
	})
})

describe("shouldAdvancePastEmptyPage", () => {
	const base = { hasNextPage: true, isFetching: false, fetchFailed: false }

	it("keeps going when the latest page is empty but a next page exists", () => {
		expect(shouldAdvancePastEmptyPage({ ...base, pages: [page(1, [])] })).toBe(true)
	})

	it("does not advance when there is no next page, a fetch is running, or it failed", () => {
		const pages = [page(1, [])]
		expect(shouldAdvancePastEmptyPage({ ...base, pages, hasNextPage: false })).toBe(false)
		expect(shouldAdvancePastEmptyPage({ ...base, pages, isFetching: true })).toBe(false)
		expect(shouldAdvancePastEmptyPage({ ...base, pages, fetchFailed: true })).toBe(false)
	})

	it("does not advance when the latest page has events", () => {
		expect(shouldAdvancePastEmptyPage({ ...base, pages: [page(1, [ev])] })).toBe(false)
	})

	it("stops after too many empty pages in a row", () => {
		const pages = Array.from({ length: MAX_EMPTY_PAGE_ADVANCE }, (_, i) => page(i + 1, []))
		expect(shouldAdvancePastEmptyPage({ ...base, pages })).toBe(false)
	})
})

describe("searchCoverage", () => {
	const base = { active: true, hasNextPage: true, pagesLoaded: 1, fetchFailed: false }

	it("is inactive without a search", () => {
		expect(searchCoverage({ ...base, active: false })).toBe("inactive")
	})

	it("is complete only when no nearby page remains", () => {
		expect(searchCoverage({ ...base, hasNextPage: false })).toBe("complete")
	})

	it("is scanning while pages remain", () => {
		expect(searchCoverage(base)).toBe("scanning")
	})

	it("is partial after a failed fetch or at the page cap, never complete", () => {
		expect(searchCoverage({ ...base, fetchFailed: true })).toBe("partial")
		expect(searchCoverage({ ...base, pagesLoaded: MAX_SEARCH_SCAN_PAGES })).toBe("partial")
	})
})

describe("shouldScanForSearch", () => {
	it("scans only while scanning and idle", () => {
		expect(shouldScanForSearch({ coverage: "scanning", isFetching: false })).toBe(true)
		expect(shouldScanForSearch({ coverage: "scanning", isFetching: true })).toBe(false)
		expect(shouldScanForSearch({ coverage: "partial", isFetching: false })).toBe(false)
		expect(shouldScanForSearch({ coverage: "inactive", isFetching: false })).toBe(false)
	})
})
