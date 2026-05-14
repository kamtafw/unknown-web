"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { EmailIcon, PadlockIcon, PhoneIcon } from "@/components/shared/Icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SignupConfirmation from "./SignupConfirmation"

type SignupPayload = { email: string; phone_number: string; password: string }

const FormSchema = z.object({
	email: z.string().email("Invalid email"),
	phone_number: z.string().min(10, "Phone number is required"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(12, "Password must not exceed 12 characters")
		.regex(/[A-Z]/, "Must include at least one uppercase letter")
		.regex(/[0-9]/, "Must include at least one digit")
		.regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
})

const SignupForm = () => {
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmation, setShowConfirmation] = useState(false)

	const [formData, setFormData] = useState<SignupPayload>({
		email: "",
		phone_number: "",
		password: "",
	})

	const isPending = false

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			email: "",
			phone_number: "",
			password: "",
		},
	})

	const watchedPassword = useWatch({ control: form.control, name: "password" })

	const passwordChecker = {
		length: (value: string) => value.length >= 8 && value.length <= 12,
		hasDigit: (value: string) => /\d/.test(value),
		hasUppercase: (value: string) => /[A-Z]/.test(value),
		hasSpecialChar: (value: string) => /[^A-Za-z0.9]/.test(value),
	}

	const passwordChecks = [
		{
			label: "At least 8 to 12 characters",
			isValid: passwordChecker.length(watchedPassword ?? ""),
		},
		{
			label: "Contain a special character",
			isValid: passwordChecker.hasSpecialChar(watchedPassword ?? ""),
		},
		{
			label: "Contain an uppercase letter",
			isValid: passwordChecker.hasUppercase(watchedPassword ?? ""),
		},
		{
			label: "Contain a digit",
			isValid: passwordChecker.hasDigit(watchedPassword ?? ""),
		},
	]

	function onSubmit(data: z.infer<typeof FormSchema>) {
		setFormData(data)
		setShowConfirmation(true)
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
					<div className="flex flex-col items-center md:items-start gap-5 w-full md:w-[384px] max-w-[384px]">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem className="w-full">
									<Label className="text-base text-gray-800 font-medium">Email Address</Label>
									<FormControl>
										<div className="relative w-full">
											<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												<EmailIcon />
											</div>
											<Input
												{...field}
												placeholder="Enter your email"
												className="placeholder:text-gray-500 placeholder:text-base pl-10 py-3.5 pr-3 border border-gray-200 rounded-xl w-full h-13"
											/>
										</div>
									</FormControl>
									{form.formState.errors.email && <FormMessage />}
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone_number"
							render={({ field }) => (
								<FormItem className="w-full">
									<Label className="text-base text-gray-800 font-medium">Phone Number</Label>
									<FormControl>
										<div className="relative w-full">
											<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												<PhoneIcon />
											</div>
											<Input
												{...field}
												placeholder="Enter your phone number"
												className="placeholder:text-gray-500 placeholder:text-base pl-10 py-3.5 pr-3 border border-gray-200 rounded-xl w-full h-13"
											/>
										</div>
									</FormControl>
									{form.formState.errors.phone_number && <FormMessage />}
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="w-full">
									<Label className="text-base text-gray-800 font-medium">Create Password</Label>
									<FormControl>
										<div className="relative w-full">
											<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												<PadlockIcon />
											</div>
											<Input
												{...field}
												placeholder="Enter your password"
												className="placeholder:text-gray-500 placeholder:text-base pl-10 py-3.5 pr-3 border border-gray-200 rounded-xl w-full h-13"
												type={showPassword ? "text" : "password"}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
											>
												{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
											</button>
										</div>
									</FormControl>

									<div className="mt-2 space-y-1 text-sm">
										{passwordChecks.map(({ label, isValid }, i) => (
											<div key={i} className="flex items-center gap-2 text-muted-foreground">
												{isValid ? (
													<svg width="6" height="5" viewBox="0 0 6 5" fill="none">
														<path
															d="M0.900391 2.79922L2.30039 4.19922L5.10039 1.19922"
															stroke="#6A88D1"
															strokeWidth="0.6"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												) : (
													<div className="w-3 h-3 rounded-full bg-gray-200" />
												)}
												<span
													className={`text-xs ${isValid ? "text-gray-900" : "text-muted-foreground"}`}
												>
													{label}
												</span>
											</div>
										))}
									</div>

									{form.formState.errors.password && <FormMessage />}
								</FormItem>
							)}
						/>
					</div>

					<div className="flex flex-col items-center gap-6">
						<Button
							type="submit"
							className="py-3.5 flex items-center justify-center bg-primary rounded-xl text-white text-base font-semibold h-13 cursor-pointer hover:bg-primary-dark w-full max-w-[384px]"
						>
							{isPending ? "Signing in..." : "Sign up"}
						</Button>
						<div className="text-base text-center text-gray-900 -mt-1">
							Already a user?{" "}
							<Link href="" className="text-primary font-bold cursor-pointer">
								Sign in
							</Link>
						</div>
					</div>
				</form>
			</Form>

			{showConfirmation && (
				<SignupConfirmation
					showConfirmation={showConfirmation}
					setShowConfirmation={setShowConfirmation}
				/>
			)}
		</>
	)
}

export default SignupForm
