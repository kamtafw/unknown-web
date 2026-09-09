/**
 * Messenger socket lifecycle manager.
 *
 * This is the Foundation boundary described in the M0 plan: connect,
 * reconnect, re-authenticate, room join/rejoin, listener cleanup, and
 * disconnect-on-logout — all behind one interface, so that:
 *
 *   1. swapping the auth mechanism (ADR-003) only touches socket-auth.ts;
 *   2. swapping single-socket vs. per-feature-socket topology (open
 *      question, see docs/messenger/decisions/ADR-002) only touches this
 *      file — feature hooks call `messengerSocket.on(...)` /
 *      `.emit(...)` and never construct an `io()` connection themselves.
 *
 * Current topology: ONE connection for chat + group + (later) call/live
 * events, per the guide's explicit recommendation. This is a working
 * hypothesis, not a confirmed fact — see the smoke test in
 * scripts/messenger-socket-smoke-test.ts and
 * docs/messenger/decisions/ADR-002-socket-lifecycle.md. If the backend
 * turns out to require separate connections per feature, only the
 * internals of `connect()` below need to change to open multiple `Socket`
 * instances — the public interface (`on`/`emit`/`joinRoom`) doesn't have
 * to.
 */

import { useMessengerConnectionStore } from "@/stores/messenger-connection.store"
import { io, Socket } from "socket.io-client"
import { socketAuthProvider } from "./socket-auth"

const SOCKET_URL = process.env.NEXT_PUBLIC_MESSENGER_SOCKET_URL ?? "https://socket.appscombo.com"

type EventHandler<T = unknown> = (payload: T) => void

class MessengerSocketManager {
	private socket: Socket | null = null
	private connectPromise: Promise<void> | null = null
	/** replay functions for room joins, keyed so a feature can re-register
	 * without duplicating; replayed on every `connect` event, including
	 * reconnects — room membership belongs to the old connection and is
	 * lost when it drops (confirmed by the guide, SN"Group socket events"). */
	private roomJoins = new Map<string, () => void>()

	/**
	 * BUG FIX (2026-08-14): `doConnect()` awaits a real HTTP round-trip
	 * (the credential fetch) before `this.socket` is ever assigned. Any
	 * `on()` call made during that window used to silently no-op — nothing
	 * remembered it, so once the socket *did* connect a moment later, that
	 * listener was simply never attached. This was intermittent by nature
	 * (whether a given caller's effect ran before or after the credential
	 * fetch resolved), which is exactly the "typing never shows / messages
	 * arrive inconsistently" symptom reported after real-world testing.
	 *
	 * Fix: `on()` always registers here first, and attaches to `this.socket`
	 * immediately only if it already exists. Whenever a socket is (re)created
	 * in `doConnect()`, every registered listener is replayed onto it — so
	 * call order relative to `connect()` completing no longer matters.
	 */
	private listeners = new Map<string, Set<EventHandler>>()

	connect(): Promise<void> {
		if (this.socket?.connected) return Promise.resolve()
		if (this.connectPromise) return this.connectPromise

		this.connectPromise = this.doConnect().finally(() => {
			this.connectPromise = null
		})
		return this.connectPromise
	}

	private async doConnect(): Promise<void> {
		useMessengerConnectionStore.getState().setStatus("connecting")

		const connectAuth = await socketAuthProvider.getConnectAuth()

		this.socket = io(SOCKET_URL, {
			path: "/socket.io",
			transports: ["websocket"],
			forceNew: true,
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 10000,
			auth: connectAuth.auth,
			query: connectAuth.query,
		})

		// Re-attach every listener registered via on() before this socket
		// existed — see the class-level comment on `listeners`.
		for (const [event, handlers] of this.listeners) {
			for (const handler of handlers) this.socket.on(event, handler)
		}

		this.bindLifecycleEvents(this.socket)

		await new Promise<void>((resolve, reject) => {
			this.socket!.once("connect", () => resolve())
			this.socket!.once("connect_error", (err) => reject(err))
		})
	}

	private bindLifecycleEvents(socket: Socket) {
		socket.on("connect", () => {
			useMessengerConnectionStore.getState().setStatus("connected")
			this.replayRoomJoins()
		})

		socket.on("disconnect", (reason) => {
			const deliberate = reason === "io client disconnect"
			useMessengerConnectionStore.getState().setStatus(deliberate ? "disconnected" : "reconnecting")
		})

		socket.on("reconnect_attempt", () => {
			useMessengerConnectionStore.getState().setStatus("reconnecting")
		})

		// re-authenticate before the next reconnecting attempt rather than
		// waiting for an explicit "your token expired signal" — cheap and
		// covers the access-token-refresh case the guide calls out.
		socket.on("connect_error", async (err) => {
			try {
				const fresh = await socketAuthProvider.getConnectAuth()
				// `query` is a Manager-level (transport) option; `auth` lives on
				// the Socket itself and is what socket.io-client re-sends on the
				// next reconnection attempt — these are NOT interchangeable.
				socket.io.opts.query = fresh.query
				socket.auth = fresh.auth ?? {}
			} catch (credentialError) {
				useMessengerConnectionStore
					.getState()
					.setError(
						credentialError instanceof Error
							? credentialError.message
							: "Failed to refresh socket credentials",
					)
				return
			}
			useMessengerConnectionStore
				.getState()
				.setError(err instanceof Error ? err.message : "Socket connect error")
		})
	}

	private replayRoomJoins() {
		for (const replay of this.roomJoins.values()) replay()
	}

	/** Subscribe to a server event. Returns an unsubscribe function — always
	 * capture and call it on unmount so listeners don't accumulate across
	 * remounts (the guide's "remove old listeners before attaching new
	 * ones" rule). Safe to call before the socket exists — see the
	 * `listeners` field comment.*/
	on<T = unknown>(event: string, handler: EventHandler<T>): () => void {
		const h = handler as EventHandler
		if (!this.listeners.has(event)) this.listeners.set(event, new Set())
		this.listeners.get(event)!.add(h)
		this.socket?.on(event, h)

		return () => {
			this.listeners.get(event)?.delete(h)
			this.socket?.off(event, h)
		}
	}

	/** Fire-and-drop if the socket isn't connected yet — deliberately NOT
	 * queued like `on()`'s listeners. Emits carry a point-in-time payload
	 * (e.g. typing state); replaying a stale one later once the socket
	 * connects could show incorrect state, unlike a listener registration
	 * which is safe to attach whenever the connection becomes ready. */
	emit(event: string, payload?: unknown): void {
		this.socket?.emit(event, payload)
	}

	/** Join a room and remember how to rejoin it after a reconnect. `key`
	 * defaults to `event` — pass an explicit key (e.g. `group:42`) when the
	 * same event name is reused for different rooms. */
	joinRoom(event: string, payload: unknown, key: string = event): void {
		const replay = () => this.emit(event, payload)
		this.roomJoins.set(key, replay)
		replay()
	}

	leaveRoom(key: string): void {
		this.roomJoins.delete(key)
	}

	/** Full teardown for logout. Does NOT get called on a normal reconnect —
	 * only when the session itself is ending. */
	disconnect(): void {
		this.roomJoins.clear()
		this.socket?.removeAllListeners()
		this.socket?.disconnect()
		this.socket = null
		useMessengerConnectionStore.getState().setStatus("disconnected")
	}
}

/** Single instance for the whole browser session — the module doc comment
 * above indicates why this is one connection rather than one per feature */
export const messengerSocket = new MessengerSocketManager()
