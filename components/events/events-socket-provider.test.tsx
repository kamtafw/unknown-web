import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { EventsSocketProvider, useEventsSocket } from "./events-socket-provider"
import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const harness = vi.hoisted(() => ({
  instances: [] as Array<{ connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; on: ReturnType<typeof vi.fn> }>,
  unsubscribers: [] as Array<ReturnType<typeof vi.fn>>,
}))
vi.mock("@/lib/events/socket-manager", () => ({
  EventsSocketManager: class {
    connect = vi.fn().mockResolvedValue(undefined)
    disconnect = vi.fn()
    getStatus = vi.fn().mockReturnValue("connected")
    on = vi.fn(() => {
      const unsubscribe = vi.fn()
      harness.unsubscribers.push(unsubscribe)
      return unsubscribe
    })
    leaveRoom = vi.fn()
    constructor() { harness.instances.push(this) }
  },
}))
vi.mock("@/lib/events/socket-auth", () => ({
  eventsSocketAuthProvider: { getAuth: vi.fn().mockResolvedValue({ token: "handshake" }) },
}))

function Consumer() {
  const { status, manager } = useEventsSocket()
  return <div role="status">{manager ? status : "inactive"}</div>
}
const authenticated = (pkid: number, generation = 1) =>
  useAuthStore.setState({ user: { pkid } as never, isAuthenticated: true, sessionGeneration: generation })

function renderProvider() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <EventsSocketProvider><Consumer /></EventsSocketProvider>
    </QueryClientProvider>,
  )
}

describe("EventsSocketProvider", () => {
  beforeEach(() => {
    harness.instances.length = 0
    harness.unsubscribers.length = 0
    useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 0 })
  })
  afterEach(() => useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 0 }))

  it("stays inert without an authenticated account", () => {
    renderProvider()
    expect(screen.getByRole("status")).toHaveTextContent("inactive")
    expect(harness.instances).toHaveLength(0)
  })

  it("connects once for an authenticated account", () => {
    authenticated(42)
    render(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
    expect(harness.instances).toHaveLength(1)
    expect(harness.instances[0].connect).toHaveBeenCalledTimes(1)
    expect(harness.instances[0].on).toHaveBeenCalledTimes(4)
  })

  it("disconnects the previous account manager when the account generation changes", () => {
    authenticated(42)
    const { rerender } = render(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
    const previous = harness.instances[0]
    act(() => authenticated(84, 2))
    rerender(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
    expect(previous.disconnect).toHaveBeenCalledTimes(1)
    expect(harness.unsubscribers.slice(0, 4).every((unsubscribe) => unsubscribe.mock.calls.length === 1)).toBe(true)
    expect(harness.instances).toHaveLength(2)
  })

  it("disconnects on logout", () => {
    authenticated(42)
    const { rerender } = render(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
    const manager = harness.instances[0]
    act(() => useAuthStore.setState({ user: null, isAuthenticated: false, sessionGeneration: 2 }))
    rerender(<EventsSocketProvider><Consumer /></EventsSocketProvider>)
    expect(manager.disconnect).toHaveBeenCalledTimes(1)
  })
})
