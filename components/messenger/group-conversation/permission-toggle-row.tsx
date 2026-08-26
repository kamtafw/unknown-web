"use client"

import { cn } from "@/lib/utils"

interface PermissionToggleRowProps {
	label: string
	checked: boolean
	onChange: (value: boolean) => void
	disabled?: boolean
}

export function PermissionToggleRow({
	label,
	checked,
	onChange,
	disabled,
}: PermissionToggleRowProps) {
	return (
		<button
			onClick={() => onChange(!checked)}
			disabled={disabled}
			className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<span className="text-sm">{label}</span>
			<span
				className={cn(
					"relative h-5 w-9 rounded-full transition-colors shrink-0",
					checked ? "bg-primary" : "bg-muted",
				)}
			>
				<span
					className={cn(
						"absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform",
						checked ? "translate-x-4" : "translate-x-0.5",
					)}
				/>
			</span>
		</button>
	)
}
