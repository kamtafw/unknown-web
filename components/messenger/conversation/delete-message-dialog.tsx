"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MessageDeleteType } from "@/lib/messenger/api"

interface DeleteMessageDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onConfirm: (deleteType: MessageDeleteType) => void
}

export function DeleteMessageDialog({ open, onOpenChange, onConfirm }: DeleteMessageDialogProps) {
	const confirm = (deleteType: MessageDeleteType) => {
		onConfirm(deleteType)
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="
					top-[15%]
					translate-y-0
					w-[calc(100%-2rem)]
					max-w-sm
					rounded-[1.05rem]
					border-0
					p-0
					shadow-lg
					[&>button]:hidden
				"
			>
				<DialogHeader className="px-[1.15rem] pt-[1.9rem]">
					<DialogTitle className="text-[1rem] font-semibold leading-6 text-foreground">
						Delete message?
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col items-end gap-1 px-[1.15rem] pb-5">
					<button
						type="button"
						onClick={() => confirm("both")}
						className="
							rounded-md
							px-3
							py-1.5
							text-[0.9375rem]
							font-semibold
							text-primary
							transition-colors
							hover:bg-primary/10
							focus-visible:outline-none
							focus-visible:ring-2
							focus-visible:ring-primary/40
						"
					>
						Delete for everyone
					</button>

					<button
						type="button"
						onClick={() => confirm("self")}
						className="
							rounded-md
							px-3
							py-1.5
							text-[0.9375rem]
							font-semibold
							text-primary
							transition-colors
							hover:bg-primary/10
							focus-visible:outline-none
							focus-visible:ring-2
							focus-visible:ring-primary/40
						"
					>
						Delete for me
					</button>

					<button
						type="button"
						onClick={() => onOpenChange(false)}
						className="
							rounded-md
							px-3
							py-1.5
							text-[0.9375rem]
							font-medium
							text-destructive
							transition-colors
							hover:bg-destructive/10
							focus-visible:outline-none
							focus-visible:ring-2
							focus-visible:ring-destructive/30
						"
					>
						Close
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
