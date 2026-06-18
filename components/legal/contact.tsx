"use client"

import { CheckCircle, Clock, Loader2, Mail } from "lucide-react"
import { useState } from "react"
import { LegalWrapper } from "./legal-wrapper"

const CATEGORIES = [
	"General inquiry",
	"Technical support",
	"Account issue",
	"Business partnership",
	"Press & media",
	"Advertising",
	"Legal",
	"Other",
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
		// Simulate API call
		await new Promise((r) => setTimeout(r, 1200))
		setState("success")
	}

	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Get in touch
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Contact us</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						Have a question, feedback, or need help with something? Fill in the form and we will get
						back to you as soon as possible.
					</p>
				</div>
			</section>

			<div className="max-w-5xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<div className="grid sm:grid-cols-3 gap-10 sm:gap-16">
					{/* Info */}
					<div className="sm:col-span-1 space-y-6">
						<div>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
								<Mail size={18} className="text-primary" />
							</div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-1">Email</h3>
							<a href="mailto:hello@appscombo.com" className="text-sm text-primary hover:underline">
								hello@appscombo.com
							</a>
						</div>
						<div>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
								<Clock size={18} className="text-primary" />
							</div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-1">Response time</h3>
							<p className="text-sm text-gray-500">We aim to reply within 1–2 business days.</p>
						</div>
						<div className="bg-gray-50 rounded-2xl p-4">
							<p className="text-[12.5px] text-gray-500 leading-relaxed">
								For urgent account or safety issues, please use our{" "}
								<a href="/support" className="text-primary hover:underline font-medium">
									support page
								</a>{" "}
								or submit a{" "}
								<a href="/safety-report" className="text-primary hover:underline font-medium">
									safety report
								</a>
								.
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
									Thanks for reaching out. We will review your message and get back to you within
									1–2 business days.
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
		</LegalWrapper>
	)
}
