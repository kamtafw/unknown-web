"use client"

import { useEffect, useState } from "react"

/** used to pause polling entirely when the tab/window isn't visible */
export function useDocumentVisible() {
	const [visible, setVisible] = useState(() =>
		typeof document === "undefined" ? true : document.visibilityState === "visible",
	)

	useEffect(() => {
		const handler = () => setVisible(document.visibilityState === "visible")
		document.addEventListener("visibilitychange", handler)
		return () => document.removeEventListener("visibilitychange", handler)
	}, [])

	return visible
}
