"use client"

import { toast } from "@/lib/toast"
import { useCallback, useEffect, useRef, useState } from "react"

export type VoiceRecorderPhase = "idle" | "recording" | "paused"

export interface VoiceRecorderState {
	phase: VoiceRecorderPhase
	durationSecs: number
	metering: number
	isPlaying: boolean
}

export interface VoiceRecorderActions {
	start: () => Promise<void>
	pause: () => Promise<void>
	resume: () => Promise<void>
	discard: () => void
	send: () => Promise<{ file: File; duration: string } | null>
	playPreview: () => void
	stopPreview: () => void
}

export function formatDuration(totalSecs: number): string {
	const m = String(Math.floor(totalSecs / 60)).padStart(2, "0")
	const s = String(totalSecs % 60).padStart(2, "0")
	return `${m}:${s}`
}

/** Cross-browser mimeType — mirrors expo-av's own web fallback preset
 * (`RECORDING_OPTIONS.web: {mimeType:"audio/webm", bitsPerSecond:128000}`),
 * the exact contract mobile itself uses when running in a browser. Safari
 * doesn't support webm, hence the fallback chain rather than one hardcoded
 * value. */
function pickMimeType(): string {
	const candidates = ["audio/webm", "audio/mp4", "audio/ogg"]
	for (const type of candidates) {
		if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type
	}
	return ""
}

/**
 * Web port of mobile's use-voice-recorder.ts — same phase machine:
 * idle → start() → recording → pause() → paused → send()/discard()/playPreview()
 * "Pause" stops and finalizes the file so it's playable immediately.
 * "Resume" discards that take and starts a fresh recording. Confirmed
 * send-side contract (message_type, media shape, metadata.duration) is
 * NOT this hook's concern — it only owns capture; see the composer/view
 * wiring for the send payload.
 */
