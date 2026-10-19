"use client"

import { classifyPositionError, permissionAction, toCoordinates } from "@/lib/events/location"
import type { Coordinates, LocationStatus } from "@/types/events/api"
import { useCallback, useEffect, useRef, useState } from "react"

const POSITION_OPTIONS: PositionOptions = {
	enableHighAccuracy: false,
	timeout: 15_000,
	maximumAge: 60_000,
}

export type GeolocationState =
	| { status: Exclude<LocationStatus, "ready">; coordinates: null }
	| { status: "ready"; coordinates: Coordinates }

/** what the browser says about the site's geolocation permission ("unknown" = Permissions API unavailable) */
export type BrowserPermission = PermissionState | "unknown"

/**
 * Browser location for Events discovery.
 *
 * Nothing here ever widens discovery: any failure leaves `coordinates: null`
 * and the caller must show a recovery state, not a fallback list.
 *
 *  - starts as "locating" with no coordinates
 *  - `refresh()` drops the previous coordinates first, so results for the old
 *    location are not shown while the new one is resolved
 *  - a late result from a superseded request (or after unmount) is ignored
 *  - revoked permission clears coordinates; a permission that becomes granted
 *    while we are in an error state retries automatically
 *  - zero is a valid coordinate (validation never uses truthiness)
 */
export function useGeolocation() {
	const [state, setState] = useState<GeolocationState>({ status: "locating", coordinates: null })
	const [permission, setPermission] = useState<BrowserPermission>("unknown")
	const statusRef = useRef<LocationStatus>("locating")
	const requestId = useRef(0)

	const apply = useCallback((next: GeolocationState) => {
		statusRef.current = next.status
		setState(next)
	}, [])

	const request = useCallback(() => {
		const id = ++requestId.current

		if (
			typeof navigator === "undefined" ||
			!navigator.geolocation ||
			(typeof window !== "undefined" && window.isSecureContext === false)
		) {
			apply({ status: "unsupported", coordinates: null })
			return
		}

		apply({ status: "locating", coordinates: null })
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (id !== requestId.current) return
				const coordinates = toCoordinates(position.coords.latitude, position.coords.longitude)
				apply(
					coordinates
						? { status: "ready", coordinates }
						: { status: "unavailable", coordinates: null },
				)
			},
			(error) => {
				if (id !== requestId.current) return
				apply({ status: classifyPositionError(error.code), coordinates: null })
			},
			POSITION_OPTIONS,
		)
	}, [apply])

	// first request on mount; invalidate anything in flight on unmount
	useEffect(() => {
		request()
		return () => {
			requestId.current++
		}
	}, [request])

	// keep in step with the browser's permission state (revocation, re-enabling, tab return)
	useEffect(() => {
		if (typeof navigator === "undefined" || !navigator.permissions?.query) return

		let cancelled = false
		let status: PermissionStatus | null = null

		const sync = () => {
			if (!status || cancelled) return
			setPermission(status.state)
			const action = permissionAction(status.state, statusRef.current)
			if (action === "revoke") {
				requestId.current++
				apply({ status: "denied", coordinates: null })
			} else if (action === "retry") {
				request()
			}
		}
		const onVisible = () => {
			if (document.visibilityState === "visible") sync()
		}

		navigator.permissions
			.query({ name: "geolocation" as PermissionName })
			.then((result) => {
				if (cancelled) return
				status = result
				status.addEventListener("change", sync)
				sync()
			})
			.catch(() => {
				// Permissions API unsupported for geolocation: rely on position errors alone
			})
		document.addEventListener("visibilitychange", onVisible)

		return () => {
			cancelled = true
			status?.removeEventListener("change", sync)
			document.removeEventListener("visibilitychange", onVisible)
		}
	}, [apply, request])

	return { ...state, permission, refresh: request }
}
