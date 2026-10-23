import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLink } from "./event-link"

vi.mock("next/link", () => ({
	// the shared setup mock keeps only `href`; these tests assert aria/class props too
	default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}))

const useEventSelection = vi.fn()
vi.mock("@/hooks/events/use-event-selection", () => ({
	useEventSelection: () => useEventSelection(),
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"

beforeEach(() => {
	useEventSelection.mockReturnValue({
		selection: { mode: "none" },
		hrefFor: (next: { mode: string; eventId?: string }) => `/events?event=${next.eventId}`,
	})
})

describe("EventLink", () => {
	it("links to the event selection, not to a route with the id in the path", () => {
		render(<EventLink eventId={ID}>Jazz night</EventLink>)
		expect(screen.getByRole("link", { name: "Jazz night" })).toHaveAttribute(
			"href",
			`/events?event=${ID}`,
		)
	})

	it("marks only the selected event as current", () => {
		useEventSelection.mockReturnValue({
			selection: { mode: "view", eventId: ID },
			hrefFor: () => "/x",
		})
		const { rerender } = render(<EventLink eventId={ID}>Selected</EventLink>)
		expect(screen.getByRole("link")).toHaveAttribute("aria-current", "true")
		rerender(<EventLink eventId="someone-else">Other</EventLink>)
		expect(screen.getByRole("link")).not.toHaveAttribute("aria-current")
	})
})
