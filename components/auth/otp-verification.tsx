"use client"

import { otpSchema } from "@/lib/schemas"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { FormEvent } from "react"
import { ResendButton } from "../shared/resend-button"

const CODE_LENGTH = 6

interface OTPVerificationProps {
	email: string
	isPending: boolean
	error?: string
	onVerify: (code: string) => void
	onResend: () => void
	onBack: () => void
}

export function OTPVerification({
	email,
	isPending,
	error,
	onVerify,
	onResend,
	onBack,
}: OTPVerificationProps) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (result.success) onVerify(result.data.otp)
	}

	return (
		<div className="min-h-screen bg-background flex items-start justify-center pt-10 sm:pt-24 px-4 pb-10">
			<div className="w-full max-w-110 sm:max-w-2xl">
				{/* Mobile back */}
				<button
					type="button"
					onClick={onBack}
					className="sm:hidden flex items-center gap-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-full px-4 py-2 font-medium mb-6"
				>
					<ArrowLeft size={14} strokeWidth={2} />
					Back
				</button>

				<div className="flex items-start gap-16">
					{/* Desktop back */}
					<div className="hidden sm:block mt-1 shrink-0">
						<button
							type="button"
							onClick={onBack}
							className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-full px-4 py-2 font-medium cursor-pointer"
						>
							<ArrowLeft size={14} strokeWidth={2} />
							Back
						</button>
					</div>

					<div className="flex-1 max-w-110">
						<h1 className="text-2xl font-bold text-foreground mb-1">Enter code</h1>
						<p className="block text-sm text-muted-foreground mb-1">
							Enter the {CODE_LENGTH} digit code we sent to your email.
						</p>
						<p className="text-sm font-semibold text-foreground mb-6 sm:mb-7 break-all">{email}</p>

						<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
							<Form.Field name="otp" className="flex flex-col gap-3">
								<OneTimePasswordField.Root
									name="otp"
									validationType="numeric"
									autoComplete="one-time-code"
									className="flex gap-1.5 sm:gap-2.5"
									aria-label="One-time-password"
								>
									{Array.from({ length: CODE_LENGTH }).map((_, i) => (
										<OneTimePasswordField.Input
											key={i}
											className="
													flex-1 min-w-0
													h-12 sm:h-15.5 w-12 sm:w-15.5
													text-center text-lg sm:text-xl font-semibold
													bg-muted text-foreground rounded-xl
													border-2 border-transparent
													focus:outline-none focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary
													caret-primary transition-all duration-150
												"
										/>
									))}
									<OneTimePasswordField.HiddenInput />
								</OneTimePasswordField.Root>

								<Form.Message
									match={(value) => value.length > 0 && value.length < CODE_LENGTH}
									className="text-xs text-destructive"
								>
									Enter all {CODE_LENGTH} digits
								</Form.Message>
								<Form.Message
									match={(value) => value.length === CODE_LENGTH && !/^\d+$/.test(value)}
									className="text-xs text-destructive"
								>
									Code must be numeric
								</Form.Message>
							</Form.Field>

							{error && <p className="text-sm text-destructive text-center -mt-2">{error}</p>}

							<Form.Submit asChild>
								<button
									disabled={isPending}
									className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold transition-all duration-200 bg-primary hover:bg-primary/85 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
								>
									{isPending ? (
										<>
											<Loader2 size={15} className="animate-spin" />
											Verifying...
										</>
									) : (
										"Verify Code"
									)}
								</button>
							</Form.Submit>

							<ResendButton onResend={onResend} />
						</Form.Root>
					</div>
				</div>
			</div>
		</div>
	)
}
