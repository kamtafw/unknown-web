import { afterEach, describe, expect, it } from "vitest"
import { clearListOverlay, projectWithOverlays, setListOverlay } from "./list-overlay"

describe("account-scoped chat-list overlays", () => {
	const row = { id: "peer-1", is_pinned: false }

	afterEach(() => {
		clearListOverlay("chat-list:101", "pin:peer-1")
		clearListOverlay("chat-list:202", "pin:peer-1")
	})

	it("does not project account A's optimistic mutation into account B's list", () => {
		setListOverlay<typeof row>("chat-list:101", {
			key: "pin:peer-1",
			apply: (items) => items.map((item) => item.id === "peer-1" ? { ...item, is_pinned: true } : item),
			isSettled: () => false,
		})

		expect(projectWithOverlays("chat-list:101", [row])).toEqual([{ ...row, is_pinned: true }])
		expect(projectWithOverlays("chat-list:202", [row])).toEqual([row])
	})
})
