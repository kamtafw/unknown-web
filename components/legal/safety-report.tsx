"use client"

import { AlertTriangle, CheckCircle, Loader2, Phone } from "lucide-react"
import { useState } from "react"
import { LegalWrapper } from "./legal-wrapper"

const VIOLATION_TYPES = [
	"Harassment or bullying",
	"Hate speech or discrimination",
	"Spam or scam",
	"Misinformation or fake news",
	"Sexual content involving minors",
	"Violent or graphic content",
	"Intellectual property violation",
	"Self-harm or suicide content",
	"Terrorism or extremism",
	"Impersonation",
	"Other",
]

const PROCESS_STEPS = [
	{
		step: "1",
		title: "Report received",
		desc: "Your report is logged and assigned a case ID immediately.",
	},
	{
		step: "2",
		title: "Content review",
		desc: "Our moderation team reviews the content within 48 hours.",
	},
	{
		step: "3",
		title: "Action taken",
		desc: "If a violation is found, we remove content and may restrict or ban the account.",
	},
	{
		step: "4",
		title: "Notification",
		desc: "If you provided your email, we notify you of the outcome.",
	},
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
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Trust & Safety
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
						Report harmful content
					</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						AppsCombo takes safety seriously. Use this form to report content that violates our
						community guidelines. All reports are reviewed by our moderation team.
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
							If you or someone else is in immediate danger, please contact your local emergency
							services. This form is not monitored in real time.{" "}
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
									report within 48 hours.
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
						<h3 className="text-[15px] font-bold text-gray-900 mb-5">What happens next</h3>
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
								as they carry additional context automatically.
							</p>
						</div>
					</div>
				</div>
			</div>
		</LegalWrapper>
	)
}
