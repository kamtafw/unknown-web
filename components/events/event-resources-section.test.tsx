import type { EventResources } from "@/types/events/api"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventResourcesSection } from "./event-resources-section"

const useEventResources = vi.fn()
vi.mock("@/hooks/events/use-event-resources", () => ({
	useEventResources: (...a: unknown[]) => useEventResources(...a),
}))

const refetch = vi.fn()
const state = (over: Partial<ReturnType<typeof base>> = {}) => ({ ...base(), ...over })
const base = () => ({ resources: null as EventResources | null, errorKind: null as string | null, isLoading: false, isRefetching: false, refetch })
const loaded = (r: EventResources) => state({ resources: r })

const onEdit = vi.fn()
const renderSection = (isHost = false) => render(<EventResourcesSection eventId="e1" isHost={isHost} onEdit={onEdit} />)

beforeEach(() => {
	vi.clearAllMocks()
})

describe("EventResourcesSection", () => {
	it("asks for this event's resources", () => {
		useEventResources.mockReturnValue(state({ isLoading: true }))
		renderSection()
		expect(useEventResources).toHaveBeenCalledWith("e1")
	})

	it("shows a loading skeleton", () => {
		useEventResources.mockReturnValue(state({ isLoading: true }))
		renderSection()
		expect(screen.getByLabelText("Loading links and documents")).toHaveAttribute("aria-busy", "true")
	})

	it("renders links and documents in separate lists with safe external anchors", () => {
		useEventResources.mockReturnValue(
			loaded({
				links: [{ name: "Agenda", url: "https://example.com/agenda" }],
				documents: [
					{ name: "Brochure", url: "https://cdn.example.com/b.pdf", size: "1.2 MB", fileType: "PDF", uploadedOn: "01/11/2026" },
					{ name: "Plain", url: "https://cdn.example.com/p", size: null, fileType: null, uploadedOn: null },
				],
			}),
		)
		renderSection()
		const links = within(screen.getByRole("region", { name: "Links" }))
		const docs = within(screen.getByRole("region", { name: "Documents" }))
		const agenda = links.getByRole("link", { name: /Agenda/ })
		expect(agenda).toHaveAttribute("href", "https://example.com/agenda")
		expect(agenda).toHaveAttribute("target", "_blank")
		expect(agenda).toHaveAttribute("rel", "noopener noreferrer")
		expect(links.queryByText("Brochure")).not.toBeInTheDocument()
		const brochure = docs.getByRole("link", { name: /Brochure/ })
		expect(brochure).toHaveAttribute("href", "https://cdn.example.com/b.pdf")
		expect(brochure).toHaveAttribute("rel", "noopener noreferrer")
		expect(brochure).toHaveTextContent("PDF · 1.2 MB · 01/11/2026")
		// metadata only when present; no placeholder text and no per-link date
		expect(docs.getByRole("link", { name: "Plain" })).toBeInTheDocument()
		expect(screen.queryByText(/·/, { selector: "li:nth-child(2) *" })).not.toBeInTheDocument()
		expect(screen.queryByRole("img")).not.toBeInTheDocument()
	})

	it("omits the Links heading when there are only documents, and the reverse", () => {
		useEventResources.mockReturnValue(
			loaded({ links: [], documents: [{ name: "D", url: "https://x.test/d", size: null, fileType: null, uploadedOn: null }] }),
		)
		const { unmount } = renderSection()
		expect(screen.queryByRole("region", { name: "Links" })).not.toBeInTheDocument()
		expect(screen.getByRole("region", { name: "Documents" })).toBeInTheDocument()
		unmount()
		useEventResources.mockReturnValue(loaded({ links: [{ name: "L", url: "https://x.test/l" }], documents: [] }))
		renderSection()
		expect(screen.queryByRole("region", { name: "Documents" })).not.toBeInTheDocument()
	})

	it("renders names as text, never as HTML", () => {
		useEventResources.mockReturnValue(
			loaded({ links: [{ name: "<img src=x onerror=alert(1)><b>hi</b>", url: "https://example.com/" }], documents: [] }),
		)
		const { container } = renderSection()
		expect(container.querySelector("img")).toBeNull()
		expect(container.querySelector("b")).toBeNull()
		expect(screen.getByText("<img src=x onerror=alert(1)><b>hi</b>")).toBeInTheDocument()
	})

	it.each(["javascript:alert(1)", "data:text/html,<script>1</script>", "vbscript:x", "//evil.test", "/relative", "not a url"])(
		"never makes %s navigable",
		(url) => {
			useEventResources.mockReturnValue(
				loaded({
					links: [{ name: "Bad", url }],
					documents: [{ name: "BadDoc", url, size: null, fileType: null, uploadedOn: null }],
				}),
			)
			const { container } = renderSection()
			expect(container.querySelector("a")).toBeNull()
			expect(screen.getByText("Bad")).toBeInTheDocument()
		},
	)

	it("empty: guests see a plain message with no edit shortcut", () => {
		useEventResources.mockReturnValue(loaded({ links: [], documents: [] }))
		renderSection(false)
		expect(screen.getByText("No links or documents yet")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument()
	})

	it("empty: a host gets a shortcut to the edit form", () => {
		useEventResources.mockReturnValue(loaded({ links: [], documents: [] }))
		renderSection(true)
		fireEvent.click(screen.getByRole("button", { name: /edit event/i }))
		expect(onEdit).toHaveBeenCalledTimes(1)
	})

	it("a host sees no edit shortcut when there are resources", () => {
		useEventResources.mockReturnValue(loaded({ links: [{ name: "L", url: "https://x.test/l" }], documents: [] }))
		renderSection(true)
		expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument()
	})

	it("403 is a permission message in the section's own words, with no retry and no live-session text", () => {
		useEventResources.mockReturnValue(state({ errorKind: "forbidden" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/don.t have access to this event.s resources/i)
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
		expect(screen.queryByText(/join this event/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument()
	})

	it("404 says the resources are unavailable, not that the session expired or access was denied", () => {
		useEventResources.mockReturnValue(state({ errorKind: "not_found" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/aren.t available/i)
		expect(screen.queryByText(/session has expired/i)).not.toBeInTheDocument()
		expect(screen.queryByText(/permission|access/i)).not.toBeInTheDocument()
		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("401 says the session expired", () => {
		useEventResources.mockReturnValue(state({ errorKind: "unauthorized" }))
		renderSection()
		expect(screen.getByRole("alert")).toHaveTextContent(/session has expired/i)
	})

	it.each(["server", "network", "unknown"])("a %s failure offers Retry, which refetches", (kind) => {
		useEventResources.mockReturnValue(state({ errorKind: kind }))
		renderSection()
		fireEvent.click(screen.getByRole("button", { name: /try again/i }))
		expect(refetch).toHaveBeenCalledTimes(1)
	})
})
