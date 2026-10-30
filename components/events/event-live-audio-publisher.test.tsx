import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveAudioPublisher } from "./event-live-audio-publisher"

const mocks = vi.hoisted(() => ({
	setMicrophoneEnabled: vi.fn(),
	connect: vi.fn(),
	disconnect: vi.fn(),
	room: {
		name: "test-room",
		localParticipant: {
			identity: "host-identity",
			setMicrophoneEnabled: vi.fn(),
		},
		on: vi.fn(),
		connect: vi.fn(),
		disconnect: vi.fn(),
	},
}))

vi.mock("livekit-client", () => ({
	Room: vi.fn(function () { return mocks.room }),
	RoomEvent: { Disconnected: "disconnected" },
}))

beforeEach(() => {
	vi.clearAllMocks()
	mocks.room.name = "test-room"
	mocks.room.localParticipant.identity = "host-identity"
	mocks.room.connect.mockResolvedValue(undefined)
	mocks.room.disconnect.mockResolvedValue(undefined)
	mocks.room.localParticipant.setMicrophoneEnabled.mockResolvedValue(undefined)
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
		ok: true,
		status: 200,
		json: async () => ({
			data: {
				server_url: "wss://media.example.test",
				token: "test-token",
				room: "test-room",
				identity: "host-identity",
				permissions: { can_subscribe: true, can_publish_microphone: true },
			},
		}),
	}))
	Object.defineProperty(window, "isSecureContext", { configurable: true, value: true })
	Object.defineProperty(navigator, "mediaDevices", {
		configurable: true,
		value: { getUserMedia: vi.fn() },
	})
})

describe("EventLiveAudioPublisher", () => {
	it("toggles the published microphone off to mute and back on to unmute", async () => {
		render(<EventLiveAudioPublisher sessionId={71} sessionStatus="live" />)

		// The publisher is intentionally idle on mount; the host must explicitly
		// grant microphone access by choosing Connect microphone.
		fireEvent.click(screen.getByRole("button", { name: "Connect microphone" }))

		await waitFor(() => {
			expect(screen.getByText("You are live. Your microphone is broadcasting.")).toBeInTheDocument()
		})
		expect(mocks.room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(true)

		fireEvent.click(screen.getByRole("button", { name: "Mute microphone" }))
		await waitFor(() => {
			expect(screen.getByText("Your microphone is muted.")).toBeInTheDocument()
		})
		expect(mocks.room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(false)

		fireEvent.click(screen.getByRole("button", { name: "Unmute microphone" }))
		await waitFor(() => {
			expect(screen.getByText("Your microphone is broadcasting.")).toBeInTheDocument()
		})
		expect(mocks.room.localParticipant.setMicrophoneEnabled).toHaveBeenLastCalledWith(true)
	})
})
