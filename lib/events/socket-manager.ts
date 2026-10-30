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
}

type Handler<T = unknown> = (payload: T) => void

export class EventsSocketManager {
  private socket: Socket | null = null
  private connectPromise: Promise<void> | null = null
  private listeners = new Map<string, Set<Handler>>()
  private status: EventsSocketStatus = "idle"
  private generation = 0
  private readonly url: string
  private readonly authProvider: EventsSocketAuthProvider
  private readonly onStatusChange?: EventsSocketOptions["onStatusChange"]

  constructor(options: EventsSocketOptions) {
    this.url = options.url ?? process.env.NEXT_PUBLIC_EVENTS_SOCKET_URL ?? "https://socket.appscombo.com"
    this.authProvider = options.authProvider
    this.onStatusChange = options.onStatusChange
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

    const socket = io(`${this.url.replace(/\/+$/, "")}/live`, {
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

    socket.on("connect", () => this.setStatus("connected"))
    socket.on("disconnect", (reason) => {
      this.setStatus(reason === "io client disconnect" ? "disconnected" : "reconnecting")
    })
    socket.io.on("reconnect_attempt", () => this.setStatus("reconnecting"))
    socket.on("connect_error", async (error) => {
      this.setStatus("error", error.message)
      try {
        socket.auth = await this.authProvider.getAuth()
      } catch (authError) {
        this.setStatus("error", authError instanceof Error ? authError.message : "Unable to refresh Events socket authentication")
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

  disconnect(): void {
    this.generation += 1
    this.socket?.removeAllListeners()
    this.socket?.disconnect()
    this.socket = null
    this.connectPromise = null
    this.setStatus("disconnected")
  }
}