export function useVoiceRecorder(): VoiceRecorderState & VoiceRecorderActions {
	const [phase, setPhase] = useState<VoiceRecorderPhase>("idle")
	const [durationSecs, setDurationSecs] = useState(0)
	const [metering, setMetering] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)

	const streamRef = useRef<MediaStream | null>(null)
	const recorderRef = useRef<MediaRecorder | null>(null)
	const chunksRef = useRef<Blob[]>([])
	const mimeTypeRef = useRef<string>("")
	const savedBlobRef = useRef<Blob | null>(null)
	const previewUrlRef = useRef<string | null>(null)
	const audioElRef = useRef<HTMLAudioElement | null>(null)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const meteringFrameRef = useRef<number | null>(null)
	const audioContextRef = useRef<AudioContext | null>(null)

	const stopTimer = useCallback(() => {
		if (timerRef.current) {
			clearInterval(timerRef.current)
			timerRef.current = null
		}
	}, [])

	const startTimer = useCallback(() => {
		stopTimer()
		timerRef.current = setInterval(() => setDurationSecs((s) => s + 1), 1000)
	}, [stopTimer])

	const stopMetering = useCallback(() => {
		if (meteringFrameRef.current) cancelAnimationFrame(meteringFrameRef.current)
		meteringFrameRef.current = null
		audioContextRef.current?.close().catch(() => undefined)
		audioContextRef.current = null
		setMetering(0)
	}, [])

	/** Real levels via Web Audio, not simulated — decorative only, so a
	 * failure here never blocks recording itself. */
	const startMetering = useCallback((stream: MediaStream) => {
		try {
			const audioContext = new AudioContext()
			const source = audioContext.createMediaStreamSource(stream)
			const analyser = audioContext.createAnalyser()
			analyser.fftSize = 256
			source.connect(analyser)
			audioContextRef.current = audioContext

			const data = new Uint8Array(analyser.frequencyBinCount)
			const tick = () => {
				analyser.getByteFrequencyData(data)
				const avg = data.reduce((sum, v) => sum + v, 0) / data.length
				setMetering(Math.max(0, Math.min(1, avg / 128)))
				meteringFrameRef.current = requestAnimationFrame(tick)
			}
			tick()
		} catch {
			// Metering is decorative — recording still works without it.
		}
	}, [])

	const releaseStream = useCallback(() => {
		streamRef.current?.getTracks().forEach((t) => t.stop())
		streamRef.current = null
	}, [])

	const beginRecording = useCallback(async () => {
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
		streamRef.current = stream
		const mimeType = pickMimeType()
		mimeTypeRef.current = mimeType

		const recorder = new MediaRecorder(stream, {
			...(mimeType ? { mimeType } : {}),
			audioBitsPerSecond: 128000,
		})
		chunksRef.current = []
		recorder.ondataavailable = (e) => {
			if (e.data.size > 0) chunksRef.current.push(e.data)
		}
		recorder.start()
		recorderRef.current = recorder

		startMetering(stream)
		setDurationSecs(0)
		setPhase("recording")
		startTimer()
	}, [startMetering, startTimer])

	const start = useCallback(async () => {
		try {
			await beginRecording()
		} catch {
			toast.error("Microphone access is needed to record a voice message")
		}
	}, [beginRecording])

	/** "Pause" = stop and finalize, same semantics as mobile — the file
	 * becomes playable immediately; recording never resumes from here. */
	const pause = useCallback(async () => {
		const recorder = recorderRef.current
		if (!recorder) return

		stopTimer()
		stopMetering()

		const blob = await new Promise<Blob>((resolve) => {
			recorder.onstop = () =>
				resolve(new Blob(chunksRef.current, { type: mimeTypeRef.current || "audio/webm" }))
			recorder.stop()
		})
		releaseStream()
		recorderRef.current = null
		savedBlobRef.current = blob
		if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
		previewUrlRef.current = URL.createObjectURL(blob)

		setPhase("paused")
	}, [stopTimer, stopMetering, releaseStream])

	/** "Resume" = discard the previous take, start a brand-new recording. */
	const resume = useCallback(async () => {
		if (audioElRef.current) {
			audioElRef.current.pause()
			audioElRef.current = null
		}
		setIsPlaying(false)
		savedBlobRef.current = null
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current)
			previewUrlRef.current = null
		}
		try {
			await beginRecording()
		} catch {
			toast.error("Microphone access is needed to record a voice message")
			setPhase("idle")
		}
	}, [beginRecording])

	const discard = useCallback(() => {
		stopTimer()
		stopMetering()
		if (audioElRef.current) {
			audioElRef.current.pause()
			audioElRef.current = null
		}
		setIsPlaying(false)
		if (recorderRef.current) {
			try {
				recorderRef.current.stop()
			} catch {
				// already stopped
			}
			recorderRef.current = null
		}
		releaseStream()
		savedBlobRef.current = null
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current)
			previewUrlRef.current = null
		}
		setDurationSecs(0)
		setMetering(0)
		setPhase("idle")
	}, [stopTimer, stopMetering, releaseStream])

	const send = useCallback(async (): Promise<{ file: File; duration: string } | null> => {
		stopTimer()
		stopMetering()
		if (audioElRef.current) {
			audioElRef.current.pause()
			audioElRef.current = null
		}
		setIsPlaying(false)

		let blob = savedBlobRef.current
		// Still recording when Send was tapped — finalize first, mirrors
		// mobile's send() doing the same stop-if-recording fallback.
		if (!blob && recorderRef.current) {
			const recorder = recorderRef.current
			blob = await new Promise<Blob>((resolve) => {
				recorder.onstop = () =>
					resolve(new Blob(chunksRef.current, { type: mimeTypeRef.current || "audio/webm" }))
				recorder.stop()
			})
			releaseStream()
			recorderRef.current = null
		}

		const duration = formatDuration(durationSecs)
		savedBlobRef.current = null
		if (previewUrlRef.current) {
			URL.revokeObjectURL(previewUrlRef.current)
			previewUrlRef.current = null
		}
		setDurationSecs(0)
		setMetering(0)
		setPhase("idle")

		if (!blob) return null
		const ext = mimeTypeRef.current.includes("mp4")
			? "mp4"
			: mimeTypeRef.current.includes("ogg")
				? "ogg"
				: "webm"
		const file = new File([blob], `voice_${Date.now()}.${ext}`, { type: blob.type })
		return { file, duration }
	}, [stopTimer, stopMetering, durationSecs, releaseStream])

	/** Only valid in "paused" phase, mirrors mobile exactly. */
	const playPreview = useCallback(() => {
		const url = previewUrlRef.current
		if (!url) return
		audioElRef.current?.pause()
		const audio = new Audio(url)
		audio.onended = () => setIsPlaying(false)
		audioElRef.current = audio
		void audio.play()
		setIsPlaying(true)
	}, [])

	const stopPreview = useCallback(() => {
		audioElRef.current?.pause()
		audioElRef.current = null
		setIsPlaying(false)
	}, [])

	useEffect(() => {
		return () => {
			recorderRef.current?.stop()
			streamRef.current?.getTracks().forEach((t) => t.stop())
			if (meteringFrameRef.current) cancelAnimationFrame(meteringFrameRef.current)
			audioContextRef.current?.close().catch(() => undefined)
			if (timerRef.current) clearInterval(timerRef.current)
			audioElRef.current?.pause()
			if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
		}
	}, [])

	return {
		phase,
		durationSecs,
		metering,
		isPlaying,
		start,
		pause,
		resume,
		discard,
		send,
		playPreview,
		stopPreview,
	}
}
