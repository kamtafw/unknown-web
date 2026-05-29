"use client"

import { FormEvent } from "react"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { ArrowLeft, Loader2 } from "lucide-react"
import { otpSchema } from "@/lib/schemas"

const CODE_LENGTH = 6

interface OTPVerificationProps {
	email: string
	isPending: boolean
	onVerify: (code: string) => void
	onResend: () => void
	onBack: () => void
}

export function OTPVerification({
	email,
	isPending,
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
		<div className="min-h-screen bg-white flex items-start justify-center pt-24 px-4">
			<div className="flex items-start gap-16 w-full max-w-2xl">
				<div className="mt-1">
					<button
						type="button"
						onClick={onBack}
						className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-2 font-medium"
					>
						<ArrowLeft size={14} strokeWidth={2} />
						Back
					</button>
				</div>

				<div className="flex-1 max-w-110">
					<h1 className="text-2xl font-bold text-gray-900 mb-1">Enter code</h1>
					<p className="block text-sm text-gray-500 mb-1">
						Enter the {CODE_LENGTH} digit code we sent to your email.
					</p>
					<p className="text-sm font-semibold text-gray-900 mb-7">{email}</p>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
						<Form.Field name="otp" className="flex flex-col gap-3">
							<OneTimePasswordField.Root
								name="otp"
								validationType="numeric"
								autoComplete="one-time-code"
								className="flex gap-2.5"
								aria-label="One-time-password"
							>
								{Array.from({ length: CODE_LENGTH }).map((_, i) => (
									<OneTimePasswordField.Input
										key={i}
										className="
                      w-15.5 h-15.5 text-center text-xl font-semibold
                      bg-gray-200 text-gray-900 rounded-xl
                      border-2 border-transparent
                      focus:outline-none focus:border-primary
                      caret-primary transition-colors duration-150
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

						<Form.Submit asChild>
							<button
								disabled={isPending}
								className="w-full h-13 rounded-2xl text-white text-sm font-semibold transition-all duration-200 bg-primary hover:bg-primary/85 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
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

						<p className="text-center text-sm text-gray-500">
							I didn&apos;t receive any code{" "}
							<button
								type="button"
								onClick={onResend}
								className="text-primary font-medium hover:underline focus:outline-none cursor-pointer"
							>
								Resend
							</button>
						</p>
					</Form.Root>
				</div>
			</div>
		</div>
	)
}
