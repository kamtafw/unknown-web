import type { EventComment } from "@/types/events/api"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventCommentsSection } from "./event-comments-section"

vi.mock("./event-comment-composer", () => ({
	EventCommentComposer: ({ eventId }: { eventId: string }) => (
		<div data-testid="composer-stub" data-event={eventId} />
	),
}))

const useEventComments = vi.fn()
vi.mock("@/hooks/events/use-event-comments", () => ({
	useEventComments: (...a: unknown[]) => useEventComments(...a),
}))

const refetch = vi.fn()
const fetchNextPage = vi.fn()
const base = () => ({
	comments: [] as EventComment[],
	hasLoaded: true,
	isInitialLoading: false,
	error: null as string | null,
	phase: null as string | null,
	hasNextPage: false,
	isFetchingNextPage: false,
	isRefreshing: false,
	fetchNextPage,
	refetch,
})
const state = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over })

const NOW = new Date("2026-10-24T12:00:00Z")
const comment = (over: Partial<EventComment> = {}): EventComment => ({
	id: "c1",
	message: "See you there",
	createdAt: "2026-10-24T11:55:00Z",
	author: { name: "Ada Obi", username: "ada", photo: null, role: "guest" },
	...over,
})

beforeEach(() => {
	vi.clearAllMocks()
	vi.useFakeTimers({ toFake: ["Date"] })
	vi.setSystemTime(NOW)
})
afterEach(() => vi.useRealTimers())

const renderSection = () => render(<EventCommentsSection eventId="e1" />)

