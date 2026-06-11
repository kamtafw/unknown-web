"use client"

import * as RadioGroup from "@radix-ui/react-radio-group"
import * as Switch from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { ArrowLeft, Eye, EyeOff, Lock, Phone } from "lucide-react"
import { useState } from "react"

// ─── Shared primitives ────────────────────────────────────────────────────────

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
	return (
		<div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
			<button
				onClick={onBack}
				className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 transition-colors"
				aria-label="Go back"
			>
				<ArrowLeft size={15} className="text-gray-600" />
			</button>
			<h2 className="font-bold text-gray-900 text-[15.5px]">{title}</h2>
		</div>
	)
}

function StickyFooter({ children }: { children: React.ReactNode }) {
	return (
		<div className="shrink-0 px-6 py-4 border-t border-gray-50 bg-white">
			{children}
		</div>
	)
}

function ActionButton({
	children,
	onClick,
	variant = "primary",
	disabled,
}: {
	children: React.ReactNode
	onClick?: () => void
	variant?: "primary" | "destructive"
	disabled?: boolean
}) {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"w-full h-12 rounded-full text-[14px] text-white font-semibold transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
				variant === "destructive"
					? "bg-destructive hover:bg-destructive/90"
					: "bg-primary hover:bg-primary/85",
			)}
		>
			{children}
		</button>
	)
}

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function ShieldIllustration() {
	return (
		<div className="flex justify-center py-8">
			<svg width="90" height="98" viewBox="0 0 90 98" fill="none">
				{/* shadow */}
				<ellipse cx="45" cy="95" rx="24" ry="3.5" fill="#E5E7EB" />
				{/* outer shield */}
				<path
					d="M45 4L7 21v28c0 24 17.5 45.5 38 52 20.5-6.5 38-28 38-52V21L45 4z"
					fill="#6478B8"
				/>
				{/* inner shield */}
				<path
					d="M45 10L11 25v24c0 20 14.5 38.5 34 44.5 19.5-6 34-24.5 34-44.5V25L45 10z"
					fill="#8FA3D8"
				/>
				{/* top-left shine */}
				<path
					d="M45 10L11 25v24c0 7 1.3 14 3.8 20.5L45 10z"
					fill="white"
					fillOpacity="0.18"
				/>
				{/* padlock body */}
				<rect x="29" y="47" width="32" height="23" rx="5" fill="white" fillOpacity="0.96" />
				{/* padlock shackle */}
				<path
					d="M34 47v-8.5a11 11 0 0122 0v8.5"
					stroke="white"
					strokeWidth="3.5"
					fill="none"
					strokeLinecap="round"
					strokeOpacity="0.9"
				/>
				{/* keyhole */}
				<circle cx="45" cy="57.5" r="4" fill="#6478B8" />
				<rect x="43" y="60.5" width="4" height="5" rx="2" fill="#6478B8" />
			</svg>
		</div>
	)
}

function TwoStepIllustration() {
	return (
		<div className="flex justify-center py-8">
			<svg width="92" height="90" viewBox="0 0 92 90" fill="none">
				{/* circular track top-right */}
				<path
					d="M46 10A36 36 0 0 1 82 46"
					stroke="#F5B942"
					strokeWidth="5.5"
					strokeLinecap="round"
				/>
				{/* circular track top-left */}
				<path
					d="M46 10A36 36 0 0 0 10 46"
					stroke="#F5B942"
					strokeWidth="5.5"
					strokeLinecap="round"
				/>
				{/* arrow head */}
				<path
					d="M79 33 L82 46 L70 42"
					stroke="#F5B942"
					strokeWidth="4.5"
					strokeLinecap="round"
					strokeLinejoin="round"
					fill="none"
				/>
				{/* padlock body */}
				<rect x="24" y="49" width="44" height="33" rx="7" fill="#7B93D4" />
				{/* message badge on padlock */}
				<rect x="31" y="56" width="30" height="19" rx="4" fill="#F5B942" />
				{/* three dots */}
				<circle cx="38" cy="65" r="2.5" fill="white" />
				<circle cx="46" cy="65" r="2.5" fill="white" />
				<circle cx="54" cy="65" r="2.5" fill="white" />
				{/* shackle */}
				<path
					d="M33 49v-9a13 13 0 0126 0v9"
					stroke="#6478B8"
					strokeWidth="4.5"
					fill="none"
					strokeLinecap="round"
				/>
			</svg>
		</div>
	)
}

