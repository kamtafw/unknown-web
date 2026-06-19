"use client"

import {
	Activity,
	Book,
	Building2,
	ChevronRight,
	Clock,
	CreditCard,
	Info,
	Mail,
	MessageCircle,
	Search,
	Shield,
	UserCog,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const CATEGORIES = [
	{ icon: UserCog, label: "Account & Login", href: "#account" },
	{ icon: Shield, label: "Privacy & Security", href: "#privacy" },
	{ icon: MessageCircle, label: "Messaging & Communities", href: "#messaging" },
	{ icon: Book, label: "Content & Posts", href: "#content" },
	{ icon: Building2, label: "Events & Business", href: "#business" },
	{ icon: CreditCard, label: "Payments & Billing", href: "#payments" },
]

const FAQS = [
	{
		section: "Account & Login",
		items: [
			{
				q: "How do I create an AppsCombo account?",
				a: "Download the AppsCombo mobile app or visit our website and complete registration using your email address, phone number, or a supported third-party authentication provider.",
			},
			{
				q: "I forgot my password.",
				a: "Select Forgot Password on the login page and follow the instructions to reset your password securely.",
			},
			{
				q: "I cannot access my account.",
				a: "If you're unable to access your account due to a forgotten password, security issue, or lockout, contact our Account Recovery Team at support@appscombo.com.",
			},
			{
				q: "How do I delete my account?",
				a: "You may delete your account through your Account Settings page. Some information may remain in backup systems for a limited period as required by law and security policies.",
			},
		],
	},
	{
		section: "Profile & Account Settings",
		items: [
			{
				q: "How do I update my profile?",
				a: "You can update your profile picture, cover photo, bio, personal information, contact details, and privacy settings through the Profile Settings section.",
			},
			{
				q: "How do I change my username?",
				a: "Usernames may be changed according to AppsCombo's username policies. Availability restrictions may apply.",
			},
			{
				q: "How do I verify my account?",
				a: "Verified accounts may be available for public figures, businesses, creators, organizations, and professionals, subject to eligibility requirements.",
			},
		],
	},
	{
		section: "Privacy & Security",
		items: [
			{
				q: "How does AppsCombo protect my information?",
				a: "We use industry-standard security measures including secure authentication, encrypted communications, access controls, fraud detection, and security monitoring.",
			},
			{
				q: "How do I enable two-factor authentication?",
				a: "Navigate to Settings → Security → Two-Factor Authentication and follow the setup instructions.",
			},
			{
				q: "How do I report suspicious activity?",
				a: "Immediately change your password, review active sessions, enable two-factor authentication, and contact our Security Team at safety@appscombo.com.",
			},
		],
	},
	{
		section: "Content, Posts & Media",
		items: [
			{
				q: "How do I create a post?",
				a: "Select Create Post from your feed, profile, or community page and choose the content you'd like to share.",
			},
			{
				q: "What content is allowed on AppsCombo?",
				a: "Users must follow our Community Guidelines. Content that may be removed includes hate speech, harassment, fraudulent content, intellectual property violations, spam, violent or harmful content, and illegal activities.",
			},
			{
				q: "Why was my content removed?",
				a: "Content may be removed if it violates our Terms of Service, Community Guidelines, Safety Policies, or applicable laws. You may appeal certain moderation decisions through the platform.",
			},
		],
	},
	{
		section: "Messaging & Communication",
		items: [
			{
				q: "How do I send messages?",
				a: "You can send messages directly to other users through the Messaging section.",
			},
			{
				q: "Can I create group chats?",
				a: "Yes. AppsCombo supports both individual and group conversations.",
			},
			{
				q: "How do I block or report someone?",
				a: "Visit the user's profile and select More Options → Block User or Report User.",
			},
		],
	},
	{
		section: "Communities & Groups",
		items: [
			{
				q: "How do I create a community?",
				a: "Select Create Community and follow the setup process.",
			},
			{
				q: "Can communities be private?",
				a: "Yes. Communities can be Public, Private, or Invite-only.",
			},
			{
				q: "How do I manage community members?",
				a: "Community administrators have access to moderation tools for managing members, content, and settings.",
			},
		],
	},
	{
		section: "Events",
		items: [
			{
				q: "How do I create an event?",
				a: "Navigate to the Events section and select Create Event. You can customize event details, date and time, location, guest list, registration settings, and privacy controls.",
			},
			{
				q: "Can I sell tickets through AppsCombo?",
				a: "Ticketing and event monetization features may be available in selected regions and subject to approval.",
			},
			{
				q: "How do guests RSVP?",
				a: "Invited guests can respond directly through the event page.",
			},
		],
	},
	{
		section: "Business Pages",
		items: [
			{
				q: "How do I create a business page?",
				a: "Business pages can be created through the Business Center.",
			},
			{
				q: "What tools are available for businesses?",
				a: "Businesses may access business profiles, advertising tools, analytics, audience insights, customer engagement tools, and promotional campaigns.",
			},
			{
				q: "How do I advertise on AppsCombo?",
				a: "Visit the Ads Manager section to create and manage advertising campaigns.",
			},
		],
	},
	{
		section: "Creator Support",
		items: [
			{
				q: "How can creators grow on AppsCombo?",
				a: "Creators can publish content, build communities, engage followers, host live sessions, and participate in creator programs.",
			},
			{
				q: "Does AppsCombo offer monetization?",
				a: "Eligible creators may have access to monetization opportunities depending on location, platform policies, and program availability.",
			},
		],
	},
	{
		section: "Payments & Billing",
		items: [
			{
				q: "What payment methods are supported?",
				a: "Supported payment methods may include credit cards, debit cards, bank transfers, mobile wallets, and other approved payment providers.",
			},
			{
				q: "How do I request a refund?",
				a: "Refund requests may be submitted through our Billing Support Team at billing@appscombo.com. Refund eligibility depends on applicable policies and local regulations.",
			},
		],
	},
	{
		section: "Reporting Problems",
		items: [
			{
				q: "How do I report a bug?",
				a: "Contact support@appscombo.com and include your device type, operating system, app version, screenshots, and steps to reproduce the issue.",
			},
			{
				q: "How do I report abuse or harmful content?",
				a: "Use the Report feature available throughout AppsCombo, or contact safety@appscombo.com directly.",
			},
		],
	},
]

const CONTACTS = [
	{ label: "Customer Support", email: "support@appscombo.com" },
	{ label: "Technical Support", email: "support@appscombo.com" },
	{ label: "Account Recovery", email: "support@appscombo.com" },
	{ label: "Privacy & Data Requests", email: "support@appscombo.com" },
	{ label: "Safety & Abuse Reports", email: "support@appscombo.com" },
	{ label: "Business & Advertising", email: "business@appscombo.com" },
	{ label: "Developer & API Support", email: "developers@appscombo.com" },
]

const RESOURCES = [
	{ label: "Privacy Policy", href: "/privacy-policy" },
	{ label: "Terms of Service", href: "/terms" },
	{ label: "Safety Center", href: "/safety-report" },
	{ label: "Account Recovery", href: "/account-recovery" },
	{ label: "Advertising Policies", href: "/advertising" },
]

export function Support() {
	const [openIndex, setOpenIndex] = useState<string | null>(null)

	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
						Help Center
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">How can we help?</h1>
					<div className="relative max-w-lg mx-auto">
						<Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search help articles…"
							className="w-full h-12 pl-11 pr-4 bg-white border border-gray-200 rounded-full text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-colors shadow-sm"
						/>
					</div>
				</div>
			</section>

			<div className="max-w-4xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-14">
				{/* Categories */}
				<section>
					<h2 className="text-xl font-bold text-gray-900 mb-6">Browse by topic</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
						{CATEGORIES.map(({ icon: Icon, label, href }) => (
							<a
								key={label}
								href={href}
								className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 hover:border-primary/20 border border-gray-100 transition-colors"
							>
								<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
									<Icon size={16} className="text-primary" />
								</div>
								<span className="text-[13px] font-semibold text-gray-800">{label}</span>
							</a>
						))}
					</div>
				</section>

				{/* FAQ */}
				<section>
					<h2 className="text-xl font-bold text-gray-900 mb-8">Frequently asked questions</h2>
					<div className="space-y-10">
						{FAQS.map(({ section, items }) => (
							<div key={section}>
								<h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
									{section}
								</h3>
								<div className="space-y-2">
									{items.map(({ q, a }, i) => {
										const key = `${section}-${i}`
										const isOpen = openIndex === key
										return (
											<div key={q} className="border border-gray-100 rounded-2xl overflow-hidden">
												<button
													onClick={() => setOpenIndex(isOpen ? null : key)}
													className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
												>
													<span className="text-[14px] font-semibold text-gray-900 pr-4">{q}</span>
													<ChevronRight
														size={15}
														className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
													/>
												</button>
												{isOpen && (
													<div className="px-5 pb-5 border-t border-gray-50">
														<p className="text-sm text-gray-500 leading-relaxed pt-4">{a}</p>
													</div>
												)}
											</div>
										)
									})}
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Safety, Accessibility, Status */}
				<section className="grid sm:grid-cols-3 gap-5">
					<div className="bg-gray-50 rounded-2xl p-5">
						<div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm mb-3">
							<Shield size={16} className="text-primary" />
						</div>
						<h3 className="text-[13.5px] font-bold text-gray-900 mb-1.5">Safety Center</h3>
						<p className="text-xs text-gray-500 leading-relaxed">
							Report harassment, bullying, hate speech, fraud, scams, impersonation, threats, or
							illegal content. Reports are reviewed by our moderation and safety teams.
						</p>
					</div>
					<div className="bg-gray-50 rounded-2xl p-5">
						<div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm mb-3">
							<Info size={16} className="text-primary" />
						</div>
						<h3 className="text-[13.5px] font-bold text-gray-900 mb-1.5">Accessibility</h3>
						<p className="text-xs text-gray-500 leading-relaxed">
							We strive to provide an inclusive experience for all users. Reach out to
							support@appscombo.com with accessibility feedback or challenges.
						</p>
					</div>
					<div className="bg-gray-50 rounded-2xl p-5">
						<div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm mb-3">
							<Activity size={16} className="text-primary" />
						</div>
						<h3 className="text-[13.5px] font-bold text-gray-900 mb-1.5">Service Status</h3>
						<p className="text-xs text-gray-500 leading-relaxed">
							Check the status of AppsCombo services, maintenance schedules, or outages at{" "}
							<span className="text-primary font-medium">status.appscombo.com</span>.
						</p>
					</div>
				</section>

				{/* Resources */}
				<section>
					<h2 className="text-xl font-bold text-gray-900 mb-5">Resources</h2>
					<div className="flex flex-wrap gap-2.5">
						{RESOURCES.map((r) => (
							<Link
								key={r.label}
								href={r.href}
								className="text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-full px-4 py-2 transition-colors"
							>
								{r.label}
							</Link>
						))}
					</div>
				</section>

				{/* Contact directory */}
				<section>
					<h2 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h2>
					<p className="text-sm text-gray-500 mb-6 flex items-center gap-1.5">
						<Clock size={13} /> Support available 24 hours a day, 7 days a week.
					</p>
					<div className="grid sm:grid-cols-2 gap-3">
						{CONTACTS.map(({ label, email }) => (
							<a
								key={label}
								href={`mailto:${email}`}
								className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl hover:bg-primary/5 border border-gray-100 transition-colors"
							>
								<Mail size={14} className="text-primary shrink-0" />
								<div className="min-w-0">
									<p className="text-[12.5px] font-semibold text-gray-800">{label}</p>
									<p className="text-[11px] text-gray-500 truncate">{email}</p>
								</div>
							</a>
						))}
					</div>
				</section>

				{/* Contact CTA */}
				<section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
					<div className="sm:flex items-center justify-between gap-6">
						<div className="mb-4 sm:mb-0">
							<h3 className="text-[15px] font-bold text-gray-900 mb-1">
								Didn&rsquo;t find your answer?
							</h3>
							<p className="text-sm text-gray-500">
								Our support team typically responds within 24 hours.
							</p>
						</div>
						<Link
							href="/contact"
							className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors shrink-0"
						>
							Contact support
						</Link>
					</div>
				</section>
			</div>
		</>
	)
}
