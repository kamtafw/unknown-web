"use client"

import { cn } from "@/lib/utils"
import type { LocationStatus } from "@/types/events/api"
import { MapPin, RefreshCw } from "lucide-react"

/**
 * Location row per the design: muted "Location" label on the left, pin + resolved
 * place on the right. Used by both tabs:
 *
 *  - Events (discovery) passes `scopeKm` and `onRefresh`. The 25 km scope is not shown
 *    as text in the design, so it is exposed to screen readers and as a tooltip; the
 *    refresh control is a subtle icon, shown only once a location exists.
 *  - My events passes neither: it is a read-only reflection of the last place discovery
 *    resolved. There is no scope (My events is not distance-limited) and no refresh,
 *    because that tab never asks the browser for location. With nothing resolved it
 *    shows a neutral "Not set" (`status="unset"`).
 *
 * The address is cosmetic: without one the row says "Current location" and nothing else changes.
 */
export function LocationRow({
	status,
	address,
	onRefresh,
	scopeKm,
}: {
	status: LocationStatus | "unset"
	address: string | null
	onRefresh?: () => void
	scopeKm?: number
}) {
	const ready = status === "ready"
	const unset = status === "unset"
	const value = ready
		? (address ?? "Current location")
		: unset
			? "Not set"
			: status === "locating"
				? "Finding location…"
				: "Not available"

	return (
		<div className="flex items-center justify-between gap-3">
			<span className="shrink-0 text-[14px] text-muted-foreground">Location</span>
			<div
				className={cn(
					"flex min-w-0 items-center gap-1.5 text-base",
					unset ? "font-medium text-muted-foreground" : "font-semibold text-foreground",
				)}
				title={ready && scopeKm ? `Showing events within ${scopeKm} km` : undefined}
			>
				<MapPin
					size={18}
					className={cn(
						"shrink-0 [&_circle]:fill-card",
						unset
							? "fill-muted-foreground/40 text-muted-foreground/40"
							: "fill-primary text-primary",
					)}
					aria-hidden
				/>
				{ready && scopeKm ? <span className="sr-only">Within {scopeKm} km of</span> : null}
				<span className="truncate">{value}</span>
				{ready && onRefresh && (
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
