"use client"

import { SuccessDialog } from "@/components/auth/success-dialog"
import { createPasswordSchema } from "@/lib/schemas"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"
import { Form, unstable_PasswordToggleField as PasswordToggleField } from "radix-ui"
import { FormEvent, useEffect, useState } from "react"
import { PadlockIcon } from "../shared/Icons"

const RULES = [
	{ label: "At least 8 to 12 characters", test: (v: string) => v.length >= 8 && v.length <= 12 },
	{ label: "Special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
	{ label: "One uppercase", test: (v: string) => /[A-Z]/.test(v) },
	{ label: "One number", test: (v: string) => /\d/.test(v) },
]

interface CreateNewPasswordProps {
	isPending?: boolean
	isSuccess?: boolean
	onSubmit: (payload: { new_password: string; confirm_password: string }) => void
	onDone: () => void
}

export function CreateNewPassword({
	isPending = false,
	isSuccess = false,
	onSubmit,
	onDone,
}: CreateNewPasswordProps) {
	const [password, setPassword] = useState("")
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		if (isSuccess) setShowSuccess(true)
	}, [isSuccess])

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const raw = Object.fromEntries(new FormData(e.currentTarget))
		const result = createPasswordSchema.safeParse(raw)
		if (result.success) {
			onSubmit({ new_password: result.data.password, confirm_password: result.data.confirm })
		}
	}

	return (
		<>
			<div className="flex items-start justify-center pt-10 sm:pt-20 px-4 pb-10">
				<div className="w-full max-w-110">
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-7">
						Create new password
					</h1>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
						<Form.Field name="password" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">New Password</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border-2 border-primary bg-white">
								<PasswordToggleField.Root>
									<PadlockIcon />
									<Form.Control asChild>
										<PasswordToggleField.Input
											name="password"
											placeholder="Enter new password"
											required
											minLength={8}
											maxLength={12}
											autoComplete="new-password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
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
						</Form.Field>

						<ul className="flex flex-col gap-1.5 sm:gap-2 -mt-1 sm:-mt-2">
							{RULES.map(({ label, test }) => {
								const passed = test(password)
								return (
									<li key={label} className="flex items-center gap-2">
										{passed ? (
											<CheckCircle2 size={14} className="text-primary shrink-0" strokeWidth={2} />
										) : (
											<Circle size={14} className="text-gray-300 shrink-0" strokeWidth={2} />
										)}
										<span className={`text-xs ${passed ? "text-gray-700" : "text-gray-400"}`}>
											{label}
										</span>
									</li>
								)
							})}
						</ul>

						<Form.Field name="confirm" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">
								Confirm Password
							</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border-2 border-primary bg-white">
								<PasswordToggleField.Root>
									<PadlockIcon />
									<Form.Control asChild>
										<PasswordToggleField.Input
											name="confirm"
											placeholder="Re-enter new password"
											required
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
								Please confirm your password
							</Form.Message>
							<Form.Message
								match={(confirm) => confirm.length > 0 && confirm !== password}
								className="text-xs text-destructive"
							>
								Passwords do not match
							</Form.Message>
						</Form.Field>

						<Form.Submit asChild>
							<button
								disabled={isPending}
								className="w-full h-12 sm:h-13 rounded-full text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
							>
								{isPending ? (
									<>
										<Loader2 size={15} className="animate-spin" />
										Changing password...
									</>
								) : (
									"Change password"
								)}
							</button>
						</Form.Submit>
					</Form.Root>
				</div>
			</div>

			<SuccessDialog
				open={showSuccess}
				onOpenChange={setShowSuccess}
				title="Password reset successful"
				actionLabel="Proceed to login"
				onAction={() => {
					setShowSuccess(false)
					onDone()
				}}
			/>
		</>
	)
}
