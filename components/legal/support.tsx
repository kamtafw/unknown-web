"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="mb-10 sm:mb-12">
			<h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">{title}</h2>
			{children}
		</section>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
}

function Divider() {
	return <hr className="border-border my-8 sm:my-10" />
}

export function Support() {
	const [openIndex, setOpenIndex] = useState<string | null>(null)

	return (
		<>
			{/* Hero */}
			<section className="py-14 sm:py-20 px-4 border-b border-border">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Help center
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
						How can we help?
					</h1>
					<p className="text-muted-foreground leading-relaxed max-w-2xl mb-6">
						Welcome to the AppsCombo Support Center. We&apos;re committed to helping you get the
						most out of AppsCombo — whether you need assistance with your account, privacy settings,
						messaging, events, business pages, payments, or reporting an issue.
					</p>
					<input
						type="text"
						placeholder="Search help articles…"
						className="w-full max-w-md h-11 px-0 border-b border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary bg-transparent transition-colors"
					/>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Contact support">
					<P>If you need assistance, our support team is ready to help.</P>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						Customer support:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Technical support:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Account recovery:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Privacy & data requests:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Safety & abuse reports:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Business & advertising:{" "}
						<a href="mailto:business@appscombo.com" className="text-primary hover:underline">
							business@appscombo.com
						</a>
						<br />
						Developer & API support:{" "}
						<a href="mailto:developers@appscombo.com" className="text-primary hover:underline">
							developers@appscombo.com
						</a>
					</p>
				</Section>

				<Divider />

				{/* FAQ */}
				<section className="mb-10 sm:mb-12">
					<h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-8">
						Frequently asked questions
					</h2>
					<div className="space-y-10">
						{FAQS.map(({ section, items }) => (
							<div key={section}>
								<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
									{section}
								</h3>
								<div className="divide-y divide-gray-100 border-t border-b border-border">
									{items.map(({ q, a }, i) => {
										const key = `${section}-${i}`
										const isOpen = openIndex === key
										return (
											<div key={q}>
												<button
													onClick={() => setOpenIndex(isOpen ? null : key)}
													className="w-full flex items-center justify-between py-4 text-left"
												>
													<span className="text-[13.5px] font-medium text-foreground pr-4">{q}</span>
													<ChevronRight
														size={14}
														className={`text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
													/>
												</button>
												{isOpen && (
													<p className="text-[13px] text-muted-foreground leading-relaxed pb-4 pr-6">{a}</p>
												)}
											</div>
										)
									})}
								</div>
							</div>
						))}
					</div>
				</section>

				<Divider />

				<Section title="Safety, accessibility & status">
					<p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
						<span className="text-foreground font-medium">Safety Center —</span> report harassment,
						bullying, hate speech, fraud, scams, impersonation, threats, or illegal content. Reports
						are reviewed by our moderation and safety teams.
					</p>
					<p className="text-[13px] text-muted-foreground leading-relaxed mb-3">
						<span className="text-foreground font-medium">Accessibility —</span> we strive to provide
						an inclusive experience for all users. Reach out to support@appscombo.com with
						accessibility feedback or challenges.
					</p>
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						<span className="text-foreground font-medium">Service status —</span> check the status of
						AppsCombo services, maintenance schedules, or outages at status.appscombo.com.
					</p>
				</Section>

				<Divider />

				<Section title="Resources">
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						{RESOURCES.map((r, i) => (
							<span key={r.href}>
								<Link href={r.href} className="text-primary hover:underline">
									{r.label}
								</Link>
								{i < RESOURCES.length - 1 && " · "}
							</span>
						))}
					</p>
				</Section>

				<Divider />

				<Section title="Still need help?">
					<P>Support available 24 hours a day, 7 days a week.</P>
					<div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mb-6">
						{CONTACTS.map(({ label, email }) => (
							<p key={label} className="text-[13px] text-muted-foreground leading-relaxed">
								<span className="text-foreground font-medium">{label}</span> —{" "}
								<a href={`mailto:${email}`} className="text-primary hover:underline">
									{email}
								</a>
							</p>
						))}
					</div>
					<Link
						href="/contact"
						className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Contact support
					</Link>
				</Section>

				<p className="text-center text-xs text-muted-foreground pt-2">AppsCombo — Connect. Engage. Grow.</p>
			</div>
		</>
	)
}
