"use client"

import { CheckCircle, Loader2 } from "lucide-react"
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="mb-10 sm:mb-12">
			<h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-4">{title}</h2>
			{children}
		</section>
	)
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="mt-5">
			<h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
			{children}
		</div>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed mb-3">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-gray-500 leading-relaxed space-y-1">
			{children}
		</ul>
	)
}

function Divider() {
	return <hr className="border-gray-100 my-8 sm:my-10" />
}

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
			<section className="py-14 sm:py-20 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Contact us
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
						We&apos;d love to hear from you
					</h1>
					<p className="text-gray-500 leading-relaxed max-w-2xl">
						At AppsCombo, we&apos;re committed to creating meaningful connections and providing
						exceptional support to our users, creators, businesses, communities, and partners around
						the world. Whether you have a question, need assistance, want to report an issue,
						explore partnership opportunities, or simply share feedback — our team is here to help.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Get in touch">
					<P>
						Our support and customer success teams are available to assist you with inquiries
						related to your account, technical issues, privacy concerns, business services,
						advertising, and more.
					</P>

					<SubSection title="General inquiries">
						<P>For general questions, feedback, or information about AppsCombo.</P>
						<a
							href="mailto:info@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							info@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Customer support">
						<P>Need help with your account or using AppsCombo? Our support team can assist with:</P>
						<UL>
							<li>Account access issues</li>
							<li>Password resets</li>
							<li>Profile management</li>
							<li>Community features</li>
							<li>Messaging issues</li>
							<li>Platform navigation and general support</li>
						</UL>
						<a
							href="mailto:support@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							support@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Technical support">
						<P>
							Experiencing a technical issue or found a bug? Please include device information,
							operating system, browser or app version, screenshots (if applicable), and a
							description of the issue to help us resolve your request more efficiently.
						</P>
						<a
							href="mailto:support@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							support@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Account recovery">
						<P>
							If you&apos;ve lost access to your account or believe it has been compromised, our
							security team will guide you through the recovery process.
						</P>
						<a
							href="mailto:recovery@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							recovery@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Privacy and data protection">
						<P>
							Questions about your privacy, personal data, or data protection rights? We can assist
							with:
						</P>
						<UL>
							<li>Data access requests</li>
							<li>Data correction requests</li>
							<li>Account deletion requests</li>
							<li>Privacy concerns</li>
							<li>Regulatory compliance inquiries</li>
						</UL>
						<a
							href="mailto:privacy@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							privacy@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Safety and abuse reporting">
						<P>
							To report harassment, bullying, hate speech, impersonation, fraud, scams, security
							concerns, or other policy violations, contact us with as much detail as possible —
							including screenshots, usernames, and links.
						</P>
						<a
							href="mailto:support@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							support@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Business and advertising inquiries">
						<P>
							Interested in promoting your business or advertising on AppsCombo? Our business team
							can assist with advertising campaigns, brand partnerships, business accounts,
							sponsored content, and marketing opportunities.
						</P>
						<a
							href="mailto:business@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							business@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Partnerships and strategic alliances">
						<P>
							We welcome opportunities to collaborate with organizations, institutions, developers,
							brands, and technology partners — including technology integration, business
							collaborations, educational initiatives, community programs, event partnerships, and
							strategic alliances.
						</P>
						<a
							href="mailto:partnerships@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							partnerships@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Creator and influencer support">
						<P>
							Creators, influencers, and public figures can contact our creator relations team for
							support and collaboration opportunities.
						</P>
						<a
							href="mailto:creators@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							creators@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Media and press inquiries">
						<P>For media requests, interviews, press releases, and public relations inquiries.</P>
						<a
							href="mailto:press@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							press@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Legal department">
						<P>
							For legal notices, intellectual property matters, copyright concerns, or
							compliance-related inquiries.
						</P>
						<a
							href="mailto:legal@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							legal@appscombo.com
						</a>
					</SubSection>

					<SubSection title="Developer support">
						<P>
							For API access, integrations, technical partnerships, and developer-related questions.
						</P>
						<a
							href="mailto:support@appscombo.com"
							className="text-[13px] text-primary hover:underline"
						>
							support@appscombo.com
						</a>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Corporate headquarters">
					<P>
						AppsCombo
						<br />8 The Green, Ste A, Kent, Dover, DE, 19901, United States
					</P>
					<SubSection title="Business hours">
						<P>Customer support is available 24 hours a day, 7 days a week.</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Send us a message">
					{state === "success" ? (
						<div className="flex flex-col items-center justify-center py-14 text-center">
							<CheckCircle size={28} className="text-primary mb-4" />
							<h3 className="text-base font-bold text-gray-900 mb-2">Message sent!</h3>
							<p className="text-sm text-gray-500 max-w-sm leading-relaxed">
								Thanks for reaching out. Our team will review your message and respond as quickly as
								possible.
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
									<label className="text-sm font-medium text-gray-800">Full name</label>
									<input
										type="text"
										value={form.name}
										onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
										placeholder="Your full name"
										required
										className="h-11 px-0 border-b border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary bg-transparent transition-colors"
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<label className="text-sm font-medium text-gray-800">Email address</label>
									<input
										type="email"
										value={form.email}
										onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
										placeholder="you@example.com"
										required
										className="h-11 px-0 border-b border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary bg-transparent transition-colors"
									/>
								</div>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium text-gray-800">Category</label>
								<select
									value={form.category}
									onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
									required
									className="h-11 px-0 border-b border-gray-200 text-sm text-gray-800 bg-transparent focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
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
								<label className="text-sm font-medium text-gray-800">Subject</label>
								<input
									type="text"
									value={form.subject}
									onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
									placeholder="Brief description of your inquiry"
									required
									className="h-11 px-0 border-b border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary bg-transparent transition-colors"
								/>
							</div>

							<div className="flex flex-col gap-1.5">
								<label className="text-sm font-medium text-gray-800">Message</label>
								<textarea
									value={form.message}
									onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
									placeholder="Please include as much detail as possible…"
									rows={5}
									required
									className="px-0 py-2 border-b border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary bg-transparent transition-colors resize-none leading-relaxed"
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
				</Section>

				<Divider />

				<Section title="Follow AppsCombo">
					<P>
						Stay connected and keep up with the latest news, updates, product releases, and
						community highlights on our official social channels.
					</P>
					<p className="text-[13px] text-gray-400">
						Facebook · Instagram · X (Twitter) · LinkedIn · YouTube · TikTok
						<br />
						<span className="italic">(Official links coming soon.)</span>
					</p>
				</Section>

				<Divider />

				<Section title="Our commitment to you">
					<P>At AppsCombo, every message matters. We are dedicated to:</P>
					<UL>
						<li>Providing timely support</li>
						<li>Protecting your privacy</li>
						<li>Ensuring platform safety</li>
						<li>Improving user experiences</li>
						<li>Building a stronger global community</li>
					</UL>
				</Section>

				<p className="text-center text-xs text-gray-400 pt-2">AppsCombo — Connect. Engage. Grow.</p>
			</div>
		</>
	)
}
