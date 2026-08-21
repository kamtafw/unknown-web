import { MessageCircle } from "lucide-react"

export function MessengerEmptyState() {
	return (
		<div className="hidden sm:flex flex-1 flex-col items-center justify-center gap-4 text-center px-8">
			<div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground">
				<MessageCircle size={28} />
			</div>
			<p className="text-muted-foreground">Send and receive message with your laptop</p>
		</div>
	)
}
