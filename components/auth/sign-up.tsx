"use client"

import { formatMessage } from "@/lib/api-error"
import { signUpSchema } from "@/lib/schemas"
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons"
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

const COUNTRIES: Country[] = [
	{ code: "+1", iso: "US", name: "United States" },
	{ code: "+1", iso: "CA", name: "Canada" },
	{ code: "+7", iso: "RU", name: "Russia" },
	{ code: "+20", iso: "EG", name: "Egypt" },
	{ code: "+27", iso: "ZA", name: "South Africa" },
	{ code: "+30", iso: "GR", name: "Greece" },
	{ code: "+31", iso: "NL", name: "Netherlands" },
	{ code: "+32", iso: "BE", name: "Belgium" },
	{ code: "+33", iso: "FR", name: "France" },
	{ code: "+34", iso: "ES", name: "Spain" },
	{ code: "+36", iso: "HU", name: "Hungary" },
	{ code: "+39", iso: "IT", name: "Italy" },
	{ code: "+40", iso: "RO", name: "Romania" },
	{ code: "+41", iso: "CH", name: "Switzerland" },
	{ code: "+43", iso: "AT", name: "Austria" },
	{ code: "+44", iso: "GB", name: "United Kingdom" },
	{ code: "+45", iso: "DK", name: "Denmark" },
	{ code: "+46", iso: "SE", name: "Sweden" },
	{ code: "+47", iso: "NO", name: "Norway" },
	{ code: "+48", iso: "PL", name: "Poland" },
	{ code: "+49", iso: "DE", name: "Germany" },
	{ code: "+51", iso: "PE", name: "Peru" },
	{ code: "+52", iso: "MX", name: "Mexico" },
	{ code: "+53", iso: "CU", name: "Cuba" },
	{ code: "+54", iso: "AR", name: "Argentina" },
	{ code: "+55", iso: "BR", name: "Brazil" },
	{ code: "+56", iso: "CL", name: "Chile" },
	{ code: "+57", iso: "CO", name: "Colombia" },
	{ code: "+58", iso: "VE", name: "Venezuela" },
	{ code: "+60", iso: "MY", name: "Malaysia" },
	{ code: "+61", iso: "AU", name: "Australia" },
	{ code: "+62", iso: "ID", name: "Indonesia" },
	{ code: "+63", iso: "PH", name: "Philippines" },
	{ code: "+64", iso: "NZ", name: "New Zealand" },
	{ code: "+65", iso: "SG", name: "Singapore" },
	{ code: "+66", iso: "TH", name: "Thailand" },
	{ code: "+81", iso: "JP", name: "Japan" },
	{ code: "+82", iso: "KR", name: "South Korea" },
	{ code: "+84", iso: "VN", name: "Vietnam" },
	{ code: "+86", iso: "CN", name: "China" },
	{ code: "+90", iso: "TR", name: "Turkey" },
	{ code: "+91", iso: "IN", name: "India" },
	{ code: "+92", iso: "PK", name: "Pakistan" },
	{ code: "+93", iso: "AF", name: "Afghanistan" },
	{ code: "+94", iso: "LK", name: "Sri Lanka" },
	{ code: "+95", iso: "MM", name: "Myanmar" },
	{ code: "+98", iso: "IR", name: "Iran" },
	{ code: "+212", iso: "MA", name: "Morocco" },
	{ code: "+213", iso: "DZ", name: "Algeria" },
	{ code: "+216", iso: "TN", name: "Tunisia" },
	{ code: "+218", iso: "LY", name: "Libya" },
	{ code: "+220", iso: "GM", name: "Gambia" },
	{ code: "+221", iso: "SN", name: "Senegal" },
	{ code: "+223", iso: "ML", name: "Mali" },
	{ code: "+224", iso: "GN", name: "Guinea" },
	{ code: "+225", iso: "CI", name: "Côte d'Ivoire" },
	{ code: "+227", iso: "NE", name: "Niger" },
	{ code: "+228", iso: "TG", name: "Togo" },
	{ code: "+229", iso: "BJ", name: "Benin" },
	{ code: "+230", iso: "MU", name: "Mauritius" },
	{ code: "+231", iso: "LR", name: "Liberia" },
	{ code: "+232", iso: "SL", name: "Sierra Leone" },
	{ code: "+233", iso: "GH", name: "Ghana" },
	{ code: "+234", iso: "NG", name: "Nigeria" },
	{ code: "+235", iso: "TD", name: "Chad" },
	{ code: "+236", iso: "CF", name: "Central African Republic" },
	{ code: "+237", iso: "CM", name: "Cameroon" },
	{ code: "+238", iso: "CV", name: "Cape Verde" },
	{ code: "+239", iso: "ST", name: "São Tomé and Príncipe" },
	{ code: "+240", iso: "GQ", name: "Equatorial Guinea" },
	{ code: "+241", iso: "GA", name: "Gabon" },
	{ code: "+242", iso: "CG", name: "Congo" },
	{ code: "+243", iso: "CD", name: "DR Congo" },
	{ code: "+244", iso: "AO", name: "Angola" },
	{ code: "+245", iso: "GW", name: "Guinea-Bissau" },
	{ code: "+248", iso: "SC", name: "Seychelles" },
	{ code: "+249", iso: "SD", name: "Sudan" },
	{ code: "+250", iso: "RW", name: "Rwanda" },
	{ code: "+251", iso: "ET", name: "Ethiopia" },
	{ code: "+252", iso: "SO", name: "Somalia" },
	{ code: "+253", iso: "DJ", name: "Djibouti" },
	{ code: "+254", iso: "KE", name: "Kenya" },
	{ code: "+255", iso: "TZ", name: "Tanzania" },
	{ code: "+256", iso: "UG", name: "Uganda" },
	{ code: "+257", iso: "BI", name: "Burundi" },
	{ code: "+258", iso: "MZ", name: "Mozambique" },
	{ code: "+260", iso: "ZM", name: "Zambia" },
	{ code: "+261", iso: "MG", name: "Madagascar" },
	{ code: "+263", iso: "ZW", name: "Zimbabwe" },
	{ code: "+264", iso: "NA", name: "Namibia" },
	{ code: "+265", iso: "MW", name: "Malawi" },
	{ code: "+266", iso: "LS", name: "Lesotho" },
	{ code: "+267", iso: "BW", name: "Botswana" },
	{ code: "+268", iso: "SZ", name: "Eswatini" },
	{ code: "+269", iso: "KM", name: "Comoros" },
	{ code: "+291", iso: "ER", name: "Eritrea" },
	{ code: "+297", iso: "AW", name: "Aruba" },
	{ code: "+298", iso: "FO", name: "Faroe Islands" },
	{ code: "+299", iso: "GL", name: "Greenland" },
	{ code: "+350", iso: "GI", name: "Gibraltar" },
	{ code: "+351", iso: "PT", name: "Portugal" },
	{ code: "+352", iso: "LU", name: "Luxembourg" },
	{ code: "+353", iso: "IE", name: "Ireland" },
	{ code: "+354", iso: "IS", name: "Iceland" },
	{ code: "+355", iso: "AL", name: "Albania" },
	{ code: "+356", iso: "MT", name: "Malta" },
	{ code: "+357", iso: "CY", name: "Cyprus" },
	{ code: "+358", iso: "FI", name: "Finland" },
	{ code: "+359", iso: "BG", name: "Bulgaria" },
	{ code: "+370", iso: "LT", name: "Lithuania" },
	{ code: "+371", iso: "LV", name: "Latvia" },
	{ code: "+372", iso: "EE", name: "Estonia" },
	{ code: "+373", iso: "MD", name: "Moldova" },
	{ code: "+374", iso: "AM", name: "Armenia" },
	{ code: "+375", iso: "BY", name: "Belarus" },
	{ code: "+376", iso: "AD", name: "Andorra" },
	{ code: "+377", iso: "MC", name: "Monaco" },
	{ code: "+380", iso: "UA", name: "Ukraine" },
	{ code: "+381", iso: "RS", name: "Serbia" },
	{ code: "+382", iso: "ME", name: "Montenegro" },
	{ code: "+385", iso: "HR", name: "Croatia" },
	{ code: "+386", iso: "SI", name: "Slovenia" },
	{ code: "+387", iso: "BA", name: "Bosnia and Herzegovina" },
	{ code: "+389", iso: "MK", name: "North Macedonia" },
	{ code: "+420", iso: "CZ", name: "Czech Republic" },
	{ code: "+421", iso: "SK", name: "Slovakia" },
	{ code: "+423", iso: "LI", name: "Liechtenstein" },
	{ code: "+501", iso: "BZ", name: "Belize" },
	{ code: "+502", iso: "GT", name: "Guatemala" },
	{ code: "+503", iso: "SV", name: "El Salvador" },
	{ code: "+504", iso: "HN", name: "Honduras" },
	{ code: "+505", iso: "NI", name: "Nicaragua" },
	{ code: "+506", iso: "CR", name: "Costa Rica" },
	{ code: "+507", iso: "PA", name: "Panama" },
	{ code: "+509", iso: "HT", name: "Haiti" },
	{ code: "+591", iso: "BO", name: "Bolivia" },
	{ code: "+592", iso: "GY", name: "Guyana" },
	{ code: "+593", iso: "EC", name: "Ecuador" },
	{ code: "+595", iso: "PY", name: "Paraguay" },
	{ code: "+597", iso: "SR", name: "Suriname" },
	{ code: "+598", iso: "UY", name: "Uruguay" },
	{ code: "+670", iso: "TL", name: "Timor-Leste" },
	{ code: "+673", iso: "BN", name: "Brunei" },
	{ code: "+674", iso: "NR", name: "Nauru" },
	{ code: "+675", iso: "PG", name: "Papua New Guinea" },
	{ code: "+676", iso: "TO", name: "Tonga" },
	{ code: "+677", iso: "SB", name: "Solomon Islands" },
	{ code: "+678", iso: "VU", name: "Vanuatu" },
	{ code: "+679", iso: "FJ", name: "Fiji" },
	{ code: "+680", iso: "PW", name: "Palau" },
	{ code: "+685", iso: "WS", name: "Samoa" },
	{ code: "+686", iso: "KI", name: "Kiribati" },
	{ code: "+688", iso: "TV", name: "Tuvalu" },
	{ code: "+689", iso: "PF", name: "French Polynesia" },
	{ code: "+691", iso: "FM", name: "Micronesia" },
	{ code: "+692", iso: "MH", name: "Marshall Islands" },
	{ code: "+850", iso: "KP", name: "North Korea" },
	{ code: "+852", iso: "HK", name: "Hong Kong" },
	{ code: "+853", iso: "MO", name: "Macau" },
	{ code: "+855", iso: "KH", name: "Cambodia" },
	{ code: "+856", iso: "LA", name: "Laos" },
	{ code: "+880", iso: "BD", name: "Bangladesh" },
	{ code: "+886", iso: "TW", name: "Taiwan" },
	{ code: "+960", iso: "MV", name: "Maldives" },
	{ code: "+961", iso: "LB", name: "Lebanon" },
	{ code: "+962", iso: "JO", name: "Jordan" },
	{ code: "+963", iso: "SY", name: "Syria" },
	{ code: "+964", iso: "IQ", name: "Iraq" },
	{ code: "+965", iso: "KW", name: "Kuwait" },
	{ code: "+966", iso: "SA", name: "Saudi Arabia" },
	{ code: "+967", iso: "YE", name: "Yemen" },
	{ code: "+968", iso: "OM", name: "Oman" },
	{ code: "+970", iso: "PS", name: "Palestine" },
	{ code: "+971", iso: "AE", name: "UAE" },
	{ code: "+972", iso: "IL", name: "Israel" },
	{ code: "+973", iso: "BH", name: "Bahrain" },
	{ code: "+974", iso: "QA", name: "Qatar" },
	{ code: "+975", iso: "BT", name: "Bhutan" },
	{ code: "+976", iso: "MN", name: "Mongolia" },
	{ code: "+977", iso: "NP", name: "Nepal" },
	{ code: "+992", iso: "TJ", name: "Tajikistan" },
	{ code: "+993", iso: "TM", name: "Turkmenistan" },
	{ code: "+994", iso: "AZ", name: "Azerbaijan" },
	{ code: "+995", iso: "GE", name: "Georgia" },
	{ code: "+996", iso: "KG", name: "Kyrgyzstan" },
	{ code: "+998", iso: "UZ", name: "Uzbekistan" },
]

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.iso === "NG")!

