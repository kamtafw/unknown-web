import { z } from "zod"

export const signInSchema = z.object({
	identifier: z
		.string()
		.min(1, "Email or phone is required")
		.refine(
			(v) =>
				/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || // email
				/^\+?[\d\s\-().]{7,}$/.test(v), // phone
			"Enter a valid email or phone number",
		),
	password: z.string().min(1, "Password is required"),
})

export const signUpSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email address"),
	phone: z
		.string()
		.min(10, "Phone number is required")
		.regex(/^\+?[\d\s\-().]+$/, "Enter a valid phone number"),
	password: z
		.string()
		.min(8, "At least 8 characters")
		.max(12, "At most 12 characters")
		.regex(/[A-Z]/, "Must contain an uppercase letter")
		.regex(/\d/, "Must contain a number")
		.regex(/[^A-Za-z0-9]/, "Must contain a special character"),
})

export const forgotPasswordSchema = z.object({
	identifier: z
		.string()
		.min(1, "Email or phone is required")
		.refine(
			(v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[\d\s\-().]{7,}$/.test(v),
			"Enter a valid email or phone number",
		),
})

export const createPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "At least 8 characters")
			.max(12, "At most 12 characters")
			.regex(/[^A-Za-z0-9]/, "Must contain a special character")
			.regex(/[A-Z]/, "Must contain an uppercase letter")
			.regex(/\d/, "Must contain a number"),
		confirm: z.string().min(1, "Please confirm your password"),
	})
	.refine((d) => d.password === d.confirm, {
		message: "Passwords do not match",
		path: ["confirm"],
	})

export const otpSchema = z.object({
	otp: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
})

export const completeProfileSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	dob: z
		.string()
		.regex(/^\d{2}\/\d{2}\/\d{2,4}$/, "Use DD/MM/YY format")
		.refine((v) => {
			const [d, m] = v.split("/").map(Number)
			return d >= 1 && d <= 31 && m >= 1 && m <= 12
		}, "Enter a valid date"),
})

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type CreatePasswordValues = z.infer<typeof createPasswordSchema>
export type OtpValues = z.infer<typeof otpSchema>
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>
