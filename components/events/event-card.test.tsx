import type { EventCard as EventCardData } from "@/types/events/api"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EventCard } from "./event-card"

const base: EventCardData = {
	id: "e1",
	name: "Jazz night",
	startDate: "2026-05-19",
	endDate: "2026-05-19",
	startTime: "10:00",
	endTime: "20:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: ["music", "live"],
	address: "Amuwo, Lagos, Nigeria",
	coordinates: null,
	hosts: [{ id: "h", name: "Ada Obi", username: "ada", photo: null }],
	viewerRsvp: "going",
	distanceKm: 0.4,
}

describe("EventCard", () => {
	it("shows the title, address and the date/time exactly as stored", () => {
		render(<EventCard event={base} />)
		expect(screen.getByRole("heading", { name: "Jazz night" })).toBeInTheDocument()
		expect(screen.getByText("Amuwo, Lagos, Nigeria")).toBeInTheDocument()
		expect(screen.getByText("May 19")).toBeInTheDocument()
		expect(screen.getByText(/10:00 - 20:00/)).toBeInTheDocument()
	})

	it("replaces the date with LIVE NOW! for a live event", () => {
		render(<EventCard event={{ ...base, isLive: true }} />)
		expect(screen.getByText("Live now!")).toBeInTheDocument()
		expect(screen.queryByText("May 19")).not.toBeInTheDocument()
	})

	it("marks passcode events with an accessible lock and omits it otherwise", () => {
		const { rerender } = render(<EventCard event={{ ...base, isLocked: true }} />)
		expect(screen.getByRole("img", { name: "Passcode required" })).toBeInTheDocument()
		// the old text pill is gone
		expect(screen.queryByText("Passcode")).not.toBeInTheDocument()

		rerender(<EventCard event={base} />)
		expect(screen.queryByRole("img", { name: "Passcode required" })).not.toBeInTheDocument()
	})

	it("shows nothing the design omits: no distance, tags, host, privacy or RSVP", () => {
		render(<EventCard event={{ ...base, privacy: "private", isLocked: true }} />)
		expect(screen.queryByText(/away/)).not.toBeInTheDocument()
		expect(screen.queryByText(/#music/)).not.toBeInTheDocument()
		expect(screen.queryByText(/Hosted by|Ada Obi/)).not.toBeInTheDocument()
		expect(screen.queryByText("private")).not.toBeInTheDocument()
		expect(screen.queryByText("Going")).not.toBeInTheDocument()
	})

	it("renders no attendee avatar stack or count (guest data is not used)", () => {
		render(<EventCard event={base} />)
		expect(screen.queryByText(/\d+\+/)).not.toBeInTheDocument()
		expect(screen.queryAllByRole("img", { name: /.+/ })).toHaveLength(0)
	})

	it("omits optional parts rather than rendering empty ones", () => {
		render(<EventCard event={{ ...base, address: null, startTime: "", endTime: "" }} />)
		expect(screen.getByText("May 19")).toBeInTheDocument()
		expect(screen.queryByText(/\d\d:\d\d/)).not.toBeInTheDocument()
		expect(screen.queryByText("Amuwo, Lagos, Nigeria")).not.toBeInTheDocument()
	})

	it("renders no date for an unparseable one", () => {
		render(<EventCard event={{ ...base, startDate: "" }} />)
		expect(screen.queryByText("May 19")).not.toBeInTheDocument()
	})

	it("is not a link yet (event details arrive in Pass 2)", () => {
		render(<EventCard event={base} />)
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
	})
})
