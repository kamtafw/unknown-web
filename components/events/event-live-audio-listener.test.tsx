import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveAudioListener } from "./event-live-audio-listener"

vi.mock("livekit-client", () => ({
	Room: vi.fn(),
	RoomEvent: {},
	Track: { Kind: { Audio: "audio" } },
}))

const fetchMock = vi.fn()

beforeEach(() => {
	fetchMock.mockReset()
	vi.stubGlobal("fetch", fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe("EventLiveAudioListener presentation", () => {
	it("labels a failed connection in plain words and keeps Reconnect wired to a new attempt", async () => {
		fetchMock.mockResolvedValue({ ok: false, status: 403, json: async () => null })
		render(<EventLiveAudioListener sessionId={7} />)

		expect(await screen.findByText("You don't have access to this live audio.")).toBeInTheDocument()
		expect(screen.getByText("Couldn't connect")).toBeInTheDocument()
		// the raw state word and the track counter are not shown
		expect(screen.queryByText("error")).not.toBeInTheDocument()
		expect(screen.queryByText(/Audio tracks playing/)).not.toBeInTheDocument()

		fetchMock.mockClear()
		fireEvent.click(screen.getByRole("button", { name: "Reconnect" }))
		await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce())
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/events/live-sessions/7/media-credentials",
			expect.objectContaining({ method: "POST" }),
		)
	})

	it("shows a connecting label while access is requested", () => {
		fetchMock.mockReturnValue(new Promise(() => {}))
		render(<EventLiveAudioListener sessionId={7} />)

		expect(screen.getByRole("region", { name: "Live audio listener" })).toBeInTheDocument()
		expect(screen.getByText("Connecting")).toBeInTheDocument()
		expect(screen.getByText("Requesting live audio access…")).toBeInTheDocument()
		expect(screen.queryByRole("button", { name: "Reconnect" })).not.toBeInTheDocument()
	})
})
