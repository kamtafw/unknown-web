function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="mb-10 sm:mb-12">
			<h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">{title}</h2>
			{children}
		</section>
	)
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="mt-5">
			<h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
			{children}
		</div>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-muted-foreground leading-relaxed space-y-1">
			{children}
		</ul>
	)
}

function OL({ children }: { children: React.ReactNode }) {
	return (
		<ol className="list-decimal pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-muted-foreground leading-relaxed space-y-1">
			{children}
		</ol>
	)
}

function Divider() {
	return <hr className="border-border my-8 sm:my-10" />
}

export function SafetyReport() {
	return (
		<>
			{/* Hero */}
			<section className="py-14 sm:py-20 px-4 border-b border-border">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Trust & safety
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
						Building a safer AppsCombo community
					</h1>
					<p className="text-muted-foreground leading-relaxed max-w-2xl">
						At AppsCombo, the safety, security, and well-being of our users are among our highest
						priorities. This Safety Report Center explains how users can report safety concerns, how
						AppsCombo responds to reports, and the measures we take to protect our community.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Our commitment to safety">
					<P>AppsCombo is committed to:</P>
					<UL>
						<li>Protecting users from harmful content</li>
						<li>Preventing abuse and harassment</li>
						<li>Combating fraud and scams</li>
						<li>Protecting minors and vulnerable individuals</li>
						<li>Enforcing community standards</li>
						<li>Promoting respectful interactions</li>
						<li>Supporting user privacy and security</li>
						<li>Maintaining platform integrity</li>
					</UL>
					<P>
						Our safety systems combine user reporting, automated detection systems, artificial
						intelligence tools, human moderation teams, security specialists, and policy enforcement
						procedures to help create a safe and trusted environment.
					</P>
				</Section>

				<Divider />

				<Section title="Types of safety reports">
					<P>
						Users may submit reports related to harassment, hate speech, threats of violence, fraud,
						impersonation, spam, fake accounts, child safety, intellectual property, privacy,
						misinformation, dangerous organizations, account compromise, security vulnerabilities,
						and illegal activities.
					</P>

					<SubSection title="Harassment and bullying">
						<P>
							We do not tolerate behavior intended to intimidate, threaten, humiliate, or target
							individuals — including repeated unwanted contact, personal attacks, threatening
							messages, organized harassment, and cyberbullying. Reports are reviewed and
							appropriate action may be taken.
						</P>
					</SubSection>

					<SubSection title="Hate speech and discrimination">
						<P>
							AppsCombo prohibits content that promotes hatred, discrimination, exclusion, or
							violence based on characteristics such as race, ethnicity, national origin,
							disability, gender, religion, age, or other protected characteristics. Violations may
							result in content removal and account restrictions.
						</P>
					</SubSection>

					<SubSection title="Fraud, scams, and deceptive activity">
						<P>
							Help us protect the community by reporting investment scams, phishing attempts, fake
							giveaways, identity theft, financial fraud, deceptive promotions, and unauthorized
							fundraising. Accounts involved in fraudulent activities may be suspended or
							permanently removed.
						</P>
					</SubSection>

					<SubSection title="Impersonation and fake accounts">
						<P>
							Users may report accounts pretending to be individuals, businesses, organizations,
							public figures, or government entities. Verified reports may result in account removal
							or additional verification requirements.
						</P>
					</SubSection>

					<SubSection title="Child safety and protection">
						<P>
							AppsCombo has zero tolerance for child exploitation, abuse, or harmful activities
							involving minors. Users should immediately report child exploitation material,
							grooming behavior, child abuse content, exploitation of minors, or dangerous
							interactions involving children. Such reports receive the highest priority and may be
							referred to appropriate authorities where required by law.
						</P>
					</SubSection>

					<SubSection title="Threats and dangerous behavior">
						<P>
							Content involving threats of harm, violence, criminal activity, or dangerous conduct
							may be removed immediately — including credible threats, violent extremism, criminal
							activities, dangerous challenges, and organized harmful behavior. AppsCombo may
							cooperate with law enforcement where legally required.
						</P>
					</SubSection>

					<SubSection title="Privacy violations">
						<P>
							Users may report unauthorized sharing of personal information, confidential records,
							sensitive data, private communications, or personal images. We take privacy concerns
							seriously and investigate reported violations promptly.
						</P>
					</SubSection>

					<SubSection title="Intellectual property violations">
						<P>
							If you believe your copyright, trademark, or intellectual property rights have been
							violated — including copyright infringement, trademark infringement, unauthorized
							content use, or brand impersonation — please submit a report through our legal
							reporting process.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="How to submit a report">
					<SubSection title="Through the platform">
						<P>Most content and profiles include reporting options:</P>
						<OL>
							<li>Select the content, profile, or message</li>
							<li>Click or tap &ldquo;Report&rdquo;</li>
							<li>Choose the reason for the report</li>
							<li>Submit supporting information</li>
						</OL>
					</SubSection>

					<SubSection title="Through the safety report form">
						<P>
							You may submit a report directly to our Safety Team. Required information may include
							your full name (optional where permitted), email address, username, URL or content
							location, description of the issue, and supporting screenshots or files.
						</P>
					</SubSection>

					<SubSection title="Contact the safety team">
						<p className="text-[13px] text-muted-foreground leading-relaxed">
							Safety reports:{" "}
							<a href="mailto:safety@appscombo.com" className="text-primary hover:underline">
								safety@appscombo.com
							</a>
							<br />
							Security reports:{" "}
							<a href="mailto:security@appscombo.com" className="text-primary hover:underline">
								security@appscombo.com
							</a>
							<br />
							Emergency legal matters:{" "}
							<a href="mailto:legal@appscombo.com" className="text-primary hover:underline">
								legal@appscombo.com
							</a>
						</p>
					</SubSection>
				</Section>

				<Divider />

				<Section title="What happens after you report?">
					<SubSection title="Step 1 — Review">
						<P>Our systems and safety teams review the report you submitted.</P>
					</SubSection>
					<SubSection title="Step 2 — Investigation">
						<P>
							We may evaluate the content involved, user history, platform activity, policy
							violations, and security risks.
						</P>
					</SubSection>
					<SubSection title="Step 3 — Action">
						<P>
							Depending on the findings, AppsCombo may remove content, restrict visibility, issue
							warnings, require verification, suspend or permanently remove accounts, or escalate
							matters to legal authorities where required.
						</P>
					</SubSection>
					<SubSection title="Appeals process">
						<P>
							Users who believe enforcement actions were taken in error may request a review through
							account notifications, support channels, or safety review forms. Our team will
							evaluate appeals based on applicable policies and available evidence.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Platform safety measures">
					<SubSection title="Security features">
						<UL>
							<li>Secure authentication and two-factor authentication</li>
							<li>Login monitoring</li>
							<li>Fraud detection</li>
							<li>Device verification</li>
						</UL>
					</SubSection>
					<SubSection title="Content protection">
						<UL>
							<li>Automated moderation systems</li>
							<li>Harmful content detection</li>
							<li>Spam prevention systems</li>
							<li>Abuse detection tools</li>
						</UL>
					</SubSection>
					<SubSection title="Community safety">
						<UL>
							<li>User blocking tools</li>
							<li>Privacy controls</li>
							<li>Reporting systems</li>
							<li>Community moderation tools</li>
						</UL>
					</SubSection>
					<P>
						We strive to apply policies consistently, protect user rights, respect due process,
						improve enforcement systems, and publish transparency information where appropriate.
					</P>
				</Section>

				<Divider />

				<Section title="Safety tips for users">
					<SubSection title="Protect your account">
						<UL>
							<li>Use a strong password</li>
							<li>Enable two-factor authentication</li>
							<li>Avoid sharing login credentials</li>
							<li>Review active sessions regularly</li>
						</UL>
					</SubSection>
					<SubSection title="Protect your privacy">
						<UL>
							<li>Adjust privacy settings</li>
							<li>Limit public information</li>
							<li>Be cautious with personal details</li>
						</UL>
					</SubSection>
					<SubSection title="Stay alert">
						<UL>
							<li>Verify suspicious messages</li>
							<li>Avoid unknown links</li>
							<li>Report scams immediately</li>
						</UL>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Contact the safety team">
					<p className="text-[13px] text-muted-foreground leading-relaxed">
						Safety team:{" "}
						<a href="mailto:safety@appscombo.com" className="text-primary hover:underline">
							safety@appscombo.com
						</a>
						<br />
						Security team:{" "}
						<a href="mailto:security@appscombo.com" className="text-primary hover:underline">
							security@appscombo.com
						</a>
						<br />
						Legal department:{" "}
						<a href="mailto:legal@appscombo.com" className="text-primary hover:underline">
							legal@appscombo.com
						</a>
						<br />
						General support:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
					</p>
				</Section>

				<p className="text-center text-xs text-muted-foreground pt-2">
					AppsCombo Safety Center — Safe. Secure. Trusted.
				</p>
			</div>
		</>
	)
}
