"use client"

import { formatMessage } from "@/lib/api-error"
import { signUpSchema } from "@/lib/schemas"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
import { Country as CSCCountry } from "country-state-city"
import { CheckCircle2, ChevronDown, Circle, Loader2, Search, XCircle } from "lucide-react"
import { Form, unstable_PasswordToggleField as PasswordToggleField } from "radix-ui"
import { FormEvent, useEffect, useRef, useState } from "react"
import { Email, Padlock, Phone } from "./icons"
import { TermsDialog } from "./terms-dialog"

interface Country {
	code: string
	iso: string
	name: string
}

const COUNTRIES: Country[] = CSCCountry.getAllCountries()
	.filter((c) => c.phonecode && c.phonecode.trim() !== "")
	.map((c) => ({ code: `+${c.phonecode}`, iso: c.isoCode, name: c.name }))
	.sort((a, b) => a.name.localeCompare(b.name))

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === "NG") ?? COUNTRIES[0]

interface PhoneFieldProps {
	onChange: (fullNumber: string) => void
	onBlur: () => void
	hasError?: boolean
}

function PhoneField({ onChange, onBlur, hasError }: PhoneFieldProps) {
	const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY)
	const [localNumber, setLocalNumber] = useState("")
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [search, setSearch] = useState("")
	const dropdownRef = useRef<HTMLDivElement>(null)
	const searchRef = useRef<HTMLInputElement>(null)

	const updateParent = (country: Country, number: string) => {
		const stripped = number.replace(/^0+/, "")
		onChange(stripped ? `${country.code}${stripped}` : "")
	}

	const handleCountrySelect = (country: Country) => {
		setSelectedCountry(country)
		setDropdownOpen(false)
		setSearch("")
		updateParent(country, localNumber)
	}

	const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/[^\d]/g, "")
		setLocalNumber(raw)
		updateParent(selectedCountry, raw)
	}

	const filtered = search
		? COUNTRIES.filter(
				(c) =>
					c.name.toLowerCase().includes(search.toLowerCase()) ||
					c.code.includes(search) ||
					c.iso.toLowerCase().includes(search.toLowerCase()),
			)
		: COUNTRIES

	useEffect(() => {
		if (!dropdownOpen) return
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false)
				setSearch("")
			}
		}
		document.addEventListener("mousedown", handler)
		return () => document.removeEventListener("mousedown", handler)
	}, [dropdownOpen])

	useEffect(() => {
		if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 0)
	}, [dropdownOpen])

	return (
		<div className="relative" ref={dropdownRef}>
			<div
				className={`flex items-center h-12 sm:h-12.5 rounded-xl border bg-muted transition-all ${
					hasError
						? "border-destructive ring-1 ring-destructive"
						: "border-input focus-within:bg-card focus-within:border-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
				}`}
			>
				<div className="flex items-center gap-1 pl-3.5 h-full">
					<span className="text-muted-foreground shrink-0">
						<Phone />
					</span>
					<button
						type="button"
						onClick={() => setDropdownOpen((v) => !v)}
						className="flex items-center px-2 gap-1.5 border-border h-full shrink-0 hover:opacity-70 transition-opacity cursor-pointer"
					>
						<span className="text-sm font-medium text-foreground">{selectedCountry.code}</span>
						<ChevronDown
							size={13}
							className={`text-muted-foreground transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>
				</div>

				<input
					type="tel"
					inputMode="numeric"
					placeholder="Enter your phone number"
					value={localNumber}
					onChange={handleNumberChange}
					onBlur={onBlur}
					className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
				/>
			</div>

			{dropdownOpen && (
				<div className="absolute z-50 top-full mt-1 left-0 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
					<div className="p-2 border-b border-border">
						<div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted border border-border">
							<Search size={13} className="text-muted-foreground shrink-0" />
							<input
								ref={searchRef}
								type="text"
								placeholder="Search country or code…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-y-auto">
						{filtered.length === 0 ? (
							<p className="px-4 py-3 text-sm text-muted-foreground text-center">No results</p>
						) : (
							filtered.map((country) => (
								<button
									key={country.iso}
									type="button"
									onClick={() => handleCountrySelect(country)}
									className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors text-left ${
										selectedCountry.iso === country.iso
											? "bg-primary/5 text-primary"
											: "text-foreground"
									}`}
								>
									<span className="flex-1 truncate">{country.name}</span>
									<span className="text-muted-foreground text-xs shrink-0">{country.code}</span>
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export interface SignUpFormData {
	email: string
	phone: string
	password: string
}

interface SignUpProps {
	onSuccess: (data: SignUpFormData) => void
	onSignIn: () => void
	onTerms: () => void
	onPrivacyPolicy: () => void
	clearFieldError: (field: "email" | "phone") => void
	isPending: boolean
	fieldErrors?: { email?: string; phone?: string }
}

export function SignUp({
	isPending = false,
	fieldErrors,
	clearFieldError,
	onSuccess,
	onSignIn,
	onTerms,
	onPrivacyPolicy,
}: SignUpProps) {
	const [pendingData, setPendingData] = useState<SignUpFormData | null>(null)
	const [password, setPassword] = useState("")
	const [phone, setPhone] = useState("")
	const [showTerms, setShowTerms] = useState(false)

	const [touched, setTouched] = useState({ email: false, phone: false, password: false })

	const apiErrors = fieldErrors ?? {}

	const markTouched = (field: keyof typeof touched) =>
		setTouched((prev) => ({ ...prev, [field]: true }))

	const emailInvalid = (value: string) => touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
	const phoneInvalid = touched.phone && !/^\+\d{7,15}$/.test(phone)
	const passwordEmpty = touched.password && password.length === 0

	const RULES = [
		{ label: "At least 8 to 12 characters", test: (v: string) => v.length >= 8 && v.length <= 12 },
		{ label: "Special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
		{ label: "One uppercase", test: (v: string) => /[A-Z]/.test(v) },
		{ label: "One number", test: (v: string) => /\d/.test(v) },
	]

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setTouched({ email: true, phone: true, password: true })

		const fd = new FormData(e.currentTarget)
		const raw = {
			email: fd.get("email") as string,
			phone,
			password: fd.get("password") as string,
		}

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
		if (pendingData) onSuccess(pendingData)
	}

	return (
		<>
			<div className="flex justify-center pt-8 sm:pt-10 px-4 pb-10">
				<div className="w-full max-w-110">
					<h1 className="text-2xl sm:text-[28px] text-center font-bold text-foreground mb-6 sm:mb-7">
						Sign up to Appscombo
					</h1>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
						{/* Email */}
						<Form.Field name="email" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-foreground">Email Address</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary has-data-invalid:border-destructive has-data-invalid:ring-1 has-data-invalid:ring-destructive">
								<span className="text-muted-foreground shrink-0">
									<Email />
								</span>
								<Form.Control asChild>
									<input
										type="email"
										name="email"
										placeholder="Enter your email address"
										required
										onBlur={() => markTouched("email")}
										onChange={() => clearFieldError("email")}
										className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
									/>
								</Form.Control>
							</div>
							<Form.Message
								match={(value) => touched.email && value.trim().length === 0}
								className="text-xs text-destructive"
							>
								Email is required
							</Form.Message>
							<Form.Message
								match={(value) => emailInvalid(value)}
								className="text-xs text-destructive"
							>
								Enter a valid email address
							</Form.Message>
							{apiErrors.email && !emailInvalid("valid@email.com") && touched.email && (
								<p className="text-xs text-destructive">{formatMessage(apiErrors.email)}</p>
							)}
						</Form.Field>

						{/* Phone */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-foreground">Phone Number</label>
							<PhoneField
								onChange={(fullNumber) => {
									setPhone(fullNumber)
									clearFieldError("phone")
								}}
								onBlur={() => markTouched("phone")}
								hasError={phoneInvalid || !!apiErrors.phone}
							/>
							{phoneInvalid ? (
								<p className="text-xs text-destructive">Enter a valid phone number</p>
							) : apiErrors.phone ? (
								<p className="text-xs text-destructive">{formatMessage(apiErrors.phone)}</p>
							) : null}
						</div>

						{/* Password */}
						<Form.Field name="password" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-foreground">
								Create Password
							</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-input bg-muted transition-all focus-within:bg-card focus-within:border-primary focus-within:ring-1 focus-within:ring-primary has-data-invalid:border-destructive has-data-invalid:ring-1 has-data-invalid:ring-destructive">
								<PasswordToggleField.Root>
									<span className="text-muted-foreground shrink-0">
										<Padlock />
									</span>
									<Form.Control asChild>
										<PasswordToggleField.Input
											name="password"
											placeholder="Create a strong password"
											required
											minLength={8}
											maxLength={12}
											autoComplete="new-password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											onBlur={() => markTouched("password")}
											className="flex-1 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none"
										/>
									</Form.Control>
									<PasswordToggleField.Toggle className="text-muted-foreground hover:text-foreground transition-colors shrink-0 focus:outline-none">
										<PasswordToggleField.Icon
											visible={<EyeOpenIcon />}
											hidden={<EyeClosedIcon />}
										/>
									</PasswordToggleField.Toggle>
								</PasswordToggleField.Root>
							</div>
							{passwordEmpty && <p className="text-xs text-destructive">Password is required</p>}
							<ul className="flex flex-col gap-2 mt-1">
								{RULES.map(({ label, test }) => {
									const passed = test(password)
									const failing = touched.password && !passed
									return (
										<li key={label} className="flex items-center gap-2">
											{passed ? (
												<CheckCircle2 size={15} className="text-primary shrink-0" strokeWidth={2} />
											) : failing ? (
												<XCircle size={15} className="text-destructive shrink-0" strokeWidth={2} />
											) : (
												<Circle
													size={15}
													className="text-muted-foreground/40 shrink-0"
													strokeWidth={2}
												/>
											)}
											<span
												className={`text-[11px] leading-tight ${
													passed
														? "text-foreground/80"
														: failing
															? "text-destructive"
															: "text-muted-foreground"
												}`}
											>
												{label}
											</span>
										</li>
									)
								})}
							</ul>
						</Form.Field>

						<Form.Submit asChild>
							<button
								disabled={isPending}
								className="w-full h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
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

						<p className="text-center text-sm text-muted-foreground">
							Already a user?{" "}
							<button
								type="button"
								onClick={onSignIn}
								className="text-primary font-semibold cursor-pointer hover:underline focus:outline-none"
							>
								Sign in
							</button>
						</p>

						<p className="text-sm text-muted-foreground text-center leading-relaxed mt-3 sm:mt-5">
							By signing up, you agree to our{" "}
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

			<TermsDialog
				open={showTerms}
				onOpenChange={(open) => !open && setShowTerms(false)}
				onContinue={handleTermsAccepted}
				onTerms={onTerms}
				onPrivacyPolicy={onPrivacyPolicy}
			/>
		</>
	)
}
