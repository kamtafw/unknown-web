"use client"

import { AlignLeft, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

const SECTIONS = [
	{ id: "s1", label: "1. Information We Collect" },
	{ id: "s1-1", label: "1.1 Information You Provide", sub: true },
	{ id: "s1-2", label: "1.2 Content You Share", sub: true },
	{ id: "s1-3", label: "1.3 Automatically Collected Information", sub: true },
	{ id: "s1-4", label: "1.4 Information From Third Parties", sub: true },

	{ id: "s2", label: "2. How We Use Your Information" },

	{ id: "s3", label: "3. Cookies and Tracking Technologies" },

	{ id: "s4", label: "4. How We Share Information" },
	{ id: "s4-1", label: "4.1 With Others", sub: true },
	{ id: "s4-2", label: "4.2 With Service Providers", sub: true },
	{ id: "s4-3", label: "4.3 Legal and Safety Reasons", sub: true },
	{ id: "s4-4", label: "4.4 Business Transfers", sub: true },

	{ id: "s5", label: "5. Advertising and Personalized Content" },

	{ id: "s6", label: "6. Messaging and Communications" },

	{ id: "s7", label: "7. Data Retention" },

	{ id: "s8", label: "8. Your Rights and Choices" },

	{ id: "s9", label: "9. Account Security" },

	{ id: "s10", label: "10. Children's Privacy" },

	{ id: "s11", label: "11. International Data Transfers" },

	{ id: "s12", label: "12. Third-Party Links and Services" },

	{ id: "s13", label: "13. Artificial Intelligence and Automated Systems" },

	{ id: "s14", label: "14. Changes to This Privacy Policy" },

	{ id: "s15", label: "15. Contact Us" },

	{ id: "s16", label: "16. Additional Regional Rights" },

	{ id: "s17", label: "17. Consent" },
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
					? "text-foreground font-medium bg-accent"
					: "text-muted-foreground hover:text-foreground hover:bg-accent/50",
			].join(" ")}
		>
			{label}
		</button>
	)
}