interface PhoneFieldProps {
	onChange: (fullNumber: string) => void
	hasError?: boolean
}

function PhoneField({ onChange, hasError }: PhoneFieldProps) {
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
				className={`flex items-center h-12 sm:h-12.5 rounded-xl border bg-white transition-colors ${
					hasError
						? "border-2 border-destructive"
						: "border-gray-200 focus-within:border-2 focus-within:border-primary"
				}`}
			>
				<div className="flex items-center gap-1 pl-3.5 h-full">
					<Phone />
					{/* country selector trigger */}
					<button
						type="button"
						onClick={() => setDropdownOpen((v) => !v)}
						className="flex items-center px-2 gap-1.5 border-gray-200 h-full shrink-0 hover:bg-gray-50 transition-colors"
					>
						<span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
						<ChevronDown
							size={13}
							className={`text-gray-400 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>
				</div>

				{/* phone number input */}
				<input
					type="tel"
					inputMode="numeric"
					placeholder="Enter your phone number"
					value={localNumber}
					onChange={handleNumberChange}
					className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
				/>
			</div>

			{dropdownOpen && (
				<div className="absolute z-50 top-full mt-1 left-0 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
					<div className="p-2 border-b border-gray-100">
						<div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-gray-50 border border-gray-200">
							<Search size={13} className="text-gray-400 shrink-0" />
							<input
								ref={searchRef}
								type="text"
								placeholder="Search country or code…"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="flex-1 text-sm bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
							/>
						</div>
					</div>
					<div className="max-h-56 overflow-y-auto">
						{filtered.length === 0 ? (
							<p className="px-4 py-3 text-sm text-gray-400 text-center">No results</p>
						) : (
							filtered.map((country) => (
								<button
									key={country.iso}
									type="button"
									onClick={() => handleCountrySelect(country)}
									className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left ${
										selectedCountry.iso === country.iso
											? "bg-primary/5 text-primary"
											: "text-gray-800"
									}`}
								>
									<span className="flex-1 truncate">{country.name}</span>
									<span className="text-gray-400 text-xs shrink-0">{country.code}</span>
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
	isPending: boolean
	onSignIn: () => void
	onTerms: () => void
	onPrivacyPolicy: () => void
	fieldErrors?: { email?: string; phone?: string }
}

