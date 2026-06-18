"use client"

import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Form } from "radix-ui"
import { FormEvent } from "react"
import { EmailIcon } from "../shared/Icons"

interface ForgotPasswordProps {
	onBack: () => void
	onContinue: (data: ForgotPasswordValues) => void
	isPending?: boolean
	error?: string
}

export function ForgotPassword({ onBack, onContinue, isPending, error }: ForgotPasswordProps) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = forgotPasswordSchema.safeParse(raw)
		if (result.success) onContinue(result.data)
	}
	return (
		<div className="flex items-start justify-center pt-10 sm:pt-20 px-4 pb-10">
			<div className="w-full max-w-110 sm:max-w-2xl">
				{/* Mobile back */}
				<button
					type="button"
					onClick={onBack}
					className="sm:hidden flex items-center gap-1.5 text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors rounded-full px-4 py-2 font-medium mb-6"
				>
					<ArrowLeft size={14} strokeWidth={2} />
					Back
				</button>

				<div className="flex items-start gap-16">
					{/* Desktop-only back */}
					<div className="hidden sm:block mt-1 shrink-0">
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
								<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
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

							{error && <p className="text-xs text-destructive -mt-1">{error}</p>}

							<Form.Submit asChild>
								<button
									disabled={isPending}
									className="w-full h-12 sm:h-13 rounded-full text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
								>
									{isPending ? (
										<>
											<Loader2 size={15} className="animate-spin" />
											Continuing...
										</>
									) : (
										"Continue"
									)}
								</button>
							</Form.Submit>
						</Form.Root>
					</div>
				</div>
			</div>
		</div>
	)
}
