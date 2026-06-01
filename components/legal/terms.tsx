"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const SECTIONS = [
	{ id: "s1", label: "1. Eligibility and Account Registration" },
	{ id: "s1-1", label: "1.1 Eligibility", sub: true },
	{ id: "s1-2", label: "1.2 Account Registration", sub: true },

	{ id: "s2", label: "2. Your Use of AppsCombo" },

	{ id: "s3", label: "3. User Content and Ownership" },
	{ id: "s3-1", label: "3.1 Your Content", sub: true },
	{ id: "s3-2", label: "3.2 License You Grant to AppsCombo", sub: true },

	{ id: "s4", label: "4. Acceptable Use Policy" },

	{ id: "s5", label: "5. Community Standards and Moderation" },

	{ id: "s6", label: "6. Privacy" },

	{ id: "s7", label: "7. Intellectual Property Rights" },
	{ id: "s7-1", label: "7.1 AppsCombo Ownership", sub: true },
	{ id: "s7-2", label: "7.2 Copyright Complaints", sub: true },

	{ id: "s8", label: "8. Messaging" },

	{ id: "s9", label: "9. Advertising, Promotions, and Sponsored Content" },

	{ id: "s10", label: "10. Paid Services and Monetization" },

	{ id: "s11", label: "11. Third-Party Services and Links" },

	{ id: "s12", label: "12. Platform Availability and Changes" },

	{ id: "s13", label: "13. Artificial Intelligence and Automated Systems" },

	{ id: "s14", label: "14. Data Usage and Analytics" },

	{ id: "s15", label: "15. Account Suspension and Termination" },

	{ id: "s16", label: "16. Disclaimer of Warranties" },

	{ id: "s17", label: "17. Limitation of Liability" },

	{ id: "s18", label: "18. Indemnification" },

	{ id: "s19", label: "19. Governing Law and Jurisdiction" },

	{ id: "s20", label: "20. International Use" },

	{ id: "s21", label: "21. Changes to These Terms" },

	{ id: "s22", label: "22. Contact Information" },

	{ id: "s23", label: "23. Entire Engagement" },

	{ id: "s24", label: "24. Waiver and Severability" },

	{ id: "s25", label: "25. Electronic Communications" },

	{ id: "s26", label: "26. User Feedback and Suggestions" },

	{ id: "s27", label: "27. Beta Features and Experimental Services" },

	{ id: "s28", label: "28. Force Majeure" },

	{ id: "s29", label: "29. Acceptance of Terms" },
]

function NavItem({
	id,
	label,
	sub,
	active,
	onClick,
}: {
	id: string
	label: string
	sub?: boolean
	active: boolean
	onClick: (id: string) => void
}) {
	return (
		<button
			onClick={() => onClick(id)}
			className={[
				"block w-full text-left tracking-wide rounded-md transition-colors duration-150",
				sub ? "pl-5 text-xs py-1.25" : "text-sm py-1.25 px-2",
				active
					? "text-gray-900 font-medium bg-gray-100"
					: "text-gray-500 hover:text-gray-800 hover:bg-gray-50",
			].join(" ")}
		>
			{label}
		</button>
	)
}

