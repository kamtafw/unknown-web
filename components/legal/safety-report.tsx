"use client"

import { AlertTriangle,CheckCircle,Loader2,Phone } from "lucide-react"
import { useState } from "react"

const VIOLATION_TYPES = [
	"Harassment or bullying",
	"Hate speech or discrimination",
	"Threats of violence",
	"Fraud or scam",
	"Impersonation or fake account",
	"Spam",
	"Child safety concern",
	"Intellectual property violation",
	"Privacy violation",
	"Misinformation",
	"Dangerous organizations",
	"Account compromise",
	"Other",
]

const PROCESS_STEPS = [
	{
		step: "1",
		title: "Review",
		desc: "Our systems and safety teams review the report you submitted.",
	},
	{
		step: "2",
		title: "Investigation",
		desc: "We evaluate the content involved, user history, platform activity, and policy violations.",
	},
	{
		step: "3",
		title: "Action",
		desc: "We may remove content, restrict visibility, issue warnings, suspend, or remove accounts.",
	},
	{
		step: "4",
		title: "Escalation",
		desc: "Matters may be escalated to legal authorities where required by law.",
	},
]

const REPORT_TYPES = [
	{
		title: "Harassment & Bullying",
		desc: "Repeated unwanted contact, personal attacks, threatening messages, organized harassment, and cyberbullying.",
	},
	{
		title: "Hate Speech & Discrimination",
		desc: "Content promoting hatred, discrimination, or violence based on race, ethnicity, gender, religion, disability, or other protected characteristics.",
	},
	{
		title: "Fraud, Scams & Deceptive Activity",
		desc: "Investment scams, phishing, fake giveaways, identity theft, financial fraud, and unauthorized fundraising.",
	},
	{
		title: "Impersonation & Fake Accounts",
		desc: "Accounts pretending to be individuals, businesses, organizations, public figures, or government entities.",
	},
	{
		title: "Child Safety & Protection",
		desc: "Zero tolerance for child exploitation, abuse, or grooming. These reports receive the highest priority.",
	},
	{
		title: "Threats & Dangerous Behavior",
		desc: "Credible threats, violent extremism, criminal activity, dangerous challenges, and organized harmful behavior.",
	},
	{
		title: "Privacy Violations",
		desc: "Unauthorized sharing of personal information, confidential records, sensitive data, or private images.",
	},
	{
		title: "Intellectual Property Violations",
		desc: "Copyright infringement, trademark infringement, unauthorized content use, and brand impersonation.",
	},
]

const SAFETY_MEASURES = [
	{
		title: "Security Features",
		items: [
			"Secure authentication",
			"Two-factor authentication",
			"Login monitoring",
			"Fraud detection",
			"Device verification",
		],
	},
	{
		title: "Content Protection",
		items: [
			"Automated moderation systems",
			"Harmful content detection",
			"Spam prevention systems",
			"Abuse detection tools",
		],
	},
	{
		title: "Community Safety",
		items: [
			"User blocking tools",
			"Privacy controls",
			"Reporting systems",
			"Community moderation tools",
		],
	},
]

const SAFETY_TIPS = [
	{
		title: "Protect Your Account",
		items: [
			"Use a strong password",
			"Enable two-factor authentication",
			"Avoid sharing login credentials",
			"Review active sessions regularly",
		],
	},
	{
		title: "Protect Your Privacy",
		items: [
			"Adjust privacy settings",
			"Limit public information",
			"Be cautious with personal details",
		],
	},
	{
		title: "Stay Alert",
		items: ["Verify suspicious messages", "Avoid unknown links", "Report scams immediately"],
	},
]

const SAFETY_CONTACTS = [
	{ label: "Safety Team", email: "safety@appscombo.com" },
	{ label: "Security Team", email: "security@appscombo.com" },
	{ label: "Legal Department", email: "legal@appscombo.com" },
	{ label: "General Support", email: "support@appscombo.com" },
]

type FormState = "idle" | "loading" | "success"

