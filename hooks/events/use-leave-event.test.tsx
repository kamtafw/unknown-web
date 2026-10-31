import { useAuthStore } from "@/stores/auth-store"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useLeaveEvent } from "./use-leave-event"

const leaveEvent = vi.fn()
const leaveRoom = vi.fn()
vi.mock("@/lib/events/api", () => ({
  eventsApi: { leaveEvent: (...args: unknown[]) => leaveEvent(...args) },
}))
vi.mock("@/components/events/events-socket-provider", () => ({
  useEventsSocket: () => ({ manager: { leaveRoom: (...args: unknown[]) => leaveRoom(...args) } }),
}))

const ID = "3f9c1c2e-8d0a-4c53-9f3b-1b2a6a0c7d11"

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  )
  return { client, ...renderHook(() => useLeaveEvent(ID, 55), { wrapper }) }
}

beforeEach(() => {
  leaveEvent.mockReset()
  leaveRoom.mockReset()
  leaveEvent.mockResolvedValue(undefined)
  leaveRoom.mockReturnValue(true)
  useAuthStore.setState({ user: { pkid: 7, id: "me" } as never, sessionGeneration: 2 })
})

describe("useLeaveEvent", () => {
  it("persists leave before exiting the socket room and reports success", async () => {
    const order: string[] = []
    leaveEvent.mockImplementation(async () => { order.push("http") })
    leaveRoom.mockImplementation(() => { order.push("socket"); return true })
    const { result } = setup()

    let succeeded = false
    await act(async () => { succeeded = await result.current.leave() })

    expect(succeeded).toBe(true)
    expect(order).toEqual(["http", "socket"])
    expect(leaveRoom).toHaveBeenCalledWith(55)
  })

  it("does not leave the socket room or report success when the backend rejects leave", async () => {
    leaveEvent.mockRejectedValue(new Error("offline"))
    const { result } = setup()

    let succeeded = true
    await act(async () => { succeeded = await result.current.leave() })

    expect(succeeded).toBe(false)
    expect(leaveRoom).not.toHaveBeenCalled()
    expect(result.current.errorMessage).toMatch(/couldn't confirm that you left/i)
  })

  it("does not convert a confirmed backend leave into failure if socket cleanup throws", async () => {
    leaveRoom.mockImplementation(() => { throw new Error("socket unavailable") })
    const { result } = setup()

    let succeeded = false
    await act(async () => { succeeded = await result.current.leave() })

    expect(succeeded).toBe(true)
  })

  it("does not issue duplicate leave requests while one is pending", async () => {
    let resolve!: () => void
    leaveEvent.mockImplementation(() => new Promise<void>((r) => { resolve = r }))
    const { result } = setup()

    let first!: Promise<boolean>
    await act(async () => {
      first = result.current.leave()
      expect(await result.current.leave()).toBe(false)
    })
    await act(async () => { resolve(); expect(await first).toBe(true) })
    expect(leaveEvent).toHaveBeenCalledTimes(1)
  })
})
