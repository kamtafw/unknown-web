/**
 * Events owns a dedicated Socket.IO connection, independent of Messenger.
 * The Events guide specifies namespace /live and the access JWT in
 * handshake auth.token. Authentication is injected for lifecycle testability.
 */
import { io, type Socket } from "socket.io-client"

export type EventsSocketStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error"

export interface EventsSocketAuthProvider {
  getAuth(): Promise<Record<string, string>>
}

export interface EventsSocketOptions {
  url?: string
  authProvider: EventsSocketAuthProvider
  onStatusChange?: (status: EventsSocketStatus, error?: string) => void
  onRoomError?: (sessionId: number, error: Error) => void
}

type Handler<T = unknown> = (payload: T) => void

export type EventsRoomRevalidator = () => Promise<boolean>

export class EventsSocketRoomJoinError extends Error {
  constructor(
    message: string,
    readonly sessionId: number,
    readonly code: string | null = null,
  ) {
    super(message)
    this.name = "EventsSocketRoomJoinError"
  }
}

interface RoomMembership {
  revalidate: EventsRoomRevalidator
}

const ROOM_ACK_TIMEOUT_MS = 10_000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asError(value: unknown): Error {
  return value instanceof Error ? value : new Error("Events room membership could not be restored")
}

export class EventsSocketManager {
  private socket: Socket | null = null
  private connectPromise: Promise<void> | null = null
  private restorePromise: Promise<void> | null = null
  private listeners = new Map<string, Set<Handler>>()
  private roomMemberships = new Map<number, RoomMembership>()
  private joinedRooms = new Set<number>()
  private roomJoinPromises = new Map<number, Promise<void>>()
  private roomVersions = new Map<number, number>()
  private status: EventsSocketStatus = "idle"
  private generation = 0
  private readonly url: string
  private readonly authProvider: EventsSocketAuthProvider
  private readonly onStatusChange?: EventsSocketOptions["onStatusChange"]
  private readonly onRoomError?: EventsSocketOptions["onRoomError"]

  constructor(options: EventsSocketOptions) {
    this.url = options.url ?? process.env.NEXT_PUBLIC_EVENTS_SOCKET_URL ?? "https://socket.appscombo.com"
    this.authProvider = options.authProvider
    this.onStatusChange = options.onStatusChange
    this.onRoomError = options.onRoomError
  }

  getStatus(): EventsSocketStatus { return this.status }

  private setStatus(status: EventsSocketStatus, error?: string): void {
    this.status = status
    this.onStatusChange?.(status, error)
  }

  connect(): Promise<void> {
    if (this.socket?.connected) return Promise.resolve()
    if (this.connectPromise) return this.connectPromise
    const generation = this.generation
    const pending = this.openSocket(generation).finally(() => {
      if (this.connectPromise === pending) this.connectPromise = null
    })
    this.connectPromise = pending
    return pending
  }

  private async openSocket(generation: number): Promise<void> {
    this.setStatus("connecting")
    const auth = await this.authProvider.getAuth()
    if (generation !== this.generation) return

    const socket = io(`${this.url.replace(/\\/+$/, "")}/live`, {
      path: "/socket.io",
      transports: ["websocket"],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      auth,
    })
    this.socket = socket
    for (const [event, handlers] of this.listeners) {
      for (const handler of handlers) socket.on(event, handler)
    }

    socket.on("connect", () => {
      if (generation !== this.generation || this.socket !== socket) return
      this.setStatus("connected")
      // A transport reconnect restores only memberships that still pass the
      // caller's HTTP-backed admission check. Never replay a room blindly.
      void this.rejoinRooms()
    })
    socket.on("disconnect", (reason) => {
      if (generation !== this.generation || this.socket !== socket) return
      this.joinedRooms.clear()
      this.setStatus(reason === "io client disconnect" ? "disconnected" : "reconnecting")
    })
    socket.io.on("reconnect_attempt", () => {
      if (generation === this.generation && this.socket === socket) this.setStatus("reconnecting")
    })
    socket.on("connect_error", async (error) => {
      if (generation !== this.generation || this.socket !== socket) return
      this.setStatus("error", error.message)
      try {
        socket.auth = await this.authProvider.getAuth()
      } catch (authError) {
        if (generation === this.generation && this.socket === socket) {
          this.setStatus("error", authError instanceof Error ? authError.message : "Unable to refresh Events socket authentication")
        }
      }
    })

    await new Promise<void>((resolve, reject) => {
      socket.once("connect", () => resolve())
      socket.once("connect_error", reject)
    })
  }

  on<T = unknown>(event: string, handler: Handler<T>): () => void {
    const typedHandler = handler as Handler
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(typedHandler)
    this.socket?.on(event, typedHandler)
    return () => {
      this.listeners.get(event)?.delete(typedHandler)
      this.socket?.off(event, typedHandler)
      if (this.listeners.get(event)?.size === 0) this.listeners.delete(event)
    }
  }

  emit(event: string, payload?: unknown): boolean {
    if (!this.socket?.connected) return false
    this.socket.emit(event, payload)
    return true
  }

