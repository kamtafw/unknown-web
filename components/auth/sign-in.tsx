"use client"

import React from "react"
import { Form, unstable_PasswordToggleField as PasswordToggleField } from "radix-ui"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { EmailIcon, PadlockIcon } from "../shared/Icons"
import type { SignInValues } from "@/lib/schemas"

interface SignInProps {
	onSignIn?: (data: SignInValues) => void
	onForgotPassword?: () => void
	onSignUp?: () => void
}

export function SignIn({ onSignIn, onForgotPassword, onSignUp }: SignInProps) {
	return (
		<div className="flex justify-center pt-20 px-4">
			<div className="w-full max-w-110">
				<h1 className="text-[28px] text-center font-bold text-gray-900 mb-7">
					Sign in to Appscombo
				</h1>

				<Form.Root className="flex flex-col gap-4">
					<Form.Field name="identifier" className="flex flex-col gap-1.5">
						<Form.Label className="text-sm font-medium text-gray-800">Email or Phone</Form.Label>

						<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus:focus-within:border-2 focus-within:border-[#8892C4] transition-colors data-invalid:border-red-400 data-invalid:border-2">
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

						<div className="flex items-center gap-2.5 px-3.5 h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-[#8892C4] transition-colors">
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

					<Form.Submit asChild>
						<button className="w-full h-12.5 rounded-2xl text-white text-sm font-semibold bg-[#8892C4] hover:bg-[#7580b8] active:scale-[0.99] transition-all duration-200 mt-2">
							Sign in
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
				</Form.Root>
			</div>
		</div>
	)
}
