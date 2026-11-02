import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
	StatusPill,
	destructiveButton,
	destructiveOutlineButton,
	ghostDestructiveButton,
	primaryButton,
	primaryButton as primaryFromUi,
	secondaryButton,
} from "./event-ui"

describe("Events button styles", () => {
	it("keep the old event-list exports pointing at the shared styles", () => {
		expect(primaryButton).toBe(primaryFromUi)
		expect(secondaryButton).toContain("border-border")
	})

	it.each([
		["primary", primaryButton],
		["secondary", secondaryButton],
		["destructive", destructiveButton],
		["destructive outline", destructiveOutlineButton],
		["ghost destructive", ghostDestructiveButton],
	])("%s buttons centre their content, show a focus ring and dim when disabled", (_name, cls) => {
		expect(cls).toContain("justify-center")
		expect(cls).toContain("focus-visible:ring-2")
		expect(cls).toContain("disabled:opacity-50")
		expect(cls).toContain("disabled:pointer-events-none")
	})
})

describe("StatusPill", () => {
	it("renders its label and hides the decorative live dot from assistive tech", () => {
		const { container } = render(
			<StatusPill tone="live" dot pulse>
				Live session
			</StatusPill>,
		)
		expect(screen.getByText("Live session")).toBeInTheDocument()
		const dot = container.querySelector("[aria-hidden='true']")
		expect(dot).not.toBeNull()
		expect(container.querySelector(".animate-ping")).not.toBeNull()
	})

	it("has no dot unless asked", () => {
		const { container } = render(<StatusPill>Public</StatusPill>)
		expect(container.querySelector("[aria-hidden]")).toBeNull()
	})
})
