import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventsShell } from "./events-shell"

const useEventSelection = vi.fn()
vi.mock("@/hooks/events/use-event-selection", () => ({
	useEventSelection: () => useEventSelection(),
}))
vi.mock("./event-pane", () => ({ EventPane: () => <aside data-testid="pane" /> }))
vi.mock("./event-room-placeholder", () => ({ EventRoomPlaceholder: () => <aside data-testid="placeholder" /> }))

const left = () => screen.getByText("The list")

beforeEach(() => useEventSelection.mockReset())

describe("EventsShell", () => {
	it("keeps the list visible with nothing selected", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "none" } })
		render(<EventsShell>The list</EventsShell>)
		expect(left().className).not.toMatch(/(^|\s)hidden(\s|$)/)
		expect(screen.getByTestId("pane")).toBeInTheDocument()
	})

	it.each([
		["view", { mode: "view", eventId: "x" }],
		["edit", { mode: "edit", eventId: "x" }],
		["create", { mode: "create" }],
	])("hides the list below lg (only) while %s is open", (_name, selection) => {
		useEventSelection.mockReturnValue({ selection })
		render(<EventsShell>The list</EventsShell>)
		// hidden on small screens, but still shown from lg: the two panes sit side by side
		expect(left().className).toMatch(/(^|\s)hidden(\s|$)/)
		expect(left().className).toMatch(/lg:flex/)
	})
})
