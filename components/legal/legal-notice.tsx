import { ReactNode } from "react"

const SECTIONS = [
	{
		title: "Company Information",
		content: `Service Provider: AppsCombo
Legal Entity: AppsCombo Inc
Registration Number: SR202512714289

Registered Address: 8 THE GREEN, STE A, KENT, DOVER, DE, 19901, United States

Website: www.appscombo.com
General Contact: info@appscombo.com`,
	},
	{
		title: "Legal Department",
		content: `For legal inquiries, notices, disputes, intellectual property matters, compliance requests, court orders, subpoenas, and regulatory communications, please contact:

Email: legal@appscombo.com

Mailing Address:
Legal Department, AppsCombo, 8 THE GREEN, STE A, KENT, DOVER, DE, 19901`,
	},
	{
		title: "Ownership of the Platform",
		content: `AppsCombo and all related Services — including software, source code, mobile applications, websites, APIs, databases, user interfaces, algorithms, logos, trademarks, brand assets, designs, graphics, and documentation — are owned by AppsCombo or its licensors and are protected by applicable intellectual property laws.

Unauthorized use is strictly prohibited.`,
	},
	{
		title: "Trademarks",
		content: `AppsCombo, its logo, branding elements, slogans, product names, service names, and associated visual identities are trademarks or registered trademarks of AppsCombo.

You may not use AppsCombo trademarks without prior written authorization. Unauthorized use may result in legal action.`,
	},
	{
		title: "Copyright Notice",
		content: `All content owned by AppsCombo — including text, graphics, logos, software, designs, documentation, website content, and mobile application content — is protected by applicable copyright laws and international treaties.

Except where expressly permitted, no material may be copied, reproduced, modified, distributed, published, or exploited without written consent.`,
	},
	{
		title: "User-Generated Content",
		content: `AppsCombo hosts user-generated content submitted by users, creators, organizations, businesses, and communities.

Users are solely responsible for the content they publish. AppsCombo does not necessarily endorse, verify, or guarantee the accuracy of user-generated content, and the views expressed by users do not necessarily reflect those of AppsCombo.`,
	},
	{
		title: "Intellectual Property Complaints",
		content: `If you believe content on AppsCombo infringes your copyright, trademark, or other intellectual property rights, please submit a written notice containing:

- Full legal name
- Contact information
- Description of the protected work
- URL or location of the allegedly infringing material
- Evidence of ownership
- Statement of good faith belief
- Statement of accuracy under applicable law

Submit complaints to copyright@appscombo.com or legal@appscombo.com.

AppsCombo reserves the right to remove allegedly infringing content and take appropriate action against repeat offenders.`,
	},
	{
		title: "Compliance with Laws",
		content: `AppsCombo is committed to complying with applicable laws and regulations governing data protection, privacy, consumer protection, intellectual property, cybersecurity, online safety, electronic communications, and financial regulations where applicable.

Users are responsible for complying with local laws applicable to their use of the Services.`,
	},
	{
		title: "Privacy and Data Protection",
		content: `AppsCombo processes personal information in accordance with its Privacy Policy and applicable data protection laws, which may include the General Data Protection Regulation (GDPR), the Nigeria Data Protection Act (NDPA), the California Consumer Privacy Act (CCPA), and other applicable regional privacy laws.

For privacy-related inquiries: privacy@appscombo.com`,
	},
	{
		title: "Content Moderation and Platform Integrity",
		content: `AppsCombo may review, restrict, remove, or disable content that violates our Terms of Service, violates Community Guidelines, violates applicable laws, threatens platform safety, or infringes intellectual property rights.

AppsCombo reserves sole discretion in enforcing platform policies.`,
	},
	{
		title: "Limitation of Liability",
		content: `To the maximum extent permitted by law, AppsCombo shall not be liable for user-generated content, third-party actions, service interruptions, data loss, security incidents beyond reasonable control, business losses, or indirect or consequential damages.

Users access and use the Services at their own risk. Additional limitations are described in our Terms and Conditions.`,
	},
	{
		title: "Third-Party Services",
		content: `AppsCombo may integrate with third-party services including payment providers, analytics services, cloud infrastructure providers, authentication providers, advertising networks, and business partners.

AppsCombo is not responsible for the content, policies, security, or practices of third-party services. Users should review third-party terms and policies independently.`,
	},
	{
		title: "Regulatory Requests and Law Enforcement",
		content: `AppsCombo may respond to valid legal requests from courts, government agencies, regulatory authorities, and law enforcement agencies. Requests must be submitted through appropriate legal channels to legal@appscombo.com.

AppsCombo reserves the right to review, challenge, or reject requests that are incomplete, unlawful, overly broad, or inconsistent with applicable law.`,
	},
	{
		title: "Service Availability",
		content: `AppsCombo makes reasonable efforts to maintain platform availability and security. However, we do not guarantee continuous availability, error-free operation, uninterrupted service, or compatibility with all devices.

Services may be modified, suspended, or discontinued at any time.`,
	},
	{
		title: "Security Disclosure",
		content: `We encourage responsible disclosure of security vulnerabilities. If you discover a potential security issue, please contact security@appscombo.com.

Please do not publicly disclose vulnerabilities before allowing AppsCombo a reasonable opportunity to investigate and remediate the issue.`,
	},
	{
		title: "Export Control and Sanctions Compliance",
		content: `Users agree not to use AppsCombo in violation of applicable export control laws, trade restrictions, sanctions regulations, or international embargoes.

AppsCombo reserves the right to restrict access where required by law.`,
	},
	{
		title: "Dispute Resolution",
		content: `Any disputes relating to AppsCombo or its Services shall be governed by the laws of the United States, unless otherwise required by applicable law.

Additional dispute resolution provisions may be described in our Terms and Conditions.`,
	},
	{
		title: "Updates to This Legal Notice",
		content: `AppsCombo may update this Legal Notice periodically. Changes become effective upon publication unless otherwise stated.

Users are encouraged to review this page regularly.`,
	},
	{
		title: "Contact Information",
		content: `General Inquiries: info@appscombo.com
Legal Department: legal@appscombo.com
Privacy Team: privacy@appscombo.com
Security Team: security@appscombo.com
Copyright Complaints: copyright@appscombo.com
Compliance Team: compliance@appscombo.com

All official legal notices intended for AppsCombo should be directed to the Legal Department using the contact information above. Electronic submissions may be accepted where permitted by applicable law.`,
	},
]

