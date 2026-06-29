"use client"

import { AlignLeft, X } from "lucide-react"
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

	{ id: "s8", label: "8. Messaging, Calls, and Communications" },

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
					? "text-foreground font-medium bg-accent"
					: "text-muted-foreground hover:text-foreground hover:bg-accent/50",
			].join(" ")}
		>
			{label}
		</button>
	)
}

export default function Terms() {
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
							Terms & Conditions
						</h1>
						<p className="text-[13px] sm:text-sm text-muted-foreground">
							Effective Date: <span className="text-foreground font-medium">28 May, 2026</span>
						</p>
						<p className="text-[13px] text-sm text-muted-foreground">
							Last Updated: <span className="text-foreground font-medium">28 May, 2026</span>
						</p>
					</div>

					{/* Section 1 */}
					<Section id="s1" title="1. Eligibility and Account Registration">
						<SubSection id="s1-1" title="1.1 Eligibility">
							<P>To use AppsCombo, you must:</P>
							<UL>
								<li>Be at least the minimum legal age required in your jurisdiction</li>
								<li>Have the legal capacity to enter into a binding agreement</li>
								<li>Not be prohibited from using the Services under applicable laws</li>
							</UL>
							<P>By using AppsCombo, you represent and warrant that you meet these requirements.</P>
						</SubSection>
						<SubSection id="s1-2" title="1.2 Account Registration">
							<P>You may need to create an account to access certain features.</P>
							<P>You agree to:</P>
							<UL>
								<li>Provide accurate and complete information</li>
								<li>Keep your information updated </li>
								<li>Maintain the security of your account credentials</li>
								<li>Be responsible for all activities under your account</li>
							</UL>
							<P>You may not:</P>
							<UL>
								<li>Create fake or misleading accounts</li>
								<li>Use another person’s account without permission</li>
								<li>Sell, transfer, or license your account</li>
								<li>Impersonate individuals, businesses, or organizations</li>
							</UL>
							<P>We reserve the right to suspend or terminate accounts that violate these Terms.</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 2 */}
					<Section id="s2" title="2. Your Use of AppsCombo">
						<P>
							AppsCombo is a social networking and digital interaction platform that allows users
							to:
						</P>
						<UL>
							<li>Share content</li>
							<li>Communicate with others</li>
							<li>Create communities and events</li>
							<li>Upload media</li>
							<li>Promote businesses and brands</li>
							<li>Discover contents and opportunities</li>
							<li>Engage socially and professionally</li>
						</UL>
						<P>You agree to use the Services responsibly and lawfully.</P>
					</Section>

					<Divider />

					{/* Section 3 */}
					<Section id="s3" title="3. User Content and Ownership">
						<SubSection id="s3-1" title="3.1 Your Content">
							<P>
								You retain ownership of the content you create, upload, post, or share on AppsCombo
								(“User Content”).
							</P>
							<P>This may include:</P>
							<UL>
								<li>Photos</li>
								<li>Videos</li>
								<li>Audio</li>
								<li>Text</li>
								<li>Comments</li>
								<li>Messages</li>
								<li>Business information</li>
								<li>Profile details</li>
								<li>Live streams</li>
								<li>Event content</li>
							</UL>
						</SubSection>
						<SubSection id="s3-2" title="3.2 License You Grant to AppsCombo">
							<P>
								By posting or sharing content on AppsCombo, you grant us a worldwide, non-exclusive,
								transferable, sub-licensable, royalty-free license to:
							</P>
							<UL>
								<li>Host</li>
								<li>Store</li>
								<li>Use</li>
								<li>Display</li>
								<li>Reproduce</li>
								<li>Modify</li>
								<li>Adapt</li>
								<li>Publish</li>
								<li>Distribute</li>
								<li>Promote</li>
								<li>Analyze</li>
								<li>Process</li>
							</UL>
							<P>
								your content solely for operating, improving, promoting, securing, and providing the
								Services.
							</P>
							<P>This license ends when your content is deleted from our systems, except where:</P>
							<UL>
								<li>Content has been shared by others</li>
								<li>Retention is legally required</li>
								<li>Backups or cached systems temporarily retain copies</li>
							</UL>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 4 */}
					<Section id="s4" title="4. Content & Conduct">
						<P>You agree NOT to use AppsCombo to:</P>
						<UL>
							<li>Violate laws or regulations</li>
							<li>Promote violence or criminal activity</li>
							<li>Harass, threaten, abuse, or intimidate others</li>
							<li>Spread misinformation or fraudulent schemes</li>
							<li>Upload malicious software or harmful code</li>
							<li>Engage in spam or unauthorized advertising</li>
							<li>Infringe intellectual property rights</li>
							<li>Post sexually exploitative or abusive content</li>
							<li>Exploit minors</li>
							<li>Engage in hate speech or discriminatory conduct</li>
							<li>Manipulate platform systems or algorithms</li>
							<li>Scrape or harvest user data without authorization</li>
							<li>Create fake engagement or fake accounts</li>
							<li>Circumvent security or access controls</li>
							<li>Conduct unauthorized surveillance or tracking</li>
						</UL>
						<P>We may remove content or restrict accounts that violate these Terms.</P>
					</Section>

					<Divider />

					{/* Section 5 */}
					<Section id="s5" title="5. Community Standards and Moderation">
						<P>
							AppsCombo may monitor, review, remove, restrict, or disable content that violates:
						</P>
						<UL>
							<li>These Terms</li>
							<li>Community Guidelines</li>
							<li>Applicable laws</li>
							<li>Safety and integrity policies</li>
						</UL>
						<P>We reserve the right to:</P>
						<UL>
							<li>Suspend accounts</li>
							<li>Remove posts</li>
							<li>Limit visibility</li>
							<li>Disable features</li>
							<li>Restrict monetization</li>
							<li>Permanently ban users</li>
						</UL>
						<P>
							Moderation may involve automated systems, artificial intelligence, human reviewers, or
							external partners.
						</P>
					</Section>

					<Divider />

					{/* Section 6 */}
					<Section id="s6" title="6. Privacy">
						<P>Your use of AppsCombo is also governed by our Privacy Policy.</P>
						<P>
							By using the Services, you acknowledge that your information may be collected, used,
							stored, and shared as described in our Privacy Policy.
						</P>
					</Section>

					<Divider />

					{/* Section 7 */}
					<Section id="s7" title="7. Intellectual Property Rights">
						<SubSection id="s7-1" title="7.1 AppsCombo Ownership">
							<P>AppsCombo and its Services, including:</P>
							<UL>
								<li>Software</li>
								<li>Logos</li>
								<li>Designs</li>
								<li>Features</li>
								<li>Branding</li>
								<li>User interfaces</li>
								<li>Graphics</li>
								<li>Code</li>
								<li>Databases</li>
								<li>Algorithms</li>
							</UL>
							<P>
								are owned by AppsCombo or its licensors and protected by intellectual property laws.
							</P>
							<P>You may not:</P>
							<UL>
								<li>Copy</li>
								<li>Modify</li>
								<li>Reverse engineer</li>
								<li>Sell</li>
								<li>Redistribute</li>
								<li>Reproduce</li>
								<li>License</li>
								<li>Exploit</li>
							</UL>
							<P>any part of the Services without written permission.</P>
						</SubSection>
						<SubSection id="s7-2" title="7.2 Copyright Complaints">
							<P>
								If you believe your intellectual property rights have been violated, you may submit
								a complaint with sufficient legal documentation.
							</P>
							<P>
								AppsCombo reserves the right to remove allegedly infringing content and terminate
								repeat offenders.
							</P>
						</SubSection>
					</Section>

					<Divider />

					{/* Section 8 */}
					<Section id="s8" title="8. Messaging, Calls, and Communications">
						<P>AppsCombo may provide:</P>
						<UL>
							<li>Messaging</li>
							<li>Voice communication</li>
							<li>Video calls</li>
							<li>Group chats</li>
							<li>Broadcast features</li>
						</UL>
						<P>You understand that:</P>
						<UL>
							<li>Communications may travel through third-party infrastructure</li>
							<li>No system is completely secure</li>
							<li>We may use automated systems to detect spam, fraud, abuse, or harmful content</li>
						</UL>
						<P>You are responsible for the communications you send through the platform.</P>
					</Section>

					<Divider />

					{/* Section 9 */}
					<Section id="s9" title="9. Advertising, Promotions, and Sponsored Content">
						<P>AppsCombo may display:</P>
						<UL>
							<li>Advertisements</li>
							<li>Sponsored posts</li>
							<li>Promotional campaigns</li>
							<li>Business listings</li>
							<li>Influencer promotions</li>
						</UL>
						<P>We may personalize advertising based on user activities and preferences.</P>
						<P>You agree that:</P>
						<UL>
							<li>Ads may appear near your content</li>
							<li>
								We are not obligated to compensate you for advertisements displayed alongside your
								content unless expressly agreed
							</li>
						</UL>
						<P>
							Businesses and advertisers are solely responsible for their promotions and claims.
						</P>
					</Section>

					<Divider />

					{/* Section 10 */}
					<Section id="s10" title="10. Paid Services and Monetization">
						<P>AppsCombo may offer paid services, including:</P>
						<UL>
							<li>Subscriptions</li>
							<li>Verification services</li>
							<li>Advertising tools</li>
							<li>Premium features</li>
							<li>Creator monetization</li>
							<li>Marketplace services</li>
						</UL>
						<P>
							All fees are generally non-refundable unless required by law or expressly stated
							otherwise.
						</P>
						<P>We reserve the right to:</P>
						<UL>
							<li>Change pricing</li>
							<li>Modify features</li>
							<li>Introduce new charges</li>
							<li>Suspend monetization eligibility</li>
						</UL>
					</Section>

					<Divider />

					{/* Section 11 */}
					<Section id="s11" title="11. Third-Party Services and Links">
						<P>AppsCombo may integrate with or link to third-party services, including:</P>
						<UL>
							<li>Payment providers</li>
							<li>Authentication services</li>
							<li>Cloud services</li>
							<li>Social integrations</li>
							<li>Advertisers</li>
						</UL>
						<P>We are not responsible for:</P>
						<UL>
							<li>Third-party content</li>
							<li>Policies</li>
							<li>Security practices</li>
							<li>Transactions</li>
							<li>Service availability</li>
						</UL>
						<P>Your use of third-party services is subject to their own terms and policies.</P>
					</Section>

					<Divider />

					{/* Section 12 */}
					<Section id="s12" title="12. Platform Availability and Changes">
						<P>We may:</P>
						<UL>
							<li>Modify features</li>
							<li>Updates interfaces</li>
							<li>Introduce new functionality</li>
							<li>Remove content</li>
							<li>Suspend services</li>
							<li>Discontinue portions of the platform</li>
						</UL>
						<P>without prior notice.</P>
						<P>We do not guarantee uninterrupted or error-free operation of the Services.</P>
					</Section>

					<Divider />

					{/* Section 13 */}
					<Section id="s13" title="13. Artificial Intelligence and Automated Systems">
						<P>AppsCombo may use artificial intelligence and automated systems to:</P>
						<UL>
							<li>Personalize feeds</li>
							<li>Recommend content</li>
							<li>Detect harmful activity</li>
							<li>Improve moderation</li>
							<li>Enhance search and discovery</li>
							<li>Analyze engagement</li>
							<li>Prevent fraud and abuse</li>
						</UL>
						<P>
							You acknowledge that automated decisions may affect visibility, recommendations,
							moderation, and platform interactions.
						</P>
					</Section>

					<Divider />

					{/* Section 14 */}
					<Section id="s14" title="14. Data Usage and Analytics">
						<P>We may analyze usage data, trends, interactions, and content performance to:</P>
						<UL>
							<li>Improve user experience</li>
							<li>Develop new features</li>
							<li>Enhance recommendations</li>
							<li>Improve security</li>
							<li>Conduct research and analytics</li>
						</UL>
						<P>
							Aggregated or anonymized data may be used for business, analytical, or research
							purposes.
						</P>
					</Section>

					<Divider />

					{/* Section 15 */}
					<Section id="s15" title="15. Account Suspension and Termination">
						<P>We may suspend, restrict, or terminate your account if:</P>
						<UL>
							<li>You violate these Terms</li>
							<li>We detect suspicious activity</li>
							<li>Required by law</li>
							<li>Necessary to protect users or platform integrity</li>
						</UL>
						<P>
							You may also delete your account at any time through account settings where available.
						</P>
						<P>
							Certain data may remain retained for legal, security, fraud prevention, or operational
							purposes.
						</P>
					</Section>

					{/* Section 16 */}
					<Section id="s16" title="16. Disclaimer of Warranties">
						<P>AppsCombo is provided “AS IS” and “AS AVAILABLE.”</P>
						<P>To the fullest extent permitted by law, we disclaim all warranties, including:</P>
						<UL>
							<li>Merchantability</li>
							<li>Fitness for a particular purpose</li>
							<li>Non-infringement</li>
							<li>Reliability</li>
							<li>Availability</li>
							<li>Security</li>
							<li>Accuracy</li>
						</UL>
						<P>We do not guarantee that:</P>
						<UL>
							<li>The Services will always be available</li>
							<li>The platform will be error-free</li>
							<li>Content will be accurate or reliable</li>
							<li>The Services will be secure from all threats</li>
						</UL>
					</Section>

					{/* Section 17 */}
					<Section id="s17" title="17. Limitation of Liabilities">
						<P>
							To the maximum extent permitted by law, AppsCombo and its affiliates, officers,
							employees, partners, and licensors shall not be liable for:
						</P>
						<UL>
							<li>Indirect damages</li>
							<li>Incidental damages</li>
							<li>Lost profits</li>
							<li>Data loss</li>
							<li>Reputation damage</li>
							<li>Business interruption</li>
							<li>Unauthorized access</li>
							<li>User conduct</li>
							<li>Third-party actions</li>
						</UL>
						<P>
							Our total liability shall not exceed the amount you paid to AppsCombo, if any, within
							the previous twelve months.
						</P>
					</Section>

					{/* Section 18 */}
					<Section id="s18" title="18. Indemnification">
						<P>
							You agree to indemnify and hold harmless AppsCombo and its affiliates from claims,
							damages, liabilities, losses, and expenses arising from:
						</P>
						<UL>
							<li>Your use of the Services </li>
							<li>Your content</li>
							<li>Your violations of these Terms</li>
							<li>Your infringement of third-party rights</li>
							<li>Your unlawful activities</li>
						</UL>
					</Section>

					{/* Section 19 */}
					<Section id="s19" title="19. Governing Law and Jurisdiction">
						<P>
							These Terms shall be governed by and interpreted under the laws of United State/
							Delaware.
						</P>
						<P>
							Any disputes arising from these Terms or the Services shall be resolved exclusively in
							the courts located within the applicable jurisdiction unless otherwise required by
							law.
						</P>
					</Section>

					{/* Section 20 */}
					<Section id="s20" title="20. International Use">
						<P>AppsCombo may be accessible globally.</P>
						<P>
							You are responsible for complying with local laws applicable to your use of the
							Services.
						</P>
						<P>
							We make no representation that the Services are lawful or available in every
							jurisdiction.
						</P>
					</Section>

					{/* Section 21 */}
					<Section id="s21" title="21. Changes to These Terms">
						<P>We may modify these Terms from time to time.</P>
						<P>When changes are made, we may:</P>
						<UL>
							<li>Update the “Last Updated” date</li>
							<li>Notify users through the platform</li>
							<li>Send emails or notifications where required</li>
						</UL>
						<P>
							Continued use of AppsCombo after changes become effective constitutes acceptance of
							the updated Terms.
						</P>
					</Section>

					{/* Section 22 */}
					<Section id="s22" title="22. Contact Information">
						<P>If you have any questions regarding these Terms, please contact us at:</P>
						<P>
							Email: <span className="text-foreground font-medium">legal@appscombo.com</span>
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

					{/* Section 23 */}
					<Section id="s23" title="23. Entire Agreement">
						<P>
							These Terms, together with the Privacy Policy and other applicable policies,
							constitute the entire agreement between you and AppsCombo regarding the Services.
						</P>
						<P>
							If any provision of these Terms is found unenforceable, the remaining provisions shall
							remain in full force and effect.
						</P>
					</Section>

					{/* Section 24 */}
					<Section id="s24" title="24. Waiver and Severability">
						<P>
							Failure by AppsCombo to enforce any provision of these Terms shall not constitute a
							waiver of that provision.
						</P>
						<P>
							If any part of these Terms is determined to be invalid or unenforceable, the remaining
							provisions will continue in effect.
						</P>
					</Section>

					{/* Section 25 */}
					<Section id="s25" title="25. Electronic Communication">
						<P>
							By using AppsCombo, you consent to receive electronic communications from us,
							including:
						</P>
						<UL>
							<li>Notices</li>
							<li>Announcements</li>
							<li>Security Alerts</li>
							<li>Updates</li>
							<li>Transactional messages</li>
							<li>Legal communications</li>
						</UL>
						<P>These communications may be delivered through:</P>
						<UL>
							<li>Email</li>
							<li>In-app notifications</li>
							<li>SMS</li>
							<li>Website notices</li>
							<li>Push notifications</li>
						</UL>
					</Section>

					{/* Section 26 */}
					<Section id="s26" title="26. User Feedback and Suggestions">
						<P>
							If you provide suggestions, ideas, feedback, or recommendations regarding AppsCombo,
							you grant us the right to use them without compensation, restriction, or obligation to
							you.
						</P>
					</Section>

					{/* Section 27*/}
					<Section id="s27" title="27. Beta Features and Experimental Services">
						<P>AppsCombo may release beta, experimental, or test features.</P>
						<P>These features may:</P>
						<UL>
							<li>Be incomplete</li>
							<li>Contain bugs</li>
							<li>Change without notice</li>
							<li>Be discontinued at any time</li>
						</UL>
						<P>Use of beta features is at your own risk.</P>
					</Section>

					{/* Section 28*/}
					<Section id="s28" title="28. Force Majeure">
						<P>
							AppsCombo shall not be liable for delays or failures caused by events beyond our
							reasonable control, including:
						</P>
						<UL>
							<li>Natural disasters</li>
							<li>Internet outages</li>
							<li>Government actions</li>
							<li>Wars</li>
							<li>Cyberattacks</li>
							<li>Labor disputes</li>
							<li>Infrastructure failures</li>
						</UL>
						<P>Use of beta features is at your own risk.</P>
					</Section>

					{/* Section 29 */}
					<Section id="s29" title="29. Acceptance of Terms">
						<P>
							By accessing or using AppsCombo, you acknowledge that you have read, understood, and
							agreed to these Terms and Conditions.
						</P>
						<P>Thank you for using AppsCombo</P>
					</Section>
				</main>
			</div>

			<div className="lg:hidden fixed bottom-6 right-4 z-40">
				<button
					onClick={() => setTocOpen(true)}
					className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform"
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

					<div className="relative bg-white rounded-t-3xl max-h-[78vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
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