function SimCardsIllustration() {
	return (
		<div className="flex justify-center items-center gap-6 py-7">
			{/* Active SIM – brand blue */}
			<svg width="62" height="76" viewBox="0 0 62 76" fill="none">
				<rect x="1" y="16" width="60" height="59" rx="5.5" fill="#7B93D4" />
				<path d="M1 16L15 2H61V16H1Z" fill="#6478B8" />
				<rect x="11" y="32" width="40" height="30" rx="3.5" fill="#6478B8" />
				<rect x="15" y="36" width="12" height="22" rx="2" fill="#5567A5" fillOpacity="0.65" />
				<rect x="31" y="36" width="16" height="10" rx="2" fill="#5567A5" fillOpacity="0.65" />
				<rect x="31" y="49" width="16" height="9" rx="2" fill="#5567A5" fillOpacity="0.65" />
			</svg>

			{/* divider dots */}
			<div className="flex gap-1.5 mt-5">
				{[0, 1, 2].map((i) => (
					<div key={i} className="w-2.5 h-2.5 rounded-full bg-gray-300" />
				))}
			</div>

			{/* New SIM – muted gray */}
			<svg width="62" height="76" viewBox="0 0 62 76" fill="none">
				<rect x="1" y="16" width="60" height="59" rx="5.5" fill="#B0BAC8" />
				<path d="M1 16L15 2H61V16H1Z" fill="#9AA3B5" />
				<rect x="11" y="32" width="40" height="30" rx="3.5" fill="#9AA3B5" />
				<rect x="15" y="36" width="12" height="22" rx="2" fill="#8591A5" fillOpacity="0.65" />
				<rect x="31" y="36" width="16" height="10" rx="2" fill="#8591A5" fillOpacity="0.65" />
				<rect x="31" y="49" width="16" height="9" rx="2" fill="#8591A5" fillOpacity="0.65" />
			</svg>
		</div>
	)
}

function DeleteIllustration() {
	return (
		<div className="flex justify-center py-7">
			<div className="w-21 h-21 rounded-full bg-red-400 flex items-center justify-center">
				<svg width="52" height="48" viewBox="0 0 52 48" fill="none">
					{/* person head */}
					<circle cx="17" cy="10" r="8.5" fill="white" />
					{/* person body */}
					<path
						d="M2 42c0-9 6.7-15 15-15h6"
						stroke="white"
						strokeWidth="3.5"
						strokeLinecap="round"
						fill="none"
					/>
					{/* trash outline */}
					<rect x="27" y="24" width="22" height="19" rx="3" stroke="white" strokeWidth="2.5" fill="none" />
					{/* trash lid */}
					<line x1="24" y1="24" x2="52" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
					{/* lid handle */}
					<line x1="32" y1="24" x2="32" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
					<line x1="44" y1="24" x2="44" y2="20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
					{/* interior lines */}
					<line x1="33" y1="30" x2="33" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
					<line x1="38" y1="30" x2="38" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
					<line x1="43" y1="30" x2="43" y2="39" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
				</svg>
			</div>
		</div>
	)
}

// ─── Radio item ───────────────────────────────────────────────────────────────

function RadioItem({
	value,
	label,
	description,
}: {
	value: string
	label: string
	description?: string
}) {
	return (
		<div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
			<RadioGroup.Item
				value={value}
				className="shrink-0 w-5.5 h-5.5 rounded-full border-2 border-gray-300 mt-0.5 focus:outline-none data-[state=checked]:border-primary flex items-center justify-center transition-colors cursor-pointer"
			>
				<RadioGroup.Indicator className="block w-2.75 h-2.75 rounded-full bg-primary" />
			</RadioGroup.Item>
			<div className="flex-1 min-w-0">
				<p className="text-[14.5px] font-semibold text-gray-900 leading-snug">{label}</p>
				{description && (
					<p className="text-[12.5px] text-gray-500 mt-0.5 leading-relaxed">{description}</p>
				)}
			</div>
		</div>
	)
}

