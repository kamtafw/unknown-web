import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventsTabs } from "./events-tabs"

let pathname = "/events"
vi.mock("next/navigation", () => ({ usePathname: () => pathname }))
// the global Link mock drops aria-* props; this one forwards them
vi.mock("next/link", () => ({
	default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}))

beforeEach(() => {
	pathname = "/events"
})

describe("EventsTabs", () => {
	it("links Events and My events with the design's labels", () => {
		render(<EventsTabs />)
		expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events")
		expect(screen.getByRole("link", { name: "My events" })).toHaveAttribute(
			"href",
			"/events/my-events",
		)
	})

	it("marks only Events as current on /events", () => {
		render(<EventsTabs />)
		expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("aria-current", "page")
		expect(screen.getByRole("link", { name: "My events" })).not.toHaveAttribute("aria-current")
	})

	it("marks only My events as current on /events/my-events", () => {
		pathname = "/events/my-events"
		render(<EventsTabs />)
		expect(screen.getByRole("link", { name: "My events" })).toHaveAttribute("aria-current", "page")
		expect(screen.getByRole("link", { name: "Events" })).not.toHaveAttribute("aria-current")
	})

	it("keeps My events current on a nested path", () => {
		pathname = "/events/my-events/abc"
		render(<EventsTabs />)
		expect(screen.getByRole("link", { name: "My events" })).toHaveAttribute("aria-current", "page")
	})
})
