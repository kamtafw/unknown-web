"use client"

import {
	useAvailableTimezones,
	useChangeTimezone,
	useTimezonePreference,
} from "@/hooks/use-timezone"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, Loader2, Search } from "lucide-react"
import { useRef, useState } from "react"

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-accent transition-colors"
				aria-label="Back"
			>
				<ArrowLeft size={15} className="text-muted-foreground" strokeWidth={2.5} />
			</button>
			<h2 className="font-bold text-foreground">{title}</h2>
		</div>
	)
}

export function TimeZonePanel({ onBack }: { onBack: () => void }) {
	const { data: preferenceData, isLoading: prefLoading } = useTimezonePreference()
	const { data: tzData, isLoading: tzLoading } = useAvailableTimezones("en")
	const changeTimezone = useChangeTimezone()

	const [search, setSearch] = useState("")
	const [selected, setSelected] = useState<string | null>(null)
	const searchRef = useRef<HTMLInputElement>(null)

	const currentTimezone = preferenceData?.data?.timezone ?? null
	const timezones = tzData?.data?.timezones ?? []
	const activeValue = selected ?? currentTimezone

	const q = search.trim().toLowerCase()
	const filtered = q
		? timezones.filter(
				(tz) => tz.label.toLowerCase().includes(q) || tz.value.toLowerCase().includes(q),
			)
		: timezones

	const isDirty = selected !== null && selected !== currentTimezone

	const handleSave = () => {
		if (!isDirty || changeTimezone.isPending) return
		changeTimezone.mutate({ timezone: selected! }, { onSuccess: () => onBack() })
	}

	const isLoading = prefLoading || tzLoading

	return (
		<div className="border-l border-border h-full flex flex-col overflow-hidden">
			<PanelHeader title="Time Zone" onBack={onBack} />

			<div className="px-5 pt-4 pb-2 shrink-0">
				{currentTimezone && !isLoading && (
					<p className="text-[12px] text-muted-foreground mb-2.5">
						Current:{" "}
						<span className="font-medium text-foreground">
							{timezones.find((t) => t.value === currentTimezone)?.label ?? currentTimezone}
						</span>
					</p>
				)}
				<div className="flex items-center gap-2 px-3.5 h-10 rounded-xl border border-input focus-within:border-primary transition-colors bg-muted focus-within:bg-card">
					<Search size={14} className="text-muted-foreground shrink-0" />
					<input
						ref={searchRef}
						type="text"
						placeholder="Search timezone…"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
					/>
				</div>
			</div>

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden min-h-0">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 size={20} className="animate-spin text-primary" />
					</div>
				) : filtered.length === 0 ? (
					<p className="text-center text-sm text-muted-foreground py-8">No timezones found</p>
				) : (
					<div className="py-1">
						{filtered.map((tz) => {
							const isActive = tz.value === activeValue
							return (
								<button
									key={tz.value}
									onClick={() => setSelected(tz.value)}
									className={cn(
										"w-full flex items-center justify-between gap-3 px-5 py-3 text-left transition-colors",
										isActive ? "bg-primary/5" : "hover:bg-accent",
									)}
								>
									<div className="min-w-0">
										<p
											className={cn(
												"text-[13px] font-medium leading-tight truncate",
												isActive ? "text-primary" : "text-foreground",
											)}
										>
											{tz.label}
										</p>
										<p className="text-[11px] text-muted-foreground mt-0.5 truncate">{tz.value}</p>
									</div>
									{isActive && (
										<Check size={15} className="text-primary shrink-0" strokeWidth={2.5} />
									)}
								</button>
							)
						})}
					</div>
				)}
			</div>

			<div className="shrink-0 px-5 py-4 border-t border-border">
				<button
					onClick={handleSave}
					disabled={!isDirty || changeTimezone.isPending}
					className="w-full h-12 rounded-full bg-primary text-primary-foreground text-[14px] font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
				>
					{changeTimezone.isPending ? (
						<>
							<Loader2 size={14} className="animate-spin" /> Saving…
						</>
					) : (
						"Save"
					)}
				</button>
			</div>
		</div>
	)
}