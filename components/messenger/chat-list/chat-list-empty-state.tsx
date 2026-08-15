import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ChatListEmptyStateProps {
	icon: LucideIcon
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
			<div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
				<Icon size={26} />
			</div>
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
