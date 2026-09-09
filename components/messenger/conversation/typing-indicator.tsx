export function TypingIndicator() {
	return (
		<div className="flex items-center gap-1 w-fit bg-card border border-border rounded-2xl rounded-bl-sm px-3.5 py-2.5 mb-1">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
					style={{ animationDelay: `${i * 120}ms` }}
				/>
			))}
		</div>
	)
}
