import { LegalWrapper } from "./legal-wrapper"

const SECTIONS = [
	{
		title: "Copyright",
		content: `All content on this platform — including but not limited to text, graphics, logos, icons, images, audio clips, and software — is the property of AppsCombo Inc. or its content suppliers and is protected by applicable international copyright laws. Reproduction or redistribution of any part of this platform without the express written permission of AppsCombo Inc. is strictly prohibited.

User-generated content remains the intellectual property of the respective user. By posting content on AppsCombo, users grant AppsCombo Inc. a non-exclusive, royalty-free, worldwide licence to use, reproduce, and distribute that content solely for the purpose of operating and improving the platform.`,
	},
	{
		title: "Trademarks",
		content: `"AppsCombo", the AppsCombo logo, and all related names, logos, product and service names, designs, and slogans are trademarks of AppsCombo Inc. or its affiliates. You may not use such marks without the prior written permission of AppsCombo Inc. All other names, logos, product and service names, designs, and slogans on this platform are the trademarks of their respective owners.`,
	},
	{
		title: "Disclaimer of Warranties",
		content: `The platform and its content are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. AppsCombo Inc. does not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components. Your use of the platform is at your own risk.`,
	},
	{
		title: "Limitation of Liability",
		content: `To the fullest extent permitted by applicable law, AppsCombo Inc., its affiliates, officers, directors, employees, agents, licensors, and service providers will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the platform, even if AppsCombo Inc. has been advised of the possibility of such damages.`,
	},
	{
		title: "Third-Party Links",
		content: `The platform may contain links to third-party websites. These links are provided for your convenience only. AppsCombo Inc. has no control over the contents of those sites and accepts no responsibility for them or for any loss or damage that may arise from your use of them. When you access third-party websites, you do so at your own risk.`,
	},
	{
		title: "Governing Law and Jurisdiction",
		content: `These notices and any disputes arising from them are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. Any legal proceedings arising out of or related to these notices shall be brought exclusively in the courts of Lagos State, Nigeria, and you consent to the jurisdiction of such courts.`,
	},
	{
		title: "Changes to this Notice",
		content: `AppsCombo Inc. reserves the right to modify this legal notice at any time. Changes are effective immediately upon posting to the platform. Your continued use of the platform after any changes constitutes your acceptance of the new terms. We encourage you to review this page periodically.`,
	},
]

export function LegalNotice() {
	const lastUpdated = "January 15, 2025"

	return (
		<LegalWrapper>
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
					This legal notice governs your use of the AppsCombo platform (the &ldquo;Platform&ldquo;) operated by
					AppsCombo Inc. (&ldquo;we&ldquo;, &ldquo;us&ldquo;, or &ldquo;our&ldquo;). Please read this notice carefully before using our
					services. By accessing or using the Platform, you agree to be bound by these terms.
				</p>

				<div className="space-y-10">
					{SECTIONS.map(({ title, content }) => (
						<div key={title} className="border-t border-gray-100 pt-8">
							<h2 className="text-[17px] font-bold text-gray-900 mb-4">{title}</h2>
							{content.split("\n\n").map((para, i) => (
								<p key={i} className="text-sm text-gray-600 leading-relaxed mb-3 last:mb-0">
									{para}
								</p>
							))}
						</div>
					))}
				</div>

				<div className="mt-12 bg-gray-50 rounded-2xl p-6">
					<p className="text-sm text-gray-600 leading-relaxed">
						<span className="font-semibold text-gray-900">Contact us about legal matters:</span> If
						you have questions about this legal notice or wish to report a potential legal
						violation, please contact our legal team at{" "}
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
		</LegalWrapper>
	)
}
