import { act, renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useFormLocation } from "./use-form-location"

type Success = (p: { coords: { latitude: number; longitude: number } }) => void
type Failure = (e: { code: number }) => void
let requests: { success: Success; failure: Failure }[] = []

function installGeolocation() {
	requests = []
	Object.defineProperty(navigator, "geolocation", {
		configurable: true,
		value: { getCurrentPosition: (success: Success, failure: Failure) => requests.push({ success, failure }) },
	})
}
const at = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } })

beforeEach(installGeolocation)
afterEach(() => vi.restoreAllMocks())

describe("useFormLocation", () => {
	it("asks for nothing on mount", () => {
		const { result } = renderHook(() => useFormLocation())
		expect(result.current.status).toBe("idle")
		expect(requests).toHaveLength(0)
	})

	it("asks only when request() is called, then reports the browser coordinates", () => {
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		expect(result.current.status).toBe("locating")
		expect(requests).toHaveLength(1)
		act(() => requests[0].success(at(9.9, 8.9)))
		expect(result.current).toMatchObject({ status: "ready", coordinates: { latitude: 9.9, longitude: 8.9 } })
	})

	it("accepts zero as a valid coordinate", () => {
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		act(() => requests[0].success(at(0, 0)))
		expect(result.current).toMatchObject({ status: "ready", coordinates: { latitude: 0, longitude: 0 } })
	})

	it.each([
		[1, "denied"],
		[2, "unavailable"],
		[3, "timeout"],
	])("maps position error %i to %s and never invents a location", (code, status) => {
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		act(() => requests[0].failure({ code }))
		expect(result.current.status).toBe(status)
		expect(result.current.coordinates).toBeNull()
	})

	it("treats out-of-range coordinates as unavailable", () => {
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		act(() => requests[0].success(at(120, 8.9)))
		expect(result.current.status).toBe("unavailable")
		expect(result.current.coordinates).toBeNull()
	})

	it("reports a browser without geolocation as unsupported", () => {
		Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined })
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		expect(result.current.status).toBe("unsupported")
	})

	it("ignores a late result from a superseded request", () => {
		const { result } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		act(() => result.current.request())
		act(() => requests[0].success(at(1, 1)))
		expect(result.current.status).toBe("locating")
		act(() => requests[1].success(at(2, 2)))
		expect(result.current.coordinates).toEqual({ latitude: 2, longitude: 2 })
	})

	it("ignores a result that arrives after reset or unmount", () => {
		const { result, unmount } = renderHook(() => useFormLocation())
		act(() => result.current.request())
		act(() => result.current.reset())
		act(() => requests[0].success(at(1, 1)))
		expect(result.current.status).toBe("idle")
		act(() => result.current.request())
		unmount()
		expect(() => requests[1].success(at(3, 3))).not.toThrow()
	})
})
