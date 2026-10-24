/**
 * What the Events right pane shows, held in the URL:
 *   ?event=<uuid>                         details or restricted preview
 *   ?event=<uuid>&tab=comments            a full-access section
 *   ?event=<uuid>&edit=1                  edit form (hosts only; the server stays authoritative)
 *   ?create=1                             create form
 * Pure, so it is unit-testable. Only approved selection keys are read or written; unrelated
 * query parameters are preserved, and nothing secret (a passcode, a token) belongs in the URL.
 * The id is NOT validated here; useEventDetails rejects a malformed id without a request.
 */

export type EventTab = "details" | "comments" | "resources" | "guests"
const EVENT_TABS = new Set<EventTab>(["details", "comments", "resources", "guests"])

export type EventSelection =
	| { mode: "none" }
	| { mode: "create" }
	| { mode: "view"; eventId: string; tab?: EventTab }
	| { mode: "edit"; eventId: string }

export const SELECTION_KEYS = ["event", "edit", "create", "tab"] as const

type ParamsLike = { get(name: string): string | null }

/** An id longer than any UUID is treated as garbage, not echoed into the UI. */
const MAX_ID_LENGTH = 64

export function parseSelection(params: ParamsLike | null | undefined): EventSelection {
	if (!params) return { mode: "none" }
	if (params.get("create") === "1") return { mode: "create" }

	const raw = (params.get("event") ?? "").trim()
	if (!raw) return { mode: "none" }
	const eventId = raw.slice(0, MAX_ID_LENGTH)
	if (params.get("edit") === "1") return { mode: "edit", eventId }
	const rawTab = params.get("tab") as EventTab | null
	const tab = rawTab && EVENT_TABS.has(rawTab) ? rawTab : "details"
	return { mode: "view", eventId, tab }
}

/** `pathname` + current params with the selection keys replaced by `next`. */
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
		else if (next.tab && next.tab !== "details") query.set("tab", next.tab)
	}

	const qs = query.toString()
	return qs ? `${pathname}?${qs}` : pathname
}
