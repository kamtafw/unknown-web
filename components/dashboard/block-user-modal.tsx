"use client"

import { useBlockUser } from "@/hooks/use-post-interactions"
import * as Dialog from "@radix-ui/react-dialog"
import * as RadioGroup from "@radix-ui/react-radio-group"
import { Loader2, X } from "lucide-react"
import { useState } from "react"

const REASONS = [
	"They're posting spam or fake content",
	"They're harassing or bullying me",
	"They're impersonating someone",
	"I just don't want to see their content",
]

export function BlockUserModal({
	pkid,
	username,
	open,
	onOpenChange,
}: {
	pkid: number
	username: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const blockUser = useBlockUser()
	const [reason, setReason] = useState("")
	const [feedback, setFeedback] = useState("")
	const MAX = 200

	const handleSubmit = () => {
		blockUser.mutate(
			{ pkid, reason: reason === "Other" ? feedback.trim() || undefined : reason || undefined },
			{ onSuccess: () => onOpenChange(false) },
		)
	}

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-100 bg-card border border-border rounded-3xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<div className="flex items-center justify-between mb-5">
						<Dialog.Title className="font-bold text-foreground text-[16px]">
							Block @{username}?
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					<Dialog.Description className="text-[13px] text-muted-foreground leading-relaxed mb-5">
						They won&apos;t be able to see your posts or contact you. They won&apos;t be notified.
					</Dialog.Description>

					<p className="text-sm font-semibold text-foreground mb-3">
						Help us understand why (optional)
					</p>

					<RadioGroup.Root value={reason} onValueChange={setReason} className="flex flex-col mb-4">
						{[...REASONS, "Other"].map((r) => (
							<label
								key={r}
								className="flex items-center gap-3 py-2.5 border-b border-border/60 last:border-0 cursor-pointer"
							>
								<RadioGroup.Item
									value={r}
									className="w-5 h-5 rounded-full border-2 border-input data-[state=checked]:border-primary flex items-center justify-center shrink-0"
								>
									<RadioGroup.Indicator className="block w-2.5 h-2.5 rounded-full bg-primary" />
								</RadioGroup.Item>
								<span className="text-[13px] text-foreground">{r}</span>
							</label>
						))}
					</RadioGroup.Root>

					{reason === "Other" && (
						<textarea
							value={feedback}
							onChange={(e) => setFeedback(e.target.value.slice(0, MAX))}
							placeholder="Tell us more…"
							rows={3}
							className="w-full rounded-xl border border-input focus:border-primary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors bg-card mb-4 resize-none"
						/>
					)}

					<button
						onClick={handleSubmit}
						disabled={blockUser.isPending}
						className="w-full h-12 rounded-full bg-destructive text-white text-sm font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
					>
						{blockUser.isPending ? (
							<>
								<Loader2 size={14} className="animate-spin" /> Blocking…
							</>
						) : (
							`Block @${username}`
						)}
					</button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
