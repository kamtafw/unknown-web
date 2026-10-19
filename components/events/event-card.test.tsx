import type { EventCard as EventCardData } from "@/types/events/api"
import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { EventCard } from "./event-card"

const base: EventCardData = {
	id: "e1",
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "19:00",
	endTime: "22:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: ["music", "live", "jos", "extra"],
	address: "Jos, Plateau",
	coordinates: null,
	hosts: [{ id: "h", name: "Ada Obi", username: "ada", photo: null }],
	viewerRsvp: null,
	distanceKm: 0.4,
}

describe("EventCard", () => {
	it("shows name, schedule exactly as stored, address, distance, host and at most 3 tags", () => {
		render(<EventCard event={base} />)
		expect(screen.getByRole("heading", { name: "Jazz night" })).toBeInTheDocument()
		expect(screen.getByText(/19:00 – 22:00/)).toBeInTheDocument()
		expect(screen.getByText("Jos, Plateau")).toBeInTheDocument()
		expect(screen.getByText("400 m away")).toBeInTheDocument()
		expect(screen.getByText("Ada Obi")).toBeInTheDocument()
		expect(screen.getByText("#music")).toBeInTheDocument()
		expect(screen.queryByText("#extra")).not.toBeInTheDocument()
	})

	it("flags live and passcode-protected events and non-public privacy", () => {
		render(<EventCard event={{ ...base, isLive: true, isLocked: true, privacy: "private" }} />)
		expect(screen.getByText("Live")).toBeInTheDocument()
		expect(screen.getByText("Passcode")).toBeInTheDocument()
		expect(screen.getByText("private")).toBeInTheDocument()
	})

	it("omits optional parts rather than rendering empty ones", () => {
		render(
			<EventCard
				event={{ ...base, address: null, distanceKm: null, hosts: [], hashtags: [], startTime: "" }}
			/>,
		)
		expect(screen.queryByText(/away/)).not.toBeInTheDocument()
		expect(screen.queryByText(/Hosted by/)).not.toBeInTheDocument()
		expect(screen.queryByLabelText("Tags")).not.toBeInTheDocument()
	})

	it("is not a link yet (event details arrive in Pass 2)", () => {
		render(<EventCard event={base} />)
		expect(screen.queryByRole("link")).not.toBeInTheDocument()
	})
})
