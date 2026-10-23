import { describe, expect, it } from "vitest"
import {
	COVER_MAX_BYTES,
	DEFAULT_MAX_TOTAL_UPLOAD_BYTES,
	DEFAULT_PAGE_SIZE,
	MAX_EVENT_REQUEST_BYTES,
	MAX_PAGE_SIZE,
	MAX_TOTAL_UPLOAD_BYTES,
	NEARBY_RADIUS_KM,
	resolveMaxUploadBytes,
	resolvePageSize,
} from "./constants"

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

describe("resolveMaxUploadBytes", () => {
	it("defaults to 20 MiB when unset or invalid", () => {
		expect(DEFAULT_MAX_TOTAL_UPLOAD_BYTES).toBe(20 * 1024 * 1024)
		expect(MAX_TOTAL_UPLOAD_BYTES).toBe(DEFAULT_MAX_TOTAL_UPLOAD_BYTES)
		expect(resolveMaxUploadBytes(undefined)).toBe(DEFAULT_MAX_TOTAL_UPLOAD_BYTES)
		expect(resolveMaxUploadBytes("abc")).toBe(DEFAULT_MAX_TOTAL_UPLOAD_BYTES)
		expect(resolveMaxUploadBytes(1.5)).toBe(DEFAULT_MAX_TOTAL_UPLOAD_BYTES)
	})
	it("never goes below the cover limit and is bounded above", () => {
		expect(resolveMaxUploadBytes(COVER_MAX_BYTES - 1)).toBe(DEFAULT_MAX_TOTAL_UPLOAD_BYTES)
		expect(resolveMaxUploadBytes(COVER_MAX_BYTES)).toBe(COVER_MAX_BYTES)
		expect(resolveMaxUploadBytes(String(5 * 1024 * 1024))).toBe(5 * 1024 * 1024)
		expect(resolveMaxUploadBytes(10 ** 12)).toBe(100 * 1024 * 1024)
	})
	it("allows the request a little overhead above the upload total", () => {
		expect(MAX_EVENT_REQUEST_BYTES).toBeGreaterThan(MAX_TOTAL_UPLOAD_BYTES)
	})
})
