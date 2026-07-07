"use client"

import { useReadAloud } from "@/hooks/use-read-aloud"
import * as Dialog from "@radix-ui/react-dialog"
import { Pause, Play, Volume2, X } from "lucide-react"
import { useEffect, useMemo } from "react"

function formatTime(ms: number) {
	const totalSec = Math.floor(ms / 1000)
	const m = Math.floor(totalSec / 60)
	const s = totalSec % 60
	return `${m}:${String(s).padStart(2, "0")}`
}

const BAR_COUNT = 46

export function ReadAloudModal({
	text,
	open,
	onOpenChange,
}: {
	text: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const { status, elapsedMs, progress, play, pause, stop } = useReadAloud(text)

	useEffect(() => {
		if (open) play()
		else stop()
	}, [open])

	const bars = useMemo(
		() => Array.from({ length: BAR_COUNT }, () => 30 + Math.round(Math.random() * 70)),
		[text],
	)
	const activeBars = Math.round(progress * BAR_COUNT)

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-110 bg-card border border-border rounded-3xl shadow-2xl px-6 py-7 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<div className="flex items-center justify-between mb-8">
						<Dialog.Title className="font-bold text-foreground text-[16px]">
							Read post out loud
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>
					<Dialog.Description className="sr-only">
						Listening to this post read aloud
					</Dialog.Description>

					<div className="flex flex-col items-center">
						<div className="relative w-38 h-38 flex items-center justify-center mb-5">
							<span
								className={`absolute inset-0 rounded-full bg-primary/10 ${status === "playing" ? "animate-pulse" : ""}`}
							/>
							<span className="absolute inset-3 rounded-full bg-primary/15" />
							<span className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center">
								<Volume2 size={30} className="text-primary-foreground" />
							</span>
						</div>

						<p className="text-[15px] text-muted-foreground mb-1">
							{status === "done" ? "Finished reading" : "Reading post out loud"}
						</p>
						<p className="text-2xl font-semibold text-foreground tabular-nums mb-6">
							{formatTime(elapsedMs)}
						</p>

						<div className="flex items-center gap-3 w-full mb-8">
							<span className="text-xs text-muted-foreground tabular-nums shrink-0 w-8">
								{formatTime(elapsedMs)}
							</span>
							<div className="flex items-end gap-0.5 flex-1 h-9 overflow-hidden">
								{bars.map((h, i) => (
									<span
										key={i}
										className={`flex-1 rounded-full transition-colors ${i < activeBars ? "bg-primary" : "bg-muted"}`}
										style={{ height: `${h}%` }}
									/>
								))}
							</div>
						</div>

						<button
							onClick={() => (status === "playing" ? pause() : play())}
							className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/85 active:scale-95 transition-all shadow-sm"
						>
							{status === "playing" ? (
								<Pause size={22} fill="currentColor" />
							) : (
								<Play size={22} fill="currentColor" className="ml-0.5" />
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}