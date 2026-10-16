"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CalendarDays, Compass, MapPin, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type EventTab = "discover" | "mine"

export default function EventsPage() {
	const searchParams = useSearchParams()
	const [activeTab, setActiveTab] = useState<EventTab>(searchParams.get("view") === "mine" ? "mine" : "discover")
	const [search, setSearch] = useState("")
	const [locationState, setLocationState] = useState<"idle" | "requesting" | "denied" | "captured">("idle")

	useEffect(() => {
		setActiveTab(searchParams.get("view") === "mine" ? "mine" : "discover")
	}, [searchParams])

	const requestLocation = () => {
		if (!navigator.geolocation) {
			setLocationState("denied")
			return
		}

		setLocationState("requesting")
		navigator.geolocation.getCurrentPosition(
			() => setLocationState("captured"),
			() => setLocationState("denied"),
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
		)
	}

	return (
		<main className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-border bg-background">
			<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
							<Compass size={16} /> AppsCombo Events
						</p>
						<h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
							Find your people. Be there.
						</h1>
						<p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
							Discover events happening around you or keep track of the ones you&apos;re part of.
						</p>
					</div>
					<Button className="rounded-full" onClick={() => window.location.assign("/events/create")}>
						<Plus size={17} /> Create event
					</Button>
				</div>

				<div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="inline-flex w-fit rounded-full border border-border bg-card p-1">
						<button
							type="button"
							onClick={() => setActiveTab("discover")}
							aria-pressed={activeTab === "discover"}
							className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "discover" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
						>
							Discover
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("mine")}
							aria-pressed={activeTab === "mine"}
							className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${activeTab === "mine" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
						>
							My events
						</button>
					</div>

					<label className="relative block w-full sm:max-w-sm">
						<Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder={activeTab === "discover" ? "Search nearby events" : "Search my events"}
							className="h-11 rounded-full bg-card pl-10"
							aria-label={activeTab === "discover" ? "Search nearby events" : "Search my events"}
						/>
					</label>
				</div>

				<section className="mt-6 rounded-2xl border border-border bg-card px-5 py-12 text-center sm:px-10">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
						{activeTab === "discover" ? <MapPin size={25} /> : <CalendarDays size={25} />}
					</div>
					<h2 className="mt-5 text-lg font-semibold text-foreground">
						{activeTab === "discover" ? "Discover events near you" : "Your events, all in one place"}
					</h2>
					<p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
						{activeTab === "discover"
							? "Events are shown based on your location. Allow location access to find what is happening nearby."
							: "Events you host or have joined will appear here once we connect your event list."}
					</p>
					{activeTab === "discover" && (
						<div className="mt-5 flex flex-col items-center gap-3">
							<Button onClick={requestLocation} disabled={locationState === "requesting"} className="rounded-full">
								<MapPin size={16} />
								{locationState === "requesting" ? "Getting location…" : locationState === "captured" ? "Location captured" : "Use my location"}
							</Button>
							{locationState === "captured" && (
								<p role="status" className="max-w-md text-sm text-muted-foreground">Location access is working. Nearby event results will appear here when the Events API integration is connected.</p>
							)}
							{locationState === "denied" && (
								<p role="status" className="max-w-md text-sm text-destructive">
									Location access wasn&apos;t available. Enable it in your browser settings and try again. We won&apos;t show a global event list as a fallback.
								</p>
							)}
						</div>
					)}
					{activeTab === "mine" && (
						<Button variant="outline" className="mt-5 rounded-full" onClick={() => setActiveTab("discover")}>
							<Compass size={16} /> Explore nearby
						</Button>
					)}
				</section>
				<p className="mt-4 text-xs text-muted-foreground">
					{search.trim() ? "Search will filter the events available in this view." : "Event listings will appear here when the API integration is connected."}
				</p>
			</div>
		</main>
	)
}
