import type { EventFullDetails, EventPreviewDetails } from "@/types/events/api"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EventDetailsView } from "./event-details-view"

vi.mock("./rsvp-control", () => ({ RsvpControl: () => <section aria-label="rsvp-stub" /> }))
vi.mock("./delete-event-dialog", () => ({
	DeleteEventDialog: ({ liveBlocked }: { liveBlocked: boolean }) => <div data-testid="delete" data-live-blocked={String(liveBlocked)} />,
}))

const full: EventFullDetails = {
	kind: "full",
	id: "e1",
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: true,
	privacy: "private",
	coverImage: null,
	liveSessionId: null,
	address: "Amuwo, Lagos",
	hashtags: ["music"],
	coordinates: null,
	hosts: [{ id: "h1", name: "Ada Obi", username: "ada", photo: null }],
	liveSessionStatus: null,
	links: [{ name: "Secret agenda", url: "https://example.com/agenda" }],
	documents: [{ name: "Secret.pdf", url: "https://x/y.pdf" }],
	rsvp: { state: "none" },
}
const preview: EventPreviewDetails = {
	kind: "preview",
	id: "e1",
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: true,
	privacy: "private",
	coverImage: null,
	liveSessionId: null,
	address: "Amuwo, Lagos",
	hashtags: ["music"],
}
const noop = () => {}

