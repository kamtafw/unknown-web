import type { EventCard } from "@/types/events/api"
import { fireEvent, render, screen } from "@testing-library/react"
import { useAuthStore } from "@/stores/auth-store"
import { useEventsLocationStore } from "@/stores/events-location-store"
import type { FullUser } from "@/types/api"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { NearbyDiscovery } from "./nearby-discovery"

vi.mock("react-intersection-observer", () => ({
	useInView: () => ({ ref: vi.fn(), inView: false }),
}))

const useGeolocation = vi.fn()
const useNearbyEvents = vi.fn()
const useEventAddress = vi.fn()
vi.mock("@/hooks/events/use-geolocation", () => ({ useGeolocation: () => useGeolocation() }))
vi.mock("@/hooks/events/use-nearby-events", () => ({
	useNearbyEvents: (...a: unknown[]) => useNearbyEvents(...a),
}))
vi.mock("@/hooks/events/use-event-address", () => ({
	useEventAddress: (...a: unknown[]) => useEventAddress(...a),
}))
vi.mock("@/hooks/use-debounced-value", () => ({ useDebouncedValue: (v: unknown) => v }))

const card = (id: string, name: string): EventCard => ({
	id,
	name,
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "10:00",
	endTime: "12:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	hashtags: ["music"],
	address: "Jos, Plateau",
	coordinates: null,
	hosts: [{ id: "h1", name: "Ada Obi", username: "ada", photo: null }],
	viewerRsvp: null,
	distanceKm: 2.5,
})

const refresh = vi.fn()
const refetch = vi.fn()
const fetchNextPage = vi.fn()

const ready = { status: "ready", coordinates: { latitude: 9.9, longitude: 8.9 }, permission: "granted", refresh }
const failed = (status: string, permission = "prompt") => ({
	status,
	coordinates: null,
	permission,
	refresh,
})
const nearby = (over: Record<string, unknown> = {}) => ({
	events: [],
	totalLoaded: 0,
	coverage: "inactive",
	isScanning: false,
	isInitialLoading: false,
	isError: false,
	isFetchingNextPage: false,
	hasNextPage: false,
	fetchNextPage,
	refetch,
	...over,
})

beforeEach(() => {
	vi.clearAllMocks()
	useEventsLocationStore.setState({ last: null })
	useAuthStore.setState({ user: { pkid: 1 } as FullUser, sessionGeneration: 0 })
	useGeolocation.mockReturnValue(ready)
	useNearbyEvents.mockReturnValue(nearby())
	useEventAddress.mockReturnValue(null)
})

describe("NearbyDiscovery location states", () => {
	it("shows a finding-location state while locating and requests nothing", () => {
		useGeolocation.mockReturnValue({ ...failed("locating"), status: "locating" })
		render(<NearbyDiscovery />)
		expect(screen.getByText("Finding your location…")).toBeInTheDocument()
		expect(useNearbyEvents).toHaveBeenCalledWith(null, "")
		expect(screen.queryByRole("article")).not.toBeInTheDocument()
	})

	it("explains a blocked permission and offers retry and My events, with no events", () => {
		useGeolocation.mockReturnValue(failed("denied", "denied"))
		render(<NearbyDiscovery />)
		expect(screen.getByText("Location access is blocked")).toBeInTheDocument()
		expect(screen.getByText(/site settings/i)).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Go to My events" })).toHaveAttribute(
			"href",
			"/events/my-events",
		)
		expect(screen.queryByRole("article")).not.toBeInTheDocument()
		// discovery was handed no coordinates, so nothing can be fetched
		expect(useNearbyEvents).toHaveBeenCalledWith(null, "")
	})

	it("asks to allow location when the prompt was dismissed", () => {
		useGeolocation.mockReturnValue(failed("denied", "prompt"))
		render(<NearbyDiscovery />)
		expect(screen.getByText("Location access is needed")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Allow location" }))
		expect(refresh).toHaveBeenCalledTimes(1)
	})

	it.each([
		["unavailable", "We couldn't find your location"],
		["timeout", "Finding your location took too long"],
		["unsupported", "Location isn't available here"],
	])("shows a recovery state for %s and never any events", (status, title) => {
		useGeolocation.mockReturnValue(failed(status))
		render(<NearbyDiscovery />)
		expect(screen.getByRole("alert")).toHaveTextContent(title)
		expect(screen.queryByRole("article")).not.toBeInTheDocument()
		expect(useNearbyEvents).toHaveBeenCalledWith(null, "")
	})

	it("offers no all-locations or clear-filter option anywhere", () => {
		useGeolocation.mockReturnValue(failed("denied", "denied"))
		render(<NearbyDiscovery />)
		expect(screen.queryByText(/all locations/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/clear (location )?filter/i)).not.toBeInTheDocument()
	})
})

