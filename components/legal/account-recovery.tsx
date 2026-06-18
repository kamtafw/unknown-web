import { ChevronRight, HeadphonesIcon, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { LegalWrapper } from "./legal-wrapper"

const METHODS = [
	{
		icon: Mail,
		title: "Recover with email",
		desc: "If you have access to your registered email address, this is the fastest way to get back in.",
		steps: [
			'Go to the sign-in page and click "Forgot Password".',
			"Enter your registered email address.",
			"Check your inbox (and spam folder) for a 6-digit code.",
			"Enter the code and create a new password.",
		],
	},
	{
		icon: Phone,
		title: "Recover with phone number",
		desc: "If your phone number is linked to your account, you can receive a recovery code via SMS.",
		steps: [
			'On the sign-in page, click "Forgot Password".',
			"Enter your registered phone number including the country code.",
			"You will receive an SMS with a one-time code.",
			"Enter the code and reset your password.",
		],
	},
	{
		icon: HeadphonesIcon,
		title: "Contact support",
		desc: "If you no longer have access to your email or phone, our support team can manually verify your identity.",
		steps: [
			'Submit a request through our support page with the subject "Account Recovery".',
			"Provide your username or any email addresses previously associated with the account.",
			"Our team will ask you identity verification questions.",
			"Once verified, we will send recovery instructions to a verified contact method.",
		],
	},
]

const COMMON_ISSUES = [
	{
		q: "I'm not receiving the recovery email.",
		a: "Check your spam or junk folder. If still missing, ensure you're checking the correct inbox — some users sign up with a work or secondary email. Allow up to 5 minutes for delivery before requesting a new code.",
	},
	{
		q: "My account says it doesn't exist.",
		a: "Try alternative email addresses or usernames you may have used. If you signed up with a phone number, try entering that instead of an email.",
	},
	{
		q: "My account was hacked and the email was changed.",
		a: "Submit a support request immediately with as much identifying information as possible (original email, phone, device used to sign up). Our security team prioritises these cases.",
	},
	{
		q: "I deleted my account but want it back.",
		a: "If you are within the 30-day grace period, sign in with your original credentials to restore your account automatically.",
	},
]

export function AccountRecovery() {
	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Account recovery</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						Locked out of your AppsCombo account? Follow the steps below to regain access. Most
						cases are resolved in under 10 minutes.
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

				{/* Support CTA */}
				<div className="bg-gray-50 rounded-2xl p-6 sm:p-8 text-center">
					<h3 className="text-[15px] font-bold text-gray-900 mb-2">Still can&#39;t get in?</h3>
					<p className="text-sm text-gray-500 mb-5">
						Our support team is available 7 days a week and typically responds within 24 hours.
					</p>
					<Link
						href="/support"
						className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Contact support
					</Link>
				</div>
			</div>
		</LegalWrapper>
	)
}
