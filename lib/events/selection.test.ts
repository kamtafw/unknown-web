import { describe, expect, it } from "vitest"
import { parseSelection, selectionHref } from "./selection"

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
		expect(selectionHref("/events", null, { mode: "view", eventId: ID })).toBe(`/events?event=${ID}`)
		expect(selectionHref("/events", null, { mode: "edit", eventId: ID })).toBe(`/events?event=${ID}&edit=1`)
		expect(selectionHref("/events/my-events", null, { mode: "create" })).toBe("/events/my-events?create=1")
		expect(selectionHref("/events", p(`event=${ID}&edit=1`), { mode: "none" })).toBe("/events")
	})
	it("replaces the selection keys and keeps unrelated params", () => {
		expect(selectionHref("/events", p(`x=1&event=old&edit=1`), { mode: "view", eventId: ID })).toBe(
			`/events?x=1&event=${ID}`,
		)
		expect(selectionHref("/events", p(`x=1&create=1`), { mode: "none" })).toBe("/events?x=1")
	})
	it("never carries a create flag together with an event", () => {
		expect(selectionHref("/events", p("create=1"), { mode: "view", eventId: ID })).toBe(`/events?event=${ID}`)
	})
})


describe("event section selection", () => {
	it("defaults to details and accepts only known tabs in view mode", () => {
		expect(parseSelection(p(`event=${ID}`))).toEqual({ mode: "view", eventId: ID, tab: "details" })
		expect(parseSelection(p(`event=${ID}&tab=comments`))).toEqual({ mode: "view", eventId: ID, tab: "comments" })
		expect(parseSelection(p(`event=${ID}&tab=resources`))).toEqual({ mode: "view", eventId: ID, tab: "resources" })
		expect(parseSelection(p(`event=${ID}&tab=guests`))).toEqual({ mode: "view", eventId: ID, tab: "guests" })
		expect(parseSelection(p(`event=${ID}&tab=unknown`))).toEqual({ mode: "view", eventId: ID, tab: "details" })
	})

	it("does not carry a tab into create or edit mode", () => {
		expect(parseSelection(p(`create=1&tab=guests&event=${ID}`))).toEqual({ mode: "create" })
		expect(parseSelection(p(`event=${ID}&edit=1&tab=guests`))).toEqual({ mode: "edit", eventId: ID })
		expect(selectionHref("/events", p("x=1&tab=guests"), { mode: "create" })).toBe("/events?x=1&create=1")
		expect(selectionHref("/events", p("x=1&tab=guests"), { mode: "edit", eventId: ID })).toBe(`/events?x=1&event=${ID}&edit=1`)
	})

	it("writes a deep-linkable tab while preserving the event and unrelated params", () => {
		expect(selectionHref("/events", p(`x=1&event=${ID}&tab=resources`), { mode: "view", eventId: ID, tab: "comments" }))
			.toBe(`/events?x=1&event=${ID}&tab=comments`)
		expect(selectionHref("/events", p("x=1&tab=guests"), { mode: "view", eventId: ID, tab: "details" }))
			.toBe(`/events?x=1&event=${ID}`)
		expect(selectionHref("/events", p("x=1&tab=guests"), { mode: "view", eventId: "other" }))
			.toBe("/events?x=1&event=other")
	})
})