describe("NearbyDiscovery results", () => {
	it("shows the location row, cards and the address when known; the 25 km scope is not visible text", () => {
		useEventAddress.mockReturnValue("Jos North, Plateau")
		useNearbyEvents.mockReturnValue(
			nearby({ events: [card("a", "Jazz night"), card("b", "Tech meetup")], totalLoaded: 2 }),
		)
		render(<NearbyDiscovery />)
		expect(screen.getByText("Location")).toBeInTheDocument()
		expect(screen.getByText("Jos North, Plateau")).toBeInTheDocument()
		// scope is available to assistive tech and as a tooltip, not as prominent text
		expect(screen.getByText("Within 25 km of")).toHaveClass("sr-only")
		expect(screen.getByTitle("Showing events within 25 km")).toBeInTheDocument()
		expect(screen.getAllByRole("article")).toHaveLength(2)
		expect(screen.getByText("Jazz night")).toBeInTheDocument()
	})

	it("falls back to a generic label when the address lookup gave nothing", () => {
		useNearbyEvents.mockReturnValue(nearby({ events: [card("a", "Jazz night")] }))
		render(<NearbyDiscovery />)
		expect(screen.getByText("Current location")).toBeInTheDocument()
		expect(screen.getAllByRole("article")).toHaveLength(1)
	})

	it("refreshes the location from the scope label", () => {
		useNearbyEvents.mockReturnValue(nearby({ events: [card("a", "Jazz night")] }))
		render(<NearbyDiscovery />)
		fireEvent.click(screen.getByRole("button", { name: "Refresh my location" }))
		expect(refresh).toHaveBeenCalledTimes(1)
	})

	it("shows a loading state, not an empty one, while the first page loads", () => {
		useNearbyEvents.mockReturnValue(nearby({ isInitialLoading: true }))
		render(<NearbyDiscovery />)
		expect(screen.getByText("Loading nearby events…")).toBeInTheDocument()
		expect(screen.queryByText(/No events within/)).not.toBeInTheDocument()
	})

	it("keeps loading, not empty, while scanning past empty pages", () => {
		useNearbyEvents.mockReturnValue(nearby({ isScanning: true, hasNextPage: true }))
		render(<NearbyDiscovery />)
		expect(screen.getByText("Loading nearby events…")).toBeInTheDocument()
		expect(screen.queryByText(/No events within/)).not.toBeInTheDocument()
	})

	it("shows a failure with retry and no fallback list", () => {
		useNearbyEvents.mockReturnValue(nearby({ isError: true }))
		render(<NearbyDiscovery />)
		expect(screen.getByRole("alert")).toHaveTextContent("We couldn't load nearby events")
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(refetch).toHaveBeenCalledTimes(1)
		expect(screen.queryByRole("article")).not.toBeInTheDocument()
	})

	it("shows the empty state with a way to My events", () => {
		render(<NearbyDiscovery />)
		expect(screen.getByText("No events within 25 km right now")).toBeInTheDocument()
		expect(screen.getByRole("link", { name: "Go to My events" })).toBeInTheDocument()
	})
})

describe("NearbyDiscovery shell", () => {
	it("renders the shared pane: search with the design placeholder and both Events tabs", () => {
		render(<NearbyDiscovery />)
		expect(screen.getByRole("searchbox", { name: "Search nearby events" })).toHaveAttribute(
			"placeholder",
			"Search…",
		)
		expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events")
		expect(screen.getByRole("link", { name: "My events" })).toHaveAttribute(
			"href",
			"/events/my-events",
		)
	})

	it("keeps the pane (tabs, row) but disables search while location is not ready", () => {
		useGeolocation.mockReturnValue(failed("denied", "denied"))
		render(<NearbyDiscovery />)
		expect(screen.getByRole("searchbox", { name: "Search nearby events" })).toBeDisabled()
		expect(screen.getByRole("link", { name: "My events" })).toBeInTheDocument()
		expect(screen.getByText("Not available")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Refresh my location" })).not.toBeInTheDocument()
	})

	it("shows a subtle finding-location value in the row while locating", () => {
		useGeolocation.mockReturnValue({ ...failed("locating"), status: "locating" })
		render(<NearbyDiscovery />)
		expect(screen.getByText("Finding location…")).toBeInTheDocument()
	})

	it("renders events as a plain list with no card grid", () => {
		useNearbyEvents.mockReturnValue(
			nearby({ events: [card("a", "Jazz night"), card("b", "Tech meetup")] }),
		)
		render(<NearbyDiscovery />)
		expect(screen.getAllByRole("listitem")).toHaveLength(2)
	})
})

describe("NearbyDiscovery search", () => {
	it("passes the typed term to the nearby hook (local filtering, no global search)", () => {
		render(<NearbyDiscovery />)
		fireEvent.change(screen.getByRole("searchbox", { name: "Search nearby events" }), {
			target: { value: "jazz" },
		})
		expect(useNearbyEvents).toHaveBeenLastCalledWith(
			{ latitude: 9.9, longitude: 8.9 },
			"jazz",
		)
	})

	it("declares no matches only when the whole nearby set was searched", () => {
		useNearbyEvents.mockReturnValue(nearby({ coverage: "complete" }))
		render(<NearbyDiscovery />)
		fireEvent.change(screen.getByRole("searchbox", { name: "Search nearby events" }), {
			target: { value: "zzz" },
		})
		expect(screen.getByText("No nearby events match “zzz”")).toBeInTheDocument()
	})

	it("says only loaded events were searched when the scan stopped early", () => {
		useNearbyEvents.mockReturnValue(nearby({ coverage: "partial", hasNextPage: true }))
		render(<NearbyDiscovery />)
		fireEvent.change(screen.getByRole("searchbox", { name: "Search nearby events" }), {
			target: { value: "zzz" },
		})
		expect(screen.getByText("No matches in the events loaded so far")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Load more events" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	describe("remembered location for My events", () => {
		it("remembers the resolved place when location is ready", () => {
			useEventAddress.mockReturnValue("Amuwo, Lagos")
			render(<NearbyDiscovery />)
			expect(useEventsLocationStore.getState().last).toEqual({
				accountId: 1,
				sessionGeneration: 0,
				address: "Amuwo, Lagos",
			})
		})

		it("clears it when location is blocked, so My events never shows a revoked place", () => {
			useEventsLocationStore.setState({
				last: { accountId: 1, sessionGeneration: 0, address: "Old" },
			})
			useGeolocation.mockReturnValue(failed("denied", "denied"))
			render(<NearbyDiscovery />)
			expect(useEventsLocationStore.getState().last).toBeNull()
		})
	})
})
