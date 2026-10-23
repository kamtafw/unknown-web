import { useAuthStore } from "@/stores/auth-store"
import { useEventsLocationStore } from "@/stores/events-location.store"
import type { FullUser } from "@/types/api"
import type { LocationStatus } from "@/types/events/api"
import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import { useLastLocation, useRememberLocation } from "./use-last-location"

const signIn = (pkid: number, sessionGeneration = 0) =>
	act(() => {
		useAuthStore.setState({ user: { pkid } as FullUser, sessionGeneration })
	})

function setup(status: LocationStatus, address: string | null) {
	return renderHook(
		(props: { status: LocationStatus; address: string | null }) =>
			useRememberLocation(props.status, props.address),
		{ initialProps: { status, address } },
	)
}

beforeEach(() => {
	useEventsLocationStore.setState({ last: null })
	useAuthStore.setState({ user: null, sessionGeneration: 0 })
})

describe("useRememberLocation + useLastLocation", () => {
	it("remembers the resolved place once location is ready", () => {
		signIn(1)
		setup("ready", "Amuwo, Lagos, Nigeria")
		const { result } = renderHook(() => useLastLocation())
		expect(result.current).toEqual({ address: "Amuwo, Lagos, Nigeria" })
	})

	it("remembers a resolved location even when the address lookup failed", () => {
		signIn(1)
		setup("ready", null)
		expect(renderHook(() => useLastLocation()).result.current).toEqual({ address: null })
	})

	it("picks up the address when it arrives after the coordinates", () => {
		signIn(1)
		const hook = setup("ready", null)
		hook.rerender({ status: "ready", address: "Jos" })
		expect(renderHook(() => useLastLocation()).result.current).toEqual({ address: "Jos" })
	})

	it("keeps the place after the discovery screen unmounts (that is what My events reads)", () => {
		signIn(1)
		const hook = setup("ready", "Jos")
		hook.unmount()
		expect(renderHook(() => useLastLocation()).result.current).toEqual({ address: "Jos" })
	})

	it.each(["locating", "denied", "unavailable", "timeout", "unsupported"] as const)(
		"forgets the place when location becomes %s",
		(status) => {
			signIn(1)
			const hook = setup("ready", "Jos")
			hook.rerender({ status, address: "Jos" })
			expect(renderHook(() => useLastLocation()).result.current).toBeNull()
		},
	)

	it("does not reuse a place from an earlier visit while the new location is being resolved", () => {
		signIn(1)
		setup("ready", "Old place").unmount()
		setup("locating", null)
		expect(renderHook(() => useLastLocation()).result.current).toBeNull()
	})

	it("does not remember anything before the account is known", () => {
		setup("ready", "Jos")
		expect(useEventsLocationStore.getState().last).toBeNull()
	})

	it("is invisible to another account", () => {
		signIn(1)
		setup("ready", "Jos").unmount()
		signIn(2)
		expect(renderHook(() => useLastLocation()).result.current).toBeNull()
	})

	it("is invisible after the session generation changes (logout / re-login)", () => {
		signIn(1, 0)
		setup("ready", "Jos").unmount()
		signIn(1, 1)
		expect(renderHook(() => useLastLocation()).result.current).toBeNull()
	})

	it("returns null when nothing was ever resolved", () => {
		signIn(1)
		expect(renderHook(() => useLastLocation()).result.current).toBeNull()
	})

	it("stores only the label with its scope — never coordinates", () => {
		signIn(1)
		setup("ready", "Jos")
		expect(Object.keys(useEventsLocationStore.getState().last!).sort()).toEqual([
			"accountId",
			"address",
			"sessionGeneration",
		])
	})

	it("is not persisted to browser storage", () => {
		signIn(1)
		setup("ready", "Jos")
		expect(JSON.stringify({ ...localStorage })).not.toContain("Jos")
		expect(JSON.stringify({ ...sessionStorage })).not.toContain("Jos")
	})
})
