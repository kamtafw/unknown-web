import { describe, expect, it } from "vitest"
import {
	EVENT_TABS,
	parseEventTab,
	parseSelection,
	SELECTION_KEYS,
	selectionHref,
} from "./selection"

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const p = (q: string) => new URLSearchParams(q)

describe("parseSelection", () => {
	it("is none without params", () => {
		expect(parseSelection(p(""))).toEqual({ mode: "none" })
		expect(parseSelection(null)).toEqual({ mode: "none" })
	})
	it("reads view, edit and create", () => {
		expect(parseSelection(p(`event=${ID}`))).toEqual({ mode: "view", eventId: ID })
		expect(parseSelection(p(`event=${ID}&edit=1`))).toEqual({ mode: "edit", eventId: ID })
		expect(parseSelection(p("create=1"))).toEqual({ mode: "create" })
	})
	it("create wins over an event, and edit needs an event", () => {
		expect(parseSelection(p(`create=1&event=${ID}`))).toEqual({ mode: "create" })
		expect(parseSelection(p("edit=1"))).toEqual({ mode: "none" })
	})
	it("only the exact value 1 turns on edit or create", () => {
		expect(parseSelection(p(`event=${ID}&edit=true`))).toEqual({ mode: "view", eventId: ID })
		expect(parseSelection(p("create=yes"))).toEqual({ mode: "none" })
	})
	it("trims, ignores an empty id and caps an oversized one", () => {
		expect(parseSelection(p("event=%20"))).toEqual({ mode: "none" })
		const long = parseSelection(p(`event=${"a".repeat(500)}`))
		expect(long.mode === "view" && long.eventId.length).toBe(64)
	})
	it("keeps a malformed id so the pane can say it is invalid", () => {
		expect(parseSelection(p("event=not-a-uuid"))).toEqual({ mode: "view", eventId: "not-a-uuid" })
	})
})

describe("selectionHref", () => {
	it("builds each mode and returns the bare path for none", () => {
		expect(selectionHref("/events", null, { mode: "view", eventId: ID })).toBe(
			`/events?event=${ID}`,
		)
		expect(selectionHref("/events", null, { mode: "edit", eventId: ID })).toBe(
			`/events?event=${ID}&edit=1`,
		)
		expect(selectionHref("/events/my-events", null, { mode: "create" })).toBe(
			"/events/my-events?create=1",
		)
		expect(selectionHref("/events", p(`event=${ID}&edit=1`), { mode: "none" })).toBe("/events")
	})
	it("replaces the selection keys and keeps unrelated params", () => {
		expect(selectionHref("/events", p(`x=1&event=old&edit=1`), { mode: "view", eventId: ID })).toBe(
			`/events?x=1&event=${ID}`,
		)
		expect(selectionHref("/events", p(`x=1&create=1`), { mode: "none" })).toBe("/events?x=1")
	})
	it("never carries a create flag together with an event", () => {
		expect(selectionHref("/events", p("create=1"), { mode: "view", eventId: ID })).toBe(
			`/events?event=${ID}`,
		)
	})
})

describe("section (tab) state, P3-03", () => {
	it("SELECTION_KEYS covers the four keys the pane owns", () => {
		expect([...SELECTION_KEYS].sort()).toEqual(["create", "edit", "event", "tab"])
		expect([...EVENT_TABS]).toEqual(["details", "comments", "resources", "guests"])
	})

	it("parseEventTab accepts the three sections and falls back to details for anything else", () => {
		for (const tab of ["comments", "resources", "guests"]) expect(parseEventTab(tab)).toBe(tab)
		for (const bad of [
			null,
			undefined,
			"",
			"details",
			"Comments",
			"live",
			"guests ",
			"__proto__",
			"constructor",
		]) {
			expect(parseEventTab(bad)).toBe("details")
		}
	})

	it("a viewed event carries its section; Details has none", () => {
		for (const tab of ["comments", "resources", "guests"] as const) {
			expect(parseSelection(p(`event=${ID}&tab=${tab}`))).toEqual({
				mode: "view",
				eventId: ID,
				tab,
			})
		}
		expect(parseSelection(p(`event=${ID}`))).toEqual({ mode: "view", eventId: ID })
		expect(parseSelection(p(`event=${ID}&tab=details`))).toEqual({ mode: "view", eventId: ID })
		expect(parseSelection(p(`event=${ID}&tab=nope`))).toEqual({ mode: "view", eventId: ID })
	})

	it("edit, create and none ignore a tab", () => {
		expect(parseSelection(p(`event=${ID}&edit=1&tab=guests`))).toEqual({
			mode: "edit",
			eventId: ID,
		})
		expect(parseSelection(p("create=1&tab=guests"))).toEqual({ mode: "create" })
		expect(parseSelection(p("tab=guests"))).toEqual({ mode: "none" })
	})

	it("writes the section for a viewed event only, and omits Details", () => {
		expect(selectionHref("/events", null, { mode: "view", eventId: ID, tab: "comments" })).toBe(
			`/events?event=${ID}&tab=comments`,
		)
		expect(selectionHref("/events", null, { mode: "view", eventId: ID, tab: "details" })).toBe(
			`/events?event=${ID}`,
		)
		expect(
			selectionHref("/events", p(`event=${ID}&tab=guests`), { mode: "view", eventId: ID }),
		).toBe(`/events?event=${ID}`)
	})

	it("keeps the event and unrelated params when the section changes", () => {
		expect(
			selectionHref("/events", p(`x=1&event=${ID}&tab=comments&y=2`), {
				mode: "view",
				eventId: ID,
				tab: "guests",
			}),
		).toBe(`/events?x=1&y=2&event=${ID}&tab=guests`)
	})

	it("never carries a section into edit, create or none", () => {
		const current = p(`event=${ID}&tab=guests&x=1`)
		expect(selectionHref("/events", current, { mode: "edit", eventId: ID })).toBe(
			`/events?x=1&event=${ID}&edit=1`,
		)
		expect(selectionHref("/events", current, { mode: "create" })).toBe("/events?x=1&create=1")
		expect(selectionHref("/events", current, { mode: "none" })).toBe("/events?x=1")
	})

	it("opening a different event starts on Details", () => {
		const other = "7a1d2c3e-8d0a-4c53-9f3b-1b2a6a0c7d22"
		expect(
			selectionHref("/events", p(`event=${ID}&tab=guests`), { mode: "view", eventId: other }),
		).toBe(`/events?event=${other}`)
	})

	it("round-trips through parse", () => {
		for (const tab of ["comments", "resources", "guests"] as const) {
			const href = selectionHref("/events", null, { mode: "view", eventId: ID, tab })
			expect(parseSelection(new URL(href, "http://x").searchParams)).toEqual({
				mode: "view",
				eventId: ID,
				tab,
			})
		}
	})
})
