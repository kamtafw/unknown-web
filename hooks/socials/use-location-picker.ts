import { useState } from "react"

export interface LocationValue {
	longitude: string
	latitude: string
}

/**
 * Consolidated from 7 copies (create-post-modal, edit-post-modal,
 * comment-modal, reply-modal, quote-post-modal, quote-comment-modal,
 * post-detail's ContentComposer).
 *
 * These weren't all byte-identical — they split roughly 3-3 on one real
 * behavioral difference (edit-post-modal is its own case, handled
 * separately since it seeds from an existing post location rather than
 * starting empty):
 *
 *   - create-post-modal / quote-post-modal / quote-comment-modal: check
 *     `locationLabel` (toggle off) and `!navigator.geolocation`
 *     (unsupported) as two separate concerns — unsupported just silently
 *     no-ops, toggle-off explicitly clears.
 *   - comment-modal / reply-modal / post-detail's ContentComposer: folded
 *     both into one condition, so an unsupported browser also clears
 *     state (there'd be nothing to clear in practice, but it's not the
 *     same logic).
 *
 * This hook uses the first (separate-concerns) version. It's a genuine,
 * if extremely minor, behavior change for the second group of three —
 * observable only on a browser without geolocation support, since that's
 * the only case where the two versions diverge. Flagging rather than
 * silently picking one.
 */
export function useLocationPicker() {
	const [location, setLocation] = useState<LocationValue | null>(null)
	const [locationLabel, setLocationLabel] = useState<string | null>(null)
	const [fetchingLocation, setFetchingLocation] = useState(false)

	const toggleLocation = () => {
		if (locationLabel) {
			setLocation(null)
			setLocationLabel(null)
			return
		}
		if (!navigator.geolocation) return

		setFetchingLocation(true)
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setLocation({
					longitude: String(pos.coords.longitude),
					latitude: String(pos.coords.latitude),
				})
				setLocationLabel(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
				setFetchingLocation(false)
			},
			() => setFetchingLocation(false),
		)
	}

	const reset = () => {
		setLocation(null)
		setLocationLabel(null)
	}

	/** for edit-post-modal, which seeds from an existing post's location
	 * rather than starting empty */
	const seed = (value: LocationValue | null, label: string | null) => {
		setLocation(value)
		setLocationLabel(label)
	}

	return { location, locationLabel, fetchingLocation, toggleLocation, reset, seed }
}
