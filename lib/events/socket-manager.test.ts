import { beforeEach, describe, expect, it, vi } from "vitest"

const socketHarness = vi.hoisted(() => {
  class FakeSocket {
    connected = false
    auth: Record<string, string>
    handlers = new Map<string, Set<(...args: unknown[]) => unknown>>()
    io = {
      handlers: new Map<string, Set<(...args: unknown[]) => unknown>>(),
      on: (event: string, handler: (...args: unknown[]) => unknown) => {
        const set = this.io.handlers.get(event) ?? new Set()
        set.add(handler)
        this.io.handlers.set(event, set)
      },
      trigger: (event: string, ...args: unknown[]) => {
        for (const handler of this.io.handlers.get(event) ?? []) handler(...args)
      },
    }
    emitted: Array<{ event: string; payload: unknown }> = []
    disconnected = false

    constructor(auth: Record<string, string>) {
      this.auth = auth
    }

    on(event: string, handler: (...args: unknown[]) => unknown) {
      const set = this.handlers.get(event) ?? new Set()
      set.add(handler)
      this.handlers.set(event, set)
      return this
    }

    once(event: string, handler: (...args: unknown[]) => unknown) {
      const wrapped = (...args: unknown[]) => {
        this.off(event, wrapped)
        handler(...args)
      }
      return this.on(event, wrapped)
    }

    off(event: string, handler: (...args: unknown[]) => unknown) {
      this.handlers.get(event)?.delete(handler)
      return this
    }

    emit(event: string, payload?: unknown) {
      this.emitted.push({ event, payload })
      return this
    }

    trigger(event: string, ...args: unknown[]) {
      for (const handler of [...(this.handlers.get(event) ?? [])]) {
        handler(...args)
      }
    }

    removeAllListeners() {
      this.handlers.clear()
      return this
    }

    disconnect() {
      this.connected = false
      this.disconnected = true
      return this
    }
  }

  const sockets: FakeSocket[] = []
  const io = vi.fn((_url: string, options: { auth: Record<string, string> }) => {
    const socket = new FakeSocket(options.auth)
    sockets.push(socket)
    return socket
  })
  return { FakeSocket, sockets, io }
})

vi.mock("socket.io-client", () => ({
  io: socketHarness.io,
}))

import { EventsSocketManager } from "./socket-manager"

describe("EventsSocketManager", () => {
  beforeEach(() => {
    socketHarness.sockets.length = 0
    socketHarness.io.mockClear()
  })

  it("creates an independent websocket connection with the injected handshake auth", async () => {
    const getAuth = vi.fn().mockResolvedValue({ token: "fresh-token" })
    const manager = new EventsSocketManager({
      url: "https://events.example.test",
      authProvider: { getAuth },
    })

    const connecting = manager.connect()
    expect(manager.getStatus()).toBe("connecting")
    await vi.waitFor(() => expect(socketHarness.io).toHaveBeenCalled())
    expect(socketHarness.io).toHaveBeenCalledWith(
      "https://events.example.test/live",
      expect.objectContaining({
        path: "/socket.io",
        transports: ["websocket"],
        forceNew: true,
        auth: { token: "fresh-token" },
      }),
    )

    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    socket.connected = true
    socket.trigger("connect")
    await expect(connecting).resolves.toBeUndefined()
    expect(manager.getStatus()).toBe("connected")
    expect(getAuth).toHaveBeenCalledTimes(1)
  })

  it("attaches listeners registered before connect and supports unsubscribe", async () => {
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn().mockResolvedValue({ token: "x" }) },
    })
    const handler = vi.fn()
    const unsubscribe = manager.on("live:updated", handler)

    const connecting = manager.connect()
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    socket.connected = true
    socket.trigger("connect")
    await connecting

    socket.trigger("live:updated", { live: true })
    expect(handler).toHaveBeenCalledWith({ live: true })

    unsubscribe()
    socket.trigger("live:updated", { live: false })
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it("returns false rather than queueing emits while disconnected", () => {
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn() },
    })
    expect(manager.emit("live:join", { session_id: 12 })).toBe(false)
  })

  it("emits only while connected", async () => {
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn().mockResolvedValue({ token: "x" }) },
    })
    const connecting = manager.connect()
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    socket.connected = true
    socket.trigger("connect")
    await connecting

    expect(manager.emit("live:join", { session_id: 12 })).toBe(true)
    expect(socket.emitted).toEqual([
      { event: "live:join", payload: { session_id: 12 } },
    ])
  })

  it("refreshes handshake auth after a connection error for the next attempt", async () => {
    const getAuth = vi
      .fn()
      .mockResolvedValueOnce({ token: "initial" })
      .mockResolvedValueOnce({ token: "refreshed" })
    const manager = new EventsSocketManager({
      authProvider: { getAuth },
    })
    const connecting = manager.connect()
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]

    // Attach the rejection assertion before triggering connect_error so Vitest
    // observes the expected rejection immediately rather than reporting it as
    // an unhandled rejection while the auth-refresh assertion is pending.
    const connectionFailure = expect(connecting).rejects.toThrow("expired")
    socket.trigger("connect_error", new Error("expired"))
    await vi.waitFor(() => {
      expect(socket.auth).toEqual({ token: "refreshed" })
    })
    await connectionFailure
    expect(manager.getStatus()).toBe("error")
  })

  it("disconnects explicitly and reports the disconnected state", async () => {
    const onStatusChange = vi.fn()
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn().mockResolvedValue({ token: "x" }) },
      onStatusChange,
    })
    const connecting = manager.connect()
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    socket.connected = true
    socket.trigger("connect")
    await connecting

    manager.disconnect()
    expect(socket.disconnected).toBe(true)
    expect(manager.getStatus()).toBe("disconnected")
    expect(onStatusChange).toHaveBeenLastCalledWith("disconnected", undefined)
    expect(manager.emit("live:join", {})).toBe(false)
  })

  it("does not create a stale connection when disconnected during auth lookup", async () => {
    let resolveAuth!: (value: Record<string, string>) => void
    const getAuth = vi.fn(
      () =>
        new Promise<Record<string, string>>((resolve) => {
          resolveAuth = resolve
        }),
    )
    const manager = new EventsSocketManager({
      authProvider: { getAuth },
    })

    const connecting = manager.connect()
    manager.disconnect()
    resolveAuth({ token: "old-account-token" })
    await connecting

    expect(socketHarness.io).not.toHaveBeenCalled()
    expect(manager.getStatus()).toBe("disconnected")
  })

  it("does not let a cancelled attempt clear a newer in-flight connection", async () => {
    const resolvers: Array<(value: Record<string, string>) => void> = []
    const getAuth = vi.fn(
      () =>
        new Promise<Record<string, string>>((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const manager = new EventsSocketManager({
      authProvider: { getAuth },
    })

    const oldAttempt = manager.connect()
    manager.disconnect()
    const currentAttempt = manager.connect()

    resolvers[0]({ token: "old-account" })
    await oldAttempt
    expect(socketHarness.io).not.toHaveBeenCalled()

    resolvers[1]({ token: "current-account" })
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    socket.connected = true
    socket.trigger("connect")
    await currentAttempt

    expect(socket.auth).toEqual({ token: "current-account" })
    expect(manager.getStatus()).toBe("connected")
  })
})
