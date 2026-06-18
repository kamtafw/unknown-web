"use client"

import {
	Bell,
	Book,
	ChevronRight,
	HelpCircle,
	MessageCircle,
	Search,
	Shield,
	UserCog,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { LegalWrapper } from "./legal-wrapper"

const CATEGORIES = [
	{ icon: UserCog, label: "Account & Profile", href: "/support#account" },
	{ icon: Shield, label: "Privacy & Safety", href: "/support#privacy" },
	{ icon: Bell, label: "Notifications", href: "/support#notifications" },
	{ icon: MessageCircle, label: "Messaging", href: "/support#messaging" },
	{ icon: Book, label: "Content & Policies", href: "/support#content" },
	{ icon: HelpCircle, label: "Other Topics", href: "/support#other" },
]

const FAQS = [
	{
		section: "Account",
		items: [
			{
				q: "How do I change my username?",
				a: "Go to Settings → Account → Change Username. Usernames can only be changed once every 180 days. The new username must be unique and can only contain letters, numbers, and underscores.",
			},
			{
				q: "How do I enable two-step verification?",
				a: "Navigate to Settings → Account → Two-step verification. You can choose between OTP email verification, a 6-digit PIN, or Google Authenticator.",
			},
			{
				q: "Can I have multiple accounts?",
				a: "Multiple account support is coming soon. For now, each phone number and email address can only be associated with one account.",
			},
			{
				q: "How do I change my password?",
				a: "If you know your current password, go to Settings → Account → Change Password. If you're locked out, use the 'Forgot Password' flow on the sign-in page.",
			},
		],
	},
	{
		section: "Privacy & Content",
		items: [
			{
				q: "Who can see my posts?",
				a: "By default, your posts are visible to everyone. You can change visibility per post (Everyone or Followers Only) when creating or editing a post.",
			},
			{
				q: "How do I block someone?",
				a: "Visit the user's profile, tap the three-dot menu, and select 'Block'. Blocked users cannot see your profile or contact you.",
			},
			{
				q: "How do I report harmful content?",
				a: "Tap the three-dot menu on any post, comment, or profile and select 'Report'. Our moderation team reviews all reports within 48 hours.",
			},
			{
				q: "Can I download my data?",
				a: "Data export is available in Settings → Privacy → Download your data. You will receive a download link via email within 24 hours.",
			},
		],
	},
	{
		section: "Technical",
		items: [
			{
				q: "The app is not loading. What should I do?",
				a: "Try refreshing the page or clearing your browser cache. If the problem persists, check our status page or contact support.",
			},
			{
				q: "Why am I not receiving notifications?",
				a: "Check that notifications are enabled in your device settings and in AppsCombo Settings → Alerts. Also check that your browser has granted notification permissions.",
			},
			{
				q: "Media files are not uploading. Why?",
				a: "Check your file size (images: max 10 MB, videos: max 100 MB). Supported formats are JPG, PNG, WebP for images, and MP4, MOV for videos. A stable internet connection is also required.",
			},
		],
	},
]

export function Support() {
	const [openIndex, setOpenIndex] = useState<string | null>(null)

	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
						Help Center
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">How can we help?</h1>
					{/* Search (decorative) */}
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
							<Link
								key={label}
								href={href}
								className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 hover:border-primary/20 border border-gray-100 transition-colors"
							>
								<div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
									<Icon size={16} className="text-primary" />
								</div>
								<span className="text-[13px] font-semibold text-gray-800">{label}</span>
							</Link>
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

				{/* Contact CTA */}
				<section className="bg-gray-50 rounded-2xl p-6 sm:p-8">
					<div className="sm:flex items-center justify-between gap-6">
						<div className="mb-4 sm:mb-0">
							<h3 className="text-[15px] font-bold text-gray-900 mb-1">Didn&rsquo;t find your answer?</h3>
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
		</LegalWrapper>
	)
}
