"use client"

import { useEventAddress } from "@/hooks/events/use-event-address"
import { type FormLocationState, useFormLocation } from "@/hooks/events/use-form-location"
import type { Coordinates } from "@/types/events/api"
import { Loader2, LocateFixed, MapPin } from "lucide-react"
import { useEffect, useId, useRef } from "react"
import { secondaryButton } from "../event-list"
import { FieldMessages, SECTION_TITLE } from "./fields"

function failureMessage(status: FormLocationState["status"]): string | null {
	switch (status) {
		case "denied":
			return "Location access was blocked. Allow location for this site in your browser's site settings, then try again."
		case "unavailable":
			return "We couldn't find your location. Check that location services are on, then try again."
		case "timeout":
			return "Finding your location took too long. Check your connection and try again."
		case "unsupported":
			return "This browser can't share its location here (it needs a secure https connection)."
		default:
			return null
	}
}

/**
 * Where the event is. The backend takes coordinates (and looks the address up itself), and the
 * only way this app has to get them is the browser's location, so this asks only when the button
 * is pressed, says why, and never substitutes a default place. There is no address search or map
 * (decision for Pass 2; a picker needs a design and a backend lookup).
 *
 * The address shown is the `my-location` label, which is display only: the coordinates sent are
 * the ones the browser reported. A new or failed request clears the chosen point, so a stale
 * location can never be submitted by accident. On edit, no point chosen means "keep the saved one".
 */
export function LocationField({
	mode,
	existingAddress,
	coordinates,
	onChange,
	error,
}: {
	mode: "create" | "edit"
	existingAddress?: string | null
	coordinates: Coordinates | null
	onChange: (coordinates: Coordinates | null) => void
	error?: string
}) {
	const id = useId()
	const location = useFormLocation()
	const label = useEventAddress(location.coordinates)
	const onChangeRef = useRef(onChange)
	useEffect(() => {
		onChangeRef.current = onChange
	})

	useEffect(() => {
		if (location.status === "ready") onChangeRef.current(location.coordinates)
		else if (location.status !== "idle") onChangeRef.current(null)
	}, [location.status, location.coordinates])

	const failure = failureMessage(location.status)
	const locating = location.status === "locating"
	const chosen = location.status === "ready" && coordinates

	return (
		<section aria-labelledby={`${id}-title`} className="flex flex-col gap-2">
			<h2 id={`${id}-title`} className={SECTION_TITLE}>
				Event&apos;s location
			</h2>
			<p id={`${id}-hint`} className="text-[12px] leading-relaxed text-muted-foreground">
				We use your device&apos;s location to place the event. Nothing is requested until you press the
				button.
			</p>

			<div className="flex items-start gap-2.5 rounded-xl border border-border px-3.5 py-3 text-[13px]">
				<MapPin size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden />
				<p aria-live="polite" className="min-w-0 text-foreground">
					{locating
						? "Finding your location…"
						: chosen
							? (label ?? "Your current location")
							: mode === "edit"
								? (existingAddress ?? "Saved location")
								: "No location set yet"}
				</p>
			</div>

			<div>
				<button
					type="button"
					className={secondaryButton}
					onClick={location.request}
					disabled={locating}
					aria-describedby={`${id}-hint`}
				>
					{locating ? (
						<Loader2 size={13} className="animate-spin" aria-hidden />
					) : (
						<LocateFixed size={13} aria-hidden />
					)}
					{failure ? "Try again" : mode === "edit" || chosen ? "Update to my current location" : "Use my current location"}
				</button>
			</div>

			{failure && (
				<p role="alert" className="text-[12px] font-medium text-destructive">
					{failure}
				</p>
			)}
			<FieldMessages id={id} error={error} />
		</section>
	)
}
