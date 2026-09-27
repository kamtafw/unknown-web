// @vitest-environment node
/**
 * TEST-ONLY shared setup for the E2EE storage/runtime suites. Not exported
 * from `../index.ts`.
 *
 * `fake-indexeddb/auto` installs a fresh, spec-compliant in-memory
 * IndexedDB implementation onto `globalThis` — independent of the app code
 * under test, so these tests exercise the real IndexedDB API surface
 * (transactions, key ranges, cursors, structured clone of typed arrays)
 * rather than a hand-rolled mock of it.
 */
import "fake-indexeddb/auto"
import { afterEach } from "vitest"
import { resetE2eeDatabaseForTests } from "./database"

/** Call once per test file (top level, not inside a test). Ensures every
 * test starts against a completely empty database: closes the cached
 * connection and deletes the backing database by name. */
export function setupFreshE2eeDatabase(): void {
	afterEach(async () => {
		resetE2eeDatabaseForTests()
		await new Promise<void>((resolve, reject) => {
			const request = indexedDB.deleteDatabase("appscombo-messenger-e2ee")
			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
			request.onblocked = () => resolve() // shouldn't happen once the connection is closed
		})
	})
}