  /**
   * Join a live room only after the caller has completed HTTP event admission.
   * The callback is retained for reconnects and must re-check that the viewer
   * remains an active participant (normally via GET event live-session and
   * the session's isJoined field). It is never called before the initial join.
   */
  joinRoom(sessionId: number, revalidate: EventsRoomRevalidator): Promise<void> {
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      return Promise.reject(new EventsSocketRoomJoinError("Invalid live session id", sessionId))
    }
    const socket = this.socket
    if (!socket?.connected) {
      return Promise.reject(new EventsSocketRoomJoinError("Events socket is not connected", sessionId))
    }
    if (this.joinedRooms.has(sessionId) && this.roomMemberships.has(sessionId)) return Promise.resolve()
    const pendingJoin = this.roomJoinPromises.get(sessionId)
    if (pendingJoin) return pendingJoin

    const generation = this.generation
    const version = (this.roomVersions.get(sessionId) ?? 0) + 1
    this.roomVersions.set(sessionId, version)
    const pending = this.emitRoomJoin(socket, sessionId, generation).then(() => {
      if (
        generation === this.generation &&
        socket === this.socket &&
        this.roomVersions.get(sessionId) === version
      ) {
        this.roomMemberships.set(sessionId, { revalidate })
        this.joinedRooms.add(sessionId)
      }
    }).finally(() => {
      if (this.roomJoinPromises.get(sessionId) === pending) this.roomJoinPromises.delete(sessionId)
    })
    this.roomJoinPromises.set(sessionId, pending)
    return pending
  }

  /**
   * Leave the socket room only. This does not call the HTTP event-leave route
   * and does not persist guest departure. The caller owns that separate action.
   */
  leaveRoom(sessionId: number): boolean {
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) return false
    this.roomVersions.set(sessionId, (this.roomVersions.get(sessionId) ?? 0) + 1)
    this.roomMemberships.delete(sessionId)
    this.joinedRooms.delete(sessionId)
    if (!this.socket?.connected) return false
    this.socket.emit("live:leave", { sessionId })
    return true
  }

  /** Retry pending room recovery after a transient revalidation or ack failure. */
  rejoinRooms(): Promise<void> {
    if (this.restorePromise) return this.restorePromise
    const generation = this.generation
    const pending = this.restoreRoomMemberships(generation).finally(() => {
      if (this.restorePromise === pending) this.restorePromise = null
    })
    this.restorePromise = pending
    return pending
  }

  private async restoreRoomMemberships(generation: number): Promise<void> {
    const socket = this.socket
    if (!socket?.connected) return

    for (const [sessionId, membership] of [...this.roomMemberships.entries()]) {
      if (generation !== this.generation || socket !== this.socket || !socket.connected) return
      if (this.roomMemberships.get(sessionId) !== membership) continue
      this.joinedRooms.delete(sessionId)

      let authorized: boolean
      try {
        authorized = await membership.revalidate()
      } catch (error) {
        this.onRoomError?.(sessionId, asError(error))
        continue
      }

      if (generation !== this.generation || socket !== this.socket || !socket.connected) return
      if (this.roomMemberships.get(sessionId) !== membership) continue
      if (!authorized) {
        this.roomMemberships.delete(sessionId)
        continue
      }

      try {
        await this.emitRoomJoin(socket, sessionId, generation)
        if (
          generation === this.generation &&
          socket === this.socket &&
          socket.connected &&
          this.roomMemberships.get(sessionId) === membership
        ) {
          this.joinedRooms.add(sessionId)
        }
      } catch (error) {
        if (error instanceof EventsSocketRoomJoinError && error.code === "live_room_unauthorized") {
          this.roomMemberships.delete(sessionId)
        }
        this.onRoomError?.(sessionId, asError(error))
      }
    }
  }

  private async emitRoomJoin(socket: Socket, sessionId: number, generation: number): Promise<void> {
    if (generation !== this.generation || socket !== this.socket || !socket.connected) {
      throw new EventsSocketRoomJoinError("Events socket is not connected", sessionId)
    }

    const acknowledgement = await new Promise<unknown>((resolve, reject) => {
      socket.timeout(ROOM_ACK_TIMEOUT_MS).emit(
        "live:join",
        { sessionId },
        (error: Error | null, response: unknown) => {
          if (error) reject(error)
          else resolve(response)
        },
      )
    })

    if (generation !== this.generation || socket !== this.socket) {
      throw new EventsSocketRoomJoinError("Events socket changed during room admission", sessionId)
    }
    if (!isRecord(acknowledgement) || acknowledgement.sessionId !== sessionId || typeof acknowledgement.ok !== "boolean") {
      throw new EventsSocketRoomJoinError("Events room acknowledgement was invalid", sessionId)
    }
    if (acknowledgement.ok !== true) {
      const code = typeof acknowledgement.code === "string" ? acknowledgement.code : null
      throw new EventsSocketRoomJoinError(
        code === "live_room_unauthorized" ? "You are not authorized to join this live session" : "Events room admission was rejected",
        sessionId,
        code,
      )
    }
  }

  disconnect(): void {
    this.generation += 1
    this.roomMemberships.clear()
    this.joinedRooms.clear()
    this.roomVersions.clear()
    this.roomJoinPromises.clear()
    this.restorePromise = null
    this.socket?.removeAllListeners()
    this.socket?.disconnect()
    this.socket = null
    this.connectPromise = null
    this.setStatus("disconnected")
  }
}
