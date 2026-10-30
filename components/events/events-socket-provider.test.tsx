import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventsSocketProvider, useEventsSocket } from "./events-socket-provider"
import { useAuthStore } from "@/stores/auth-store"

const harness = vi.hoisted(() => ({ instances: [] as Array<{ connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; getStatus: ReturnType<typeof vi.fn> }> }))
vi.mock("@/lib/events/socket-manager", () => ({
	EventsSocketManager: class {
		connect = vi.fn().mockResolvedValue(undefined)
		disconnect = vi.fn()
		getStatus = vi.fn().mockReturnValue("connected")
		constructor(options: { onStatusChange: (status: string) => void }) {
			harness.instances.push(this)
		}
	},
}))

function Consumer() {
	const { status, manager } = useEventsSocket()
	return <div role="status">{manager ? status : "inactive"}</div>
}
const authenticated = (pkid: number, generation = 1) =>
	useAuthStore.setState({ user: { pkid } as never, isAuthenticated: true, sessionGeneration: generation })

describe("EventsSocketProvider", () => {
	beforeEach(() => {
		harness.instances.length = 0
		useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 0 })
	})
	afterEach(() => useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 0 }))

	it("stays inert without a confirmed auth provider", () => {
		authenticated(42)
		render(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
		expect(screen.getByRole("status")).toHaveTextContent("inactive")
		expect(harness.instances).toHaveLength(0)
	})

	it("connects once for the authenticated account when an auth provider is supplied", () => {
		authenticated(42)
		render(<EventsSocketProvider authProvider={{ getAuth: vi.fn().mockResolvedValue({ token: "handshake" }) }}><Consumer /></EventsSocketProvider>)
		expect(harness.instances).toHaveLength(1)
		expect(harness.instances[0].connect).toHaveBeenCalledTimes(1)
	})

	it("disconnects the previous account manager when the account generation changes", () => {
		const authProvider = { getAuth: vi.fn().mockResolvedValue({ token: "handshake" }) }
		authenticated(42)
		const { rerender } = render(<EventsSocketProvider authProvider={authProvider}><Consumer /></EventsSocketProvider>)
		const previous = harness.instances[0]
		act(() => authenticated(84, 2))
		rerender(<EventsSocketProvider authProvider={authProvider}><Consumer /></EventsSocketProvider>)
		expect(previous.disconnect).toHaveBeenCalledTimes(1)
		expect(harness.instances).toHaveLength(2)
	})

	it("disconnects on logout", () => {
		const authProvider = { getAuth: vi.fn().mockResolvedValue({ token: "handshake" }) }
		authenticated(42)
		const { rerender } = render(<EventsSocketProvider authProvider={authProvider}><Consumer /></EventsSocketProvider>)
		const manager = harness.instances[0]
		act(() => useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 2 }))
		rerender(<EventsSocketProvider authProvider={authProvider}><Consumer /></EventsSocketProvider>)
		expect(manager.disconnect).toHaveBeenCalledTimes(1)
	})
})
