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
		render(<LocationRow status="ready" address="Jos" onRefresh={vi.fn()} scopeKm={25} />)
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
		const { rerender } = render(
			<LocationRow status="locating" address={null} onRefresh={vi.fn()} />,
		)
		expect(screen.getByText("Finding location…")).toBeInTheDocument()
		rerender(<LocationRow status="denied" address="stale" onRefresh={vi.fn()} />)
		// a stale address must never be shown without a current location
		expect(screen.getByText("Not available")).toBeInTheDocument()
		expect(screen.queryByText("stale")).not.toBeInTheDocument()
	})

	describe("read-only use on My events (no scope, no refresh)", () => {
		it("shows a neutral placeholder when no location has been resolved", () => {
			render(<LocationRow status="unset" address={null} />)
			expect(screen.getByText("Location")).toBeInTheDocument()
			expect(screen.getByText("Not set")).toBeInTheDocument()
			expect(screen.queryByRole("button")).not.toBeInTheDocument()
		})

		it("never shows an address for the unset state", () => {
			render(<LocationRow status="unset" address="stale" />)
			expect(screen.queryByText("stale")).not.toBeInTheDocument()
		})

		it("reflects a resolved place without a 25 km scope or a refresh control", () => {
			render(<LocationRow status="ready" address="Amuwo, Lagos, Nigeria" />)
			expect(screen.getByText("Amuwo, Lagos, Nigeria")).toBeInTheDocument()
			// My events is not distance-limited, so no scope text or tooltip may appear
			expect(screen.queryByText(/km/)).not.toBeInTheDocument()
			expect(document.querySelector("[title]")).toBeNull()
			expect(screen.queryByRole("button")).not.toBeInTheDocument()
		})

		it("falls back to a generic place when only the address lookup failed", () => {
			render(<LocationRow status="ready" address={null} />)
			expect(screen.getByText("Current location")).toBeInTheDocument()
		})
	})
})
