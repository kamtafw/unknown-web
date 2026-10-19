import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useGeolocation } from "./use-geolocation"

type Success = (p: { coords: { latitude: number; longitude: number } }) => void
type Failure = (e: { code: number }) => void
let requests: { success: Success; failure: Failure }[] = []
let permissionListeners: Array<() => void> = []
let permissionStatus: { state: PermissionState } & Record<string, unknown>

function installGeolocation() {
	requests = []
	Object.defineProperty(navigator, "geolocation", {
		configurable: true,
		value: {
			getCurrentPosition: (success: Success, failure: Failure) =>
				requests.push({ success, failure }),
		},
	})
}

function installPermissions(state: PermissionState) {
	permissionListeners = []
	permissionStatus = {
		state,
		addEventListener: (_: string, l: () => void) => permissionListeners.push(l),
		removeEventListener: () => {},
	}
	Object.defineProperty(navigator, "permissions", {
		configurable: true,
		value: { query: vi.fn().mockResolvedValue(permissionStatus) },
	})
}

function removePermissions() {
	Object.defineProperty(navigator, "permissions", { configurable: true, value: undefined })
}

const at = (latitude: number, longitude: number) => ({ coords: { latitude, longitude } })

beforeEach(() => {
	installGeolocation()
	removePermissions()
})
afterEach(() => vi.restoreAllMocks())

describe("useGeolocation", () => {
	it("starts locating with no coordinates", () => {
		const { result } = renderHook(() => useGeolocation())
		expect(result.current.status).toBe("locating")
		expect(result.current.coordinates).toBeNull()
	})

	it("becomes ready with the browser coordinates", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].success(at(9.9, 8.9)))
		expect(result.current).toMatchObject({
			status: "ready",
			coordinates: { latitude: 9.9, longitude: 8.9 },
		})
	})

	it("treats 0,0 as a valid location", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].success(at(0, 0)))
		expect(result.current).toMatchObject({ status: "ready", coordinates: { latitude: 0, longitude: 0 } })
	})

	it("rejects non-finite or out-of-range positions as unavailable", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].success(at(Number.NaN, 8)))
		expect(result.current).toMatchObject({ status: "unavailable", coordinates: null })
	})

	it.each([
		[1, "denied"],
		[2, "unavailable"],
		[3, "timeout"],
	])("maps position error %i to %s with no coordinates", (code, status) => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].failure({ code }))
		expect(result.current).toMatchObject({ status, coordinates: null })
	})

	it("reports unsupported when the browser has no geolocation", () => {
		Object.defineProperty(navigator, "geolocation", { configurable: true, value: undefined })
		const { result } = renderHook(() => useGeolocation())
		expect(result.current).toMatchObject({ status: "unsupported", coordinates: null })
	})

	it("refresh drops the previous coordinates while the new one is resolved", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].success(at(9.9, 8.9)))
		act(() => result.current.refresh())
		expect(result.current).toMatchObject({ status: "locating", coordinates: null })
		expect(requests).toHaveLength(2)
	})

	it("ignores a late result from a superseded request", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => result.current.refresh())
		act(() => requests[0].success(at(1, 1))) // stale
		expect(result.current.status).toBe("locating")
		act(() => requests[1].success(at(2, 2)))
		expect(result.current.coordinates).toEqual({ latitude: 2, longitude: 2 })
	})

	it("can retry after a failure", () => {
		const { result } = renderHook(() => useGeolocation())
		act(() => requests[0].failure({ code: 3 }))
		act(() => result.current.refresh())
		act(() => requests[1].success(at(9, 8)))
		expect(result.current.status).toBe("ready")
	})

	it("clears coordinates when permission is revoked while ready", async () => {
		installPermissions("granted")
		const { result } = renderHook(() => useGeolocation())
		await waitFor(() => expect(result.current.permission).toBe("granted"))
		act(() => requests[0].success(at(9.9, 8.9)))
		expect(result.current.status).toBe("ready")

		act(() => {
			permissionStatus.state = "denied"
			permissionListeners.forEach((l) => l())
		})
		expect(result.current).toMatchObject({ status: "denied", coordinates: null, permission: "denied" })
	})

	it("retries automatically when permission becomes granted after a denial", async () => {
		installPermissions("prompt")
		const { result } = renderHook(() => useGeolocation())
		await waitFor(() => expect(result.current.permission).toBe("prompt"))
		act(() => requests[0].failure({ code: 1 }))
		expect(result.current.status).toBe("denied")

		act(() => {
			permissionStatus.state = "granted"
			permissionListeners.forEach((l) => l())
		})
		expect(result.current.status).toBe("locating")
		expect(requests).toHaveLength(2)
	})

	it("starts denied when the browser already blocks location", async () => {
		installPermissions("denied")
		const { result } = renderHook(() => useGeolocation())
		await waitFor(() => expect(result.current.status).toBe("denied"))
		expect(result.current.coordinates).toBeNull()
	})
})
