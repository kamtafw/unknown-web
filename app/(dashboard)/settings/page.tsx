import { Settings } from "@/components/dashboard/settings"
import { Suspense } from "react"

export default function SettingsPage() {
	return (
		<Suspense fallback={null}>
			<Settings />
		</Suspense>
	)
}
