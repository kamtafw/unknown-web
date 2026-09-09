import { AppsComboStripped } from "./icons/shared"

export function MessengerEmptyState() {
	return (
		<div className="hidden sm:flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
			<AppsComboStripped />
			<p className="text-muted-foreground">Send and receive message with your laptop</p>
		</div>
	)
}
