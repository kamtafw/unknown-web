"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export type ReadAloudStatus = "idle" | "playing" | "paused" | "done"

const FALLBACK_WPM = 165

function toSpeakableText(text: string): string {
	return text.replace(/@(\w+)/g, "at $1").replace(/#(\w+)/g, "hashtag $1")
}

function estimateDurationMs(speakable: string) {
	const words = speakable.trim().split(/\s+/).filter(Boolean).length
	return Math.max(3, Math.round((words / FALLBACK_WPM) * 60)) * 1000
}

export function useReadAloud(text: string) {
	const [status, setStatus] = useState<ReadAloudStatus>("idle")
	const [elapsedMs, setElapsedMs] = useState(0)
	const [progress, setProgress] = useState(0)

	const speakable = useMemo(() => toSpeakableText(text), [text])
	const speakableLength = Math.max(speakable.length, 1)
	const estimatedMs = useMemo(() => estimateDurationMs(speakable), [speakable])

	const startRef = useRef(0)
	const bankedMsRef = useRef(0)
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

	const boundarySeenRef = useRef(false)

	const clearTick = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}

	const startClock = () => {
		clearTick()
		intervalRef.current = setInterval(() => {
			const ms = bankedMsRef.current + (performance.now() - startRef.current)
			setElapsedMs(ms)
			if (!boundarySeenRef.current) setProgress(Math.min(ms / estimatedMs, 1))
		}, 200)
	}

	const play = useCallback(() => {
		if (typeof window === "undefined" || !("speechSynthesis" in window)) return

		if (status === "paused") {
			window.speechSynthesis.resume()
			startRef.current = performance.now()
			setStatus("playing")
			startClock()
			return
		}

		const utterance = new SpeechSynthesisUtterance(speakable)
		utterance.rate = 1

		utterance.onboundary = (event) => {
			boundarySeenRef.current = true
			setProgress(Math.min(event.charIndex / speakableLength, 1))
		}
		utterance.onend = () => {
			setStatus("done")
			setProgress(1)
			clearTick()
		}
		utterance.onerror = () => {
			setStatus("idle")
			clearTick()
		}

		window.speechSynthesis.cancel()
		boundarySeenRef.current = false
		bankedMsRef.current = 0
		startRef.current = performance.now()
		setElapsedMs(0)
		setProgress(0)

		window.speechSynthesis.speak(utterance)
		setStatus("playing")
		startClock()
	}, [speakable, status, estimatedMs, speakableLength])

	const pause = useCallback(() => {
		window.speechSynthesis.pause()
		bankedMsRef.current += performance.now() - startRef.current
		setStatus("paused")
		clearTick()
	}, [])

	const stop = useCallback(() => {
		if (typeof window !== "undefined") window.speechSynthesis.cancel()
		setStatus("idle")
		setElapsedMs(0)
		setProgress(0)
		bankedMsRef.current = 0
		clearTick()
	}, [])

	useEffect(() => stop, [stop])

	return { status, elapsedMs, progress, play, pause, stop }
}
