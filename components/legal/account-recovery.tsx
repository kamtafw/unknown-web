import {
	ChevronRight,
	Fingerprint,
	HeadphonesIcon,
	Lock,
	Mail,
	Phone,
	ShieldCheck,
} from "lucide-react"
import Link from "next/link"

const METHODS = [
	{
		icon: Lock,
		title: "Reset your password",
		desc: "If you still have access to your registered email or phone number, this is the fastest recovery option.",
		steps: [
			"Visit the AppsCombo login page.",
			'Select "Forgot Password."',
			"Enter your registered email, phone number, or username.",
			"Follow the instructions sent to your recovery method.",
			"Create a new password and sign in.",
		],
	},
	{
		icon: Mail,
		title: "Recover with email verification",
		desc: "If your account is associated with an active email address, verify ownership to restore access.",
		steps: [
			'Select "Recover Account."',
			"Enter your email address.",
			"Verify ownership through the email verification link.",
			"Follow the recovery instructions. Links may expire after a limited period.",
		],
	},
	{
		icon: Phone,
		title: "Recover with phone verification",
		desc: "If your account is linked to a mobile number, receive a one-time code via SMS.",
		steps: [
			'Select "Recover Account."',
			"Enter your phone number.",
			"Receive and enter a one-time verification code.",
			"Follow the instructions to restore access.",
		],
	},
	{
		icon: HeadphonesIcon,
		title: "Recover a compromised account",
		desc: "If you believe your account was hacked or accessed without permission, act immediately.",
		steps: [
			"Change your password if you can still sign in.",
			"Log out of all active sessions.",
			"Enable two-factor authentication.",
			"If locked out, contact our Security Team with your username, registered email/phone, and a description of the issue.",
		],
	},
]

const RECOVERY_INFO = [
	{
		title: "Personal information",
		items: ["Full name", "Username", "Registered email address", "Registered phone number"],
	},
	{
		title: "Account information",
		items: [
			"Approximate date of account creation",
			"Previous passwords (if known)",
			"Recent login locations",
			"Devices used to access the account",
		],
	},
	{
		title: "Additional verification",
		items: [
			"Identification documents (where required)",
			"Screenshots of error messages",
			"Evidence of unauthorized activity",
		],
	},
]

const PROTECT_TIPS = [
	"Enable two-factor authentication",
	"Use a strong, unique password",
	"Review active sessions regularly",
	"Keep your recovery email and phone number current",
]

const COMMON_ISSUES = [
	{
		q: "How long does account recovery take?",
		a: "Most automated recovery requests are processed immediately. Manual recovery requiring investigation or identity verification typically takes 24–72 hours; complex cases may need additional review time.",
	},
	{
		q: "Can I recover a deleted account?",
		a: "Accounts scheduled for deletion may be recoverable during the grace period. Permanently deleted accounts generally cannot be restored.",
	},
	{
		q: "What if I no longer have access to my email and phone number?",
		a: "You may still recover your account through identity verification and manual review by our security team.",
	},
	{
		q: "Why was my recovery request denied?",
		a: "Requests may be denied if we cannot verify account ownership, or if submitted information is incomplete or inconsistent.",
	},
	{
		q: "I'm unable to complete two-factor authentication.",
		a: "Try your recovery codes, an alternate verification method, or an approved backup device. If none are available, contact support@appscombo.com for manual verification.",
	},
]

const CONTACTS = [
	{ label: "Account Recovery Support", email: "recovery@appscombo.com" },
	{ label: "Security Team", email: "security@appscombo.com" },
	{ label: "General Support", email: "support@appscombo.com" },
]

