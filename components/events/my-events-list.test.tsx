import type { EventCard } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MyEventsList } from "./my-events-list"

vi.mock("react-intersection-observer", () => ({
	useInView: () => ({ ref: vi.fn(), inView: false }),
}))

const useMyEvents = vi.fn()
vi.mock("@/hooks/events/use-my-events", () => ({
	useMyEvents: (...a: unknown[]) => useMyEvents(...a),
}))
vi.mock("@/hooks/use-debounced-value", () => ({ useDebouncedValue: (v: unknown) => v }))

const card = (id: string, name: string): EventCard => ({
	id,
	name,
	startDate: "2025-01-10",
	endDate: "2025-01-10",
	startTime: "",
	endTime: "",
	isLive: false,
	isLocked: false,
	privacy: "private",
	coverImage: null,
	hashtags: [],
	address: null,
	coordinates: null,
	hosts: [],
	viewerRsvp: "going",
	distanceKm: null,
})

const refetch = vi.fn()
const state = (over: Record<string, unknown> = {}) => ({
	events: [],
	isInitialLoading: false,
	isError: false,
	isFetchingNextPage: false,
	hasNextPage: false,
	fetchNextPage: vi.fn(),
	refetch,
	...over,
})

beforeEach(() => {
	vi.clearAllMocks()
	useMyEvents.mockReturnValue(state())
})

describe("MyEventsList", () => {
	it("needs no location: it renders without any geolocation", () => {
		useMyEvents.mockReturnValue(state({ events: [card("a", "Old gig")] }))
		render(<MyEventsList />)
		expect(screen.getByText("Old gig")).toBeInTheDocument()
		// RSVP / privacy chips are not in the design
		expect(screen.queryByText("Going")).not.toBeInTheDocument()
		expect(screen.queryByText("private")).not.toBeInTheDocument()
	})

	it("uses the same pane as Events: search, both tabs, and no location row", () => {
		render(<MyEventsList />)
		expect(screen.getByRole("searchbox", { name: "Search my events" })).toHaveAttribute(
			"placeholder",
			"Search…",
		)
		expect(screen.getByRole("link", { name: "My events" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument()
		expect(screen.queryByText("Location")).not.toBeInTheDocument()
	})

	it("shows loading, then the empty state", () => {
		useMyEvents.mockReturnValue(state({ isInitialLoading: true }))
		const { rerender } = render(<MyEventsList />)
		expect(screen.getByText("Loading your events…")).toBeInTheDocument()

		useMyEvents.mockReturnValue(state())
		rerender(<MyEventsList />)
		expect(screen.getByText("No events yet")).toBeInTheDocument()
	})

	it("shows a failure with retry", () => {
		useMyEvents.mockReturnValue(state({ isError: true }))
		render(<MyEventsList />)
		expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load your events")
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})

	it("passes the search term to the hook and shows a no-match state", () => {
		render(<MyEventsList />)
		fireEvent.change(screen.getByRole("searchbox", { name: "Search my events" }), {
			target: { value: "gig" },
		})
		expect(useMyEvents).toHaveBeenLastCalledWith("gig")
		expect(screen.getByText("No events match “gig”")).toBeInTheDocument()
	})
})
