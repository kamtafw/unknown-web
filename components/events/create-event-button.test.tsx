import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { CreateEventButton } from "./create-event-button"

vi.mock("next/link", () => ({
	// the shared setup mock keeps only `href`; these tests assert aria/class props too
	default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
		<a href={href} {...rest}>
			{children}
		</a>
	),
}))

describe("CreateEventButton", () => {
	it("is an accessible link to the create selection and carries no secrets", () => {
		render(<CreateEventButton />)
		const link = screen.getByRole("link", { name: "Create event" })
		expect(link).toHaveAttribute("href", "?create=1")
	})
})
