"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePauseGroup } from "@/hooks/messenger/use-group-admin"
import { useState } from "react"

interface PauseGroupDialogProps {
	groupId: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function PauseGroupDialog({ groupId, open, onOpenChange }: PauseGroupDialogProps) {
	const pauseGroup = usePauseGroup(groupId)
	const [indefinite, setIndefinite] = useState(true)
	const [date, setDate] = useState("")
	const [time, setTime] = useState("")

	const handleConfirm = async () => {
		let pauseUntil: string | null = null
		if (!indefinite) {
			if (!date || !time) return
			const merged = new Date(`${date}T00:00:00`)
			const [h, m] = time.split(":").map(Number)
			merged.setHours(h, m, 0, 0)
			if (merged.getTime() <= Date.now()) return
			pauseUntil = merged.toISOString()
		}
		await pauseGroup.mutateAsync({ pause: true, pause_until: pauseUntil })
		onOpenChange(false)
		setIndefinite(true)
		setDate("")
		setTime("")
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Pause group</DialogTitle>
				</DialogHeader>

				<p className="text-sm text-muted-foreground">
					No one will be able to send messages while the group is paused.
				</p>

				<div className="flex flex-col gap-3">
					<label className="flex items-center gap-2 text-sm">
						<input type="radio" checked={indefinite} onChange={() => setIndefinite(true)} />
						Until I resume it manually
					</label>
					<label className="flex items-center gap-2 text-sm">
						<input type="radio" checked={!indefinite} onChange={() => setIndefinite(false)} />
						Resume automatically at a set time
					</label>

					{!indefinite && (
						<div className="flex gap-3 pl-6">
							<input
								type="date"
								value={date}
								min={new Date().toISOString().slice(0, 10)}
								onChange={(e) => setDate(e.target.value)}
								className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
							/>
							<input
								type="time"
								value={time}
								onChange={(e) => setTime(e.target.value)}
								className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary"
							/>
						</div>
					)}
				</div>

				<button
					onClick={handleConfirm}
					disabled={pauseGroup.isPending || (!indefinite && (!date || !time))}
					className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
				>
					{pauseGroup.isPending ? "Pausing…" : "Pause group"}
				</button>
			</DialogContent>
		</Dialog>
	)
}
