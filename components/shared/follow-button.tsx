"use client"

import { cn } from "@/lib/utils"
import type { MouseEvent } from "react"

interface FollowButtonProps {
	isFollowed: boolean
	followsYou?: boolean
	onClick: (e: MouseEvent<HTMLButtonElement>) => void
	disabled?: boolean
	className?: string
}

/**
 * Single source of truth for follow/unfollow styling — unfollowed uses the
 * high-contrast foreground pill, followed shows "Following" that swaps to
 * "Unfollow" on hover. Override size/spacing via className; color and hover
 * behavior are fixed so every follow button in the app looks and behaves
 * the same.
 */
export function FollowButton({
	isFollowed,
	followsYou = false,
	onClick,
	disabled,
	className,
}: FollowButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"group shrink-0 h-8 px-4 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
				isFollowed
					? "border border-primary text-muted-foreground hover:border-destructive hover:text-destructive hover:bg-destructive/5"
					: "bg-primary text-primary-foreground hover:opacity-85",
				className,
			)}
		>
			<span className={isFollowed ? "group-hover:hidden" : ""}>
				{isFollowed ? "Following" : followsYou ? "Follow Back" : "Follow"}
			</span>
			{isFollowed && <span className="hidden group-hover:inline">Unfollow</span>}
		</button>
	)
}
