"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { EmailIcon, PadlockIcon } from "@/components/shared/Icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type LoginPayload = { identifier: string; password: string }

const FormSchema = z.object({
	identifier: z.string().min(1, "Email or phone is required"),
	password: z.string().min(1, "Password is required"),
})

const LoginForm = () => {
	const [showPassword, setShowPassword] = useState(false)
	const [formData, setFormData] = useState<LoginPayload>({
		identifier: "",
		password: "",
	})

	const isPending = false

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			identifier: "",
			password: "",
		},
	})

	function onSubmit(data: z.infer<typeof FormSchema>) {
		setFormData(data)
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-6">
					<div className="flex flex-col items-center md:items-start gap-6 w-full md:w-[384px] max-w-[384px]">
						<FormField
							control={form.control}
							name="identifier"
							render={({ field }) => (
								<FormItem className="w-full">
									<Label className="text-base text-gray-800 font-medium">Email or Phone</Label>
									<FormControl>
										<div className="relative w-full">
											<div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
												<EmailIcon />
											</div>
											<Input
												{...field}
												placeholder="Enter your email or phone number"
												className="placeholder:text-gray-500 placeholder:text-base pl-10 py-3.5 pr-3 border border-gray-200 rounded-xl w-full h-13"
											/>
										</div>
									</FormControl>
									{form.formState.errors.identifier && <FormMessage />}
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem className="w-full">
									<Label className="text-base text-gray-800 font-medium">Password</Label>
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
									{form.formState.errors.password && <FormMessage />}
								</FormItem>
							)}
						/>
					</div>
					<div className="w-full flex flex-col items-end -mt-3">
						<Link href="" className="text-base text-center text-primary font-bold cursor-pointer">
							Forgot Password?
						</Link>
					</div>

					<div className="flex flex-col items-center gap-6">
						<Button
							type="submit"
							className="py-3.5 flex items-center justify-center bg-primary rounded-xl text-white text-base font-semibold h-13 cursor-pointer hover:bg-primary-dark w-full max-w-[384px]"
						>
							{isPending ? "Signing in..." : "Sign in"}
						</Button>
						<div className="text-base text-center text-gray-900 -mt-1">
							Not registered yet?{" "}
							<Link href="" className="text-primary font-bold cursor-pointer">
								Sign up
							</Link>
						</div>
					</div>
				</form>
			</Form>
		</>
	)
}

export default LoginForm
