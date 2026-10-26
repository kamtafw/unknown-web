import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventPane } from "./event-pane"

const go = vi.fn()
const useEventSelection = vi.fn()
const useEventDetails = vi.fn()
vi.mock("@/hooks/events/use-event-selection", () => ({ useEventSelection: () => useEventSelection() }))
vi.mock("@/hooks/events/use-event-details", () => ({ useEventDetails: (id: string) => useEventDetails(id) }))
vi.mock("./event-room-placeholder", () => ({ EventRoomPlaceholder: () => <p>No event selected</p> }))
vi.mock("./event-form", () => ({
	EventForm: (p: { mode: string; onDone: (id: string | null) => void; onCancel: () => void }) => (
		<div>
			<p>form:{p.mode}</p>
			<button onClick={() => p.onDone("new-id")}>finish</button>
			<button onClick={p.onCancel}>cancel</button>
		</div>
	),
}))
vi.mock("./event-details-view", () => ({
	EventDetailsView: (p: {
		details: { name: string }
		isHost: boolean
		onEdit: () => void
		tab?: string
		onTabChange?: (tab: string) => void
	}) => (
		<div>
			<p>details:{p.details.name}</p>
			<p>host:{String(p.isHost)}</p>
			<p>tab:{String(p.tab)}</p>
			<button onClick={p.onEdit}>edit</button>
			<button onClick={() => p.onTabChange?.("guests")}>pick guests</button>
		</div>
	),
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const full = { kind: "full", id: ID, name: "Jazz night" }
const preview = { kind: "preview", id: ID, name: "Jazz night" }
const loaded = (over: Record<string, unknown>) => ({
	status: "ready",
	details: full,
	isHost: false,
	refetch: vi.fn(),
	isRefetching: false,
	...over,
})

beforeEach(() => {
	vi.clearAllMocks()
	useEventSelection.mockReturnValue({ selection: { mode: "none" }, go })
	useEventDetails.mockReturnValue(loaded({}))
})

describe("EventPane", () => {
	it("shows the neutral placeholder when nothing is selected", () => {
		render(<EventPane />)
		expect(screen.getByText("No event selected")).toBeInTheDocument()
	})

	it("create: shows the create form, and a finished create opens the new event (replacing history)", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "create" }, go })
		render(<EventPane />)
		expect(screen.getByText("form:create")).toBeInTheDocument()
		fireEvent.click(screen.getByText("finish"))
		expect(go).toHaveBeenCalledWith({ mode: "view", eventId: "new-id" }, { replace: true })
		fireEvent.click(screen.getByText("cancel"))
		expect(go).toHaveBeenLastCalledWith({ mode: "none" }, { replace: true })
	})

	it("view: loading, then details; the id is passed through to the details hook", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID }, go })
		useEventDetails.mockReturnValue(loaded({ status: "loading", details: null }))
		const { rerender } = render(<EventPane />)
		expect(screen.getByRole("status")).toHaveTextContent("Loading event")
		expect(useEventDetails).toHaveBeenCalledWith(ID)

		useEventDetails.mockReturnValue(loaded({ isHost: true }))
		rerender(<EventPane />)
		expect(screen.getByText("details:Jazz night")).toBeInTheDocument()
		fireEvent.click(screen.getByText("edit"))
		expect(go).toHaveBeenCalledWith({ mode: "edit", eventId: ID })
	})

	it.each([
		["invalid", "This event link isn't valid"],
		["unavailable", "This event isn't available"],
		["error", "We couldn't load this event"],
	])("view: %s selection shows a recoverable state, never details", (status, title) => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: "nope" }, go })
		useEventDetails.mockReturnValue(loaded({ status, details: null }))
		render(<EventPane />)
		expect(screen.getByRole("heading", { name: title })).toBeInTheDocument()
		expect(screen.queryByText(/details:/)).not.toBeInTheDocument()
	})

	it("view: retry refetches after a failure", () => {
		const refetch = vi.fn()
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID }, go })
		useEventDetails.mockReturnValue(loaded({ status: "error", details: null, refetch }))
		render(<EventPane />)
		fireEvent.click(screen.getByRole("button", { name: /try again/i }))
		expect(refetch).toHaveBeenCalled()
	})

	it("close returns to nothing selected without adding a history entry", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID }, go })
		render(<EventPane />)
		fireEvent.click(screen.getByRole("button", { name: "Close event" }))
		expect(go).toHaveBeenCalledWith({ mode: "none" }, { replace: true })
	})

	it("edit: a host gets the edit form", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "edit", eventId: ID }, go })
		useEventDetails.mockReturnValue(loaded({ isHost: true }))
		render(<EventPane />)
		expect(screen.getByText("form:edit")).toBeInTheDocument()
		fireEvent.click(screen.getByText("finish"))
		expect(go).toHaveBeenCalledWith({ mode: "view", eventId: ID }, { replace: true })
	})

	it.each([
		["a non-host", { details: full, isHost: false }],
		["a restricted preview", { details: preview, isHost: false }],
	])("edit: %s never gets the form (the server stays authoritative, this is only the UI)", (_n, over) => {
		useEventSelection.mockReturnValue({ selection: { mode: "edit", eventId: ID }, go })
		useEventDetails.mockReturnValue(loaded(over))
		render(<EventPane />)
		expect(screen.queryByText("form:edit")).not.toBeInTheDocument()
		expect(screen.getByRole("heading", { name: "Only hosts can edit this event" })).toBeInTheDocument()
	})

	it("view: passes the selected section to the details view (none = Details)", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID }, go })
		const { rerender } = render(<EventPane />)
		expect(screen.getByText("tab:undefined")).toBeInTheDocument()
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID, tab: "comments" }, go })
		rerender(<EventPane />)
		expect(screen.getByText("tab:comments")).toBeInTheDocument()
	})

	it("view: choosing a section keeps the event, replaces history (Back still closes the event)", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID, tab: "comments" }, go })
		render(<EventPane />)
		fireEvent.click(screen.getByText("pick guests"))
		expect(go).toHaveBeenCalledWith({ mode: "view", eventId: ID, tab: "guests" }, { replace: true })
	})

	it("view: a section chosen for one event does not follow the user to another", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID, tab: "guests" }, go })
		const { rerender } = render(<EventPane />)
		expect(screen.getByText("tab:guests")).toBeInTheDocument()
		// the new selection comes from a link built without a tab, so the pane starts on Details
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: "other-id" }, go })
		rerender(<EventPane />)
		expect(screen.getByText("tab:undefined")).toBeInTheDocument()
	})

	it("view: a restricted preview is still passed through; the details view ignores the section", () => {
		useEventSelection.mockReturnValue({ selection: { mode: "view", eventId: ID, tab: "guests" }, go })
		useEventDetails.mockReturnValue(loaded({ details: preview }))
		render(<EventPane />)
		expect(screen.getByText("details:Jazz night")).toBeInTheDocument()
	})
})
