export function DateSeparator({ label }: { label: string }) {
	return (
		<div className="flex justify-center py-2">
			<span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
				{label}
			</span>
		</div>
	)
}
