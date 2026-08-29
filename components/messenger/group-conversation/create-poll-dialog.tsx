"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useCreatePoll } from "@/hooks/messenger/use-create-poll"
import { toast } from "@/lib/toast"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import { PermissionToggleRow } from "../group-conversation/permission-toggle-row"

interface CreatePollDialogProps {
	groupId: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

/**
 * Text-only — no image step. Mobile's create-poll.tsx supports poll
 * images via its generic media-upload hook; this app has no confirmed
 * generic upload utility wired up for Messenger yet (same gap documented
 * for the group icon in create-group-dialog.tsx). Additive once that
 * infra lands — just another `metadata` field, no new endpoint.
 *
 * No "close early" control — confirmed no manual-close endpoint exists
 * on mobile either. Duration is the only close mechanism.
 */
export function CreatePollDialog({ groupId, open, onOpenChange }: CreatePollDialogProps) {
	const [question, setQuestion] = useState("")
	const [options, setOptions] = useState(["", ""])
	const [allowMultiple, setAllowMultiple] = useState(true)
	const [isAnonymous, setIsAnonymous] = useState(false)
	const [hasDuration, setHasDuration] = useState(false)
	const [days, setDays] = useState("0")
	const [hours, setHours] = useState("0")
	const [mins, setMins] = useState("0")

	const { createPoll, isPending } = useCreatePoll(groupId)

	const resetAndClose = () => {
		setQuestion("")
		setOptions(["", ""])
		setAllowMultiple(true)
		setIsAnonymous(false)
		setHasDuration(false)
		setDays("0")
		setHours("0")
		setMins("0")
		onOpenChange(false)
	}

	const updateOption = (index: number, text: string) =>
		setOptions((prev) => prev.map((o, i) => (i === index ? text : o)))
	const deleteOption = (index: number) => {
		if (options.length <= 2) return
		setOptions((prev) => prev.filter((_, i) => i !== index))
	}
	const addOption = () => {
		if (options.length >= 10) {
			toast.error("Maximum 10 options allowed")
			return
		}
		setOptions((prev) => [...prev, ""])
	}

	const handleCreate = async () => {
		const trimmedQuestion = question.trim()
		if (!trimmedQuestion) {
			toast.error("Please enter a question")
			return
		}
		const validOptions = options.map((o) => o.trim()).filter(Boolean)
		if (validOptions.length < 2) {
			toast.error("Please add at least 2 options")
			return
		}

		let durationMinutes: number | undefined
		if (hasDuration) {
			durationMinutes =
				(parseInt(days, 10) || 0) * 1440 +
				(parseInt(hours, 10) || 0) * 60 +
				(parseInt(mins, 10) || 0)
			if (durationMinutes <= 0) durationMinutes = undefined
		}

		const ok = await createPoll({
			question: trimmedQuestion,
			options: validOptions,
			allowMultiple,
			isAnonymous,
			durationMinutes,
		})
		if (ok) resetAndClose()
	}

	return (
		<Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : resetAndClose())}>
			<DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create Poll</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div>
						<p className="mb-1.5 text-sm font-medium">Question</p>
						<Input
							autoFocus
							placeholder="Ask a question"
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
						/>
					</div>

					<div>
						<p className="mb-2 text-sm font-medium">Options</p>
						<div className="flex flex-col gap-2">
							{options.map((opt, i) => (
								<div key={i} className="flex items-center gap-2">
									<Input
										placeholder={`Option ${i + 1}`}
										value={opt}
										onChange={(e) => updateOption(i, e.target.value)}
									/>
									<button
										onClick={() => deleteOption(i)}
										disabled={options.length <= 2}
										className="h-9 w-9 shrink-0 rounded-lg border border-border flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-accent transition-colors"
									>
										<Trash2 size={15} />
									</button>
								</div>
							))}
						</div>
						<button
							onClick={addOption}
							className="mt-2 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
						>
							<Plus size={15} /> Add option
						</button>
					</div>

					<div className="flex flex-col gap-1 -mx-1">
						<PermissionToggleRow
							label="Anonymous votes"
							checked={isAnonymous}
							onChange={setIsAnonymous}
						/>
						<PermissionToggleRow
							label="Allow multiple answers"
							checked={allowMultiple}
							onChange={setAllowMultiple}
						/>
						<PermissionToggleRow
							label="Add poll duration"
							checked={hasDuration}
							onChange={setHasDuration}
						/>
						{hasDuration && (
							<div className="flex items-center gap-3 px-3 py-1">
								{[
									{ label: "Days", value: days, onChange: setDays },
									{ label: "Hrs", value: hours, onChange: setHours },
									{ label: "Mins", value: mins, onChange: setMins },
								].map((field) => (
									<div key={field.label} className="flex items-center gap-1.5">
										<input
											value={field.value}
											onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
											inputMode="numeric"
											maxLength={3}
											className="w-12 rounded-lg border border-border px-2 py-1.5 text-center text-sm outline-none focus:border-primary"
										/>
										<span className="text-xs text-muted-foreground">{field.label}</span>
									</div>
								))}
							</div>
						)}
						{hasDuration && (
							<p className="px-3 text-xs text-muted-foreground">
								Poll closes automatically after this time — ending it early isn&apos;t supported
								yet.
							</p>
						)}
					</div>

					<button
						onClick={handleCreate}
						disabled={isPending}
						className="w-full py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
					>
						{isPending ? "Creating…" : "Create Poll"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
