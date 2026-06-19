"use client"

import {
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  Code2,
  HeartHandshake,
  Loader2,
  Mail,
  Megaphone,
  Newspaper,
  Scale,
  ShieldAlert,
  UserCog,
  Wrench,
} from "lucide-react"
import { useState } from "react"

const CATEGORIES = [
	"General Inquiry",
	"Customer Support",
	"Technical Support",
	"Account Recovery",
	"Privacy Request",
	"Safety Report",
	"Business Inquiry",
	"Advertising",
	"Partnership",
	"Media Request",
	"Legal Inquiry",
	"Other",
]

const TEAMS = [
	{
		icon: Mail,
		label: "General Inquiries",
		email: "info@appscombo.com",
		desc: "Questions, feedback, or general information about AppsCombo.",
	},
	{
		icon: UserCog,
		label: "Customer Support",
		email: "support@appscombo.com",
		desc: "Account access, password resets, profile management, messaging.",
	},
	{
		icon: Wrench,
		label: "Technical Support",
		email: "support@appscombo.com",
		desc: "Bugs and technical issues — include device, OS, and app version.",
	},
	{
		icon: ShieldAlert,
		label: "Account Recovery",
		email: "recovery@appscombo.com",
		desc: "Lost access or believe your account has been compromised.",
	},
	{
		icon: BadgeCheck,
		label: "Privacy & Data Protection",
		email: "privacy@appscombo.com",
		desc: "Data access, correction, deletion requests, and privacy concerns.",
	},
	{
		icon: ShieldAlert,
		label: "Safety & Abuse Reporting",
		email: "support@appscombo.com",
		desc: "Harassment, hate speech, impersonation, fraud, or scams.",
	},
	{
		icon: Briefcase,
		label: "Business & Advertising",
		email: "business@appscombo.com",
		desc: "Advertising campaigns, brand partnerships, sponsored content.",
	},
	{
		icon: HeartHandshake,
		label: "Partnerships",
		email: "partnerships@appscombo.com",
		desc: "Technology integrations, collaborations, strategic alliances.",
	},
	{
		icon: Megaphone,
		label: "Creator Support",
		email: "creators@appscombo.com",
		desc: "Support and collaboration opportunities for creators.",
	},
	{
		icon: Newspaper,
		label: "Media & Press",
		email: "press@appscombo.com",
		desc: "Interviews, press releases, and public relations inquiries.",
	},
	{
		icon: Scale,
		label: "Legal Department",
		email: "legal@appscombo.com",
		desc: "Legal notices, intellectual property, and compliance matters.",
	},
	{
		icon: Code2,
		label: "Developer Support",
		email: "support@appscombo.com",
		desc: "API access, integrations, and developer-related questions.",
	},
]

type FormState = "idle" | "loading" | "success"

export function Contact() {
	const [form, setForm] = useState({ name: "", email: "", category: "", subject: "", message: "" })
	const [state, setState] = useState<FormState>("idle")

	const canSubmit = form.name && form.email && form.category && form.subject && form.message

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!canSubmit) return
		setState("loading")
		await new Promise((r) => setTimeout(r, 1200))
		setState("success")
	}

	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						We&rsquo;d love to hear from you
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contact us</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						Whether you have a question, need assistance, want to report an issue, explore
						partnership opportunities, or simply share feedback — our team is here to help, around
						the clock.
					</p>
				</div>
			</section>

			{/* Team directory */}
			<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16 border-b border-gray-100">
				<h2 className="text-xl font-bold text-gray-900 mb-1">Reach the right team</h2>
				<p className="text-sm text-gray-500 mb-8">
					Routing your message to the right inbox gets you a faster response.
				</p>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{TEAMS.map(({ icon: Icon, label, email, desc }) => (
						<a
							key={label}
							href={`mailto:${email}`}
							className="flex flex-col gap-2.5 p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-colors"
						>
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
									<Icon size={15} className="text-primary" />
								</div>
								<span className="text-[13.5px] font-semibold text-gray-900">{label}</span>
							</div>
							<p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
							<span className="text-xs font-medium text-primary">{email}</span>
						</a>
					))}
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<div className="grid sm:grid-cols-3 gap-10 sm:gap-16">
					{/* Info */}
					<div className="sm:col-span-1 space-y-6">
						<div>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
								<Mail size={18} className="text-primary" />
							</div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-1">Send a message</h3>
							<a href="mailto:hello@appscombo.com" className="text-sm text-primary hover:underline">
								hello@appscombo.com
							</a>
						</div>
						<div>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
								<Clock size={18} className="text-primary" />
							</div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-1">Support hours</h3>
							<p className="text-sm text-gray-500">
								Customer support is available 24 hours a day, 7 days a week.
							</p>
						</div>
						<div>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
								<Building2 size={18} className="text-primary" />
							</div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-1">Headquarters</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								8 The Green, Ste A, Kent, Dover, DE, 19901, United States
							</p>
						</div>
						<div className="bg-gray-50 rounded-2xl p-4">
							<p className="text-[12.5px] text-gray-500 leading-relaxed">
								For urgent safety or account-security matters, please use our{" "}
								<a href="/safety-report" className="text-primary hover:underline font-medium">
									safety report
								</a>{" "}
								or{" "}
								<a href="/support" className="text-primary hover:underline font-medium">
									support page
								</a>{" "}
								directly.
							</p>
						</div>
					</div>

					{/* Form */}
					<div className="sm:col-span-2">
						{state === "success" ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
									<CheckCircle size={30} className="text-green-500" />
								</div>
								<h2 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h2>
								<p className="text-gray-500 text-sm max-w-sm leading-relaxed">
									Thanks for reaching out. Our team will review your message and respond as quickly
									as possible.
								</p>
								<button
									onClick={() => {
										setForm({ name: "", email: "", category: "", subject: "", message: "" })
										setState("idle")
									}}
									className="mt-6 text-sm font-semibold text-primary hover:underline"
								>
									Send another message
								</button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="grid sm:grid-cols-2 gap-5">
									<div className="flex flex-col gap-1.5">
										<label className="text-sm font-semibold text-gray-900">Full name</label>
										<input
											type="text"
											value={form.name}
											onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
											placeholder="Your full name"
											required
											className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
										/>
									</div>
									<div className="flex flex-col gap-1.5">
										<label className="text-sm font-semibold text-gray-900">Email address</label>
										<input
											type="email"
											value={form.email}
											onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
											placeholder="you@example.com"
											required
											className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
										/>
									</div>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">Category</label>
									<select
										value={form.category}
										onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
										required
										className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
									>
										<option value="" disabled>
											Select a category…
										</option>
										{CATEGORIES.map((c) => (
											<option key={c} value={c}>
												{c}
											</option>
										))}
									</select>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">Subject</label>
									<input
										type="text"
										value={form.subject}
										onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
										placeholder="Brief description of your inquiry"
										required
										className="h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors"
									/>
								</div>

								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-semibold text-gray-900">Message</label>
									<textarea
										value={form.message}
										onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
										placeholder="Please include as much detail as possible…"
										rows={5}
										required
										className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
									/>
								</div>

								<button
									type="submit"
									disabled={!canSubmit || state === "loading"}
									className="w-full h-12 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
								>
									{state === "loading" ? (
										<>
											<Loader2 size={15} className="animate-spin" /> Sending…
										</>
									) : (
										"Send message"
									)}
								</button>
							</form>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
