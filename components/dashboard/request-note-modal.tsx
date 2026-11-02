"use client"

import { useRequestCommunityNote } from "@/hooks/use-post-interactions"
import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, X } from "lucide-react"
import { useState } from "react"

const POINTS = [
	{ emoji: "🚨", text: "Contributors will see an alert on this post and can respond to requests" },
	{
		emoji: "📝",
		text: "If a note is written and rated helpful by other contributors, it will be shown on this post",
	},
	{
		emoji: "🗣️",
		text: "AppsCombo doesn't choose which note to show — community notes are by the people, for the people",
	},
]

export function RequestNoteModal({
	postId,
	open,
	onOpenChange,
}: {
	postId: string
	open: boolean
	onOpenChange: (open: boolean) => void
}) {
	const requestNote = useRequestCommunityNote()
	const [submitted, setSubmitted] = useState(false)
	const [reason, setReason] = useState("")
	const [description, setDescription] = useState("")

	const handleAgree = () => {
		if (!reason.trim() || !description.trim()) return
		requestNote.mutate({ post: postId, reason: reason.trim(), description: description.trim(), evidence_urls: [] }, { onSuccess: (res) => res.success && setSubmitted(true) })
	}

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(v) => {
				if (!v) { setSubmitted(false); setReason(""); setDescription("") }
				onOpenChange(v)
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-110 max-h-[85vh] overflow-y-auto bg-card border border-border rounded-3xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 [&::-webkit-scrollbar]:hidden">
					<div className="flex items-center justify-between mb-5">
						<Dialog.Title className="font-bold text-foreground text-[16px]">
							Request note
						</Dialog.Title>
						<Dialog.Close asChild>
							<button className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors">
								<X size={18} />
							</button>
						</Dialog.Close>
					</div>

					{submitted ? (
						<div className="flex flex-col items-center text-center py-6 gap-3">
							<div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
								<span className="text-2xl">🙌</span>
							</div>
							<p className="font-semibold text-foreground text-[15px]">Note requested</p>
							<p className="text-[13px] text-muted-foreground leading-relaxed max-w-72">
								Your community note request has been submitted for review.
							</p>
							<button
								onClick={() => onOpenChange(false)}
								className="mt-2 h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"
							>
								Done
							</button>
						</div>
					) : (
						<>
							<h3 className="text-xl font-bold text-foreground leading-snug mb-2">
								Request a note from AppsCombo about this post
							</h3>
							<Dialog.Description className="text-[13.5px] text-muted-foreground leading-relaxed mb-6">
								You think this post is misleading? Request a note from the community.
							</Dialog.Description>

							<div className="flex flex-col gap-4 mb-6">
								{POINTS.map((p) => (
									<div key={p.text} className="flex items-start gap-3">
										<span className="text-xl shrink-0 leading-none mt-0.5">{p.emoji}</span>
										<p className="text-[13.5px] font-medium text-foreground leading-relaxed">
											{p.text}
										</p>
									</div>
								))}
							</div>

							<p className="text-[12px] text-muted-foreground leading-relaxed mb-1">
								Requests are anonymized and made available to the public for transparency.
							</p>
							<div className="my-5 space-y-4">
                                <label className="block text-sm font-medium">Reason
                                    <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} className="mt-2 w-full rounded-xl border border-border bg-background p-3" placeholder="Why does this post need a note?" />
                                </label>
                                <label className="block text-sm font-medium">Details
                                    <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 min-h-24 w-full rounded-xl border border-border bg-background p-3" placeholder="Explain what needs context or correction" />
                                </label>
                                {requestNote.isError && <p role="alert" className="text-sm text-destructive">Could not submit your request. Please try again.</p>}
                            </div>

							<button
								onClick={handleAgree}
								disabled={requestNote.isPending || !reason.trim() || !description.trim()}
								className="w-full h-12.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
							>
								{requestNote.isPending ? (
									<>
										<Loader2 size={14} className="animate-spin" /> Requesting…
									</>
								) : (
									"Agree and request a note"
								)}
							</button>
						</>
					)}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
