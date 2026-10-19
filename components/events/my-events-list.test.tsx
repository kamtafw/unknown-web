import { useAuthStore } from "@/stores/auth-store"
import { useEventsLocationStore } from "@/stores/events-location.store"
import type { FullUser } from "@/types/api"
import type { EventCard } from "@/types/events/api"
import { act, fireEvent, render, screen } from "@testing-library/react"
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
	useEventsLocationStore.setState({ last: null })
	useAuthStore.setState({ user: { pkid: 1 } as FullUser, sessionGeneration: 0 })
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

	it("uses the same pane as Events: search, both tabs, and a read-only location row", () => {
		render(<MyEventsList />)
		expect(screen.getByRole("searchbox", { name: "Search my events" })).toHaveAttribute(
			"placeholder",
			"Search…",
		)
		expect(screen.getByRole("link", { name: "My events" })).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Events" })).toBeInTheDocument()
		expect(screen.getByText("Location")).toBeInTheDocument()
	})

	it("shows a neutral placeholder when no location has been resolved, and loads normally", () => {
		useMyEvents.mockReturnValue(state({ events: [card("a", "Old gig")] }))
		render(<MyEventsList />)
		expect(screen.getByText("Not set")).toBeInTheDocument()
		expect(screen.getByText("Old gig")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument()
	})

	it("shows the place discovery already resolved, without a scope or refresh", () => {
		act(() => {
			useEventsLocationStore.setState({
				last: { accountId: 1, sessionGeneration: 0, address: "Amuwo, Lagos" },
			})
		})
		render(<MyEventsList />)
		expect(screen.getByText("Amuwo, Lagos")).toBeInTheDocument()
		expect(screen.queryByText(/km/)).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument()
	})

	it("ignores a place remembered for another account", () => {
		useEventsLocationStore.setState({
			last: { accountId: 2, sessionGeneration: 0, address: "Other person" },
		})
		render(<MyEventsList />)
		expect(screen.queryByText("Other person")).not.toBeInTheDocument()
		expect(screen.getByText("Not set")).toBeInTheDocument()
	})

	it("never asks the browser for location, and the hook is called without location input", () => {
		const getCurrentPosition = vi.fn()
		Object.defineProperty(navigator, "geolocation", {
			value: { getCurrentPosition, watchPosition: vi.fn() },
			configurable: true,
		})
		render(<MyEventsList />)
		expect(getCurrentPosition).not.toHaveBeenCalled()
		expect(useMyEvents).toHaveBeenCalledWith(
			expect.not.objectContaining({ coordinates: expect.anything() }),
		)
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
