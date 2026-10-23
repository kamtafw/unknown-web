import type { EventFullDetails } from "@/types/events/api"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventForm } from "./event-form"

const createAsync = vi.fn()
const updateAsync = vi.fn()
vi.mock("@/hooks/events/use-event-mutations", () => ({
	useCreateEvent: () => ({ mutateAsync: createAsync, isPending: false }),
	useUpdateEvent: () => ({ mutateAsync: updateAsync, isPending: false }),
}))

const location = vi.fn()
vi.mock("@/hooks/events/use-form-location", () => ({ useFormLocation: () => location() }))
vi.mock("@/hooks/events/use-event-address", () => ({ useEventAddress: () => "Jos, Plateau" }))

const toastSuccess = vi.fn()
const toastInfo = vi.fn()
vi.mock("@/lib/toast", () => ({
	toast: { success: (m: string) => toastSuccess(m), info: (m: string) => toastInfo(m), error: vi.fn() },
}))

const ready = { status: "ready", coordinates: { latitude: 9.92, longitude: 8.89 }, request: vi.fn(), reset: vi.fn() }
const idle = { status: "idle", coordinates: null, request: vi.fn(), reset: vi.fn() }
const onDone = vi.fn()
const onCancel = vi.fn()

const fill = (label: string, value: string) =>
	fireEvent.change(screen.getByLabelText(label), { target: { value } })
const fillSchedule = () => {
	fill("Event name", "Jos Tech Meetup")
	fill("Start date", "2026-11-01")
	fill("Start time", "18:00")
	fill("End date", "2026-11-01")
	fill("End time", "20:00")
}
const submitCreate = () => fireEvent.click(screen.getByRole("button", { name: "Create event" }))

const existing: EventFullDetails = {
	kind: "full",
	id: "e1",
	name: "Jazz night",
	startDate: "2026-11-01",
	endDate: "2026-11-01",
	startTime: "18:00",
	endTime: "20:00",
	isLive: false,
	isLocked: false,
	privacy: "public",
	coverImage: null,
	liveSessionId: null,
	address: "Amuwo, Lagos",
	hashtags: [],
	coordinates: null,
	hosts: [],
	liveSessionStatus: null,
	links: [],
	documents: [],
	rsvp: { state: "none" },
}

beforeEach(() => {
	vi.clearAllMocks()
	location.mockReturnValue(ready)
})

