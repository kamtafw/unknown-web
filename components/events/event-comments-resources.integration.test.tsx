import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails, EventPreviewDetails } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventDetailsView } from "./event-details-view"

// Only the transport and two unrelated children are replaced: the pane's real tab wiring, the
// real comments/resources hooks and the real sections run.
const getEventCommentsPage = vi.fn()
const getEventResources = vi.fn()
const postEventComment = vi.fn()
vi.mock("@/lib/events/api", () => ({
	eventsApi: {
		getEventCommentsPage: (...a: unknown[]) => getEventCommentsPage(...a),
		getEventResources: (...a: unknown[]) => getEventResources(...a),
	},
}))
vi.mock("./rsvp-control", () => ({ RsvpControl: () => <section aria-label="rsvp-stub" /> }))
vi.mock("./delete-event-dialog", () => ({ DeleteEventDialog: () => null }))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"
const base = {
	id: ID,
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: true,
	privacy: "private" as const,
	coverImage: null,
	liveSessionId: null,
	address: null,
	hashtags: [],
}
const full: EventFullDetails = {
	...base,
	kind: "full",
	coordinates: null,
	hosts: [],
	liveSessionStatus: null,
	links: [],
	documents: [],
	rsvp: { state: "none" },
}
const preview: EventPreviewDetails = { ...base, kind: "preview" }
const noop = () => {}

let client: QueryClient
const renderView = (
	details: EventFullDetails | EventPreviewDetails,
	tab: "details" | "comments" | "resources" | "guests",
) =>
	render(
		<QueryClientProvider client={client}>
			<EventDetailsView details={details} isHost={false} onEdit={noop} onDeleted={noop} tab={tab} />
		</QueryClientProvider>,
	)

beforeEach(() => {
	vi.clearAllMocks()
	client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 1 })
	getEventCommentsPage.mockResolvedValue({
		page: 1,
		hasNext: false,
		comments: [
			{
				id: "c1",
				message: "hello there",
				createdAt: null,
				author: { name: "Ada", username: "a", photo: null, role: "host" },
			},
		],
	})
	postEventComment.mockResolvedValue(undefined)
	getEventResources.mockResolvedValue({
		links: [{ name: "Agenda", url: "https://example.com/a" }],
		documents: [],
	})
})

describe("Comments and Links and docs inside the details pane", () => {
	it("Comments tab on a full event fetches this event's comments through the real hook and renders them", async () => {
		renderView(full, "comments")
		expect(await screen.findByText("hello there")).toBeInTheDocument()
		expect(screen.getByText("Host")).toBeInTheDocument()
		expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
		expect(getEventCommentsPage.mock.calls[0][0]).toMatchObject({ eventId: ID, page: 1 })
		expect(getEventResources).not.toHaveBeenCalled()
		expect(
			client.getQueryCache().findAll({ queryKey: [...eventKeys.commentsRoot(), 7, 1, ID] }),
		).toHaveLength(1)
	})

	it("a restricted preview with tab=comments or tab=resources makes no request at all", async () => {
		for (const tab of ["comments", "resources"] as const) {
			const { unmount } = renderView(preview, tab)
			unmount()
		}
		await new Promise((r) => setTimeout(r, 20))
		expect(getEventCommentsPage).not.toHaveBeenCalled()
		expect(getEventResources).not.toHaveBeenCalled()
	})

	it("Details and Guests never request comments or resources", async () => {
		for (const tab of ["details", "guests"] as const) {
			const { unmount } = renderView(full, tab)
			unmount()
		}
		await new Promise((r) => setTimeout(r, 20))
		expect(getEventCommentsPage).not.toHaveBeenCalled()
		expect(getEventResources).not.toHaveBeenCalled()
	})

	it("Links and docs still works and does not request comments (P3-04 not regressed)", async () => {
		renderView(full, "resources")
		expect(await screen.findByRole("link", { name: /Agenda/ })).toHaveAttribute(
			"href",
			"https://example.com/a",
		)
		await waitFor(() => expect(getEventResources).toHaveBeenCalledTimes(1))
		expect(getEventCommentsPage).not.toHaveBeenCalled()
	})

	it("a comments 403 inside the pane is worded for comments", async () => {
		getEventCommentsPage.mockRejectedValue(
			Object.assign(new Error("x"), {
				response: {
					status: 403,
					data: { message: "Join this event before accessing its live session." },
				},
			}),
		)
		renderView(full, "comments")
		expect(await screen.findByText(/can.t view these comments/i)).toBeInTheDocument()
		expect(screen.queryByText(/live session/i)).not.toBeInTheDocument()
	})
})

