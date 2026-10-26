import type { EventGuest } from "@/types/events/api"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventGuestsSection } from "./event-guests-section"

const useEventGuests = vi.fn()
vi.mock("@/hooks/events/use-event-guests", () => ({
	useEventGuests: (...a: unknown[]) => useEventGuests(...a),
}))

const refetch = vi.fn()
const fetchNextPage = vi.fn()
const base = () => ({
	guests: [] as EventGuest[],
	hasLoaded: true,
	isInitialLoading: false,
	error: null as string | null,
	phase: null as string | null,
	hasNextPage: false,
	isFetchingNextPage: false,
	fetchNextPage,
	refetch,
})
const state = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over })
const g = (userId: number, over: Partial<EventGuest> = {}): EventGuest => ({
	userId,
	name: `Guest ${userId}`,
	username: `user${userId}`,
	photo: null,
	role: "guest",
	...over,
})
const roster = () => [
	g(1, { name: "Ada Obi", username: "ada", role: "host" }),
	g(2, { name: "Bola Ade", username: "bolaa" }),
	g(3, { name: "Chidi Eze", username: "ceze" }),
]

const renderSection = () => render(<EventGuestsSection eventId="e1" />)
const search = () => screen.getByRole("searchbox", { name: "Search guest" }) as HTMLInputElement
const type = (value: string) => fireEvent.change(search(), { target: { value } })
const names = () => screen.queryAllByRole("listitem").map((li) => li.textContent ?? "")

beforeEach(() => {
	vi.clearAllMocks()
})

