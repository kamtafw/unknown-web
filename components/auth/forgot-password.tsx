"use client"

import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/schemas"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Form } from "radix-ui"
import { FormEvent } from "react"
import { Email } from "./icons"

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
							className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted hover:bg-accent transition-colors rounded-full px-4 py-2 font-medium"
						>
							<ArrowLeft size={14} strokeWidth={2} />
							Back
						</button>
					</div>

					<div className="flex-1 max-w-110">
						<div className="sm:bg-card sm:rounded-2xl sm:border sm:border-border sm:shadow-sm sm:px-8 sm:py-10">
							<h1 className="text-2xl font-bold text-foreground mb-1">Forgot Password</h1>
							<p className="block text-sm text-muted-foreground mb-6">
								Kindly provide the email address or phone number registered to your account
							</p>

							<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
								<Form.Field name="identifier" className="flex flex-col gap-1.5">
									<Form.Label className="text-sm font-medium text-foreground">
										Email or phone number
									</Form.Label>
									<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary has-data-invalid:border-destructive has-data-invalid:ring-1 has-data-invalid:ring-destructive">
										<span className="text-muted-foreground shrink-0">
											<Email />
										</span>
										<Form.Control asChild>
											<input
												type="text"
												name="identifier"
												placeholder="Enter your email or phone number"
												required
												className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
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
										className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
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
		</div>
	)
}