const reject = (status: number) => Object.assign(new Error("x"), { response: { status, data: {} } })
const box = () => screen.getByRole("textbox", { name: "Write a comment" }) as HTMLTextAreaElement
const cm = (id: string, message: string) => ({
	id,
	message,
	createdAt: null,
	author: { name: "Ada", username: "a", photo: null, role: "guest" as const },
})

describe("Posting a comment inside the Comments section (P3-06)", () => {
	it("the composer is on a full event for a non-host too, wired to the real mutation", async () => {
		renderView(full, "comments")
		expect(await screen.findByText("hello there")).toBeInTheDocument()
		expect(box()).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Post comment" })).toBeEnabled()
	})

	it("a restricted preview has no composer and cannot post, even with tab=comments", async () => {
		renderView(preview, "comments")
		await new Promise((r) => setTimeout(r, 20))
		expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /post comment/i })).not.toBeInTheDocument()
		expect(postEventComment).not.toHaveBeenCalled()
		expect(getEventCommentsPage).not.toHaveBeenCalled()
	})

	it("post -> trimmed send -> composer cleared -> page 1 refetched -> the new comment appears only via the read path", async () => {
		getEventCommentsPage.mockResolvedValue({
			page: 1,
			hasNext: false,
			comments: [cm("c1", "first")],
		})
		renderView(full, "comments")
		expect(await screen.findByText("first")).toBeInTheDocument()
		getEventCommentsPage.mockClear()

		let posted = false
		postEventComment.mockImplementation(async () => {
			posted = true
		})
		getEventCommentsPage.mockImplementation(async () => ({
			page: 1,
			hasNext: false,
			comments: posted ? [cm("c2", "brand new"), cm("c1", "first")] : [cm("c1", "first")],
		}))

		fireEvent.change(box(), { target: { value: "  brand new  " } })
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))

		await waitFor(() => expect(postEventComment).toHaveBeenCalledWith(ID, "brand new"))
		await waitFor(() => expect(box().value).toBe(""))
		// not shown from the write response: it arrives with the refetched thread
		expect(await screen.findByText("brand new")).toBeInTheDocument()
		const items = screen.getAllByRole("listitem")
		expect(items[0]).toHaveTextContent("brand new")
		expect(items[1]).toHaveTextContent("first")
		expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
		expect(getEventCommentsPage.mock.calls[0][0]).toMatchObject({ eventId: ID, page: 1 })
	})

	it("a 404 shows the has-not-joined message, keeps the text and leaves the thread and event alone", async () => {
		renderView(full, "comments")
		expect(await screen.findByText("hello there")).toBeInTheDocument()
		getEventCommentsPage.mockClear()
		postEventComment.mockRejectedValue(reject(404))
		fireEvent.change(box(), { target: { value: "let me in" } })
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
		expect(
			await screen.findByText("Only people who have joined this event can post comments"),
		).toBeInTheDocument()
		expect(box().value).toBe("let me in")
		expect(screen.getByText("hello there")).toBeInTheDocument()
		expect(screen.queryByText(/isn.t available/i)).not.toBeInTheDocument()
		expect(getEventCommentsPage).not.toHaveBeenCalled()
	})

	it("after a failed post the same text can be sent again (retry)", async () => {
		renderView(full, "comments")
		await screen.findByText("hello there")
		postEventComment.mockRejectedValueOnce(reject(500)).mockResolvedValue(undefined)
		fireEvent.change(box(), { target: { value: "try twice" } })
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
		await screen.findByText(/couldn.t post your comment/i)
		expect(box().value).toBe("try twice")
		fireEvent.click(screen.getByRole("button", { name: "Post comment" }))
		await waitFor(() => expect(box().value).toBe(""))
		expect(postEventComment).toHaveBeenCalledTimes(2)
		expect(postEventComment).toHaveBeenLastCalledWith(ID, "try twice")
	})

	it("P3-05 behaviour stays: Load more still appends the next page after the composer was added", async () => {
		getEventCommentsPage.mockImplementation(async ({ page }: { page: number }) =>
			page === 1
				? { page: 1, hasNext: true, comments: [cm("c2", "newer")] }
				: { page: 2, hasNext: false, comments: [cm("c1", "older")] },
		)
		renderView(full, "comments")
		await screen.findByText("newer")
		fireEvent.click(screen.getByRole("button", { name: "Load more" }))
		expect(await screen.findByText("older")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Load more" })).not.toBeInTheDocument()
	})
})
