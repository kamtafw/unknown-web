"use client"

import { formatDuration, VoiceRecorderPhase } from "@/hooks/messenger/use-voice-recorder"
import { Mic, Pause, Play, SendHorizontal, Trash2 } from "lucide-react"
import { useMemo } from "react"

// Static decorative waveform bars, ported from mobile — boosted by live
// metering (real Web Audio levels, not simulated) while recording.
const WAVEFORM_BARS = [
	3, 8, 5, 12, 7, 15, 9, 4, 11, 16, 6, 13, 8, 5, 10, 14, 7, 12, 4, 9, 15, 6, 11, 8, 13, 5, 10, 16,
	7, 3, 12, 9, 14, 6, 8, 11, 5, 13, 7, 10, 15, 4, 9, 8, 12, 6, 14, 3, 11, 7,
]

interface VoiceRecorderBarProps {
	phase: VoiceRecorderPhase
	durationSecs: number
	metering: number
	isPlaying: boolean
	onPause: () => void
	onResume: () => void
	onDiscard: () => void
	onSend: () => void
	onPlayPreview: () => void
	onStopPreview: () => void
}

export function VoiceRecorderBar({
	phase,
	durationSecs,
	metering,
	isPlaying,
	onPause,
	onResume,
	onDiscard,
	onSend,
	onPlayPreview,
	onStopPreview,
}: VoiceRecorderBarProps) {
	const isRecording = phase === "recording"
	const durationText = formatDuration(durationSecs)

	const barHeights = useMemo(() => {
		if (!isRecording) return WAVEFORM_BARS
		return WAVEFORM_BARS.map((base) => Math.max(2, Math.min(20, base * 0.5 + metering * 12)))
	}, [isRecording, metering])

	return (
		<div className="px-4 py-3">
			<div className="overflow-hidden rounded-2xl bg-card border border-border px-4 pb-4 pt-4">
				<div className="mb-4 flex items-center">
					{phase === "paused" && (
						<button onClick={isPlaying ? onStopPreview : onPlayPreview} className="mr-3 shrink-0">
							{isPlaying ? (
								<Pause size={22} className="fill-foreground text-foreground" />
							) : (
								<Play size={22} className="fill-foreground text-foreground" />
							)}
						</button>
					)}

					<div className="flex flex-1 items-center gap-[1.5px] overflow-hidden">
						{barHeights.map((height, index) => (
							<span
								key={index}
								className="w-[2.5px] shrink-0 rounded-full bg-muted-foreground"
								style={{ height }}
							/>
						))}
					</div>

					<span className="ml-3 text-sm font-semibold text-destructive shrink-0">
						{durationText}
					</span>
				</div>

				<div className="flex items-center justify-between">
					<button onClick={onDiscard} title="Discard">
						<Trash2 size={22} className="text-muted-foreground" />
					</button>

					{isRecording ? (
						<button onClick={onPause} title="Stop and preview">
							<Pause size={24} className="fill-destructive text-destructive" />
						</button>
					) : (
						<button onClick={onResume} title="Record again">
							<Mic size={24} className="text-destructive" />
						</button>
					)}

					<button
						onClick={onSend}
						title="Send voice message"
						className="h-11 w-11 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
					>
						<SendHorizontal size={20} />
					</button>
				</div>
			</div>
		</div>
	)
}