export function SignUp({ onSuccess, isPending = false, onSignIn,onTerms, onPrivacyPolicy, fieldErrors }: SignUpProps) {
	const [pendingData, setPendingData] = useState<SignUpFormData | null>(null)
	const [password, setPassword] = useState("")
	const [phone, setPhone] = useState("")
	const [showTerms, setShowTerms] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	const RULES = [
		{ label: "At least 8 to 12 characters", test: (v: string) => v.length >= 8 && v.length <= 12 },
		{ label: "Special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
		{ label: "One uppercase", test: (v: string) => /[A-Z]/.test(v) },
		{ label: "One number", test: (v: string) => /\d/.test(v) },
	]

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setSubmitted(true)

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

	const phoneInvalid = submitted && !/^\+\d{7,15}$/.test(phone)

	return (
		<>
			<div className="flex justify-center pt-10 sm:pt-15 px-4 pb-10">
				<div className="w-full max-w-110">
					<h1 className="text-2xl sm:text-[28px] text-center font-bold text-gray-900 mb-6 sm:mb-7">
						Sign up to Appscombo
					</h1>

					<Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
						{/* Email */}
						<Form.Field name="email" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">Email Address</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-primary transition-colors data-invalid:border-destructive data-invalid:border-2">
								<Email />
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
							{fieldErrors?.email && (
								<p className="text-xs text-destructive">{formatMessage(fieldErrors.email)}</p>
							)}
						</Form.Field>

						{/* Phone number */}
						<div className="flex flex-col gap-1.5">
							<label className="text-sm font-medium text-gray-800">Phone Number</label>
							<PhoneField onChange={setPhone} hasError={phoneInvalid} />
							{phoneInvalid ? (
								<p className="text-xs text-destructive">Enter a valid phone number</p>
							) : (
								fieldErrors?.phone && (
									<p className="text-xs text-destructive">{formatMessage(fieldErrors.phone)}</p>
								)
							)}
						</div>

						{/* Password */}
						<Form.Field name="password" className="flex flex-col gap-1.5">
							<Form.Label className="text-sm font-medium text-gray-800">Create Password</Form.Label>
							<div className="flex items-center gap-2.5 px-3.5 h-12 sm:h-12.5 rounded-xl border border-gray-200 focus-within:border-2 focus-within:border-primary transition-colors">
								<PasswordToggleField.Root>
									<Padlock />
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
							<ul className="flex flex-col gap-2 mt-1">
								{RULES.map(({ label, test }) => {
									const passed = test(password)
									const failing = submitted && !passed
									return (
										<li key={label} className="flex items-center gap-2">
											{passed ? (
												<CheckCircle2 size={15} className="text-primary shrink-0" strokeWidth={2} />
											) : failing ? (
												<XCircle size={15} className="text-destructive shrink-0" strokeWidth={2} />
											) : (
												<Circle size={15} className="text-gray-300 shrink-0" strokeWidth={2} />
											)}
											<span
												className={`text-[11px] text-xs leading-tight ${
													passed ? "text-gray-700" : failing ? "text-destructive" : "text-gray-400"
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
								className="w-full h-12 sm:h-13 rounded-2xl text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] transition-all duration-200 mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
				onTerms={onTerms}
				onPrivacyPolicy={onPrivacyPolicy}
			/>
		</>
	)
}