export function SafetyReport() {
	const [form, setForm] = useState({
		violationType: "",
		contentUrl: "",
		description: "",
		email: "",
	})
	const [state, setState] = useState<FormState>("idle")

	const canSubmit = form.violationType && form.description

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return
		setState("loading")
		await new Promise((r) => setTimeout(r, 1400))
		setState("success")
	}

	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Trust & Safety
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
						Building a safer AppsCombo community
					</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						The safety, security, and well-being of our users are among our highest priorities. Use
						this form to report content that violates our community guidelines — all reports are
						reviewed by our moderation team.
					</p>
				</div>
			</section>

			<div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				{/* Emergency notice */}
				<div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 mb-10">
					<AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
					<div>
						<p className="text-[13px] font-semibold text-gray-900 mb-1">
							For immediate danger or emergencies
						</p>
						<p className="text-sm text-gray-600">
							If you or someone else is in immediate danger, contact local emergency services
							immediately. This form is reviewed as quickly as possible, but is not monitored in
							real time.{" "}
							<a
								href="tel:199"
								className="text-red-500 font-semibold inline-flex items-center gap-1"
							>
								<Phone size={12} /> Emergency: 199 (Nigeria)
							</a>
						</p>
					</div>
				</div>

				<div className="grid sm:grid-cols-5 gap-10 sm:gap-14">
					{/* Form */}
					<div className="sm:col-span-3">
						{state === "success" ? (
							<div className="flex flex-col items-center justify-center py-14 text-center">
								<div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
									<CheckCircle size={30} className="text-green-500" />
								</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">Report submitted</h2>
								<p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-2">
									Thank you for helping keep AppsCombo safe. Our moderation team will review your
									report.
								</p>
								{form.email && (
									<p className="text-xs text-gray-400">
										We will notify you at <strong>{form.email}</strong>.
									</p>
								)}
								<button
									onClick={() => {
										setForm({ violationType: "", contentUrl: "", description: "", email: "" })
										setState("idle")
									}}
									className="mt-6 text-sm font-semibold text-primary hover:underline"
								>
									Submit another report
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">
										Type of violation <span className="text-red-400">*</span>
									</label>
									<select
										value={form.violationType}
										onChange={(e) => setForm((f) => ({ ...f, violationType: e.target.value }))}
										required
										className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
									>
										<option value="" disabled>
											Select violation type…
										</option>
										{VIOLATION_TYPES.map((v) => (
											<option key={v} value={v}>
												{v}
											</option>
										))}
									</select>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">
										URL of reported content{" "}
										<span className="text-gray-400 font-normal">(optional but recommended)</span>
									</label>
									<input
										type="url"
										value={form.contentUrl}
										onChange={(e) => setForm((f) => ({ ...f, contentUrl: e.target.value }))}
										placeholder="https://appscombo.com/posts/..."
										className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">
										Description <span className="text-red-400">*</span>
									</label>
									<textarea
										value={form.description}
										onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
										placeholder="Please describe the issue in detail. Include usernames, dates, or any context that may help our review team…"
										rows={5}
										required
										className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">
										Your email{" "}
										<span className="text-gray-400 font-normal">
											(optional — for outcome notification)
										</span>
									</label>
									<input
										type="email"
										value={form.email}
										onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
										placeholder="you@example.com"
										className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
									/>
								</div>

								<button
									type="submit"
									disabled={!canSubmit || state === "loading"}
									className="w-full h-12 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
								>
									{state === "loading" ? (
										<>
											<Loader2 size={15} className="animate-spin" /> Submitting…
										</>
									) : (
										"Submit report"
									)}
								</button>

								<p className="text-[11px] text-gray-400 text-center leading-relaxed">
									Reports are anonymous unless you provide your email. False or malicious reports
									may result in action against your account.
								</p>
							</form>
						)}
					</div>

					{/* What happens next */}
					<div className="sm:col-span-2">
						<h3 className="text-[15px] font-bold text-gray-900 mb-5">
							What happens after you report
						</h3>
						<div className="space-y-5">
							{PROCESS_STEPS.map(({ step, title, desc }) => (
								<div key={step} className="flex gap-4">
									<div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
										{step}
									</div>
									<div>
										<p className="text-[13px] font-semibold text-gray-900 mb-0.5">{title}</p>
										<p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
									</div>
								</div>
							))}
						</div>
						<div className="mt-8 bg-gray-50 rounded-2xl p-4">
							<p className="text-[12px] text-gray-500 leading-relaxed">
								In-app reports (via the three-dot menu on any post or profile) are processed faster
								as they carry additional context automatically. If you believe an enforcement action
								was taken in error, you may request a review through Support.
							</p>
						</div>
					</div>
				</div>

				{/* Types of reports */}
				<section className="mt-20">
					<h2 className="text-xl font-bold text-gray-900 mb-6">Types of safety reports</h2>
					<div className="grid sm:grid-cols-2 gap-5">
						{REPORT_TYPES.map(({ title, desc }) => (
							<div key={title} className="border border-gray-100 rounded-2xl p-5">
								<h3 className="text-[14px] font-bold text-gray-900 mb-1.5">{title}</h3>
								<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Platform safety measures */}
				<section className="mt-16">
					<h2 className="text-xl font-bold text-gray-900 mb-6">Platform safety measures</h2>
					<div className="grid sm:grid-cols-3 gap-6">
						{SAFETY_MEASURES.map(({ title, items }) => (
							<div key={title}>
								<h3 className="text-[13.5px] font-bold text-gray-900 mb-3">{title}</h3>
								<ul className="space-y-1.5">
									{items.map((i) => (
										<li key={i} className="flex items-center gap-2 text-xs text-gray-500">
											<span className="w-1 h-1 rounded-full bg-primary shrink-0" />
											{i}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>

				{/* Safety tips */}
				<section className="mt-16">
					<h2 className="text-xl font-bold text-gray-900 mb-6">Safety tips for users</h2>
					<div className="grid sm:grid-cols-3 gap-6">
						{SAFETY_TIPS.map(({ title, items }) => (
							<div key={title} className="bg-gray-50 rounded-2xl p-5">
								<h3 className="text-[13.5px] font-bold text-gray-900 mb-3">{title}</h3>
								<ul className="space-y-1.5">
									{items.map((i) => (
										<li key={i} className="flex items-center gap-2 text-xs text-gray-500">
											<span className="w-1 h-1 rounded-full bg-primary shrink-0" />
											{i}
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>

				{/* Contact */}
				<section className="mt-16">
					<h2 className="text-xl font-bold text-gray-900 mb-2">Contact the safety team</h2>
					<p className="text-sm text-gray-500 mb-6">
						Every report helps us improve the safety and integrity of AppsCombo.
					</p>
					<div className="grid sm:grid-cols-2 gap-3">
						{SAFETY_CONTACTS.map(({ label, email }) => (
							<a
								key={label}
								href={`mailto:${email}`}
								className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-primary/5 border border-gray-100 transition-colors"
							>
								<span className="text-[13px] font-semibold text-gray-800">{label}</span>
								<span className="text-[12px] text-primary">{email}</span>
							</a>
						))}
					</div>
				</section>
			</div>
		</>
	)
}