export default function PrivacyPolicy() {
	const [activeId, setActiveId] = useState("s1")
	const [tocOpen, setTocOpen] = useState(false)
	const contentRef = useRef<HTMLDivElement>(null)

	const scrollTo = (id: string) => {
		const el = document.getElementById(id)
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
	}

	const handleMobileNav = (id: string) => {
		scrollTo(id)
		setTocOpen(false)
	}

	useEffect(() => {
		if (tocOpen) {
			document.body.style.overflow = "hidden"
		} else {
			document.body.style.overflow = ""
		}
		return () => {
			document.body.style.overflow = ""
		}
	}, [tocOpen])

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
		<>
			<div className="flex">
				{/* Desktop sidebar nav */}
				<nav className="hidden lg:block w-84 xl:w-96 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)] overflow-y-auto px-16 py-8 border-r border-border scrollbar-hide">
					<div className="flex flex-col gap-0.75">
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
				<main
					ref={contentRef}
					className="flex-1 max-w-4xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 pb-32"
				>
					{/* Hero */}
					<div className="mb-10 sm:mb-14">
						<h1 className="text-4xl sm:text-5xl lg:text-6xl text-primary font-bold tracking-tighter leading-[1.05] mb-3 sm:mb-4">
							Privacy Policy
						</h1>
						<p className="text-[13px] sm:text-sm text-muted-foreground">
							Effective Date: <span className="text-foreground font-medium">28 May, 2026</span>
						</p>
						<p className="text-[13px] sm:text-sm text-muted-foreground mb-2 sm:mb-3">
							Last Updated: <span className="text-foreground font-medium">28 May, 2026</span>
						</p>
						<p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-2 sm:mb-3">
							Welcome to AppsCombo (“AppsCombo,” “we,” “our,” or “us”). Your privacy is important to
							us. This Privacy Policy explains how AppsCombo collects, uses, stores, shares, and
							protects your information when you use our website, mobile applications, services,
							products, and related features (collectively, the “Services”).{" "}
						</p>
						<p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
							By using AppsCombo, you agree to the practices described in this Privacy Policy.
						</p>
					</div>

					{/* Section 1 */}
					<Section id="s1" title="1. Information We Collect">
						<P>We collect information to provide, improve, personalize, and secure our Services.</P>
						<SubSection id="s1-1" title="1.1 Information You Provide">
							<P>You may provide the following information when using AppsCombo:</P>
							<UL>
								<li>Full name</li>
								<li>Username</li>
								<li>Email address</li>
								<li>Phone number</li>
								<li>Password</li>
								<li>Profile photo</li>
								<li>Bio and personal profile information</li>
								<li>Business or company details</li>
								<li>Payment or billing information</li>
								<li>Messages, posts, comments, and media uploads</li>
								<li>Contact information imported or synced from your device</li>
								<li>Support requests and communications with us</li>
							</UL>
						</SubSection>
						<SubSection id="s1-2" title="1.2 Content You Share">
							<P>AppsCombo allows users to create, upload, and share content, including:</P>
							<UL>
								<li>Photos</li>
								<li>Videos</li>
								<li>Audio files</li>
								<li>Text posts</li>
								<li>Stories</li>
								<li>Live streams</li>
								<li>Event information</li>
								<li>Comments and reactions</li>
								<li>Messages and chats</li>
							</UL>
							<P>
								Content shared publicly may be viewed, copied, or shared by other users depending on
								your privacy settings.
							</P>
						</SubSection>
						<SubSection id="s1-3" title="1.3 Automatically Collected Information">
							<P>When you use AppsCombo, we may automatically collect:</P>
							<UL>
								<li>IP address</li>
								<li>Browser type</li>
								<li>Device information</li>
								<li>Operating system</li>
								<li>Mobile network information</li>
								<li>Device identifiers</li>
								<li>App version</li>
								<li>Log data</li>
								<li>Usage activity</li>
								<li>Search history within AppsCombo</li>
								<li>Cookies and tracking technologies</li>
								<li>Location information (with permission)</li>
							</UL>
						</SubSection>
						<SubSection id="s1-4" title="1.4 Information From Third Parties">
							<P>We may receive information from:</P>
							<UL>
								<li>Social login providers</li>
								<li>Advertising partners</li>
								<li>Analytics providers</li>
								<li>Business partners</li>
								<li>Publicly available sources</li>
								<li>Other AppsCombo users</li>
							</UL>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 2 */}
					<Section id="s2" title="2. How We Use Your Information">
						<P>We use your information to:</P>
						<UL>
							<li>Provide and maintain the Services</li>
							<li>Create and manage your account</li>
							<li>Personalize your experience</li>
							<li>Recommend content, users, events, and advertisements</li>
							<li>Improve platform performance and security</li>
							<li>Monitor usage trends and analytics</li>
							<li>Process payments and transactions</li>
							<li>Enable messaging and social interactions</li>
							<li>Detect fraud, abuse, and unauthorized activity</li>
							<li>Enforce our Terms of Service</li>
							<li>Respond to legal requests and obligations</li>
							<li>Communicate updates, promotions, and notifications</li>
						</UL>
					</Section>

					<Divider />

					{/* Section 3 */}
					<Section id="s3" title="3. Cookies and Tracking Technologies">
						<P>AppsCombo uses cookies, pixels, local storage, SDKs, and similar technologies to:</P>
						<UL>
							<li>Keep you logged in</li>
							<li>Remember preferences</li>
							<li>Improve functionality</li>
							<li>Analyze traffic and engagement</li>
							<li>Deliver personalized content and advertisements</li>
							<li>Enhance security and fraud prevention</li>
							<P>
								You may control cookies through your browser settings, though some features may not
								function properly if disabled.
							</P>
						</UL>
					</Section>

					<Divider />

					{/* Section 4 */}
					<Section id="s4" title="4. How We Share Information">
						<P>We may share your information in the following situations:</P>
						<SubSection id="s4-1" title="4.1 With Other Users">
							<P>
								Information you share publicly on AppsCombo may be visible to other users,
								including:
							</P>
							<UL>
								<li>Profile information</li>
								<li>Posts and comments</li>
								<li>Followers and following lists</li>
								<li>Public interactions</li>
							</UL>
						</SubSection>
						<SubSection id="s4-2" title="4.2 With Service Providers">
							<P>
								We may share information with trusted third-party providers who help us operate
								AppsCombo, including:
							</P>
							<UL>
								<li>Cloud hosting providers</li>
								<li>Payment processors</li>
								<li>Analytics services</li>
								<li>Customer support platform</li>
								<li>Security and fraud prevention providers</li>
								<li>Marketing and advertising partners</li>
							</UL>
						</SubSection>
						<SubSection id="s4-3" title="4.3 Legal and Safety Reasons">
							<P>We may disclose information if required to:</P>
							<UL>
								<li>Comply with legal obligations</li>
								<li>Respond to government requests</li>
								<li>Enforce our policies</li>
								<li>Protect rights, safety, and property</li>
								<li>Investigate fraud or security threats</li>
							</UL>
						</SubSection>
						<SubSection id="s4-4" title="4.4 Business Transfers">
							<P>
								If AppsCombo is involved in a merger, acquisition, restructuring, or sale of assets,
								your information may be transferred as part of that transaction.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 5 */}
					<Section id="s5" title="5. Advertising and Personalized Content">
						<P>
							AppsCombo may display advertisements, sponsored content, and personalized
							recommendations based on your activities and interests.
						</P>
						<P>We and our advertising partners may use information such as:</P>
						<UL>
							<li>Device data</li>
							<li>Usage activity</li>
							<li>Interactions</li>
							<li>Interests</li>
							<li>Approximate location</li>
						</UL>
						<P>
							You manage the advertising settings through your account settings where available.
						</P>
					</Section>

					<Divider />

					{/* Section 6 */}
					<Section id="s6" title="6. Messaging and Communications">
						<P>
							AppsCombo may offer private messaging, group chats, voice communication, and media
							sharing features.
						</P>
						<P>
							While we implement security measures, no communication system is completely secure.
							Users should avoid sharing highly sensitive personal information through the platform.
						</P>
						<P>
							We may use automated systems to detect spam, abuse, harmful content, and policy
							violations.
						</P>
					</Section>

					<Divider />

					{/* Section 7 */}
					<Section id="s7" title="7. Data Retention">
						<P>We retain information for as long as necessary to:</P>
						<UL>
							<li>Provide the Services</li>
							<li>Comply with legal obligations</li>
							<li>Resolve disputes</li>
							<li>Enforce agreements</li>
							<li>Maintain security and integrity</li>
						</UL>
						<P>Deleted content may remain in backups or cached systems for a limited period.</P>
					</Section>

					<Divider />

					{/* Section 8 */}
					<Section id="s8" title="8. Your Rights and Choices">
						<P>Depending on your location, you may have rights to:</P>
						<UL>
							<li>Access your personal information</li>
							<li>Correct inaccurate information</li>
							<li>Delete your account or data</li>
							<li>Restrict or object to certain processing</li>
							<li>Download a copy of your data</li>
							<li>Withdraw consent</li>
							<li>Manage communication preferences</li>
						</UL>
						<P>You can manage many of these settings directly within your AppsCombo account.</P>
					</Section>

					<Divider />

					{/* Section 9 */}
					<Section id="s9" title="9. Account Security">
						<P>
							You are responsible for maintaining the confidentiality of your account credentials.
						</P>
						<P>We encourage users to:</P>
						<UL>
							<li>Use strong passwords</li>
							<li>Enable two-factor authentication where available</li>
							<li>Avoid sharing login credentials</li>
							<li>Report suspicious activities immediately</li>
						</UL>
						<P>
							Although we use industry-standard security measures, no method of transmission or
							storage is completely secure.
						</P>
					</Section>

					<Divider />

					{/* Section 10 */}
					<Section id="s10" title="10. Children's Privacy">
						<P>
							AppsCombo is not intended for children under the age required by applicable laws in
							your jurisdiction.
						</P>
						<P>
							We do not knowingly collect personal information from children without appropriate
							consent. If we become aware that a child has provided personal information unlawfully,
							we may remove such information and suspend the account.
						</P>
					</Section>

					<Divider />

					{/* Section 11 */}
					<Section id="s11" title="11. International Data Transfers">
						<P>
							Your information may be stored and processed in countries outside your own
							jurisdiction where data protection laws may differ.
						</P>
						<P>
							By using AppsCombo, you consent to the transfer, storage, and processing of your
							information in accordance with this Privacy Policy.
						</P>
					</Section>

					<Divider />

					{/* Section 12 */}
					<Section id="s12" title="12. Third-Party Links and Services">
						<P>AppsCombo may contain links to third-party websites, applications, or services.</P>
						<P>
							We are not responsible for the privacy practices or content of third-party services.
							We encourage users to review the privacy policies of those services separately.
						</P>
					</Section>

					<Divider />

					{/* Section 13 */}
					<Section id="s13" title="13. Artificial Intelligence and Automated Systems">
						<P>
							AppsCombo may use artificial intelligence, machine learning, and automated systems to:
						</P>
						<UL>
							<li>Personalize feeds and recommendations</li>
							<li>Detect harmful or abusive content</li>
							<li>Improve platform security</li>
							<li>Moderate content</li>
							<li>Enhance user experience</li>
							<li>Improve advertisements and engagement</li>
						</UL>
						<P>
							These systems may analyze user behavior and interactions to improve platform
							functionality.
						</P>
					</Section>

					<Divider />

					{/* Section 14 */}
					<Section id="s14" title="14. Changes to This Privacy Policy">
						<P>We may update this Privacy Policy from time to time.</P>
						<P>When changes are made, we may:</P>
						<UL>
							<li>Update the “Last Updated” date</li>
							<li>Notify users through the platform</li>
							<li>Send notifications or emails where required</li>
						</UL>
						<P>
							Continued use of AppsCombo after changes become effective means you accept the updated
							Privacy Policy.
						</P>
					</Section>

					<Divider />

					{/* Section 15 */}
					<Section id="s15" title="15. Contact Us">
						<P>
							If you have any questions, concerns, or requests regarding these Privacy Policy,
							please contact us at:
						</P>
						<P>
							Email: <span className="text-foreground font-medium">privacy@appscombo.com</span>
							<br />
							Website:{" "}
							<a
								className="text-blue-600 underline underline-offset-2"
								href="https://www.appscombo.com"
							>
								https://appscombo.com
							</a>
							<br />
							Address:{" "}
							<span className="text-foreground font-medium">
								8 THE GREEN,STE A,KENT, DOVER, DE, 19901
							</span>
						</P>
					</Section>

					{/* Section 16 */}
					<Section id="s16" title="16. Additional Regional Rights">
						<P>
							Depending on your jurisdiction, additional privacy rights may apply under laws such
							as:
						</P>
						<UL>
							<li>General Data Protection Regulation (GDPR)</li>
							<li>California Consumer Privacy Act (CCPA)</li>
							<li>Nigeria Data Protection Act (NDPA)</li>
							<li>Other applicable privacy regulations</li>
						</UL>
						<P>
							AppsCombo will comply with applicable privacy laws and regulations where required.
						</P>
					</Section>

					{/* Section 17 */}
					<Section id="s17" title="17. Consent">
						<P>
							By accessing or using AppsCombo, you acknowledge that you have read, understood, and
							agreed to this Privacy Policy and our Terms of Service.
						</P>
						<P>Thank you for using AppsCombo.</P>
					</Section>
				</main>
			</div>

			<div className="lg:hidden fixed bottom-6 right-4 z-40">
				<button
					onClick={() => setTocOpen(true)}
					className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform"
				>
					<AlignLeft size={15} />
					Contents
				</button>
			</div>

			{tocOpen && (
				<div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
					<div
						className="absolute inset-0 bg-muted backdrop-blur-sm"
						onClick={() => setTocOpen(false)}
					/>

					<div className="relative bg-background rounded-t-3xl max-h-[78vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
						<div className="flex justify-center pt-3 pb-1 shrink-0">
							<div className="w-10 h-1 bg-accent rounded-full" />
						</div>

						<div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
							<h3 className="font-bold text-foreground">Contents</h3>
							<button
								onClick={() => setTocOpen(false)}
								className="p-1.5 rounded-full hover:bg-accent text-muted-foreground transition-colors"
							>
								<X size={18} />
							</button>
						</div>

						<div className="overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
							{SECTIONS.map(({ id, label, sub }) => (
								<button
									key={id}
									onClick={() => handleMobileNav(id)}
									className={[
										"w-full text-left rounded-xl px-3 py-2.5 transition-colors",
										sub ? "pl-7 text-xs text-muted-foreground" : "text-sm font-medium",
										activeId === id
											? "bg-primary/10 text-primary"
											: "text-foreground hover:bg-accent",
									].join(" ")}
								>
									{label}
								</button>
							))}
						</div>

						<div className="h-safe-area-inset-bottom shrink-0 pb-4" />
					</div>
				</div>
			)}
		</>
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
		<section id={id} className="mb-8 sm:mb-10 scroll-mt-20">
			<h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3 sm:mb-4">{title}</h2>
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
		<div id={id} className="mt-4 sm:mt-5 scroll-mt-20">
			<h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
			{children}
		</div>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
}

function Divider() {
	return <hr className="border-border my-6 sm:my-8" />
}

function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-muted-foreground leading-relaxed space-y-1">
			{children}
		</ul>
	)
}
