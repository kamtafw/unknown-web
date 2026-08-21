/**
 * Read-after-write overlay for chat-list mutations.
 *
 * WHY THIS EXISTS: mobile's use-chats.ts documents a confirmed backend
 * quirk — "a successful DELETE or POST on /chats/favorites is occasionally
 * not reflected by the next GET" — and works around it with a client-side
 * tombstone/pending-add layer, reconciled against each fresh server
 * response. That's not favorites-specific; the same risk applies to any
 * toggle-style chat-list mutation (pin, mute, archive, block) hitting the
 * same API family. This module generalizes mobile's exact mechanism
 * (optimistic local projection, self-clears once the server catches up)
 * into one small, reusable piece instead of five copy-pasted ones.
 *
 * WHAT THIS DELIBERATELY IS NOT: a generic client-state framework. There's
 * no subscription system, no middleware, no persistence beyond one
 * in-memory Map. One overlay = one pending mutation's effect on one list.
 * If a genuinely different shape of problem shows up later, that should be
 * solved directly rather than extending this file to cover it.
 */

interface ListOverlay<T> {
	/** Unique per logical target+action, e.g. `pin:${userUuid}`. A new
	 * overlay with the same key replaces the old one (e.g. pin then
	 * immediately unpin before the server responds to either). */
	key: string
	/** Produces the optimistic projection from the raw/previous list. */
	apply: (items: T[]) => T[]
	/** True once a fresh server response already reflects this overlay's
	 * effect — at that point the override is redundant and gets dropped
	 * rather than lingering indefinitely (mobile's "reconcile against each
	 * fresh response" rule). */
	isSettled: (freshItems: T[]) => boolean
}

/** One overlay set per logical list (keyed by the query's own cache key,
 * stringified) — module-scope so it survives component unmounts, same
 * reasoning as mobile's module-scope Sets/Maps. */
const overlaysByList = new Map<string, Map<string, ListOverlay<unknown>>>()

export function setListOverlay<T>(listKey: string, overlay: ListOverlay<T>): void {
	if (!overlaysByList.has(listKey)) overlaysByList.set(listKey, new Map())
	overlaysByList.get(listKey)!.set(overlay.key, overlay as ListOverlay<unknown>)
}

export function clearListOverlay(listKey: string, overlayKey: string): void {
	overlaysByList.get(listKey)?.delete(overlayKey)
}

/**
 * Call this every time fresh server data lands for a list (typically in a
 * query's `select`). Drops any overlay the server has now caught up on,
 * then applies whatever remains on top of the fresh data.
 */
export function projectWithOverlays<T>(listKey: string, freshItems: T[]): T[] {
	const overlays = overlaysByList.get(listKey)
	if (!overlays || overlays.size === 0) return freshItems

	for (const [key, overlay] of overlays) {
		if (overlay.isSettled(freshItems as T[])) overlays.delete(key)
	}
	if (overlays.size === 0) return freshItems

	let projected = freshItems
	for (const overlay of overlays.values()) {
		projected = (overlay as ListOverlay<T>).apply(projected)
	}
	return projected
}
