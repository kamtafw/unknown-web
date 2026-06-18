"use client"

import { signInSchema, type SignInValues } from "@/lib/schemas"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { Loader2 } from "lucide-react"
import { Form, unstable_PasswordToggleField as PasswordToggleField } from "radix-ui"
import { FormEvent } from "react"
import { EmailIcon, PadlockIcon } from "../shared/Icons"

interface SignInProps {
	onSignIn: (data: SignInValues) => void
	isPending: boolean
	error?: string
	onForgotPassword: () => void
	onSignUp: () => void
	onTerms: () => void
	onPrivacyPolicy: () => void
}

export function SignIn({
	onSignIn,
	isPending = false,
	error,
	onForgotPassword,
	onSignUp,
	onTerms,
	onPrivacyPolicy,
}: SignInProps) {
	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = signInSchema.safeParse(raw)
		if (result.success) onSignIn(result.data)
	}

	return (
		<div className="flex justify-center pt-10 sm:pt-15 px-4 pb-10">
			<div className="w-full max-w-110">
				<h1 className="text-2xl sm:text-[28px] text-center font-bold text-gray-900 mb-6 sm:mb-7">
					Sign in to AppsCombo
				</h1>

				<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
					<Form.Field name="identifier" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-gray-800">Email or Phone</Form.Label>

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

					<Form.Field name="password" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-gray-800">Password</Form.Label>

						<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
							<PasswordToggleField.Root>
								<PadlockIcon />
								<Form.Control asChild>
									<PasswordToggleField.Input
										name="password"
										placeholder="Enter your password"
										required
										autoComplete="current-password"
										className="flex-1 text-sm text-gray-900 placeholder:text-gray-500 bg-transparent outline-none"
									/>
								</Form.Control>
								<PasswordToggleField.Toggle className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 focus:outline-none">
									<PasswordToggleField.Icon visible={<EyeOpenIcon />} hidden={<EyeClosedIcon />} />
								</PasswordToggleField.Toggle>
							</PasswordToggleField.Root>
						</div>
						<Form.Message match="valueMissing" className="text-xs text-destructive">
							Password is required
						</Form.Message>
					</Form.Field>

					<div className="flex justify-end -mt-2">
						<button
							type="button"
							onClick={onForgotPassword}
							className="text-sm font-semibold text-primary cursor-pointer hover:underline focus:outline-none"
						>
							Forgot Password?
						</button>
					</div>

					{error && <p className="text-xs text-destructive -mt-2">{error}</p>}

					<Form.Submit asChild>
						<button
							disabled={isPending}
							className="w-full h-12 sm:h-13 rounded-full text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
						>
							{isPending ? (
								<>
									<Loader2 size={15} className="animate-spin" />
									Signing in...
								</>
							) : (
								"Sign in"
							)}
						</button>
					</Form.Submit>

					<p className="text-center text-sm text-gray-500">
						Not registered yet?{" "}
						<button
							type="button"
							onClick={onSignUp}
							className="text-primary font-semibold cursor-pointer hover:underline focus:outline-none"
						>
							Sign Up
						</button>
					</p>

					<p className="text-sm text-gray-500 text-center leading-relaxed mt-3 sm:mt-5">
						By signing in, you agree to our{" "}
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
				</Form.Root>
			</div>
		</div>
	)
}
