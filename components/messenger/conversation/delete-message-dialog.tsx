"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MessageDeleteType } from "@/lib/messenger/api"

interface DeleteMessageDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (deleteType: MessageDeleteType) => void
}

export function DeleteMessageDialog({ open, onOpenChange, onConfirm }: DeleteMessageDialogProps) {
	const confirm = (type: MessageDeleteType) => {
		onConfirm(type)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Delete message?</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-2">
					<button
						onClick={() => confirm("self")}
						className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left hover:bg-accent transition-colors"
					>
						Delete for me
					</button>
					<button
						onClick={() => confirm("both")}
						className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left text-destructive hover:bg-destructive/10 transition-colors"
					>
						Delete for everyone
					</button>
					<button
						onClick={() => onOpenChange(false)}
						className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left text-muted-foreground hover:bg-accent transition-colors"
					>
						Cancel
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
