import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import { EmptyFavorites } from "../icons/chat-list-icons"

interface ChatListEmptyStateProps {
	icon: LucideIcon | typeof EmptyFavorites
	title: string
	description: string
	action?: { label: string; onClick: () => void }
	className?: string
}

export function ChatListEmptyState({
	icon: Icon,
	title,
	description,
	action,
	className,
}: ChatListEmptyStateProps) {
	return (
		<div className={cn("flex flex-col items-center text-center px-8 py-16 gap-3", className)}>
			<Icon size={32} />
			<h3 className="font-semibold text-base">{title}</h3>
			<p className="text-sm text-muted-foreground max-w-[26ch]">{description}</p>
			{action && (
				<button
					onClick={action.onClick}
					className="mt-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
				>
					{action.label}
				</button>
			)}
		</div>
	)
}
