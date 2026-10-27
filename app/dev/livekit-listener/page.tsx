import { LiveKitListenerHarness } from "./livekit-listener-harness"

export const dynamic = "force-dynamic"

export default function LiveKitListenerPage() {
	if (process.env.NODE_ENV === "production") return <main className="p-6">Not found</main>
	return (
		<main className="mx-auto max-w-2xl space-y-4 p-6">
			<h1 className="text-2xl font-semibold">LiveKit listener proof</h1>
			<p className="text-sm text-muted-foreground">
				Development-only test surface. Enter an existing mobile-created live session ID.
				This does not create or join an AppsCombo session and never publishes microphone audio.
			</p>
			<LiveKitListenerHarness />
		</main>
	)
}