describe("EventCommentsSection", () => {
	it("asks for this event's comments", () => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, isInitialLoading: true }))
		renderSection()
		expect(useEventComments).toHaveBeenCalledWith("e1")
	})

	it("shows a loading skeleton", () => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, isInitialLoading: true }))
		renderSection()
		expect(screen.getByLabelText("Loading comments")).toHaveAttribute("aria-busy", "true")
	})

	it("renders name, initial fallback, message and relative time", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()] }))
		renderSection()
		const item = within(screen.getByRole("list", { name: "Event comments" })).getByRole("listitem")
		expect(item).toHaveTextContent("Ada Obi")
		expect(item).toHaveTextContent("See you there")
		expect(item).toHaveTextContent("A") // avatar fallback initial
		const time = within(item).getByText("5 minutes ago")
		expect(time.tagName).toBe("TIME")
		expect(time).toHaveAttribute("datetime", "2026-10-24T11:55:00.000Z")
		expect(within(item).queryByText("Host")).not.toBeInTheDocument()
	})

	it("shows a Host badge for a host author only (never Co Host)", () => {
		useEventComments.mockReturnValue(
			state({
				comments: [
					comment({ id: "h", author: { name: "Host Hal", username: "hal", photo: null, role: "host" } }),
					comment({ id: "g" }),
					comment({ id: "n", author: { name: "No Role", username: "", photo: null, role: null } }),
				],
			}),
		)
		renderSection()
		expect(screen.getAllByText("Host")).toHaveLength(1)
		expect(screen.queryByText(/co.?host/i)).not.toBeInTheDocument()
	})

	it("copes with a missing author, missing time and future/just-now times", () => {
		useEventComments.mockReturnValue(
			state({
				comments: [
					comment({ id: "a", author: null, createdAt: null }),
					comment({ id: "b", createdAt: "2026-10-24T11:59:45Z" }),
					comment({ id: "c", createdAt: "2026-10-24T12:30:00Z" }),
				],
			}),
		)
		const { container } = renderSection()
		expect(screen.getByText("Unknown user")).toBeInTheDocument()
		expect(container.querySelectorAll("time")).toHaveLength(2)
		expect(screen.getAllByText("just now")).toHaveLength(2)
	})

	it("renders message and name as text, never as HTML", () => {
		const evil = "<img src=x onerror=alert(1)><script>alert(2)</script><b>bold</b>"
		useEventComments.mockReturnValue(
			state({ comments: [comment({ message: evil, author: { name: "<i>x</i>", username: "", photo: null, role: "guest" } })] }),
		)
		const { container } = renderSection()
		expect(container.querySelector("img")).toBeNull()
		expect(container.querySelector("script")).toBeNull()
		expect(container.querySelector("b")).toBeNull()
		expect(container.querySelector("i")).toBeNull()
		expect(screen.getByText(evil)).toBeInTheDocument()
		expect(screen.getByText("<i>x</i>")).toBeInTheDocument()
	})

	it("wraps long unbroken messages instead of overflowing", () => {
		const long = "x".repeat(500)
		useEventComments.mockReturnValue(state({ comments: [comment({ message: long })] }))
		renderSection()
		const p = screen.getByText(long)
		expect(p.className).toMatch(/break-words/)
		expect(p.className).toMatch(/overflow-wrap:anywhere/)
		expect(p.className).toMatch(/whitespace-pre-wrap/)
	})

	it("keeps the order it is given", () => {
		useEventComments.mockReturnValue(
			state({ comments: [comment({ id: "1", message: "newest" }), comment({ id: "2", message: "older" })] }),
		)
		renderSection()
		const items = screen.getAllByRole("listitem")
		expect(items[0]).toHaveTextContent("newest")
		expect(items[1]).toHaveTextContent("older")
	})

	it("empty and terminal: an empty state, still with Refresh", () => {
		useEventComments.mockReturnValue(state())
		renderSection()
		expect(screen.getByText("No comments yet")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Refresh comments" })).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument()
	})

	it("empty page with a next link is not 'no comments': it offers Load more", () => {
		useEventComments.mockReturnValue(state({ hasNextPage: true }))
		renderSection()
		expect(screen.queryByText("No comments yet")).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Load more" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it("Load more appears only when another page exists, and shows a pending state", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()] }))
		const { rerender } = renderSection()
		expect(screen.queryByRole("button", { name: /load more/i })).not.toBeInTheDocument()
		useEventComments.mockReturnValue(state({ comments: [comment()], hasNextPage: true, isFetchingNextPage: true }))
		rerender(<EventCommentsSection eventId="e1" />)
		const pending = screen.getByRole("button", { name: "Loading…" })
		expect(pending).toBeDisabled()
		fireEvent.click(pending)
		expect(fetchNextPage).not.toHaveBeenCalled()
		expect(screen.getByRole("button", { name: "Refresh comments" })).toBeDisabled()
	})

	it("Refresh refetches, and is disabled with a pending label while refreshing", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()] }))
		const { rerender } = renderSection()
		fireEvent.click(screen.getByRole("button", { name: "Refresh comments" }))
		expect(refetch).toHaveBeenCalledTimes(1)
		useEventComments.mockReturnValue(state({ comments: [comment()], isRefreshing: true }))
		rerender(<EventCommentsSection eventId="e1" />)
		const button = screen.getByRole("button", { name: "Refresh comments" })
		expect(button).toBeDisabled()
		expect(button).toHaveTextContent("Refreshing…")
	})

	it("initial 403 is a comments-specific access message: no raw backend text, no retry, no logout prompt", () => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, error: "forbidden", phase: "initial" }))
		renderSection()
		const alert = screen.getByRole("alert")
		expect(alert).toHaveTextContent(/can.t view these comments/i)
		expect(alert).toHaveTextContent(/access to this event.s comments/i)
		expect(screen.queryByText(/live session/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/session has expired|sign in/i)).not.toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("initial 404 is 'comments aren't available', not 'event not found' and not an empty thread", () => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, error: "not_found", phase: "initial" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/comments aren.t available/i)
		expect(screen.queryByText("No comments yet")).not.toBeInTheDocument()
		expect(screen.queryByText("This event isn't available. It may have been deleted.")).not.toBeInTheDocument()
	})

	it("initial 401 says the session expired", () => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, error: "unauthorized", phase: "initial" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/session has expired/i)
	})

	it.each(["server", "network", "unknown"])("an initial %s failure offers Retry and is never an empty thread", (error) => {
		useEventComments.mockReturnValue(state({ hasLoaded: false, error, phase: "initial" }))
		renderSection()
		expect(screen.queryByText("No comments yet")).not.toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: /try again/i }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})

	it("a failed next page keeps the loaded comments, explains, and Load more becomes Try again", () => {
		useEventComments.mockReturnValue(
			state({ comments: [comment()], hasNextPage: true, error: "server", phase: "next-page" }),
		)
		renderSection()
		expect(screen.getByText("See you there")).toBeInTheDocument()
		expect(screen.getByRole("alert")).toHaveTextContent(/couldn.t update comments/i)
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(fetchNextPage).toHaveBeenCalledTimes(1)
	})

	it("a 404 on a later page keeps the comments and points to Refresh", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()], error: "not_found", phase: "next-page" }))
		renderSection()
		expect(screen.getByText("See you there")).toBeInTheDocument()
		expect(screen.getByRole("alert")).toHaveTextContent(/no more comments could be loaded/i)
		expect(screen.queryByText(/event isn.t available/i)).not.toBeInTheDocument()
	})

	it("a failed refresh keeps the loaded comments and says so", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()], error: "network", phase: "refresh" }))
		renderSection()
		expect(screen.getByText("See you there")).toBeInTheDocument()
		expect(screen.getByRole("alert")).toHaveTextContent(/loaded earlier/i)
	})

	it("a refresh 403 keeps the comments and says access may have been lost, without a logout prompt", () => {
		useEventComments.mockReturnValue(state({ comments: [comment()], error: "forbidden", phase: "refresh" }))
		renderSection()
		expect(screen.getByText("See you there")).toBeInTheDocument()
		expect(screen.getByRole("alert")).toHaveTextContent(/no longer have access/i)
		expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument()
	})

	it("shows the composer with the loaded thread (empty or populated) and not while the first load fails", () => {
		useEventComments.mockReturnValue(state())
		const { rerender } = renderSection()
		expect(screen.getByTestId("composer-stub")).toHaveAttribute("data-event", "e1")
		useEventComments.mockReturnValue(state({ comments: [comment()] }))
		rerender(<EventCommentsSection eventId="e1" />)
		expect(screen.getByTestId("composer-stub")).toBeInTheDocument()
		useEventComments.mockReturnValue(state({ hasLoaded: false, error: "server", phase: "initial" }))
		rerender(<EventCommentsSection eventId="e1" />)
		expect(screen.queryByTestId("composer-stub")).not.toBeInTheDocument()
	})

	it("renders no other interaction controls (the composer is the only writing control)", () => {
		useEventComments.mockReturnValue(
			state({ comments: [comment()], hasNextPage: true }),
		)
		const { container } = renderSection()
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
		expect(container.querySelector("textarea, input, form")).toBeNull() // the composer is stubbed here
		const names = screen.getAllByRole("button").map((b) => b.textContent)
		expect(names).toEqual(["Refresh", "Load more"])
		expect(screen.queryByText(/reply|react|edit|delete|report|pin|post/i)).not.toBeInTheDocument()
	})
})
