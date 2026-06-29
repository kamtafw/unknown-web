import * as Dialog from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import Image from "next/image"

interface TermsDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onContinue: () => void
	onTerms: () => void
	onPrivacyPolicy: () => void
}

export function TermsDialog({
	open,
	onOpenChange,
	onContinue,
	onTerms,
	onPrivacyPolicy,
}: TermsDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
				<Dialog.Content
					className="
						fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
						w-[calc(100%-2rem)] max-w-104
						bg-card rounded-3xl shadow-xl border border-border
						px-5 sm:px-10 py-7 sm:py-10
						focus:outline-none
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
					"
				>
					<Dialog.Close asChild>
						<button className="absolute top-3 right-3 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground p-1.5 rounded-full hover:bg-muted transition-colors focus:outline-none">
							<XIcon size={18} />
						</button>
					</Dialog.Close>

					<div className="flex items-center justify-center mb-5 sm:mb-6">
						<Image
							src="/logo.svg"
							alt="Appscombo logo"
							width={140}
							height={44}
							className="object-contain w-32 sm:w-40 h-auto"
							priority
						/>
					</div>

					<Dialog.Title className="sr-only">Terms & Conditions</Dialog.Title>
					<Dialog.Description className="sr-only">
						Terms & Conditions, and Privacy Policy
					</Dialog.Description>

					<p className="text-sm text-muted-foreground text-center leading-relaxed mb-5 sm:mb-6">
						By signing up with AppsCombo, you have agreed to our{" "}
						<button
							type="button"
							onClick={onTerms}
							className="text-primary font-semibold cursor-pointer hover:underline focus:outline-none"
						>
							Terms & Conditions
						</button>
						, and{" "}
						<button
							type="button"
							onClick={onPrivacyPolicy}
							className="text-primary font-semibold cursor-pointer hover:underline focus:outline-none"
						>
							Privacy Policy
						</button>
						.
					</p>

					<button
						onClick={onContinue}
						className="w-full h-12 sm:h-13 rounded-full text-sm text-primary-foreground font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 cursor-pointer shadow-sm"
					>
						Continue to sign up
					</button>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
