import { Plus } from "lucide-react"
import Link from "next/link"

/**
 * Floating "create event" action from the My events design (EV-014). A plain link to `?create=1`
 * (a query-only href keeps the current tab), so it needs no router state and is usable by keyboard.
 */
export function CreateEventButton() {
	return (
		<Link
			href="?create=1"
			scroll={false}
			aria-label="Create event"
			className="absolute bottom-6 right-4 flex size-[52px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:right-6"
		>
			<Plus size={24} aria-hidden />
		</Link>
	)
}
