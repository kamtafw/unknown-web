"use client"

import React, { FormEvent, useState } from "react"
import { Form } from "radix-ui"
import { completeProfileSchema, type CompleteProfileValues } from "@/lib/schemas"
import { Calendar, Check, Loader2, User } from "lucide-react"

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
		<div className="flex justify-center pt-20 px-4">
			<div className="w-full max-w-110">
				<h1 className="text-[28px] font-bold text-gray-900 mb-7">Complete your profile</h1>

				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-5">
					{/* Full name */}
					<div>
						<p className="text-sm font-medium text-gray-800 mb-2">Full Name</p>
						<div className="flex gap-3">
							<Form.Field name="firstName" className="flex-1 flex flex-col gap-1.5">
								<Form.Label className="sr-only">First name</Form.Label>
								<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus:focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
									<User size={16} className="text-gray-400 shrink-0" />
									<Form.Control asChild>
										<input
											type="text"
											name="firstName"
											placeholder="First name"
											required
											className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
										/>
									</Form.Control>
								</div>
								<Form.Message match="valueMissing" className="text-xs text-destructive">
									First name is required
								</Form.Message>
							</Form.Field>

							<Form.Field name="lastName" className="flex-1 flex flex-col gap-1.5">
								<Form.Label className="sr-only">Last name</Form.Label>
								<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus:focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
									<User size={16} className="text-gray-400 shrink-0" />
									<Form.Control asChild>
										<input
											type="text"
											name="lastName"
											placeholder="Last name"
											required
											className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
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
						<Form.Label className="text-sm font-medium text-gray-800">Date of Birth</Form.Label>
						<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 bg-white focus-within:border-2 focus-within:border-primary transition-colors">
							<Calendar size={16} className="text-gray-400 shrink-0" />
							<Form.Control asChild>
								<input
									type="text"
									name="dob"
									placeholder="DD/MM/YY"
									value={dob}
									required
									inputMode="numeric"
									onChange={(e) => setDob(formatDOB(e.target.value))}
									className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
								/>
							</Form.Control>
							{dobValid && (
								<Check size={16} className="text-green-500 shrink-0" strokeWidth={2.5} />
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
							className="w-full h-13 rounded-2xl text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
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
