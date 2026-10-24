import { eventKeys } from "@/lib/events/query-keys"
import { useAuthStore } from "@/stores/auth-store"
import type { EventFullDetails, EventPreviewDetails } from "@/types/events/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventDetailsView } from "./event-details-view"

// Only the transport and two unrelated children are replaced: the pane's real tab wiring, the
// real comments/resources hooks and the real sections run.
const getEventCommentsPage = vi.fn()
const getEventResources = vi.fn()
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
const renderView = (details: EventFullDetails | EventPreviewDetails, tab: "details" | "comments" | "resources" | "guests") =>
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
		comments: [{ id: "c1", message: "hello there", createdAt: null, author: { name: "Ada", username: "a", photo: null, role: "host" } }],
	})
	getEventResources.mockResolvedValue({ links: [{ name: "Agenda", url: "https://example.com/a" }], documents: [] })
})

describe("Comments and Links and docs inside the details pane", () => {
	it("Comments tab on a full event fetches this event's comments through the real hook and renders them", async () => {
		renderView(full, "comments")
		expect(await screen.findByText("hello there")).toBeInTheDocument()
		expect(screen.getByText("Host")).toBeInTheDocument()
		expect(getEventCommentsPage).toHaveBeenCalledTimes(1)
		expect(getEventCommentsPage.mock.calls[0][0]).toMatchObject({ eventId: ID, page: 1 })
		expect(getEventResources).not.toHaveBeenCalled()
		expect(client.getQueryCache().findAll({ queryKey: [...eventKeys.commentsRoot(), 7, 1, ID] })).toHaveLength(1)
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
		expect(await screen.findByRole("link", { name: /Agenda/ })).toHaveAttribute("href", "https://example.com/a")
		await waitFor(() => expect(getEventResources).toHaveBeenCalledTimes(1))
		expect(getEventCommentsPage).not.toHaveBeenCalled()
	})

	it("a comments 403 inside the pane is worded for comments", async () => {
		getEventCommentsPage.mockRejectedValue(
			Object.assign(new Error("x"), { response: { status: 403, data: { message: "Join this event before accessing its live session." } } }),
		)
		renderView(full, "comments")
		expect(await screen.findByText(/can.t view these comments/i)).toBeInTheDocument()
		expect(screen.queryByText(/live session/i)).not.toBeInTheDocument()
	})
})
