"use client"

import { cn } from "@/lib/utils"
import { Mic, Pause, Play } from "lucide-react"
import { Avatar } from "radix-ui"
import { useEffect, useRef, useState } from "react"

const WAVEFORM_BARS = [
	5, 9, 6, 13, 8, 16, 10, 5, 12, 17, 7, 14, 9, 6, 11, 15, 8, 13, 5, 10, 16, 7, 12, 9, 14, 6, 11,
	17, 8, 4, 13, 10, 15, 7, 9, 12, 6, 14, 8, 11, 16, 5, 10, 9, 13, 7, 15, 4, 12, 8,
]

interface VoiceMessagePlayerProps {
	url: string
	isOwn: boolean
	senderName: string
	senderInitials: string
	senderAvatarUrl?: string | null
}

/** Real waveform player replacing the bare <audio controls> fallback —
 * matches the reference's play/pause + bars + duration + sender-avatar
 * pill. Bars are static/decorative (same set the recorder uses); the
 * played portion recolors solid based on real <audio> currentTime, the
 * unplayed portion stays dim — not faked. Used for both live voice notes
 * and plain audio-file attachments, so this player is the single audio
 * rendering path across the app now. */
export function VoiceMessagePlayer({ url, isOwn, senderName, senderInitials, senderAvatarUrl }: VoiceMessagePlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null)
	const [isPlaying, setIsPlaying] = useState(false)
	const [progress, setProgress] = useState(0)
	const [duration, setDuration] = useState(0)
	const [currentTime, setCurrentTime] = useState(0)

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return
		const onTimeUpdate = () => {
			setCurrentTime(audio.currentTime)
			if (audio.duration) setProgress(audio.currentTime / audio.duration)
		}
		const onLoadedMetadata = () => setDuration(audio.duration)
		const onEnded = () => {
			setIsPlaying(false)
			setProgress(0)
			setCurrentTime(0)
		}
		audio.addEventListener("timeupdate", onTimeUpdate)
		audio.addEventListener("loadedmetadata", onLoadedMetadata)
		audio.addEventListener("ended", onEnded)
		return () => {
			audio.removeEventListener("timeupdate", onTimeUpdate)
			audio.removeEventListener("loadedmetadata", onLoadedMetadata)
			audio.removeEventListener("ended", onEnded)
		}
	}, [url])

	const toggle = () => {
		const audio = audioRef.current
		if (!audio) return
		if (isPlaying) {
			audio.pause()
			setIsPlaying(false)
		} else {
			void audio.play()
			setIsPlaying(true)
		}
	}

	const playedBars = Math.round(progress * WAVEFORM_BARS.length)
	const displaySecs = Math.round(currentTime > 0 ? currentTime : duration || 0)
	const label = `${String(Math.floor(displaySecs / 60)).padStart(2, "0")}:${String(displaySecs % 60).padStart(2, "0")}`

	return (
		<div className="flex items-center gap-2.5 min-w-64 max-w-72">
			<audio ref={audioRef} src={url} preload="metadata" className="hidden" />

			<button
				onClick={toggle}
				className={cn(
					"h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-opacity hover:opacity-90",
					isOwn ? "bg-primary text-primary-foreground" : "bg-foreground/85 text-background",
				)}
			>
				{isPlaying ? <Pause size={15} className="fill-current" /> : <Play size={15} className="fill-current ml-0.5" />}
			</button>

			<div className="flex flex-1 items-center gap-0.5 min-w-0">
				{WAVEFORM_BARS.map((h, i) => (
					<span
						key={i}
						className={cn(
							"w-[2.5px] shrink-0 rounded-full transition-colors",
							i < playedBars ? (isOwn ? "bg-primary" : "bg-foreground/80") : "bg-muted-foreground/30",
						)}
						style={{ height: h }}
					/>
				))}
			</div>

			<span className="text-[11px] tabular-nums text-muted-foreground shrink-0">{label}</span>

			<Avatar.Root className="relative h-7 w-7 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
				<Avatar.Image src={senderAvatarUrl ?? undefined} alt={senderName} className="h-full w-full object-cover" />
				<Avatar.Fallback className="text-[10px] font-medium text-muted-foreground">{senderInitials}</Avatar.Fallback>
				<span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-2 ring-background">
					<Mic size={7} />
				</span>
			</Avatar.Root>
		</div>
	)
}