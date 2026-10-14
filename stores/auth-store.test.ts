import type { FullUser } from "@/types/api"
import { describe, expect, it } from "vitest"
import { useAuthStore } from "./auth-store"

function user(pkid: number): FullUser {
	return {
		pkid,
		profile_photo: "",
		cover_photo: "",
	} as FullUser
}

describe("auth session generation", () => {
	it("changes at logout, login, and account switch, but not same-account profile refresh", () => {
		useAuthStore.setState({
			user: null,
			isAuthenticated: false,
			sessionGeneration: 0,
			photoVersions: { profile: 0, cover: 0 },
		})

		useAuthStore.getState().setUser(user(101))
		expect(useAuthStore.getState().sessionGeneration).toBe(1)

		useAuthStore.getState().setUser(user(101))
		expect(useAuthStore.getState().sessionGeneration).toBe(1)

		useAuthStore.getState().logout()
		expect(useAuthStore.getState().sessionGeneration).toBe(2)

		useAuthStore.getState().setUser(user(101))
		expect(useAuthStore.getState().sessionGeneration).toBe(3)

		useAuthStore.getState().setUser(user(202))
		expect(useAuthStore.getState().sessionGeneration).toBe(4)
	})
})