// ─── Panels ───────────────────────────────────────────────────────────────────

export function SecurityNotificationsPanel({ onBack }: { onBack: () => void }) {
	const [notificationsEnabled, setNotificationsEnabled] = useState(true)

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Security Notifications" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<ShieldIllustration />

				<div className="px-6">
					{/* Section 1 */}
					<h3 className="text-[16px] font-bold text-gray-900 mb-3">
						Your chats and calls are private
					</h3>
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-4">
						End to end encryption keeps your personal messages and calls between your and the
						people your choose. Not even Appscombo can read or listen to them, this include:
					</p>
					<ul className="space-y-2.5 mb-4">
						{[
							"Text and voice messages",
							"Audio and voice call",
							"Photos, Video and documents",
							"Location sharing",
							"Status updates",
						].map((item) => (
							<li key={item} className="flex items-center gap-2.5 text-[13.5px] text-gray-600">
								<span className="text-gray-400 text-base leading-none shrink-0">•</span>
								{item}
							</li>
						))}
					</ul>
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-7">
						Learn More
					</button>

					<hr className="border-gray-100 mb-6" />

					{/* Section 2 */}
					<div className="flex items-start justify-between gap-4 mb-3">
						<h3 className="text-[15px] font-bold text-gray-900 flex-1 leading-snug">
							Show security notification on this device
						</h3>
						<Switch.Root
							checked={notificationsEnabled}
							onCheckedChange={setNotificationsEnabled}
							className="shrink-0 w-12 h-6 rounded-full bg-gray-200 data-[state=checked]:bg-green-500 transition-colors focus:outline-none mt-0.5 cursor-pointer"
						>
							<Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow-sm transition-transform translate-x-0.5 data-[state=checked]:translate-x-6" />
						</Switch.Root>
					</div>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-3">
						Get notified when your security code changes for a contact's phone in an end-to-end
						encrypted chat, if you have multiple devices, this settings must be enabled on each
						devices where you want to get notification
					</p>
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-10">
						Learn More
					</button>
				</div>
			</div>
		</div>
	)
}

export function ReportProblemPanel({ onBack }: { onBack: () => void }) {
	const PROBLEMS = [
		"App crashes or freezes frequently",
		"Unable to send or receive messages",
		"Media files not loading or uploading",
		"Notification issues or delays",
	]
	const [selected, setSelected] = useState("")
	const [feedback, setFeedback] = useState("")
	const MAX = 200

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Report A Problem" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<div className="px-6 pt-5 pb-8">
					<h3 className="text-[15px] font-bold text-gray-900 mb-4">
						Please select a problem
					</h3>

					<RadioGroup.Root
						value={selected}
						onValueChange={setSelected}
						className="flex flex-col"
					>
						{PROBLEMS.map((p) => (
							<RadioItem key={p} value={p} label={p} />
						))}
						<RadioItem value="other" label="Other" />
					</RadioGroup.Root>

					<div className="mt-6">
						<h3 className="text-[15px] font-bold text-gray-900 mb-3">
							Your feedback is very much appreciated
						</h3>
						<div className="relative">
							<textarea
								value={feedback}
								onChange={(e) => setFeedback(e.target.value.slice(0, MAX))}
								placeholder="Placeholder"
								rows={4}
								className="w-full resize-none rounded-xl border border-primary/60 focus:border-primary px-4 py-3 pb-7 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-primary/20 transition-colors leading-relaxed"
							/>
							<span className="absolute bottom-3 right-3 text-xs text-gray-400 tabular-nums pointer-events-none">
								{feedback.length}/{MAX}
							</span>
						</div>
					</div>

					<div className="mt-6">
						<ActionButton disabled={!selected}>Submit</ActionButton>
					</div>
				</div>
			</div>
		</div>
	)
}

