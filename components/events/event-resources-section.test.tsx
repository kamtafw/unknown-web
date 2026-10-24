import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { EventResourcesSection } from "./event-resources-section"

const base = {
	isLoading: false,
	isError: false,
	error: null,
	isHost: false,
	onEdit: vi.fn(),
	onRetry: vi.fn(),
}

describe("EventResourcesSection", () => {
	it("shows an accessible loading skeleton", () => {
		render(<EventResourcesSection {...base} isLoading resources={undefined} />)
		expect(screen.getByRole("status")).toHaveTextContent("Loading links and documents")
	})

	it("shows the empty state and an edit shortcut for hosts", () => {
		const onEdit = vi.fn()
		render(<EventResourcesSection {...base} isHost onEdit={onEdit} resources={{ links: [], documents: [] }} />)
		expect(screen.getByText("No links or documents yet")).toBeInTheDocument()
		fireEvent.click(screen.getByRole("button", { name: "Edit event" }))
		expect(onEdit).toHaveBeenCalledOnce()
	})

	it("shows an access-denied message without a retry action for 403", () => {
		const error = Object.assign(new Error("denied"), { response: { status: 403, data: {} } })
		render(<EventResourcesSection {...base} isError error resources={undefined} />)
		expect(screen.getByText("You can't access these resources")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Try again" })).not.toBeInTheDocument()
	})

	it("offers retry for a retryable error", () => {
		const onRetry = vi.fn()
		const error = Object.assign(new Error("failed"), { response: { status: 500, data: {} } })
		render(<EventResourcesSection {...base} isError error onRetry={onRetry} resources={undefined} />)
		fireEvent.click(screen.getByRole("button", { name: "Try again" }))
		expect(onRetry).toHaveBeenCalledOnce()
	})

	it("renders links safely and document metadata only when supplied", () => {
		render(<EventResourcesSection {...base} resources={{
			links: [{ name: "Project page", url: "https://example.com/project" }],
			documents: [{
				name: "Agenda",
				url: "https://files.example.com/agenda.pdf",
				size: "2 MB",
				fileType: "PDF",
				dateUploaded: "24/10/2026",
			}],
		}} />)
		const link = screen.getByRole("link", { name: "Project page" })
		expect(link).toHaveAttribute("href", "https://example.com/project")
		expect(link).toHaveAttribute("target", "_blank")
		expect(link).toHaveAttribute("rel", "noopener noreferrer")
		const documentLink = screen.getByRole("link", { name: "Agenda" })
		expect(documentLink).toHaveAttribute("href", "https://files.example.com/agenda.pdf")
		expect(documentLink).toHaveAttribute("rel", "noopener noreferrer")
		expect(screen.getByText("2 MB")).toBeInTheDocument()
		expect(screen.getByText("PDF")).toBeInTheDocument()
		expect(screen.getByText("24/10/2026")).toBeInTheDocument()
		expect(document.querySelector("img")).toBeNull()
	})
})
