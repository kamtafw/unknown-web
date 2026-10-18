import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { LocationRow } from "./location-row"

describe("LocationRow", () => {
	it("shows the label and the resolved place", () => {
		render(<LocationRow status="ready" address="Amuwo, Lagos, Nigeria" onRefresh={vi.fn()} />)
		expect(screen.getByText("Location")).toBeInTheDocument()
		expect(screen.getByText("Amuwo, Lagos, Nigeria")).toBeInTheDocument()
	})

	it("falls back to a generic place when the address lookup gave nothing", () => {
		render(<LocationRow status="ready" address={null} onRefresh={vi.fn()} />)
		expect(screen.getByText("Current location")).toBeInTheDocument()
	})

	it("keeps the 25 km scope out of the visible text but available to assistive tech", () => {
		render(<LocationRow status="ready" address="Jos" onRefresh={vi.fn()} />)
		expect(screen.getByText("Within 25 km of")).toHaveClass("sr-only")
		expect(screen.getByTitle("Showing events within 25 km")).toBeInTheDocument()
	})

	it("offers a refresh only once a location exists", () => {
		const onRefresh = vi.fn()
		const { rerender } = render(<LocationRow status="ready" address="Jos" onRefresh={onRefresh} />)
		fireEvent.click(screen.getByRole("button", { name: "Refresh my location" }))
		expect(onRefresh).toHaveBeenCalledTimes(1)

		for (const status of ["locating", "denied", "unavailable", "timeout", "unsupported"] as const) {
			rerender(<LocationRow status={status} address={null} onRefresh={onRefresh} />)
			expect(screen.queryByRole("button", { name: "Refresh my location" })).not.toBeInTheDocument()
		}
	})

	it("says what is happening instead of a place when there is no location", () => {
		const { rerender } = render(<LocationRow status="locating" address={null} onRefresh={vi.fn()} />)
		expect(screen.getByText("Finding location…")).toBeInTheDocument()
		rerender(<LocationRow status="denied" address="stale" onRefresh={vi.fn()} />)
		// a stale address must never be shown without a current location
		expect(screen.getByText("Not available")).toBeInTheDocument()
		expect(screen.queryByText("stale")).not.toBeInTheDocument()
	})
})