export function AccountRecovery() {
	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Account recovery</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						Locked out of your AppsCombo account? Whether you&apos;ve forgotten your password, lost
						access to your email or phone, or suspect unauthorized access, follow the steps below to
						regain access securely.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-14">
				{/* Recovery methods */}
				<div className="space-y-8">
					{METHODS.map(({ icon: Icon, title, desc, steps }) => (
						<div key={title} className="border border-gray-100 rounded-2xl p-6 sm:p-8">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<Icon size={18} className="text-primary" />
								</div>
								<h2 className="text-[16px] font-bold text-gray-900">{title}</h2>
							</div>
							<p className="text-sm text-gray-500 leading-relaxed mb-5">{desc}</p>
							<ol className="space-y-3">
								{steps.map((step, i) => (
									<li key={i} className="flex items-start gap-3">
										<span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
											{i + 1}
										</span>
										<p className="text-sm text-gray-600 leading-relaxed">{step}</p>
									</li>
								))}
							</ol>
						</div>
					))}
				</div>

				{/* Identity verification / locked accounts */}
				<div className="grid sm:grid-cols-2 gap-8">
					<div>
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
							<Fingerprint size={18} className="text-primary" />
						</div>
						<h2 className="text-[16px] font-bold text-gray-900 mb-2">
							Identity verification recovery
						</h2>
						<p className="text-sm text-gray-500 leading-relaxed">
							If you no longer have access to your registered email or phone number, we may require
							additional verification — such as government-issued identification, confirmation of
							account ownership details, or security questions — to protect against unauthorized
							access.
						</p>
					</div>
					<div>
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
							<ShieldCheck size={18} className="text-primary" />
						</div>
						<h2 className="text-[16px] font-bold text-gray-900 mb-2">
							Locked or disabled accounts
						</h2>
						<p className="text-sm text-gray-500 leading-relaxed">
							Accounts may be temporarily restricted for security concerns, suspicious login
							activity, or Terms of Service violations. If you believe your account was restricted
							in error, you may submit an appeal through the recovery process.
						</p>
					</div>
				</div>

				{/* Info required */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-2">
						Information required for recovery
					</h2>
					<p className="text-sm text-gray-500 leading-relaxed mb-6">
						To help us verify ownership, you may be asked to provide the following.
					</p>
					<div className="grid sm:grid-cols-3 gap-6">
						{RECOVERY_INFO.map(({ title, items }) => (
							<div key={title}>
								<h3 className="text-[13px] font-bold text-gray-900 mb-2.5">{title}</h3>
								<ul className="space-y-1.5">
									{items.map((i) => (
										<li
											key={i}
											className="flex items-start gap-2 text-xs text-gray-500 leading-relaxed"
										>
											<span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
											{i}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Protect your account + processing time */}
				<div className="grid sm:grid-cols-2 gap-8">
					<div className="bg-gray-50 rounded-2xl p-6">
						<h2 className="text-[15px] font-bold text-gray-900 mb-3">
							Once access is restored, protect your account
						</h2>
						<ul className="space-y-2">
							{PROTECT_TIPS.map((t) => (
								<li key={t} className="flex items-start gap-2 text-sm text-gray-600">
									<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
									{t}
								</li>
							))}
						</ul>
					</div>
					<div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
						<h2 className="text-[15px] font-bold text-gray-900 mb-2">Processing times</h2>
						<p className="text-sm text-gray-600 leading-relaxed mb-3">
							Most automated recovery requests are processed immediately. Manual requests requiring
							investigation or identity verification typically take:
						</p>
						<p className="text-2xl font-bold text-primary">24–72 hours</p>
						<p className="text-xs text-gray-500 mt-1">
							More complex cases may require additional time.
						</p>
					</div>
				</div>

				{/* Common issues */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-6">Common issues</h2>
					<div className="space-y-4">
						{COMMON_ISSUES.map(({ q, a }) => (
							<details key={q} className="group border border-gray-100 rounded-2xl">
								<summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
									<span className="text-[14px] font-semibold text-gray-900">{q}</span>
									<ChevronRight
										size={15}
										className="text-gray-400 group-open:rotate-90 transition-transform shrink-0 ml-4"
									/>
								</summary>
								<p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
							</details>
						))}
					</div>
				</div>

				{/* Contact */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-5">Contact the recovery team</h2>
					<div className="grid sm:grid-cols-3 gap-3">
						{CONTACTS.map(({ label, email }) => (
							<a
								key={label}
								href={`mailto:${email}`}
								className="flex flex-col gap-1 p-4 bg-gray-50 rounded-xl hover:bg-primary/5 border border-gray-100 transition-colors"
							>
								<span className="text-[13px] font-semibold text-gray-800">{label}</span>
								<span className="text-[12px] text-primary">{email}</span>
							</a>
						))}
					</div>
				</div>

				{/* Support CTA */}
				<div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center">
					<h3 className="text-[15px] font-bold text-gray-900 mb-2">Still can&#39;t get in?</h3>
					<p className="text-sm text-gray-500 mb-5">
						Our recovery specialists will review your request and contact you with further
						instructions.
					</p>
					<Link
						href="/support"
						className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Contact support
					</Link>
				</div>
			</div>
		</>
	)
}
