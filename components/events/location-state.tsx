"use client"

import type { BrowserPermission } from "@/hooks/events/use-geolocation"
import { NEARBY_RADIUS_KM } from "@/lib/events/constants"
import type { LocationStatus } from "@/types/events/api"
import { LocateOff } from "lucide-react"
import Link from "next/link"
import { RetryButton, StateMessage, secondaryButton } from "./event-list"

type FailedStatus = Exclude<LocationStatus, "ready" | "locating">

type Copy = { title: string; description: string; retry: string }

function copyFor(status: FailedStatus, blocked: boolean): Copy {
	switch (status) {
		case "denied":
			return blocked
				? {
						title: "Location access is blocked",
						description: `Events shows what's within ${NEARBY_RADIUS_KM} km of you, so it needs your location. Allow location for this site in your browser's site settings (usually the icon beside the address bar), then try again.`,
						retry: "Try again",
					}
				: {
						title: "Location access is needed",
						description: `Events shows what's within ${NEARBY_RADIUS_KM} km of you. Allow location when your browser asks.`,
						retry: "Allow location",
					}
		case "unavailable":
			return {
				title: "We couldn't find your location",
				description:
					"Check that location services are turned on for your device and browser, then try again.",
				retry: "Try again",
			}
		case "timeout":
			return {
				title: "Finding your location took too long",
				description: "Your device didn't respond in time. Check your connection and try again.",
				retry: "Try again",
			}
		case "unsupported":
			return {
				title: "Location isn't available here",
				description:
					"Events near you needs a browser that supports location over a secure (https) connection. You can still see the events you host or have joined.",
				retry: "Try again",
			}
	}
}

/**
 * Shown when location cannot be resolved. Discovery stays empty here: there is no
 * "all locations" option and no fallback list. My Events needs no location, so it is
 * offered as the way forward.
 */
export function LocationState({
	status,
	permission,
	onRetry,
}: {
	status: FailedStatus
	permission: BrowserPermission
	onRetry: () => void
}) {
	const copy = copyFor(status, status === "denied" && permission === "denied")

	return (
		<StateMessage
			tone="alert"
			icon={<LocateOff size={24} aria-hidden />}
			title={copy.title}
			description={copy.description}
		>
			<RetryButton onClick={onRetry} label={copy.retry} />
			<Link href="/events/my-events" className={secondaryButton}>
				Go to My Events
			</Link>
		</StateMessage>
	)
}
