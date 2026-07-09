"use client"

import { useBlockUser } from "@/hooks/use-block-actions"
import * as Dialog from "@radix-ui/react-dialog"
import { Loader2 } from "lucide-react"

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

	const handleSubmit = () => {
		blockUser.mutate(pkid, { onSuccess: () => onOpenChange(false) })
	}

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-100 bg-card border border-border rounded-3xl shadow-2xl px-6 py-6 focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
					<Dialog.Title className="font-bold text-foreground text-[15px] mb-1.5">
						Block @{username}?
					</Dialog.Title>

					<Dialog.Description className="text-[13px] text-muted-foreground leading-relaxed mb-6">
						{`They will be able to see your public posts, but will no longer be able to engage with them. @${username} will also not be able to follow or message you, and you will not see notifications from them`}
					</Dialog.Description>

					<div className="flex items-center justify-end gap-4">
						<Dialog.Close asChild>
							<button className="flex-1 text-sm font-semibold text-muted-foreground hover:opacity-70 transition-colors cursor-pointer">
								Cancel
							</button>
						</Dialog.Close>

						<button
							onClick={handleSubmit}
							disabled={blockUser.isPending}
							className="flex-1 text-destructive text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
						>
							{blockUser.isPending ? (
								<>
									<Loader2 size={12} className="animate-spin" /> Blocking…
								</>
							) : (
								`Block @${username}`
							)}
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
