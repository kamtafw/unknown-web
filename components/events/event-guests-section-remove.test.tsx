import type { EventGuest } from "@/types/events/api"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventGuestsSection } from "./event-guests-section"

const useEventGuests = vi.fn()
vi.mock("@/hooks/events/use-event-guests", () => ({
	useEventGuests: (...a: unknown[]) => useEventGuests(...a),
}))
const remove = vi.fn()
vi.mock("@/hooks/events/use-remove-event-guest", () => ({
	useRemoveEventGuest: () => ({ remove, clearError: vi.fn(), isPending: false, error: null }),
}))
vi.mock("@/lib/toast", () => ({ toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

const g = (userId: number, name: string, role: "host" | "guest" = "guest"): EventGuest => ({
	userId,
	name,
	username: name.toLowerCase().replace(/\s/g, ""),
	photo: null,
	role,
})
const state = (over = {}) => ({
	guests: [g(1, "Ada Obi", "host"), g(2, "Bola Ade"), g(3, "Chidi Eze")],
	hasLoaded: true,
	isInitialLoading: false,
	error: null,
	phase: null,
	hasNextPage: false,
	isFetchingNextPage: false,
	fetchNextPage: vi.fn(),
	refetch: vi.fn(),
	...over,
})

beforeEach(() => {
	vi.clearAllMocks()
	useEventGuests.mockReturnValue(state())
})

describe("EventGuestsSection host Remove action (P3-08A)", () => {
	it("shows Remove on every row for a host, and keeps the Host badge", () => {
		render(<EventGuestsSection eventId="e1" isHost />)
		expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(3)
		expect(screen.getByText("Host")).toBeInTheDocument()
	})

	it("shows no Remove action without isHost", () => {
		render(<EventGuestsSection eventId="e1" />)
		expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull()
		render(<EventGuestsSection eventId="e1" isHost={false} />)
		expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull()
	})

	it("removes the chosen guest after confirmation", () => {
		remove.mockResolvedValue("removed")
		render(<EventGuestsSection eventId="e1" isHost />)
		fireEvent.click(screen.getByRole("button", { name: "Remove Bola Ade" }))
		const dialog = screen.getByRole("alertdialog")
		expect(within(dialog).getByText("Remove Bola Ade?")).toBeInTheDocument()
		fireEvent.click(within(dialog).getByRole("button", { name: "Remove guest" }))
		expect(remove).toHaveBeenCalledWith(2)
	})

	it("search keeps working and Remove targets the filtered row", () => {
		render(<EventGuestsSection eventId="e1" isHost />)
		fireEvent.change(screen.getByRole("searchbox", { name: "Search guest" }), {
			target: { value: "chidi" },
		})
		expect(screen.getAllByRole("button", { name: /^Remove / })).toHaveLength(1)
		expect(screen.getByRole("button", { name: "Remove Chidi Eze" })).toBeInTheDocument()
	})

	it("keeps Load more and the empty state for a host", () => {
		useEventGuests.mockReturnValue(state({ hasNextPage: true }))
		const { unmount } = render(<EventGuestsSection eventId="e1" isHost />)
		expect(screen.getByRole("button", { name: "Load more" })).toBeInTheDocument()
		unmount()
		useEventGuests.mockReturnValue(state({ guests: [] }))
		render(<EventGuestsSection eventId="e1" isHost />)
		expect(screen.getByText("No guests yet")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull()
	})

	it("a 403 on the list shows the access message and no host actions", () => {
		useEventGuests.mockReturnValue(state({ guests: [], hasLoaded: false, error: "forbidden" }))
		render(<EventGuestsSection eventId="e1" isHost />)
		expect(screen.queryByRole("button", { name: /^Remove / })).toBeNull()
	})
})
