import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { EventLiveAudioPublisher } from "./event-live-audio-publisher"
import { EventsSocketProvider } from "./events-socket-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"

const socketHarness = vi.hoisted(() => ({ instances: [] as Array<any> }))
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

vi.mock("@/lib/events/socket-manager", () => ({
	EventsSocketManager: class {
		handlers = new Map<string, Set<(payload: unknown) => void>>()
		connect = vi.fn().mockResolvedValue(undefined)
		disconnect = vi.fn()
		leaveRoom = vi.fn()
		getStatus = vi.fn().mockReturnValue("connected")
		on = vi.fn((event: string, handler: (payload: unknown) => void) => {
			if (!this.handlers.has(event)) this.handlers.set(event, new Set())
			this.handlers.get(event)!.add(handler)
			return () => this.handlers.get(event)?.delete(handler)
		})
		trigger(event: string, payload: unknown) {
			for (const handler of this.handlers.get(event) ?? []) handler(payload)
		}
		constructor() { socketHarness.instances.push(this) }
	},
}))
vi.mock("@/lib/events/socket-auth", () => ({
	eventsSocketAuthProvider: { getAuth: vi.fn().mockResolvedValue({ token: "test" }) },
}))

beforeEach(() => {
	socketHarness.instances.length = 0
	useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 0 })
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

function renderPublisher() {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	useAuthStore.setState({ user: { pkid: 42 } as never, isAuthenticated: true, sessionGeneration: 1 })
	return render(
		<QueryClientProvider client={queryClient}>
			<EventsSocketProvider>
				<EventLiveAudioPublisher sessionId={71} sessionStatus="live" />
			</EventsSocketProvider>
		</QueryClientProvider>,
	)
}

describe("EventLiveAudioPublisher", () => {
	it("toggles the published microphone off to mute and back on to unmute", async () => {
		renderPublisher()

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
	it("disconnects host media immediately when the server ends the session", async () => {
		renderPublisher()
		fireEvent.click(screen.getByRole("button", { name: "Connect microphone" }))
		await waitFor(() => {
			expect(screen.getByText("You are live. Your microphone is broadcasting.")).toBeInTheDocument()
		})

		socketHarness.instances[0].trigger("live:session:ended", {
			session_id: 71,
			ended_at: "2026-10-30T09:00:00Z",
		})

		await waitFor(() => {
			expect(mocks.room.disconnect).toHaveBeenCalled()
			expect(screen.getByText("The live session has ended.")).toBeInTheDocument()
		})
		expect(socketHarness.instances[0].leaveRoom).toHaveBeenCalledWith(71)
	})

})