describe("EventGuestsSection", () => {
	it("asks for this event's guests", () => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, isInitialLoading: true }))
		renderSection()
		expect(useEventGuests).toHaveBeenCalledWith("e1")
	})

	it("shows a loading skeleton", () => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, isInitialLoading: true }))
		renderSection()
		expect(screen.getByLabelText("Loading guests")).toHaveAttribute("aria-busy", "true")
	})

	it("empty and terminal: an empty state, no search box, no Load more", () => {
		useEventGuests.mockReturnValue(state())
		renderSection()
		expect(screen.getByText("No guests yet")).toBeInTheDocument()
		expect(screen.queryByRole("searchbox")).not.toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("an empty first page with a next link is not 'no guests': it offers Load more", () => {
		useEventGuests.mockReturnValue(state({ hasNextPage: true }))
		renderSection()
		expect(screen.queryByText("No guests yet")).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Load more" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it("renders name, @username and a Host badge for the host only, in the given order", () => {
		useEventGuests.mockReturnValue(state({ guests: roster() }))
		renderSection()
		const items = screen.getAllByRole("listitem")
		expect(items).toHaveLength(3)
		expect(items[0]).toHaveTextContent("Ada Obi")
		expect(items[0]).toHaveTextContent("@ada")
		expect(within(items[0]).getByText("Host")).toBeInTheDocument()
		expect(within(items[1]).queryByText("Host")).not.toBeInTheDocument()
		expect(screen.getAllByText("Host")).toHaveLength(1)
		expect(screen.queryByText(/co.?host/i)).not.toBeInTheDocument()
	})

	it("avatar falls back to the initial; a missing or repeated username shows no @", () => {
		useEventGuests.mockReturnValue(
			state({ guests: [g(1, { name: "ada obi", username: "" }), g(2, { name: "sam", username: "sam" })] }),
		)
		renderSection()
		const items = screen.getAllByRole("listitem")
		expect(items[0]).toHaveTextContent("A")
		expect(items[0]).not.toHaveTextContent("@")
		expect(items[1]).not.toHaveTextContent("@")
	})

	it("renders names as text, never as HTML", () => {
		useEventGuests.mockReturnValue(state({ guests: [g(1, { name: "<img src=x onerror=alert(1)>", username: "<b>x</b>" })] }))
		const { container } = renderSection()
		expect(container.querySelector("img")).toBeNull()
		expect(container.querySelector("b")).toBeNull()
		expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeInTheDocument()
	})

	it("search is case-insensitive over name and username", () => {
		useEventGuests.mockReturnValue(state({ guests: roster() }))
		renderSection()
		type("ADA")
		expect(names()).toHaveLength(1)
		expect(names()[0]).toMatch(/Ada Obi/)
		type("bOLA aDE")
		expect(names()).toHaveLength(1)
		expect(names()[0]).toMatch(/Bola Ade/)
		type("CEZE")
		expect(names()).toHaveLength(1)
		expect(names()[0]).toMatch(/Chidi Eze/)
		type("  bolaa  ")
		expect(names()).toHaveLength(1)
	})

	it("search with no matches says so (and is not the empty-list state)", () => {
		useEventGuests.mockReturnValue(state({ guests: roster() }))
		renderSection()
		type("zzz")
		expect(screen.getByText("No guests match your search.")).toBeInTheDocument()
		expect(screen.queryByText("No guests yet")).not.toBeInTheDocument()
		expect(screen.queryAllByRole("listitem")).toHaveLength(0)
	})

	it("while more pages exist, an active search says it covers loaded guests only and Load more stays available", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: true }))
		renderSection()
		expect(screen.queryByText(/searching loaded guests/i)).not.toBeInTheDocument()
		type("ada")
		expect(screen.getByRole("status")).toHaveTextContent(/searching loaded guests/i)
		type("zzz")
		expect(screen.getByText("No loaded guests match your search.")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Load more" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it("does not claim to search only loaded guests when nothing more can load", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: false }))
		renderSection()
		type("ada")
		expect(screen.queryByText(/searching loaded guests/i)).not.toBeInTheDocument()
	})

	it("rows loaded later take part in the active filter; clearing the search restores every loaded row", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: true }))
		const { rerender } = renderSection()
		type("ob")
		expect(names()).toHaveLength(1)
		useEventGuests.mockReturnValue(
			state({ guests: [...roster(), g(4, { name: "Obi Nze", username: "obin" })], hasNextPage: false }),
		)
		rerender(<EventGuestsSection eventId="e1" />)
		expect(names()).toHaveLength(2)
		expect(screen.queryByText(/searching loaded guests/i)).not.toBeInTheDocument()
		type("")
		expect(names()).toHaveLength(4)
	})

	it("searching makes no request and clearing it leaves pagination state alone", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: true }))
		renderSection()
		type("ada")
		type("")
		expect(fetchNextPage).not.toHaveBeenCalled()
		expect(refetch).not.toHaveBeenCalled()
		expect(screen.getByRole("button", { name: "Load more" })).toBeEnabled()
	})

	it("Load more shows a pending state and cannot be clicked twice", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: true, isFetchingNextPage: true }))
		renderSection()
		const pending = screen.getByRole("button", { name: "Loading…" })
		expect(pending).toBeDisabled()
		fireEvent.click(pending)
		expect(fetchNextPage).not.toHaveBeenCalled()
	})

	it("initial 403 shows the contextual message: not an error, no retry, no sign-in prompt, no raw text", () => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, error: "forbidden", phase: "initial" }))
		renderSection()
		expect(screen.getByText("Only the host and guests can see the guest list.")).toBeInTheDocument()
		expect(screen.queryByRole("alert")).not.toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.queryByText(/sign in|session has expired|live session/i)).not.toBeInTheDocument()
		expect(screen.queryByText("No guests yet")).not.toBeInTheDocument()
	})

	it("initial 404 is 'guest list isn't available', not an empty list and not a login prompt", () => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, error: "not_found", phase: "initial" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/guest list isn.t available/i)
		expect(screen.queryByText("No guests yet")).not.toBeInTheDocument()
	})

	it("initial 401 says the session expired", () => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, error: "unauthorized", phase: "initial" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/session has expired/i)
	})

	it.each(["server", "network", "unknown"])("an initial %s failure offers Retry and is never an empty list", (error) => {
		useEventGuests.mockReturnValue(state({ hasLoaded: false, error, phase: "initial" }))
		renderSection()
		expect(screen.queryByText("No guests yet")).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: /try again/i }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})

	it("a failed next page keeps the loaded guests, explains, and Load more becomes Try again", () => {
		useEventGuests.mockReturnValue(
			state({ guests: roster(), hasNextPage: true, error: "server", phase: "next-page" }),
		)
		renderSection()
		expect(names()).toHaveLength(3)
		expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t load more guests/i)
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it("a 403 on a later page keeps the guests and uses the same contextual wording", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), error: "forbidden", phase: "next-page" }))
		renderSection()
		expect(names()).toHaveLength(3)
		expect(screen.getByRole("alert")).toHaveTextContent("Only the host and guests can see the guest list.")
	})

	it("shows no RSVP, join date, contact or online status, even if the data carried such fields", () => {
		const leaky = { ...g(1), rsvp_status: "going", joined_at: "2026-10-30", email: "a@b.c", phone: "0800", is_online: true }
		useEventGuests.mockReturnValue(state({ guests: [leaky as EventGuest] }))
		const { container } = renderSection()
		expect(container.textContent).not.toMatch(/going|2026-10-30|a@b\.c|0800|online|rsvp/i)
	})

	it("has no add, remove or other host actions: only search and Load more", () => {
		useEventGuests.mockReturnValue(state({ guests: roster(), hasNextPage: true }))
		const { container } = renderSection()
		expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Load more"])
		expect(container.querySelectorAll("input")).toHaveLength(1)
		expect(screen.queryByText(/add guest|remove|invite|kick|block/i)).not.toBeInTheDocument()
	})
})

describe("EventGuestsSection remove action (P3-08A)", () => {
	it("shows no Remove action to a non-host", () => {
		useEventGuests.mockReturnValue(state({ guests: roster() }))
		renderSection()
		expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull()
	})
})
