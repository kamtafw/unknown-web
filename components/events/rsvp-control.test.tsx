import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RsvpControl } from "./rsvp-control"

const useEventRsvp = vi.fn()
vi.mock("@/hooks/events/use-event-rsvp", () => ({
	useEventRsvp: (...a: unknown[]) => useEventRsvp(...a),
}))

const setRsvp = vi.fn()
const clearError = vi.fn()
const state = (over: Record<string, unknown> = {}) => ({
	rsvp: { state: "none" },
	setRsvp,
	isPending: false,
	pendingStatus: null,
	error: null,
	clearError,
	...over,
})
const details = { kind: "preview", id: "e1" } as never

beforeEach(() => {
	vi.clearAllMocks()
	useEventRsvp.mockReturnValue(state())
})

describe("RsvpControl", () => {
	it("offers the three RSVP states as a radio group", () => {
		render(<RsvpControl eventId="e1" details={details} />)
		expect(screen.getAllByRole("radio").map((r) => r.textContent)).toEqual([
			"Going",
			"Interested",
			"Not going",
		])
	})

	it("known 'no response' says so; nothing is selected", () => {
		render(<RsvpControl eventId="e1" details={details} />)
		expect(screen.getByText("You haven't responded yet.")).toBeInTheDocument()
		expect(
			screen.getAllByRole("radio").every((r) => r.getAttribute("aria-checked") === "false"),
		).toBe(true)
	})

	it("UNKNOWN is not shown as 'not responded'", () => {
		useEventRsvp.mockReturnValue(state({ rsvp: { state: "unknown" } }))
		render(<RsvpControl eventId="e1" details={details} />)
		expect(screen.queryByText(/haven't responded/)).not.toBeInTheDocument()
		expect(screen.getByText(/isn't shown for this event/)).toBeInTheDocument()
	})

	it("selects the known status and does not re-send it", () => {
		useEventRsvp.mockReturnValue(state({ rsvp: { state: "set", status: "going" } }))
		render(<RsvpControl eventId="e1" details={details} />)
		expect(screen.getByRole("radio", { name: "Going" })).toHaveAttribute("aria-checked", "true")
		fireEvent.click(screen.getByRole("radio", { name: "Going" }))
		expect(setRsvp).not.toHaveBeenCalled()
	})

	it("saves a new choice and clears an earlier error first", () => {
		render(<RsvpControl eventId="e1" details={details} />)
		fireEvent.click(screen.getByRole("radio", { name: "Not going" }))
		expect(clearError).toHaveBeenCalled()
		expect(setRsvp).toHaveBeenCalledWith("not_going")
	})

	it("disables the options while saving and shows a backend failure (e.g. event ended) inline", () => {
		useEventRsvp.mockReturnValue(
			state({
				isPending: true,
				pendingStatus: "going",
				error: { message: "This event has already ended." },
			}),
		)
		render(<RsvpControl eventId="e1" details={details} />)
		expect(screen.getAllByRole("radio").every((r) => (r as HTMLButtonElement).disabled)).toBe(true)
		expect(screen.getByRole("alert")).toHaveTextContent("This event has already ended.")
	})
})
