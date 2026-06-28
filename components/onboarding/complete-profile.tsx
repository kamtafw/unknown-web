"use client"

import { completeProfileSchema, type CompleteProfileValues } from "@/lib/schemas"
import { Calendar, Check, Loader2, User } from "lucide-react"
import { Form } from "radix-ui"
import { FormEvent, useState } from "react"

function formatDOB(raw: string): string {
	const digits = raw.replace(/\D/g, "").slice(0, 8)
	if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
	if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`
	return digits
}

interface CompleteProfileProps {
	isPending: boolean
	onContinue: (data: CompleteProfileValues) => void
}

export function CompleteProfile({ isPending = false, onContinue }: CompleteProfileProps) {
	const [dob, setDob] = useState("")

	const dobParsed = completeProfileSchema.shape.dob.safeParse(dob)
	const dobValid = dobParsed.success

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = completeProfileSchema.safeParse(raw)
		if (result.success) onContinue(result.data)
	}

	return (
		<div className="flex justify-center pt-10 sm:pt-15 px-4 pb-10">
			<div className="w-full max-w-md">
				<h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
					Complete your profile
				</h1>
				<p className="text-[13px] sm:text-sm text-muted-foreground mb-5 sm:mb-6">
					Help people find and recognise you
				</p>

				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
					{/* Full name */}
					<div>
						<p className="text-sm font-medium text-foreground mb-2">Full Name</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Form.Field name="firstName" className="flex-1 flex flex-col gap-1.5">
								<Form.Label className="sr-only">First name</Form.Label>
								<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary data-invalid:border-destructive data-invalid:ring-1 data-invalid:ring-destructive">
									<User size={15} className="text-muted-foreground shrink-0" />
									<Form.Control asChild>
										<input
											type="text"
											name="firstName"
											placeholder="First name"
											required
											className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
										/>
									</Form.Control>
								</div>
								<Form.Message match="valueMissing" className="text-xs text-destructive">
									First name is required
								</Form.Message>
							</Form.Field>

							<Form.Field name="lastName" className="flex-1 flex flex-col gap-1.5">
								<Form.Label className="sr-only">Last name</Form.Label>
								<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary data-invalid:border-destructive data-invalid:ring-1 data-invalid:ring-destructive">
									<User size={15} className="text-muted-foreground shrink-0" />
									<Form.Control asChild>
										<input
											type="text"
											name="lastName"
											placeholder="Last name"
											required
											className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
										/>
									</Form.Control>
								</div>
								<Form.Message match="valueMissing" className="text-xs text-destructive">
									Last name is required
								</Form.Message>
							</Form.Field>
						</div>
					</div>

					{/* Date of birth */}
					<Form.Field name="dob" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-foreground">Date of Birth</Form.Label>
						<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
							<Calendar size={15} className="text-muted-foreground shrink-0" />
							<Form.Control asChild>
								<input
									type="text"
									name="dob"
									placeholder="DD/MM/YY"
									value={dob}
									required
									inputMode="numeric"
									onChange={(e) => setDob(formatDOB(e.target.value))}
									className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
								/>
							</Form.Control>
							{dobValid && (
								<Check size={14} className="text-green-500 shrink-0" strokeWidth={2.5} />
							)}
						</div>
						<Form.Message match="valueMissing" className="text-xs text-destructive">
							Date of birth is required
						</Form.Message>
						<Form.Message
							match={(v) => v.length > 0 && !completeProfileSchema.shape.dob.safeParse(v).success}
							className="text-xs text-destructive"
						>
							Use DD/MM/YY format with a valid date
						</Form.Message>
					</Form.Field>

					<Form.Submit asChild>
						<button
							disabled={isPending}
							className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1 shadow-sm"
						>
							{isPending ? (
								<>
									<Loader2 size={15} className="animate-spin" />
									Saving...
								</>
							) : (
								"Continue"
							)}
						</button>
					</Form.Submit>
				</Form.Root>
			</div>
		</div>
	)
}