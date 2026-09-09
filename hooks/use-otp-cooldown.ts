import { useEffect, useState } from "react"

const COOLDOWN_MS = 1000 * 30
const STORAGE_KEY = "otp_cooldown_end"

export function useOtpCooldown() {
	const [endTime, setEndTime] = useState<number | null>(() => {
		if (typeof window === "undefined") return null
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return null
		const t = parseInt(stored, 10)
		return t > Date.now() ? t : null
	})

	const [remaining, setRemaining] = useState(0)

	useEffect(() => {
		if (!endTime) {
			setRemaining(0)
			return
		}

		const tick = () => {
			const r = Math.ceil((endTime - Date.now()) / 1000)
			if (r <= 0) {
				setRemaining(0)
				setEndTime(null)
				localStorage.removeItem(STORAGE_KEY)
			} else {
				setRemaining(r)
			}
		}

		tick()
		const id = setInterval(tick, 500)
		return () => clearInterval(id)
	}, [endTime])

	const start = () => {
		const t = Date.now() + COOLDOWN_MS
		localStorage.setItem(STORAGE_KEY, String(t))
		setEndTime(t)
	}

	return { remaining, start, isActive: remaining > 0 }
}
