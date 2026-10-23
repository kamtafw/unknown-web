import { describe, expect, it } from "vitest"
import {
	classifyPositionError,
	formatCoordinateParam,
	isValidCoordinates,
	parseCoordinateParam,
	permissionAction,
	roundForKey,
} from "./location"

describe("isValidCoordinates", () => {
	it("accepts zero coordinates", () => {
		expect(isValidCoordinates(0, 0)).toBe(true)
	})
	it("accepts the range limits", () => {
		expect(isValidCoordinates(90, 180)).toBe(true)
		expect(isValidCoordinates(-90, -180)).toBe(true)
	})
	it("rejects out-of-range, non-finite and non-number values", () => {
		expect(isValidCoordinates(90.0001, 0)).toBe(false)
		expect(isValidCoordinates(0, 180.5)).toBe(false)
		expect(isValidCoordinates(NaN, 0)).toBe(false)
		expect(isValidCoordinates(0, Infinity)).toBe(false)
		expect(isValidCoordinates("9.07", 7.4)).toBe(false)
		expect(isValidCoordinates(null, undefined)).toBe(false)
	})
})

describe("parseCoordinateParam", () => {
	it("parses decimals, including zero and negatives", () => {
		expect(parseCoordinateParam("0")).toBe(0)
		expect(parseCoordinateParam("-9.0765")).toBe(-9.0765)
		expect(parseCoordinateParam(" 7.4951 ")).toBe(7.4951)
	})
	it("rejects empty, missing and non-decimal input instead of coercing to 0", () => {
		expect(parseCoordinateParam("")).toBeNull()
		expect(parseCoordinateParam("   ")).toBeNull()
		expect(parseCoordinateParam(null)).toBeNull()
		expect(parseCoordinateParam(undefined)).toBeNull()
		expect(parseCoordinateParam("abc")).toBeNull()
		expect(parseCoordinateParam("0x10")).toBeNull()
		expect(parseCoordinateParam("Infinity")).toBeNull()
		expect(parseCoordinateParam("NaN")).toBeNull()
	})
})

describe("formatCoordinateParam", () => {
	it("never emits exponent notation", () => {
		expect(formatCoordinateParam(1e-7)).toBe("0.000000")
		expect(formatCoordinateParam(9.0765432123)).toBe("9.076543")
	})
})

describe("roundForKey", () => {
	it("collapses fixes in the same ~110 m bucket to one key value", () => {
		expect(roundForKey(9.0761)).toBe(roundForKey(9.0764))
		expect(roundForKey(9.0761)).toBe(9.076)
	})
	it("separates fixes in different buckets", () => {
		expect(roundForKey(9.0764)).not.toBe(roundForKey(9.0776))
	})
})

describe("classifyPositionError", () => {
	it("maps GeolocationPositionError codes", () => {
		expect(classifyPositionError(1)).toBe("denied")
		expect(classifyPositionError(2)).toBe("unavailable")
		expect(classifyPositionError(3)).toBe("timeout")
		expect(classifyPositionError(99)).toBe("unavailable")
	})
})

describe("permissionAction", () => {
	it("revokes when permission turns denied while a location is held or pending", () => {
		expect(permissionAction("denied", "ready")).toBe("revoke")
		expect(permissionAction("denied", "locating")).toBe("revoke")
	})
	it("does nothing when already denied", () => {
		expect(permissionAction("denied", "denied")).toBe("none")
	})
	it("retries when granted while stuck in an error state", () => {
		expect(permissionAction("granted", "denied")).toBe("retry")
		expect(permissionAction("granted", "timeout")).toBe("retry")
		expect(permissionAction("granted", "unavailable")).toBe("retry")
	})
	it("does not retry when ready or locating, and never auto-requests on prompt", () => {
		expect(permissionAction("granted", "ready")).toBe("none")
		expect(permissionAction("granted", "locating")).toBe("none")
		expect(permissionAction("prompt", "denied")).toBe("none")
	})
})
