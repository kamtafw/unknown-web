"use client"

import { classifyPositionError, toCoordinates } from "@/lib/events/location"
import type { Coordinates } from "@/types/events/api"
import { useCallback, useEffect, useRef, useState } from "react"

export type FormLocationState =
	| { status: "idle"; coordinates: null }
	| { status: "locating"; coordinates: null }
	| { status: "ready"; coordinates: Coordinates }
	| { status: "denied" | "unavailable" | "timeout" | "unsupported"; coordinates: null }

const OPTIONS: PositionOptions = { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 }

/**
 * Browser location for the event form, asked for ONLY when `request()` is called (an explicit
 * button press): nothing is requested on mount, and no default location is ever substituted.
 * A failure leaves `coordinates: null`, so the form stays invalid until a real location is set.
 * A late result from a superseded request, or after unmount, is ignored.
 */
export function useFormLocation() {
	const [state, setState] = useState<FormLocationState>({ status: "idle", coordinates: null })
	const requestId = useRef(0)

	useEffect(() => {
		return () => {
			requestId.current++
		}
	}, [])

	const request = useCallback(() => {
		const id = ++requestId.current

		if (
			typeof navigator === "undefined" ||
			!navigator.geolocation ||
			(typeof window !== "undefined" && window.isSecureContext === false)
		) {
			setState({ status: "unsupported", coordinates: null })
			return
		}

		setState({ status: "locating", coordinates: null })
		navigator.geolocation.getCurrentPosition(
			(position) => {
				if (id !== requestId.current) return
				const coordinates = toCoordinates(position.coords.latitude, position.coords.longitude)
				setState(
					coordinates
						? { status: "ready", coordinates }
						: { status: "unavailable", coordinates: null },
				)
			},
			(error) => {
				if (id !== requestId.current) return
				setState({ status: classifyPositionError(error.code), coordinates: null })
			},
			OPTIONS,
		)
	}, [])

	const reset = useCallback(() => {
		requestId.current++
		setState({ status: "idle", coordinates: null })
	}, [])

	return { ...state, request, reset }
}
