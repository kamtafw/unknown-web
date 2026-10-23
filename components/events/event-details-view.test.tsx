import type { EventFullDetails, EventPreviewDetails } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
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
