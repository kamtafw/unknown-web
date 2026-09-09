export function DateSeparator({ label }: { label: string }) {
	return (
		<div className="flex justify-center px-4 py-5">
			<span className="rounded-full bg-white/75 px-3 py-1 text-[11px] font-xs text-muted-foreground shadow-sm backdrop-blur-sm">
				{label}
			</span>
		</div>
	)
}
