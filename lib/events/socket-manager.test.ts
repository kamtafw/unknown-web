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
    acknowledgements: Array<(error: Error | null, response?: unknown) => void> = []
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

    timeout() {
      return {
        emit: (event: string, payload: unknown, acknowledgement: (error: Error | null, response?: unknown) => void) => {
          this.emitted.push({ event, payload })
          this.acknowledgements.push(acknowledgement)
          return this
        },
      }
    }

    acknowledgeNext(response: unknown) {
      const acknowledgement = this.acknowledgements.shift()
      if (!acknowledgement) throw new Error("No pending socket acknowledgement")
      acknowledgement(null, response)
    }

    failNextAcknowledgement(error: Error) {
      const acknowledgement = this.acknowledgements.shift()
      if (!acknowledgement) throw new Error("No pending socket acknowledgement")
      acknowledgement(error)
    }

    trigger(event: string, ...args: unknown[]) {
      for (const handler of [...(this.handlers.get(event) ?? [])]) handler(...args)
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

import { EventsSocketManager, EventsSocketRoomJoinError } from "./socket-manager"

const roomDescriptor = (sessionId: number) => ({
  namespace: "/live",
  joinEvent: "live:join",
  sessionId,
} as const)

async function connectManager(options: {
  getAuth?: ReturnType<typeof vi.fn>
  onRoomError?: ReturnType<typeof vi.fn>
  onReconnect?: ReturnType<typeof vi.fn>
} = {}) {
  const manager = new EventsSocketManager({
    authProvider: { getAuth: options.getAuth ?? vi.fn().mockResolvedValue({ token: "x" }) },
    onRoomError: options.onRoomError,
    onReconnect: options.onReconnect,
  })
  const connecting = manager.connect()
  await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
  const socket = socketHarness.sockets[0]
  socket.connected = true
  socket.trigger("connect")
  await connecting
  return { manager, socket }
}

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

  it("signals only successful transport reconnections, not the initial connect", async () => {
    const onReconnect = vi.fn()
    const { socket } = await connectManager({ onReconnect })
    expect(onReconnect).not.toHaveBeenCalled()

    socket.connected = false
    socket.trigger("disconnect", "transport close")
    socket.connected = true
    socket.trigger("connect")

    expect(onReconnect).toHaveBeenCalledTimes(1)
  })

  it("reconciles when the first successful connection follows a retry attempt", async () => {
    const onReconnect = vi.fn()
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn().mockResolvedValue({ token: "x" }) },
      onReconnect,
    })
    const connecting = manager.connect()
    await vi.waitFor(() => expect(socketHarness.sockets).toHaveLength(1))
    const socket = socketHarness.sockets[0]
    const failure = new Error("temporary connection failure")
    socket.trigger("connect_error", failure)
    await expect(connecting).rejects.toBe(failure)

    socket.io.trigger("reconnect_attempt")
    socket.connected = true
    socket.trigger("connect")

    expect(onReconnect).toHaveBeenCalledTimes(1)
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
    const { manager, socket } = await connectManager()
    expect(manager.emit("live:custom", { value: 12 })).toBe(true)
    expect(socket.emitted).toEqual([{ event: "live:custom", payload: { value: 12 } }])
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

    const connectionFailure = expect(connecting).rejects.toThrow("expired")
    socket.trigger("connect_error", new Error("expired"))
    await vi.waitFor(() => {
      expect(socket.auth).toEqual({ token: "refreshed" })
    })
    await connectionFailure
    expect(manager.getStatus()).toBe("error")
  })

  it("joins only with a positive session id and a matching successful acknowledgement", async () => {
    const { manager, socket } = await connectManager()
    const revalidate = vi.fn().mockResolvedValue(true)
    await expect(
      manager.joinRoom({ ...roomDescriptor(55), namespace: "/chat" } as never, revalidate),
    ).rejects.toThrow("Invalid live socket descriptor")
    expect(socket.emitted).toHaveLength(0)
    const joined = manager.joinRoom(roomDescriptor(55), revalidate)

    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    expect(socket.emitted.at(-1)).toEqual({ event: "live:join", payload: { sessionId: 55 } })
    expect(manager.getRoomStatus(55)).toBe("joining")
    expect(revalidate).not.toHaveBeenCalled()
    socket.acknowledgeNext({ ok: true, sessionId: 55 })
    await expect(joined).resolves.toBeUndefined()
    expect(manager.getRoomStatus(55)).toBe("joined")

    await expect(manager.joinRoom(roomDescriptor(55), revalidate)).resolves.toBeUndefined()
    expect(socket.acknowledgements).toHaveLength(0)
    await expect(manager.joinRoom(roomDescriptor(0), revalidate)).rejects.toBeInstanceOf(EventsSocketRoomJoinError)
  })

  it("rejects unauthorized or malformed room acknowledgements without retaining membership", async () => {
    const { manager, socket } = await connectManager()
    const revalidate = vi.fn().mockResolvedValue(true)
    const unauthorized = manager.joinRoom(roomDescriptor(56), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: false, sessionId: 56, code: "live_room_unauthorized" })
    await expect(unauthorized).rejects.toMatchObject({ code: "live_room_unauthorized", sessionId: 56 })
    expect(manager.getRoomStatus(56)).toBe("not_admitted")

    const malformed = manager.joinRoom(roomDescriptor(57), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 999 })
    await expect(malformed).rejects.toThrow("acknowledgement was invalid")
  })

  it("rejects a room join while the transport is disconnected", async () => {
    const manager = new EventsSocketManager({
      authProvider: { getAuth: vi.fn().mockResolvedValue({ token: "x" }) },
    })
    await expect(manager.joinRoom(roomDescriptor(58), vi.fn().mockResolvedValue(true))).rejects.toThrow("not connected")
  })

  it("revokes local room membership when live:error reports live_room_unauthorized", async () => {
    const onRoomError = vi.fn()
    const { manager, socket } = await connectManager({ onRoomError })
    const joined = manager.joinRoom(roomDescriptor(66), vi.fn().mockResolvedValue(true))
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 66 })
    await joined
    expect(manager.getRoomStatus(66)).toBe("joined")

    socket.trigger("live:error", { event: "live:comment", code: "comment_rejected", sessionId: 66 })
    expect(manager.getRoomStatus(66)).toBe("joined")
    expect(onRoomError).not.toHaveBeenCalled()

    socket.trigger("live:error", {
      event: "live:join",
      code: "live_room_unauthorized",
      sessionId: 66,
    })

    expect(manager.getRoomStatus(66)).toBe("not_admitted")
    expect(onRoomError).toHaveBeenCalledWith(
      66,
      expect.objectContaining({ code: "live_room_unauthorized", sessionId: 66 }),
    )
  })

  it("leaves the socket room without invoking event leave", async () => {
    const { manager, socket } = await connectManager()
    const joined = manager.joinRoom(roomDescriptor(59), vi.fn().mockResolvedValue(true))
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 59 })
    await joined

    expect(manager.leaveRoom(59)).toBe(true)
    expect(manager.getRoomStatus(59)).toBe("idle")
    expect(socket.emitted.at(-1)).toEqual({ event: "live:leave", payload: { sessionId: 59 } })
    expect(manager.leaveRoom(0)).toBe(false)
  })

  it("revalidates membership before rejoining after a transport reconnect", async () => {
    const { manager, socket } = await connectManager()
    const revalidate = vi.fn().mockResolvedValue(true)
    const joined = manager.joinRoom(roomDescriptor(60), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 60 })
    await joined

    socket.connected = false
    socket.trigger("disconnect", "transport close")
    expect(manager.getRoomStatus(60)).toBe("rejoining")
    socket.connected = true
    socket.trigger("connect")

    await vi.waitFor(() => expect(revalidate).toHaveBeenCalledTimes(1))
    expect(manager.getRoomStatus(60)).toBe("rejoining")
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    expect(socket.emitted.at(-1)).toEqual({ event: "live:join", payload: { sessionId: 60 } })
    socket.acknowledgeNext({ ok: true, sessionId: 60 })
    await manager.rejoinRooms()
    expect(manager.getRoomStatus(60)).toBe("joined")
  })

  it("does not let a caller bypass revalidation while a retained room is recovering", async () => {
    const { manager, socket } = await connectManager()
    let resolveRevalidation!: (allowed: boolean) => void
    const revalidate = vi.fn(() => new Promise<boolean>((resolve) => { resolveRevalidation = resolve }))
    const joined = manager.joinRoom(roomDescriptor(65), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 65 })
    await joined

    socket.connected = false
    socket.trigger("disconnect", "transport close")
    socket.connected = true
    socket.trigger("connect")
    await vi.waitFor(() => expect(revalidate).toHaveBeenCalledTimes(1))

    // A second caller must share the recovery operation, not issue a new join.
    const recovering = manager.joinRoom(roomDescriptor(65), revalidate)
    expect(socket.emitted.filter((item) => item.event === "live:join")).toHaveLength(1)
    resolveRevalidation(true)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 65 })
    await expect(recovering).resolves.toBeUndefined()
    expect(manager.getRoomStatus(65)).toBe("joined")
  })

  it("does not rejoin when the HTTP-backed membership check says access was lost", async () => {
    const { manager, socket } = await connectManager()
    const revalidate = vi.fn().mockResolvedValue(true)
    const joined = manager.joinRoom(roomDescriptor(61), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 61 })
    await joined

    revalidate.mockResolvedValue(false)
    socket.connected = false
    socket.trigger("disconnect", "transport close")
    socket.connected = true
    socket.trigger("connect")
    await vi.waitFor(() => expect(revalidate).toHaveBeenCalledTimes(1))
    await manager.rejoinRooms()

    expect(socket.emitted.filter((item) => item.event === "live:join")).toHaveLength(1)
    expect(manager.getRoomStatus(61)).toBe("not_admitted")
    expect(revalidate).toHaveBeenCalledTimes(1)
  })

  it("keeps a room pending after a transient revalidation failure and reports it for retry", async () => {
    const onRoomError = vi.fn()
    const { manager, socket } = await connectManager({ onRoomError })
    const revalidate = vi.fn().mockResolvedValue(true)
    const joined = manager.joinRoom(roomDescriptor(62), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 62 })
    await joined

    revalidate.mockRejectedValueOnce(new Error("temporary API failure"))
    socket.connected = false
    socket.trigger("disconnect", "transport close")
    socket.connected = true
    socket.trigger("connect")
    await vi.waitFor(() => expect(onRoomError).toHaveBeenCalledWith(62, expect.any(Error)))

    revalidate.mockResolvedValue(true)
    const retry = manager.rejoinRooms()
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 62 })
    await retry
    expect(socket.emitted.filter((item) => item.event === "live:join")).toHaveLength(2)
  })

  it("does not replay membership after explicit disconnect", async () => {
    const { manager, socket } = await connectManager()
    const revalidate = vi.fn().mockResolvedValue(true)
    const joined = manager.joinRoom(roomDescriptor(63), revalidate)
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    socket.acknowledgeNext({ ok: true, sessionId: 63 })
    await joined

    manager.disconnect()
    expect(manager.getStatus()).toBe("disconnected")
    expect(revalidate).not.toHaveBeenCalled()
  })

  it("does not retain a room join that was explicitly left while its acknowledgement was pending", async () => {
    const { manager, socket } = await connectManager()
    const joined = manager.joinRoom(roomDescriptor(64), vi.fn().mockResolvedValue(true))
    await vi.waitFor(() => expect(socket.acknowledgements).toHaveLength(1))
    expect(manager.leaveRoom(64)).toBe(true)
    socket.acknowledgeNext({ ok: true, sessionId: 64 })
    await joined

    socket.connected = false
    socket.trigger("disconnect", "transport close")
    socket.connected = true
    socket.trigger("connect")
    await manager.rejoinRooms()
    expect(socket.emitted.filter((item) => item.event === "live:join")).toHaveLength(1)
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
