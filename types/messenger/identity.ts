/**
 * Messenger identity types.
 *
 * Evidence: the guide and the mobile contract (hooks/messenger/use-chats.ts,
 * use-groups.ts) use two distinct identifiers for a user depending on the
 * endpoint:
 *
 *   - a UUID  — used by chat history / socket room addressing
 *       e.g. `chats/history/:userUuid`
 *   - a PKID  — used by most other user-referencing payloads
 *       e.g. `receiver_id` (number) when sending a message
 *
 * The two are NOT interchangeable and the backend does not appear to accept
 * one where the other is expected. Per the project's risk register (#9,
 * carried over from the implementation guide's own top risk), an ambiguous
 * `userId` is exactly how that gets confused. Every Messenger type/function
 * signature in this codebase should say which one it means.
 */

/** Branded so `Uuid` and `Pkid` can't be silently swapped even though both
 * are structurally a `string`/`number` at runtime. */
export type Uuid = string & { readonly __brand: "Uuid" }
export type Pkid = number & { readonly __brand: "Pkid" }

export function asUuid(value: string): Uuid {
	return value as Uuid
}

export function asPkid(value: number): Pkid {
	return value as Pkid
}

/**
 * Minimal user shape as it appears embedded in chat/group/message payloads
 * (sender, participant, etc.) — NOT the full social-graph `FullUser` from
 * `types/api.ts`. Only fields confirmed present on embedded-user objects in
 * the mobile contract. Extend only when a concrete payload needs more.
 */
export interface MessengerUser {
	userUuid: Uuid
	userPkid: Pkid
	displayName: string
	username: string
	avatarUrl: string | null
}
