import { describe, expect, it } from "vitest"
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, NEARBY_RADIUS_KM, resolvePageSize } from "./constants"

describe("constants", () => {
	it("pins the nearby radius to 25 km", () => {
		expect(NEARBY_RADIUS_KM).toBe(25)
	})
})

describe("resolvePageSize", () => {
	it("defaults to 20 when unset or invalid", () => {
		expect(DEFAULT_PAGE_SIZE).toBe(20)
		expect(resolvePageSize(undefined)).toBe(20)
		expect(resolvePageSize("abc")).toBe(20)
		expect(resolvePageSize(0)).toBe(20)
		expect(resolvePageSize(-5)).toBe(20)
		expect(resolvePageSize(2.5)).toBe(20)
	})
	it("accepts valid values and clamps to the backend maximum of 100", () => {
		expect(resolvePageSize("30")).toBe(30)
		expect(resolvePageSize(100)).toBe(100)
		expect(resolvePageSize(500)).toBe(MAX_PAGE_SIZE)
	})
})
