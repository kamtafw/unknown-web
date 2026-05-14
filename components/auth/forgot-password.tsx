"use client"

import { Form } from "radix-ui"
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas"
import { FormEvent } from "react"
import { ArrowLeft } from "lucide-react"
import { EmailIcon } from "../shared/Icons"

interface ForgotPasswordProps {
	onBack?: () => void
	onContinue: (data: ForgotPasswordValues) => void
}

export function ForgotPassword({ onBack, onContinue }: ForgotPasswordProps) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = forgotPasswordSchema.safeParse(raw)
		if (result.success) onContinue(result.data)
	}
	return (
		<div className="flex items-start justify-center pt-20 px-4">
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
					<h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password</h1>
					<p className="block text-sm text-gray-500 mb-6">
						Kindly provide the email address or phone number registered to your account
					</p>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
						<Form.Field name="identifier" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">
								Email or phone number
							</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-13 rounded-xl border-2 border-[#8892C4] bg-white">
								<EmailIcon />
								<Form.Control asChild>
									<input
										type="text"
										name="identifier"
										placeholder="Enter your email or phone number"
										required
										className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
									/>
								</Form.Control>
							</div>
							<Form.Message match="valueMissing" className="text-xs text-destructive">
								Email or phone is required
							</Form.Message>
							<Form.Message
								match={(value) =>
									value.length > 0 &&
									!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) &&
									!/^\+?[\d\s\-().]{7,}$/.test(value)
								}
								className="text-xs text-destructive"
							>
								Enter a valid email or phone number
							</Form.Message>
						</Form.Field>

						<Form.Submit asChild>
							<button className="w-full h-13 rounded-2xl text-white text-sm font-semibold bg-[#8892C4] hover:bg-[#7580b8] active:scale-[0.99] transition-all duration-200 mt-2">
								Continue
							</button>
						</Form.Submit>
					</Form.Root>
				</div>
			</div>
		</div>
	)
}
