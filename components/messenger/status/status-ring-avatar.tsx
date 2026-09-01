"use client"

import { Avatar } from "radix-ui"

const MAX_RING_SEGMENTS = 30

interface StatusRingAvatarProps {
	total: number
	viewed: number
	avatarUrl?: string | null
	name: string
	initials: string
	size?: number
	isMuted?: boolean
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
	const rad = ((angleDeg - 90) * Math.PI) / 180
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
	const start = polarToCartesian(cx, cy, r, endAngle)
	const end = polarToCartesian(cx, cy, r, startAngle)
	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
	return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

/**
 * Segment count = number of active statuses, capped at 30 (product
 * requirement, literal reading — not proportionally rescaled if someone
 * genuinely has more than 30 active stories, just capped). Unviewed
 * segments render primary-colored, viewed ones dim to muted-foreground —
 * same semantic the old flat ring used, now per-segment.
 */
export function StatusRingAvatar({
	total,
	viewed,
	avatarUrl,
	name,
	initials,
	size = 56,
	isMuted,
}: StatusRingAvatarProps) {
	const segmentCount = Math.min(total, MAX_RING_SEGMENTS)
	const viewedCount = Math.min(viewed, segmentCount)
	const strokeWidth = 2.5
	const radius = size / 2 - strokeWidth
	const cx = size / 2
	const cy = size / 2
	const gapDeg = segmentCount > 1 ? Math.min(6, 40 / segmentCount) : 0
	const segAngle = 360 / Math.max(segmentCount, 1)

	const avatarNode = (
		<Avatar.Root className="h-full w-full rounded-full overflow-hidden bg-muted flex items-center justify-center ring-2 ring-background">
			<Avatar.Image
				src={avatarUrl ?? undefined}
				alt={name}
				className="h-full w-full object-cover"
			/>
			<Avatar.Fallback className="text-sm font-medium text-muted-foreground">
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

	return (
		<div className="relative shrink-0" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="absolute inset-0">
				{Array.from({ length: segmentCount }).map((_, i) => {
					const start = i * segAngle + gapDeg / 2
					const end = (i + 1) * segAngle - gapDeg / 2
					const isViewedSeg = i < viewedCount
					return (
						<path
							key={i}
							d={describeArc(cx, cy, radius, start, end)}
							fill="none"
							stroke={isMuted || isViewedSeg ? "var(--muted-foreground)" : "var(--primary)"}
							strokeOpacity={isMuted ? 0.4 : isViewedSeg ? 0.5 : 1}
							strokeWidth={strokeWidth}
							strokeLinecap="round"
						/>
					)
				})}
			</svg>
			<div className="absolute inset-0 flex items-center justify-center p-0.75">{avatarNode}</div>
		</div>
	)
}
