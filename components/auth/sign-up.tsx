"use client"

import React, { FormEvent, useState } from "react"
import { Form, unstable_PasswordToggleField as PasswordToggleField } from "radix-ui"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"
import { signUpSchema, SignUpValues } from "@/lib/schemas"
import { EmailIcon, PadlockIcon } from "../shared/Icons"
import { TermsDialog } from "./terms-dialog"

export interface SignUpFormData {
	email: string
	phone: string
	password: string
}

interface SignUpProps {
	onSuccess: (data: SignUpFormData) => void
	isPending: boolean
	onSignIn: () => void
}

export function SignUp({ onSuccess, isPending = false, onSignIn }: SignUpProps) {
	const [pendingData, setPendingData] = useState<SignUpFormData | null>(null)
	const [showTerms, setShowTerms] = useState(false)

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = signUpSchema.safeParse(raw)

		if (!result.success) return

		setPendingData({
			email: result.data.email,
			phone: result.data.phone,
			password: result.data.password,
		})
		setShowTerms(true)
	}

	const handleTermsAccepted = () => {
		setShowTerms(false)
		console.log("signup PENDING DATA:", JSON.stringify(pendingData))
		if (pendingData) {
			onSuccess(pendingData)
		}
	}

	return (
		<>
			<div className="flex justify-center pt-20 px-4">
				<div className="w-full max-w-110">
					<h1 className="text-[28px] text-center font-bold text-gray-900 mb-7">
						Sign up to Appscombo
					</h1>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
						{/* Email */}
						<Form.Field name="email" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">Email Address</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus:focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
								<EmailIcon />
								<Form.Control asChild>
									<input
										type="email"
										name="email"
										placeholder="Enter your email address"
										required
										className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
									/>
								</Form.Control>
							</div>
							<Form.Message match="valueMissing" className="text-xs text-destructive">
								Email is required
							</Form.Message>
							<Form.Message match="typeMismatch" className="text-xs text-destructive">
								Enter a valid email address
							</Form.Message>
						</Form.Field>

						{/* Phone number */}
						<Form.Field name="phone" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">Phone Number</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus:focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
								<EmailIcon />
								<Form.Control asChild>
									<input
										type="tel"
										name="phone"
										placeholder="Enter your phone number"
										required
										className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
									/>
								</Form.Control>
							</div>
							<Form.Message match="valueMissing" className="text-xs text-destructive">
								Phone number is required
							</Form.Message>
							<Form.Message match="typeMismatch" className="text-xs text-destructive">
								Enter a valid phone number
							</Form.Message>
						</Form.Field>

						{/* Password */}
						<Form.Field name="password" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">Create Password</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-primary transition-colors">
								<PasswordToggleField.Root>
									<PadlockIcon />
									<Form.Control asChild>
										<PasswordToggleField.Input
											name="password"
											placeholder="Create a strong password"
											required
											minLength={8}
											maxLength={12}
											autoComplete="new-password"
											className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
										/>
									</Form.Control>
									<PasswordToggleField.Toggle className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 focus:outline-none">
										<PasswordToggleField.Icon
											visible={<EyeOpenIcon />}
											hidden={<EyeClosedIcon />}
										/>
									</PasswordToggleField.Toggle>
								</PasswordToggleField.Root>
							</div>
							<Form.Message match="valueMissing" className="text-xs text-destructive">
								Password is required
							</Form.Message>
							<Form.Message match="tooShort" className="text-xs text-destructive">
								At least 8 characters required
							</Form.Message>
							<Form.Message
								match={(v) => v.length > 0 && !/[A-Z]/.test(v)}
								className="text-xs text-destructive"
							>
								Must contain an uppercase letter
							</Form.Message>
							<Form.Message
								match={(v) => v.length > 0 && !/\d/.test(v)}
								className="text-xs text-destructive"
							>
								Must contain a number
							</Form.Message>
							<Form.Message
								match={(v) => v.length > 0 && !/[^A-Za-z0-9]/.test(v)}
								className="text-xs text-destructive"
							>
								Must contain a special character
							</Form.Message>
						</Form.Field>

						<Form.Submit asChild>
							<button
								disabled={isPending}
								className="w-full h-13 rounded-2xl text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2"
							>
								{isPending ? (
									<>
										<Loader2 size={15} className="animate-spin" />
										Signing up...
									</>
								) : (
									"Sign Up"
								)}
							</button>
						</Form.Submit>

						<p className="text-center text-sm text-gray-500">
							Already a user?{" "}
							<button
								type="button"
								onClick={onSignIn}
								className="text-primary font-semibold cursor-pointer hover:underline focus:outline-none"
							>
								Sign in
							</button>
						</p>
					</Form.Root>
				</div>
			</div>

			<TermsDialog
				open={showTerms}
				onOpenChange={(open) => !open && setShowTerms(false)}
				onContinue={handleTermsAccepted}
			/>
		</>
	)
}
