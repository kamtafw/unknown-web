import * as Dialog from "@radix-ui/react-dialog"

interface SuccessDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	title: string
	description?: string
	actionLabel: string
	onAction: () => void
}

export function SuccessDialog({
	open,
	onOpenChange,
	title,
	description,
	actionLabel,
	onAction,
}: SuccessDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-white/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50" />
				<Dialog.Content
					className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[calc(100%-2rem)] max-w-104
						bg-white rounded-3xl shadow-lg
						px-5 sm:px-8 py-8 sm:py-12
            text-center focus:outline-none
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          "
				>
					<div className="flex justify-center mb-5">
						<div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full bg-[#EEF1F8] flex items-center justify-center">
							<svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="sm:hidden">
								<path
									d="M7 16.5l6 6L25 10"
									stroke="#6A88D1"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							<svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="hidden sm:block">
								<path
									d="M7 16.5l6 6L25 10"
									stroke="#6A88D1"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>

					<Dialog.Title className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{title}</Dialog.Title>

					{description && (
						<Dialog.Description className="text-sm text-gray-500 mb-6 sm:mb-7 leading-relaxed px-1">
							{description}
						</Dialog.Description>
					)}

					{!description && <div className="mb-5 sm:mb-7" />}

					<button
						onClick={onAction}
						className="
							w-full h-12 sm:h-13 rounded-2xl text-sm text-white font-semibold
							bg-primary hover:bg-primary/85 active:scale-[0.99]
							transition-all duration-200 cursor-pointer
						"
					>
						{actionLabel}
					</button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
