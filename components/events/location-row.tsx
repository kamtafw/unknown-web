"use client"

import { NEARBY_RADIUS_KM } from "@/lib/events/constants"
import type { LocationStatus } from "@/types/events/api"
import { MapPin, RefreshCw } from "lucide-react"

/**
 * Location row per the design: muted "Location" label on the left, pin + resolved
 * place on the right. The 25 km scope is not shown as text in the design, so it is
 * exposed to screen readers and as a tooltip instead; the refresh control is a
 * subtle icon, shown only once a location exists. The address is cosmetic: without
 * one the row says "Current location" and the nearby query is unaffected.
 */
export function LocationRow({
	status,
	address,
	onRefresh,
}: {
	status: LocationStatus
	address: string | null
	onRefresh: () => void
}) {
	const ready = status === "ready"
	const value = ready
		? (address ?? "Current location")
		: status === "locating"
			? "Finding location…"
			: "Not available"

	return (
		<div className="flex items-center justify-between gap-3">
			<span className="shrink-0 text-[14px] text-muted-foreground">Location</span>
			<div
				className="flex min-w-0 items-center gap-1.5 text-base font-semibold text-foreground"
				title={ready ? `Showing events within ${NEARBY_RADIUS_KM} km` : undefined}
			>
				<MapPin
					size={18}
					className="shrink-0 fill-primary text-primary [&_circle]:fill-card"
					aria-hidden
				/>
				{ready && <span className="sr-only">Within {NEARBY_RADIUS_KM} km of</span>}
				<span className="truncate">{value}</span>
				{ready && (
					<button
						type="button"
						onClick={onRefresh}
						aria-label="Refresh my location"
						className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
					>
						<RefreshCw size={12} aria-hidden />
					</button>
				)}
			</div>
		</div>
	)
}