function P({ children }: { children: ReactNode }) {
	return <p className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">{children}</p>
}

function ParagraphBlock({ content }: { content: string }) {
	return (
		<>
			{content.split("\n\n").map((block, i) => {
				const lines = block.split("\n").filter(Boolean)
				const isList = lines.length > 1 && lines.every((l) => l.trim().startsWith("•"))

				if (isList) {
					return (
						<ul
							key={i}
							className="list-disc pl-5 mb-3 last:mb-0 text-sm text-gray-600 leading-relaxed space-y-1"
						>
							{lines.map((l, j) => (
								<li key={j}>{l.replace(/^•\s*/, "")}</li>
							))}
						</ul>
					)
				}

				return (
					<P key={i}>
						{lines.map((l, j) => (
							<span key={j}>
								{l}
								{j < lines.length - 1 && <br />}
							</span>
						))}
					</P>
				)
			})}
		</>
	)
}

export function LegalNotice() {
	const lastUpdated = "28 May, 2026"

	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Legal</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Legal Notice</h1>
					<p className="text-sm text-gray-400">Last updated: {lastUpdated}</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<p className="text-gray-600 leading-relaxed mb-10">
					This Legal Notice provides important information regarding the ownership, operation, legal
					responsibilities, intellectual property rights, regulatory compliance, and legal contact
					procedures relating to the AppsCombo platform, website, mobile applications, APIs, and
					related services (collectively, the &ldquo;Services&rdquo;). By accessing or using
					AppsCombo, you acknowledge and agree to the information contained in this Legal Notice.
				</p>

				<div className="space-y-10">
					{SECTIONS.map(({ title, content }) => (
						<div key={title} className="border-t border-gray-100 pt-8">
							<h2 className="text-[17px] font-bold text-gray-900 mb-4">{title}</h2>
							<ParagraphBlock content={content} />
						</div>
					))}
				</div>

				<div className="mt-12 bg-gray-50 rounded-2xl p-6">
					<p className="text-sm text-gray-600 leading-relaxed">
						<span className="font-semibold text-gray-900">AppsCombo</span> — Building a trusted
						platform where people, communities, creators, businesses, and organizations connect,
						engage, and grow together. For legal matters, reach our team at{" "}
						<a href="mailto:legal@appscombo.com" className="text-primary hover:underline">
							legal@appscombo.com
						</a>
						. For general support, visit our{" "}
						<a href="/support" className="text-primary hover:underline">
							support page
						</a>
						.
					</p>
				</div>
			</div>
		</>
	)
}
