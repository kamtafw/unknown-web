"use client"

import React, { FormEvent } from "react"
import { Form, unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { otpSchema } from "@/lib/schemas"

const CODE_LENGTH = 6

interface SecurityVerificationProps {
	email?: string
	onVerify?: (code: string) => void
	onResend?: () => void
	onBack?: () => void
	onUseOTP?: () => void
	onUsePin?: () => void
}

export function SecurityVerification({
	email = "chiomachukwu@gmail.com",
	onVerify,
	onResend,
	onBack,
	onUseOTP,
	onUsePin,
}: SecurityVerificationProps) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = otpSchema.safeParse(raw)
		if (result.success) onVerify?.(result.data.otp)
	}

	return (
		<div className="flex items-start justify-center pt-20 px-4">
			<div className="flex items-start gap-16 w-full max-w-2xl">
				<div className="mt-1 shrink-0">
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
					<h1 className="text-2xl font-bold text-gray-900 mb-1">Security Verification</h1>
					<p className="block text-sm text-gray-500 mb-6">
						Enter the {CODE_LENGTH} digit code we sent to your google authenticator app
					</p>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
						<Form.Field name="otp" className="flex flex-col gap-2">
							<OneTimePasswordField.Root
								name="otp"
								validationType="numeric"
								autoComplete="one-time-code"
								className="flex gap-2.5"
								aria-label="Authenticator code"
							>
								{Array.from({ length: CODE_LENGTH }).map((_, i) => (
									<OneTimePasswordField.Input
										key={i}
										className="
                      w-15.5 h-15.5 text-center text-xl font-semibold
                      bg-[#EEF1F8] text-gray-900 rounded-xl
                      border-2 border-transparent
                      focus:outline-none focus:border-[#8892C4]
                      caret-[#8892C4] transition-colors duration-150
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
							<button className="w-full h-13 rounded-2xl text-white text-sm font-semibold transition-all duration-200 bg-[#8892C4] hover:bg-[#7580B8] active:scale-[0.99]">
								Verify Code
							</button>
						</Form.Submit>

						<p className="text-center text-sm text-gray-500">
							I didn&apos;t receive any code{" "}
							<button
								type="button"
								onClick={onResend}
								className="text-[#5B67A8] font-medium hover:underline focus:outline-none"
							>
								Resend
							</button>
						</p>

						<div className="pt-2">
							<p className="text-sm text-gray-500 mb-3">
								If Google authenticator fails, use code instead
							</p>
							<div className="flex flex-col gap-2.5">
								{[
									{ label: "Use OTP Instead", action: onUseOTP },
									{ label: "Use Pin Instead", action: onUsePin },
								].map(({ label, action }) => (
									<button
										key={label}
										type="button"
										onClick={action}
										className="flex items-center justify-between w-full px-4 h-13 rounded-xl bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-800 transition-colors"
									>
										{label}
										<ArrowRight size={16} className="text-gray-500" />
									</button>
								))}
							</div>
						</div>
					</Form.Root>
				</div>
			</div>
		</div>
	)
}