describe("EventForm — create", () => {
	it("blocks an empty submit with inline errors and sends nothing", () => {
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		submitCreate()
		expect(screen.getByText("Give your event a name.")).toBeInTheDocument()
		expect(screen.getByText("Choose a start date.")).toBeInTheDocument()
		expect(createAsync).not.toHaveBeenCalled()
	})

	it("needs a real location: nothing is substituted when none was chosen", () => {
		location.mockReturnValue(idle)
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		submitCreate()
		expect(screen.getByText("Set the event location.")).toBeInTheDocument()
		expect(createAsync).not.toHaveBeenCalled()
	})

	it("asks for location only when the button is pressed, and says why", () => {
		location.mockReturnValue(idle)
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		expect(screen.getByText(/Nothing is requested until you press the button/)).toBeInTheDocument()
		expect(idle.request).not.toHaveBeenCalled()
		fireEvent.click(screen.getByRole("button", { name: "Use my current location" }))
		expect(idle.request).toHaveBeenCalledTimes(1)
	})

	it("rejects an end time before the start time even when the end date is later (backend rule)", () => {
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		fill("End date", "2026-11-02")
		fill("End time", "02:00")
		submitCreate()
		expect(screen.getByText(/Overnight schedules aren't supported yet/)).toBeInTheDocument()
		expect(createAsync).not.toHaveBeenCalled()
	})

	it("submits JSON with seconds and the browser's coordinates, never is_live, then opens the event", async () => {
		createAsync.mockResolvedValue({ id: "new-id" })
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		submitCreate()
		await waitFor(() => expect(onDone).toHaveBeenCalledWith("new-id"))
		const { submission } = createAsync.mock.calls[0][0]
		expect(submission.kind).toBe("json")
		expect(submission.body).toMatchObject({
			name: "Jos Tech Meetup",
			start_time: "18:00:00",
			end_time: "20:00:00",
			latitude: 9.92,
			longitude: 8.89,
			privacy: "public",
			is_locked: false,
		})
		expect(submission.body).not.toHaveProperty("is_live")
		expect(submission.body).not.toHaveProperty("passcode")
		expect(toastSuccess).toHaveBeenCalledWith("Event created")
	})

	it("a passcode stays a string (leading zeros) and forces private", async () => {
		createAsync.mockResolvedValue({ id: "new-id" })
		const user = userEvent.setup()
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		await user.click(screen.getByRole("switch", { name: /Require a passcode/ }))
		// privacy choices go away: a locked event is always private
		expect(screen.queryByText("Who can see this event")).not.toBeInTheDocument()
		await user.type(screen.getByLabelText("Passcode"), "0042")
		submitCreate()
		await waitFor(() => expect(createAsync).toHaveBeenCalled())
		const { body } = createAsync.mock.calls[0][0].submission
		expect(body.passcode).toBe("0042")
		expect(body).toMatchObject({ is_locked: true, privacy: "private" })
	})

	it("requires 4 digits for a new passcode", async () => {
		const user = userEvent.setup()
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		await user.click(screen.getByRole("switch", { name: /Require a passcode/ }))
		await user.type(screen.getByLabelText("Passcode"), "12")
		submitCreate()
		expect(await screen.findByText(/passcode/i, { selector: "[role=alert]" })).toBeInTheDocument()
		expect(createAsync).not.toHaveBeenCalled()
	})

	it("keeps everything typed after a backend rejection and shows its message", async () => {
		createAsync.mockRejectedValue({
			response: { status: 400, data: { message: "Start date cannot be after end date.", errors: null } },
		})
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fillSchedule()
		submitCreate()
		expect(await screen.findByText("Start date cannot be after end date.")).toBeInTheDocument()
		expect(screen.getByLabelText("Event name")).toHaveValue("Jos Tech Meetup")
		expect(onDone).not.toHaveBeenCalled()
	})

	it("cancel leaves without sending", () => {
		render(<EventForm mode="create" onDone={onDone} onCancel={onCancel} />)
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
		expect(onCancel).toHaveBeenCalled()
		expect(createAsync).not.toHaveBeenCalled()
	})
})

describe("EventForm — edit", () => {
	beforeEach(() => location.mockReturnValue(idle))

	it("starts from the stored event and keeps the saved location until a new one is chosen", () => {
		render(<EventForm mode="edit" details={existing} onDone={onDone} onCancel={onCancel} />)
		expect(screen.getByLabelText("Event name")).toHaveValue("Jazz night")
		expect(screen.getByText("Amuwo, Lagos")).toBeInTheDocument()
		expect(screen.getByRole("button", { name: "Update to my current location" })).toBeInTheDocument()
	})

	it("says so instead of sending an empty update", () => {
		render(<EventForm mode="edit" details={existing} onDone={onDone} onCancel={onCancel} />)
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		expect(toastInfo).toHaveBeenCalled()
		expect(updateAsync).not.toHaveBeenCalled()
	})

	it("sends only what changed, but the whole schedule when any part of it changed", async () => {
		updateAsync.mockResolvedValue({ id: "e1" })
		render(<EventForm mode="edit" details={existing} onDone={onDone} onCancel={onCancel} />)
		fill("End time", "21:00")
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
		await waitFor(() => expect(onDone).toHaveBeenCalledWith("e1"))
		const { body } = updateAsync.mock.calls[0][0].submission
		expect(body).toEqual({
			start_date: "2026-11-01",
			start_time: "18:00:00",
			end_date: "2026-11-01",
			end_time: "21:00:00",
		})
	})
})
