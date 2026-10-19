import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EventRoomPlaceholder } from "./event-room-placeholder"
import { EventsPane } from "./events-pane"

describe("EventsPane", () => {
	const search = (over = {}) => ({
		value: "",
		onChange: vi.fn(),
		label: "Search things",
		...over,
	})

	it("renders search above the tabs, then the list content", () => {
		render(
			<EventsPane label="Pane" search={search()}>
				<p>list content</p>
			</EventsPane>,
		)
		const box = screen.getByRole("searchbox", { name: "Search things" })
		const tabs = screen.getByRole("navigation", { name: "Events sections" })
		const content = screen.getByText("list content")
		expect(box.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(tabs.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
		expect(screen.getByRole("region", { name: "Pane" })).toBeInTheDocument()
	})

	it("shows the optional location slot first, and omits it when absent", () => {
		const { rerender } = render(
			<EventsPane label="Pane" search={search()} location={<div>loc slot</div>}>
				x
			</EventsPane>,
		)
		expect(screen.getByText("loc slot")).toBeInTheDocument()
		rerender(
			<EventsPane label="Pane" search={search()}>
				x
			</EventsPane>,
		)
		expect(screen.queryByText("loc slot")).not.toBeInTheDocument()
	})

	it("scrolls the list inside the pane while the header stays outside the scroller", () => {
		render(
			<EventsPane label="Pane" search={search()}>
				<p>list content</p>
			</EventsPane>,
		)
		const scroller = screen.getByText("list content").parentElement as HTMLElement
		expect(scroller).toHaveClass("overflow-y-auto")
		expect(scroller).not.toContainElement(screen.getByRole("searchbox"))
		expect(scroller).not.toContainElement(screen.getByRole("navigation"))
	})

	it("forwards typing and the disabled state to the search field", () => {
		const onChange = vi.fn()
		const { rerender } = render(
			<EventsPane label="Pane" search={search({ onChange })}>
				x
			</EventsPane>,
		)
		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "jazz" } })
		expect(onChange).toHaveBeenCalledWith("jazz")

		rerender(
			<EventsPane label="Pane" search={search({ onChange, disabled: true })}>
				x
			</EventsPane>,
		)
		expect(screen.getByRole("searchbox")).toBeDisabled()
	})
})

describe("EventRoomPlaceholder", () => {
	it("is a neutral, desktop-only selected-event area with no room controls", () => {
		render(<EventRoomPlaceholder />)
		const pane = screen.getByRole("complementary", { name: "Selected event" })
		expect(pane).toHaveClass("hidden", "lg:flex")
		expect(screen.getByText("No event selected")).toBeInTheDocument()
		// room, comments, live and host actions are later phases
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
	})
})