export default function Terms() {
	const [activeId, setActiveId] = useState("s1")
	const contentRef = useRef<HTMLDivElement>(null)

	const scrollTo = (id: string) => {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	useEffect(() => {
		const targets = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
			Boolean,
		) as HTMLElement[]

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id)
						break
					}
				}
			},
			{ threshold: 0.2, rootMargin: "-10% 0px -70% 0px" },
		)

		targets.forEach((el) => observer.observe(el))
		return () => observer.disconnect()
	}, [])

	return (
		<div className="min-h-screen bg-white text-gray-900">
			{/* Header */}
			<header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between">
				<div className="flex items-center gap-1">
					<Image
						src="/logo.svg"
						alt="App Combo"
						width={180}
						height={35}
						className="mr-2 object-contain"
						priority
					/>
					<span className="font-semibold text-xl text-primary tracking-tight">
						Terms & Conditions
					</span>
				</div>

				<div className="flex items-center gap-3">
					<button className="text-xs text-gray-500 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
						Archive
					</button>
					<button className="text-xs text-gray-500 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors">
						Download PDF
					</button>
				</div>
			</header>

			<div className="flex">
				{/* Sticky sidebar nav */}
				<nav className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto px-4 py-8 border-r border-gray-100 scrollbar-hide">
					<div className="flex flex-col gap-0.5">
						{SECTIONS.map(({ id, label, sub }) => (
							<NavItem
								key={id}
								id={id}
								label={label}
								sub={sub}
								active={activeId === id}
								onClick={scrollTo}
							/>
						))}
					</div>
				</nav>

				{/* Main content */}
				<main ref={contentRef} className="flex-1 max-w-2xl px-6 lg:px-12 py-12 pb-32">
					{/* Hero */}
					<div className="mb-14">
						<h1 className="text-5xl text-primary lg:text-6xl font-bold tracking-tighter leading-[1.05] mb-4">
							Terms &
							<br />
							Conditions
						</h1>
						<p className="text-sm text-gray-500">
							Effective Date: <span className="text-gray-800 font-medium">28 May, 2026</span>
						</p>
						<p className="text-sm text-gray-500">
							Last Updated: <span className="text-gray-800 font-medium">28 May, 2026</span>
						</p>
					</div>

					{/* Section 1 */}
					<Section id="s1" title="1. Acceptance of Terms">
						<P>
							By accessing or using AppsCombo, you agree to be bound by these Terms and Conditions
							and all applicable laws and regulations. If you do not agree with any part of these
							terms, you may not use our services.
						</P>
						<P>
							These terms apply to all visitors, users, and others who access or use the platform.
							Your continued use of AppsCombo after any changes to these terms constitutes your
							acceptance of the new terms.
						</P>
						<P>
							AppsCombo reserves the right to update or modify these Terms at any time without prior
							notice. We encourage you to review these Terms periodically to stay informed of any
							changes.
						</P>
					</Section>

					<Divider />

					{/* Section 2 */}
					<Section id="s2" title="2. User Accounts">
						<P>
							To access certain features of AppsCombo, you must create an account. You are
							responsible for maintaining the confidentiality of your account credentials and for
							all activities that occur under your account.
						</P>
						<SubSection id="s2-1" title="2.1 Registration">
							<P>
								When you register for an account, you must provide accurate, current, and complete
								information. You agree to update your information to keep it accurate. Accounts
								registered with false information may be suspended or permanently removed.
							</P>
						</SubSection>
						<SubSection id="s2-2" title="2.2 Account Security">
							<P>
								You are responsible for safeguarding your password and any authentication
								credentials associated with your account. You must notify AppsCombo immediately of
								any unauthorised use of your account. We will not be liable for any losses resulting
								from unauthorised access to your account.
							</P>
						</SubSection>
						<SubSection id="s2-3" title="2.3 Account Termination">
							<P>
								You may delete your account at any time through your account settings. AppsCombo
								reserves the right to suspend or terminate accounts that violate these Terms, engage
								in fraudulent activity, or pose a risk to other users or the platform.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 3 */}
					<Section id="s3" title="3. Privacy Policy">
						<P>
							Your use of AppsCombo is also governed by our Privacy Policy, which is incorporated
							into these Terms by reference. Our Privacy Policy describes how we collect, use, and
							share information when you use our services.
						</P>
						<P>
							By using AppsCombo, you consent to the collection and use of your information as
							described in our Privacy Policy. We are committed to protecting your personal data in
							accordance with applicable data protection laws.
						</P>
					</Section>

					<Divider />

					{/* Section 4 */}
					<Section id="s4" title="4. Content & Conduct">
						<P>
							AppsCombo is a community platform. The quality and integrity of content shared here is
							the shared responsibility of all users. The following rules govern what you may post
							and how you may interact.
						</P>
						<SubSection id="s4-1" title="4.1 Your Content">
							<P>
								You retain ownership of any content you post on AppsCombo. By posting content, you
								grant AppsCombo a non-exclusive, royalty-free, worldwide licence to use, display,
								and distribute your content in connection with operating the platform.
							</P>
						</SubSection>
						<SubSection id="s4-2" title="4.2 Prohibited Content">
							<P>
								You may not post content that is unlawful, harmful, threatening, abusive, harassing,
								defamatory, or otherwise objectionable. This includes but is not limited to: hate
								speech, explicit violence, spam, and content that infringes third-party intellectual
								property rights.
							</P>
						</SubSection>
						<SubSection id="s4-3" title="4.3 Content Removal">
							<P>
								AppsCombo reserves the right to remove any content that violates these Terms or our
								Community Guidelines, without prior notice. Repeated violations may result in
								account suspension or termination. You may appeal content removal decisions through
								our support channels.
							</P>
						</SubSection>
						<SubSection id="s4-4" title="4.4 Community Standards">
							<P>
								We expect all users to treat each other with respect. Harassment, bullying, or
								coordinated attacks against any individual or group are strictly prohibited.
								AppsCombo may take action against accounts involved in such behaviour, including
								permanent banning.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 5 */}
					<Section id="s5" title="5. Intellectual Property">
						<P>
							The AppsCombo name, logo, platform design, software, and all related materials are the
							exclusive intellectual property of AppsCombo and its licensors. You may not use,
							reproduce, or distribute any of these without our express written permission.
						</P>
						<P>
							If you believe any content on our platform infringes your intellectual property
							rights, please contact our support team with the relevant details and we will
							investigate promptly.
						</P>
					</Section>

					<Divider />

					{/* Section 6 */}
					<Section id="s6" title="6. Third-Party Services">
						<P>
							AppsCombo may contain links to or integrations with third-party websites and services.
							We do not control and are not responsible for the content, privacy policies, or
							practices of any third-party services.
						</P>
						<P>
							Your interactions with third-party services are governed by their own terms and
							conditions. We encourage you to review those terms before engaging with any external
							service through AppsCombo.
						</P>
					</Section>

					<Divider />

					{/* Section 7 */}
					<Section id="s7" title="7. Payments & Subscriptions">
						<P>
							Certain features of AppsCombo are available through paid subscriptions or one-time
							purchases. All payments are processed securely through our third-party payment
							providers.
						</P>
						<SubSection id="s7-1" title="7.1 Billing">
							<P>
								Subscription fees are billed in advance on a monthly or annual basis, depending on
								the plan you select. You authorise AppsCombo to charge your chosen payment method at
								the start of each billing cycle. Prices are subject to change with reasonable
								advance notice.
							</P>
						</SubSection>
						<SubSection id="s7-2" title="7.2 Refunds">
							<P>
								Payments are generally non-refundable except where required by applicable law or in
								cases of documented technical failure on our part. Requests for refunds must be
								submitted within 14 days of the charge. Each case will be reviewed on its merits.
							</P>
						</SubSection>
						<SubSection id="s7-3" title="7.3 Free Trials">
							<P>
								Where a free trial is offered, you will not be charged until the trial period ends.
								You may cancel at any time before the trial ends to avoid being charged. If you do
								not cancel, your subscription will automatically convert to a paid plan.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 8 */}
					<Section id="s8" title="8. Disclaimers">
						<P>
							AppsCombo is provided on an &quot;as is&quot; and &quot;as available&quot; basis
							without warranties of any kind, express or implied. We do not warrant that the
							platform will be uninterrupted, error-free, or free of harmful components.
						</P>
						<P>
							We make no representations about the accuracy, completeness, or reliability of any
							content posted by users on the platform. Use of the platform and reliance on any
							content is entirely at your own risk.
						</P>
					</Section>

					<Divider />

					{/* Section 9 */}
					<Section id="s9" title="9. Indemnification">
						<P>
							You agree to indemnify, defend, and hold harmless AppsCombo, its officers, directors,
							employees, and agents from and against any and all claims, damages, losses, costs, and
							expenses arising out of or related to your use of the platform, your content, or your
							violation of these Terms.
						</P>
						<P>
							AppsCombo reserves the right to assume exclusive control of the defence of any matter
							for which you are required to indemnify us, and you agree to cooperate with our
							defence of such claims.
						</P>
					</Section>

					<Divider />

					{/* Section 10 */}
					<Section id="s10" title="10. Limitation of Liability">
						<P>
							To the fullest extent permitted by applicable law, AppsCombo shall not be liable for
							any damages arising out of or in connection with your use of or inability to use the
							platform.
						</P>
						<SubSection id="s10-1" title="10.1 Indirect Damages">
							<P>
								AppsCombo shall not be liable for any indirect, incidental, special, consequential,
								or punitive damages, including but not limited to loss of profits, data, goodwill,
								or other intangible losses, even if we have been advised of the possibility of such
								damages.
							</P>
						</SubSection>
						<SubSection id="s10-2" title="10.2 Cap on Liability">
							<P>
								In no event shall our total aggregate liability to you for all claims relating to
								the platform exceed the greater of: (a) the amount you paid to AppsCombo in the
								twelve months preceding the claim, or (b) one hundred US dollars (USD $100).
							</P>
						</SubSection>
						<SubSection id="s10-3" title="10.3 Exceptions">
							<P>
								Some jurisdictions do not allow the exclusion of certain warranties or the
								limitation of liability for incidental or consequential damages. In such
								jurisdictions, our liability is limited to the greatest extent permitted by law.
								Nothing in these Terms limits our liability for fraud, gross negligence, or wilful
								misconduct.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 11 */}
					<Section id="s11" title="11. Governing Law">
						<P>
							These Terms shall be governed by and construed in accordance with the laws of the
							Federal Republic of Nigeria, without regard to its conflict of law principles. Any
							disputes arising under these Terms shall be subject to the exclusive jurisdiction of
							the courts located in Lagos, Nigeria.
						</P>
						<P>
							If you access AppsCombo from outside Nigeria, you are responsible for compliance with
							local laws to the extent they are applicable.
						</P>
					</Section>

					<Divider />

					{/* Section 12 */}
					<Section id="s12" title="12. Changes to Terms">
						<P>
							AppsCombo reserves the right to revise these Terms at any time. We will make
							reasonable efforts to notify you of significant changes before they take effect.
						</P>
						<SubSection id="s12-1" title="12.1 Notice of Changes">
							<P>
								We will notify you of material changes to these Terms via email, an in-app
								notification, or a prominent notice on our website at least 14 days before the
								changes take effect. For minor changes, we may update the effective date at the top
								of this page without further notice.
							</P>
						</SubSection>
						<SubSection id="s12-2" title="12.2 Continued Use">
							<P>
								Your continued use of AppsCombo after any changes to these Terms constitutes your
								acceptance of the revised Terms. If you do not agree to the updated Terms, you must
								stop using the platform and may delete your account at any time.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 13 */}
					<Section id="s13" title="13. Dispute Resolution">
						<P>
							Before filing a claim, you agree to first attempt to resolve any dispute informally by
							contacting AppsCombo directly. We will try to resolve the dispute within 30 days. If
							informal resolution fails, disputes shall be resolved through binding arbitration in
							accordance with applicable arbitration rules.
						</P>
						<P>
							You agree to waive the right to participate in class action lawsuits or class-wide
							arbitration against AppsCombo. Individual arbitration is the exclusive remedy for any
							dispute that cannot be resolved informally.
						</P>
					</Section>

					<Divider />

					{/* Section 14 */}
					<Section id="s14" title="14. Severability">
						<P>
							If any provision of these Terms is found to be unenforceable or invalid by a court of
							competent jurisdiction, that provision shall be limited or eliminated to the minimum
							extent necessary, and the remaining provisions shall continue in full force and
							effect.
						</P>
						<P>
							The failure of AppsCombo to enforce any right or provision of these Terms shall not be
							deemed a waiver of such right or provision unless acknowledged and agreed to by us in
							writing.
						</P>
					</Section>

					<Divider />

					{/* Section 15 */}
					<Section id="s15" title="15. Contact Us">
						<P>If you have any questions about these Terms and Conditions, please contact us at:</P>
						<P>
							Email: <span className="text-gray-900 font-medium">legal@appscombo.com</span>
							<br />
							Address: AppsCombo Ltd, Lagos, Nigeria
						</P>
						<div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400">
							Effective date: June 1, 2026.{" "}
							<a
								href="#"
								className="text-gray-600 underline underline-offset-2 hover:text-gray-900"
							>
								Archive of previous terms
							</a>
						</div>
					</Section>
				</main>
			</div>
		</div>
	)
}

function Section({
	id,
	title,
	children,
}: {
	id: string
	title: string
	children: React.ReactNode
}) {
	return (
		<section id={id} className="mb-10 scroll-mt-6">
			<h2 className="text-2xl font-bold tracking-tight mb-4">{title}</h2>
			{children}
		</section>
	)
}

function SubSection({
	id,
	title,
	children,
}: {
	id: string
	title: string
	children: React.ReactNode
}) {
	return (
		<div id={id} className="mt-5 scroll-mt-6">
			<h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
			{children}
		</div>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-sm text-gray-500 leading-relaxed mb-3">{children}</p>
}

function Divider() {
	return <hr className="border-gray-100 my-8" />
}
