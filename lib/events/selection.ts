/**
 * What the Events right pane shows, held in the URL (approved routing, Pass 2):
 *   ?event=<uuid>            details or restricted preview
 *   ?event=<uuid>&edit=1     edit form (hosts only; the server stays authoritative)
 *   ?create=1                create form
 * and, for a viewed event only, the section of the details pane (A-16):
 *   ?event=<uuid>&tab=comments|resources|guests     (no `tab` = Details, the default)
 * Pure, so it is unit-testable. Only these keys (event, edit, create, tab) are ever read or written: other query
 * parameters are preserved, and nothing secret (a passcode, a token) may be placed in them.
 * The id is NOT validated here; `useEventDetails` rejects a malformed id without a request.
 */

/** sections of a full event's details pane; `details` is the default and is never written to the URL */
export const EVENT_TABS = ["details", "comments", "resources", "guests"] as const
export type EventTab = (typeof EVENT_TABS)[number]

/** an unknown or missing value is Details, never an error */
export function parseEventTab(raw: string | null | undefined): EventTab {
	return EVENT_TABS.find((tab) => tab === raw) ?? "details"
}

export type EventSelection =
	| { mode: "none" }
	| { mode: "create" }
	/** `tab` is present only for a section other than Details */
	| { mode: "view"; eventId: string; tab?: EventTab }
	| { mode: "edit"; eventId: string }

export const SELECTION_KEYS = ["event", "edit", "create", "tab"] as const

type ParamsLike = { get(name: string): string | null }

/** an id longer than any UUID is treated as garbage, not echoed into the UI */
const MAX_ID_LENGTH = 64

export function parseSelection(params: ParamsLike | null | undefined): EventSelection {
	if (!params) return { mode: "none" }
	if (params.get("create") === "1") return { mode: "create" }

	const raw = (params.get("event") ?? "").trim()
	if (!raw) return { mode: "none" }
	const eventId = raw.slice(0, MAX_ID_LENGTH)
	if (params.get("edit") === "1") return { mode: "edit", eventId }

	const tab = parseEventTab(params.get("tab"))
	return tab === "details" ? { mode: "view", eventId } : { mode: "view", eventId, tab }
}

/** `pathname` + the current params with the selection keys replaced by `next` */
export function selectionHref(
	pathname: string,
	current: { toString(): string } | null | undefined,
	next: EventSelection,
): string {
	const query = new URLSearchParams(current?.toString() ?? "")
	for (const key of SELECTION_KEYS) query.delete(key)

	if (next.mode === "create") query.set("create", "1")
	else if (next.mode === "view" || next.mode === "edit") {
		query.set("event", next.eventId)
		if (next.mode === "edit") query.set("edit", "1")
		// a section belongs to a viewed event only: edit and create never carry one, and a
		// different event starts on Details because its href carries no `tab`
		else if (next.tab && next.tab !== "details") query.set("tab", next.tab)
	}

	const qs = query.toString()
	return qs ? `${pathname}?${qs}` : pathname
}
