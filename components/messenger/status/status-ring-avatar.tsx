"use client"

import { Avatar } from "radix-ui"

const MAX_RING_SEGMENTS = 30

interface StatusRingAvatarProps {
	total: number
	viewedFlags: boolean[]
	avatarUrl?: string | null
	name: string
	initials: string
	size?: number
	isMuted?: boolean
}

// 1. Corrected Math: Standard clockwise polar coordinate mapper
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
	// Subtracting 90 degrees ensures 0 deg starts exactly at the top (12 o'clock)
	const rad = ((angleDeg - 90) * Math.PI) / 180
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// 2. Fixed Arc Generator: Uses sweep-flag '1' to draw clockwise from start to end
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
	const start = polarToCartesian(cx, cy, r, startAngle)
	const end = polarToCartesian(cx, cy, r, endAngle)
	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
	// Sweep flag '1' ensures a clean clockwise arc path
	return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

export function StatusRingAvatar({
	total,
	viewedFlags,
	avatarUrl,
	name,
	initials,
	size = 56,
	isMuted,
}: StatusRingAvatarProps) {
	const segmentCount = Math.min(total, MAX_RING_SEGMENTS)
	const flags = viewedFlags.slice(0, segmentCount)
	const viewedCount = flags.filter(Boolean).length

	const strokeWidth = 3 // Slightly thicker for crisp visibility
	const gapSize = 4 // Clear spacing between segments

	const radius = size / 2 - strokeWidth / 2
	const cx = size / 2
	const cy = size / 2

	// Dynamic gap handling based on total segments
	const gapDeg = segmentCount > 1 ? Math.min(8, 40 / segmentCount) : 0
	const segAngle = 360 / Math.max(segmentCount, 1)
	const lineCap: "round" | "butt" = segmentCount > 12 ? "butt" : "round"

	const ringLabel =
		segmentCount === 0
			? undefined
			: `${name}, ${segmentCount} ${segmentCount === 1 ? "status update" : "status updates"}, ${viewedCount} viewed${isMuted ? ", muted" : ""}`

	const avatarNode = (
		<Avatar.Root className="h-full w-full rounded-full overflow-hidden bg-muted flex items-center justify-center">
			<Avatar.Image
				src={avatarUrl ?? undefined}
				alt={name}
				className="h-full w-full object-cover"
			/>
			<Avatar.Fallback className="text-sm font-semibold text-muted-foreground uppercase">
				{initials}
			</Avatar.Fallback>
		</Avatar.Root>
	)

	if (segmentCount === 0) {
		return (
			<div style={{ width: size, height: size }} className="shrink-0">
				{avatarNode}
			</div>
		)
	}

	const ringColor = isMuted ? "var(--muted-foreground)" : "var(--primary)"

	// Dynamically calculate the perfect inner spacing for the avatar container
	const avatarWrapperInset = strokeWidth + gapSize

	return (
		<div
			role="img"
			aria-label={ringLabel}
			className="relative shrink-0 transition-transform duration-150 ease-out group-active:scale-95 motion-reduce:transition-none"
			style={{ width: size, height: size }}
		>
			{/* Status Ring Container */}
			<svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
				{segmentCount === 1 ? (
					<circle
						cx={cx}
						cy={cy}
						r={radius}
						fill="none"
						stroke={ringColor}
						strokeOpacity={isMuted ? 0.4 : viewedCount >= 1 ? 0.5 : 1}
						strokeWidth={strokeWidth}
					/>
				) : (
					Array.from({ length: segmentCount }).map((_, i) => {
						// Calculate exact arc spans with gaps
						const start = i * segAngle + gapDeg / 2
						const end = (i + 1) * segAngle - gapDeg / 2
						const isViewedSeg = flags[i]

						return (
							<path
								key={i}
								d={describeArc(cx, cy, radius, start, end)}
								fill="none"
								stroke={isMuted || isViewedSeg ? "var(--muted-foreground)" : "var(--primary)"}
								strokeOpacity={isMuted ? 0.4 : isViewedSeg ? 0.35 : 1}
								strokeWidth={strokeWidth}
								strokeLinecap={lineCap}
							/>
						)
					})
				)}
			</svg>

			{/* Inner Avatar Wrapper with exact physical offsets */}
			<div
				className="absolute flex items-center justify-center bg-background rounded-full"
				style={{
					top: avatarWrapperInset,
					left: avatarWrapperInset,
					right: avatarWrapperInset,
					bottom: avatarWrapperInset,
				}}
			>
				{avatarNode}
			</div>
		</div>
	)
}
