import type { EventGuest } from "@/types/events/api"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RemoveGuestDialog, removeGuestErrorText } from "./remove-guest-dialog"

const remove = vi.fn()
const clearError = vi.fn()
let hookState = { isPending: false, error: null as string | null }
vi.mock("@/hooks/events/use-remove-event-guest", () => ({
	useRemoveEventGuest: (...a: unknown[]) => {
		useRemove(...a)
		return { remove, clearError, ...hookState }
	},
}))
const useRemove = vi.fn()
const toastSuccess = vi.fn()
vi.mock("@/lib/toast", () => ({
	toast: { success: (m: string) => toastSuccess(m), error: vi.fn(), info: vi.fn() },
}))

const guest: EventGuest = {
	userId: 42,
	name: "Bola Ade",
	username: "bolaa",
	photo: null,
	role: "guest",
}
const open = () => fireEvent.click(screen.getByRole("button", { name: "Remove Bola Ade" }))

beforeEach(() => {
	vi.clearAllMocks()
	hookState = { isPending: false, error: null }
})

describe("RemoveGuestDialog", () => {
	it("sends nothing until the host confirms, and says comments are deleted and it can't be undone", () => {
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		expect(useRemove).toHaveBeenCalledWith("e1")
		open()
		const dialog = screen.getByRole("alertdialog")
		expect(dialog).toHaveTextContent("also deletes their comments in this event")
		expect(dialog).toHaveTextContent("can't be undone")
		expect(dialog).not.toHaveTextContent(/live|media|disconnect/i)
		expect(remove).not.toHaveBeenCalled()
	})

	it("Keep guest (cancel) closes the dialog without a request", async () => {
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		fireEvent.click(screen.getByRole("button", { name: "Keep guest" }))
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
		expect(remove).not.toHaveBeenCalled()
	})

	it("Confirm removes that guest's user id, closes and shows a success toast", async () => {
		remove.mockResolvedValue("removed")
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		fireEvent.click(screen.getByRole("button", { name: "Remove guest" }))
		await waitFor(() => expect(remove).toHaveBeenCalledWith(42))
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
		expect(toastSuccess).toHaveBeenCalledWith("Bola Ade was removed.")
	})

	it("an already-removed guest closes the dialog with a matching message", async () => {
		remove.mockResolvedValue("already_removed")
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		fireEvent.click(screen.getByRole("button", { name: "Remove guest" }))
		await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Bola Ade was already removed."))
	})

	it("a failure keeps the dialog open", async () => {
		remove.mockResolvedValue(false)
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		fireEvent.click(screen.getByRole("button", { name: "Remove guest" }))
		await waitFor(() => expect(remove).toHaveBeenCalled())
		expect(screen.getByRole("alertdialog")).toBeInTheDocument()
		expect(toastSuccess).not.toHaveBeenCalled()
	})

	it("while pending, confirm and cancel are disabled and the dialog cannot be dismissed", () => {
		const { rerender } = render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		hookState = { isPending: true, error: null }
		rerender(<RemoveGuestDialog eventId="e1" guest={guest} />)
		expect(screen.getByRole("button", { name: "Removing…" })).toBeDisabled()
		expect(screen.getByRole("button", { name: "Keep guest" })).toBeDisabled()
		fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" })
		expect(screen.getByRole("alertdialog")).toBeInTheDocument()
	})

	it("shows the contextual error and offers Try again", () => {
		hookState = { isPending: false, error: "forbidden" }
		render(<RemoveGuestDialog eventId="e1" guest={guest} />)
		open()
		expect(screen.getByRole("alert")).toHaveTextContent("Only event hosts can remove guests.")
		expect(screen.getByRole("button", { name: "Try again" })).toBeEnabled()
	})
})

describe("removeGuestErrorText", () => {
	it("words each kind locally", () => {
		expect(removeGuestErrorText("forbidden")).toMatch(/host/)
		expect(removeGuestErrorText("not_found")).toMatch(/event/)
		expect(removeGuestErrorText("unauthorized")).toMatch(/session/)
		expect(removeGuestErrorText("network")).toMatch(/connection/)
		expect(removeGuestErrorText("server")).toMatch(/trouble/)
		expect(removeGuestErrorText("validation")).toMatch(/can't be removed/)
		expect(removeGuestErrorText("unknown")).toMatch(/Try again|try again/)
	})
})