export function TwoStepVerificationPanel({ onBack }: { onBack: () => void }) {
	const [method, setMethod] = useState("pin")

	const options = [
		{
			value: "otp",
			label: "Use OTP verification",
			description: "You will receive OTP every time you try to login",
		},
		{
			value: "pin",
			label: "Create 6 digit Pin",
			description: "You will create a 6 digit pin and use it when you try to login",
		},
		{
			value: "authenticator",
			label: "Google authenticator",
			description: "Make sure to have a google authenticator installed",
		},
	]

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Two step verification" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<TwoStepIllustration />

				<div className="px-6">
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-2">
						For extra security, turn on two-step verification, which will require a PIN when
						registering your phone number with Appscombo again.
					</p>
					<button className="text-[13.5px] font-semibold text-primary hover:underline block mb-1">
						Learn More
					</button>

					<hr className="border-gray-100 my-5" />

					<RadioGroup.Root
						value={method}
						onValueChange={setMethod}
						className="flex flex-col"
					>
						{options.map((o) => (
							<RadioItem key={o.value} {...o} />
						))}
					</RadioGroup.Root>
				</div>
			</div>

			<StickyFooter>
				<ActionButton>Next</ActionButton>
			</StickyFooter>
		</div>
	)
}

export function ChangePhonePanel({ onBack }: { onBack: () => void }) {
	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Change phone number" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<SimCardsIllustration />

				<div className="px-6 pt-2">
					<h3 className="text-[15.5px] font-bold text-gray-900 mb-3 leading-snug">
						Changing your phone number will migrate your account info, groups and settings.
					</h3>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-2.5">
						Before proceeding, please confirm that you are able to receive SMS or calls at your
						new number.
					</p>
					<p className="text-[13px] text-gray-500 leading-relaxed">
						If you have both a new phone and a new number, first change your new number on your
						old phone.
					</p>
				</div>
			</div>

			<StickyFooter>
				<ActionButton>Continue</ActionButton>
			</StickyFooter>
		</div>
	)
}

export function DeleteAccountPanel({ onBack }: { onBack: () => void }) {
	const [phone, setPhone] = useState("")
	const [password, setPassword] = useState("")
	const [showPw, setShowPw] = useState(false)

	const canSubmit = phone.trim().length > 0 && password.length > 0

	return (
		<div className="border-l border-gray-100 h-full flex flex-col overflow-hidden">
			<PanelHeader title="Delete account" onBack={onBack} />

			<div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
				<DeleteIllustration />

				<div className="px-6">
					<h3 className="text-[15.5px] font-bold text-gray-900 mb-3">
						If you delete this account
					</h3>
					<ul className="space-y-2 mb-6">
						{[
							"The account will be deleted from AppsCombo",
							"Your message history will be erased",
							"You will be removed from all your Appscombo groups",
							"Your google storage backup will be deleted",
							"Any channels you created will be deleted",
						].map((item) => (
							<li key={item} className="flex items-start gap-2 text-[13px] text-gray-600">
								<span className="text-gray-400 shrink-0 mt-0.5">•</span>
								{item}
							</li>
						))}
					</ul>

					{/* Phone number */}
					<div className="mb-4">
						<p className="text-[13.5px] font-semibold text-gray-900 mb-2">Phone number</p>
						<div className="flex items-center gap-2.5 h-12 rounded-xl border-2 border-primary px-3.5 focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
							<Phone size={16} className="text-gray-500 shrink-0" />
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Placeholder"
								className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
						</div>
					</div>

					{/* Password */}
					<div className="mb-7">
						<p className="text-[13.5px] font-semibold text-gray-900 mb-2">Password</p>
						<div className="flex items-center gap-2.5 h-12 rounded-xl border border-gray-200 px-3.5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors">
							<Lock size={16} className="text-gray-400 shrink-0" />
							<input
								type={showPw ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Enter password"
								className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
							/>
							<button
								type="button"
								onClick={() => setShowPw((v) => !v)}
								className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
							>
								{showPw ? <Eye size={16} /> : <EyeOff size={16} />}
							</button>
						</div>
					</div>

					<ActionButton disabled={!canSubmit}>Continue</ActionButton>
					<div className="h-8" />
				</div>
			</div>
		</div>
	)
}