describe("EventDetailsView", () => {
	it("full: shows schedule, address, tags, hosts and indicators, but not links or documents (Pass 3)", () => {
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(screen.getByRole("heading", { name: "Jazz night" })).toBeInTheDocument()
		expect(screen.getByText("Amuwo, Lagos")).toBeInTheDocument()
		expect(screen.getByText("#music")).toBeInTheDocument()
		expect(screen.getByText("Ada Obi")).toBeInTheDocument()
		expect(screen.getByText("Passcode")).toBeInTheDocument()
		expect(screen.queryByText("Secret agenda")).not.toBeInTheDocument()
		expect(screen.queryByText("Secret.pdf")).not.toBeInTheDocument()
	})

	it("preview: says details are hidden and shows no hosts, no resources, no host controls", () => {
		render(<EventDetailsView details={preview} isHost onEdit={noop} onDeleted={noop} />)
		expect(screen.getByRole("note")).toHaveTextContent(/details are hidden/i)
		expect(screen.queryByText("Hosted by")).not.toBeInTheDocument()
		// even if a caller wrongly passed isHost, a preview never offers edit or delete
		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument()
		expect(screen.queryByTestId("delete")).not.toBeInTheDocument()
	})

	it("both shapes offer RSVP", () => {
		const { rerender } = render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(screen.getByLabelText("rsvp-stub")).toBeInTheDocument()
		rerender(<EventDetailsView details={preview} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(screen.getByLabelText("rsvp-stub")).toBeInTheDocument()
	})

	it("host controls only for a host of a full event", () => {
		const { rerender } = render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument()
		const onEdit = vi.fn()
		rerender(<EventDetailsView details={full} isHost onEdit={onEdit} onDeleted={noop} />)
		fireEvent.click(screen.getByRole("button", { name: "Edit" }))
		expect(onEdit).toHaveBeenCalled()
		expect(screen.getByTestId("delete")).toHaveAttribute("data-live-blocked", "false")
	})

	it.each([
		["the event is live", { isLive: true }],
		["its session is live", { liveSessionStatus: "live" as const }],
	])("blocks delete when %s, and offers no join control", (_n, over) => {
		render(<EventDetailsView details={{ ...full, ...over }} isHost onEdit={noop} onDeleted={noop} />)
		expect(screen.getByTestId("delete")).toHaveAttribute("data-live-blocked", "true")
		expect(screen.queryByRole("button", { name: /join/i })).not.toBeInTheDocument()
	})
})

describe("EventDetailsView sections (P3-03)", () => {
	const names = ["Details", "Comments", "Links and docs", "Guests"]
	const panelFor = (tab: HTMLElement) => document.getElementById(tab.getAttribute("aria-controls") ?? "")

	it("a full event has an accessible tab list with the four sections, on Details by default", () => {
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(screen.getByRole("tablist", { name: "Event sections" })).toBeInTheDocument()
		const tabs = screen.getAllByRole("tab")
		expect(tabs.map((t) => t.textContent)).toEqual(names)
		expect(screen.getByRole("tab", { name: "Details" })).toHaveAttribute("aria-selected", "true")
		for (const name of names.slice(1)) {
			expect(screen.getByRole("tab", { name })).toHaveAttribute("aria-selected", "false")
		}
	})

	it("every tab controls a real panel, labelled by that tab; only the active one is shown", () => {
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} tab="guests" />)
		for (const tab of screen.getAllByRole("tab")) {
			const panel = panelFor(tab)
			expect(panel).not.toBeNull()
			expect(panel).toHaveAttribute("role", "tabpanel")
			expect(panel).toHaveAttribute("aria-labelledby", tab.id)
			expect(panel?.hasAttribute("hidden")).toBe(tab.getAttribute("aria-selected") !== "true")
		}
	})

	it("the active section shows a placeholder and the others show nothing", () => {
		const { rerender } = render(
			<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} tab="comments" />,
		)
		expect(screen.getAllByText(/isn.t available yet/i)).toHaveLength(1)
		expect(panelFor(screen.getByRole("tab", { name: "Comments" }))).toHaveTextContent("Comments")
		rerender(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} tab="guests" />)
		expect(screen.getAllByText(/isn.t available yet/i)).toHaveLength(1)
		expect(panelFor(screen.getByRole("tab", { name: "Guests" }))).toHaveTextContent("Guests")
		expect(panelFor(screen.getByRole("tab", { name: "Comments" }))).toBeEmptyDOMElement()
	})

	it("section placeholders show no resources, guests or comments, even for a host", () => {
		render(<EventDetailsView details={full} isHost onEdit={noop} onDeleted={noop} tab="resources" />)
		expect(screen.queryByText("Secret agenda")).not.toBeInTheDocument()
		expect(screen.queryByText("Secret.pdf")).not.toBeInTheDocument()
		expect(screen.queryByText("https://example.com/agenda")).not.toBeInTheDocument()
	})

	it("choosing a tab reports it; choosing the current tab does not re-report", () => {
		const onTabChange = vi.fn()
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} onTabChange={onTabChange} />)
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Links and docs" }), { button: 0 })
		expect(onTabChange).toHaveBeenCalledWith("resources")
		onTabChange.mockClear()
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Details" }), { button: 0 })
		expect(onTabChange).not.toHaveBeenCalled()
	})

	it("arrow keys move between tabs (keyboard operable)", async () => {
		const onTabChange = vi.fn()
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} onTabChange={onTabChange} />)
		const details = screen.getByRole("tab", { name: "Details" })
		details.focus()
		fireEvent.keyDown(details, { key: "ArrowRight" })
		await waitFor(() => expect(screen.getByRole("tab", { name: "Comments" })).toHaveFocus())
		expect(onTabChange).toHaveBeenCalledWith("comments")
	})

	it("roving focus: once a tab is focused, only it is in the tab order", async () => {
		render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} tab="comments" />)
		const comments = screen.getByRole("tab", { name: "Comments" })
		act(() => comments.focus())
		await waitFor(() => expect(comments).toHaveAttribute("tabindex", "0"))
		for (const name of ["Details", "Links and docs", "Guests"]) {
			expect(screen.getByRole("tab", { name })).toHaveAttribute("tabindex", "-1")
		}
	})

	it("switching sections keeps the Details content mounted (RSVP state survives)", () => {
		const { rerender } = render(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		const rsvp = screen.getByLabelText("rsvp-stub")
		rerender(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} tab="comments" />)
		expect(screen.getByLabelText("rsvp-stub", { selector: "section" })).toBe(rsvp)
		expect(rsvp.closest("[role=tabpanel]")).toHaveAttribute("hidden")
		rerender(<EventDetailsView details={full} isHost={false} onEdit={noop} onDeleted={noop} />)
		expect(rsvp.closest("[role=tabpanel]")).not.toHaveAttribute("hidden")
	})

	it("host controls stay above the sections and appear on every section", () => {
		render(<EventDetailsView details={full} isHost onEdit={noop} onDeleted={noop} tab="guests" />)
		expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument()
		expect(screen.getByTestId("delete")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Edit" }).closest("[role=tabpanel]")).toBeNull()
	})

	it.each(["comments", "resources", "guests"] as const)(
		"a restricted preview has no sections and cannot reach %s by tab",
		(tab) => {
			render(<EventDetailsView details={preview} isHost={false} onEdit={noop} onDeleted={noop} tab={tab} />)
			expect(screen.queryByRole("tablist")).not.toBeInTheDocument()
			expect(screen.queryByRole("tab")).not.toBeInTheDocument()
			expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument()
			expect(screen.queryByText(/isn.t available yet/i)).not.toBeInTheDocument()
			expect(screen.getByRole("note")).toHaveTextContent(/details are hidden/i)
			expect(screen.getByLabelText("rsvp-stub")).toBeInTheDocument()
		},
	)
})
