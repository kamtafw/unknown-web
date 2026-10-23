import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { DeleteEventDialog, LIVE_DELETE_MESSAGE } from "./delete-event-dialog"

const mutate = vi.fn()
const reset = vi.fn()
const useDeleteEvent = vi.fn()
vi.mock("@/hooks/events/use-event-mutations", () => ({
	useDeleteEvent: (id: string) => useDeleteEvent(id),
}))
const toastSuccess = vi.fn()
vi.mock("@/lib/toast", () => ({
	toast: { success: (m: string) => toastSuccess(m), error: vi.fn(), info: vi.fn() },
}))

const base = { isPending: false, isError: false, error: null, mutate, reset }
const onDeleted = vi.fn()

beforeEach(() => {
	vi.clearAllMocks()
	useDeleteEvent.mockReturnValue(base)
})

const open = () => fireEvent.click(screen.getByRole("button", { name: /^Delete$/ }))

describe("DeleteEventDialog", () => {
	it("asks for confirmation naming the event and deletes nothing until confirmed", () => {
		render(
			<DeleteEventDialog
				eventId="e1"
				eventName="Jazz night"
				liveBlocked={false}
				onDeleted={onDeleted}
			/>,
		)
		open()
		expect(screen.getByRole("alertdialog")).toHaveTextContent("Jazz night")
		expect(mutate).not.toHaveBeenCalled()
		fireEvent.click(screen.getByRole("button", { name: "Keep event" }))
		expect(mutate).not.toHaveBeenCalled()
	})

	it("deletes on confirm, then reports success and leaves the event", async () => {
		mutate.mockImplementation((_v, o) => o.onSuccess())
		render(
			<DeleteEventDialog
				eventId="e1"
				eventName="Jazz night"
				liveBlocked={false}
				onDeleted={onDeleted}
			/>,
		)
		open()
		fireEvent.click(screen.getByRole("button", { name: "Delete event" }))
		await waitFor(() => expect(onDeleted).toHaveBeenCalled())
		expect(toastSuccess).toHaveBeenCalledWith("Event deleted")
	})

	it("a live event cannot be deleted: no delete control, an explanation instead", () => {
		render(
			<DeleteEventDialog eventId="e1" eventName="Jazz night" liveBlocked onDeleted={onDeleted} />,
		)
		expect(screen.queryByRole("button", { name: /^Delete$/ })).not.toBeInTheDocument()
		expect(screen.getByRole("note")).toHaveTextContent(LIVE_DELETE_MESSAGE)
	})

	it("shows a server refusal in the dialog and keeps it open", () => {
		useDeleteEvent.mockReturnValue({
			...base,
			isError: true,
			error: {
				response: { status: 403, data: { message: "Only an event host can perform this action." } },
			},
		})
		render(
			<DeleteEventDialog
				eventId="e1"
				eventName="Jazz night"
				liveBlocked={false}
				onDeleted={onDeleted}
			/>,
		)
		open()
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Only an event host can perform this action.",
		)
		expect(onDeleted).not.toHaveBeenCalled()
	})

	it("explains a live refusal from the server (409 event_live) with the Pass 4 message", () => {
		useDeleteEvent.mockReturnValue({
			...base,
			isError: true,
			error: { response: { status: 409, data: { code: "event_live", message: "x" } } },
		})
		render(
			<DeleteEventDialog
				eventId="e1"
				eventName="Jazz night"
				liveBlocked={false}
				onDeleted={onDeleted}
			/>,
		)
		open()
		expect(screen.getByRole("alert")).toHaveTextContent(LIVE_DELETE_MESSAGE)
	})
})
