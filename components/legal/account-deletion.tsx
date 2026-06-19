import Link from "next/link"

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

function OL({ children }: { children: React.ReactNode }) {
	return (
		<ol className="list-decimal pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-gray-500 leading-relaxed space-y-1">
			{children}
		</ol>
	)
}

function Divider() {
	return <hr className="border-gray-100 my-8 sm:my-10" />
}

export function AccountDeletion() {
	return (
		<>
			{/* Hero */}
			<section className="py-14 sm:py-20 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
						Delete your account
					</h1>
					<p className="text-gray-500 leading-relaxed max-w-2xl">
						At AppsCombo, we respect your right to control your personal information and manage your
						account. This page explains how to permanently delete your AppsCombo account, what
						happens after deletion, and how your information is handled during the process. Please
						read carefully — deletion is permanent.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<div className="border-l-2 border-destructive pl-4 mb-12">
					<p className="text-[13px] font-semibold text-gray-900 mb-2">
						Before you delete your account
					</p>
					<p className="text-[13px] text-gray-500 leading-relaxed mb-2">
						When your account is deleted:
					</p>
					<UL>
						<li>Your profile will be removed from AppsCombo</li>
						<li>Your login credentials will be permanently disabled</li>
						<li>Posts, photos, videos, and comments may be removed from public view</li>
						<li>
							You will lose access to communities, groups, events, messages, and account settings
						</li>
						<li>
							You will no longer be able to access subscriptions, premium features, or purchased
							services
						</li>
					</UL>
					<p className="text-[13px] text-gray-500 leading-relaxed">
						Once the deletion process is completed, your account cannot be recovered.
					</p>
				</div>

				<Section title="How to delete your account">
					<SubSection title="Option 1 — Through the AppsCombo app">
						<OL>
							<li>Open the AppsCombo app</li>
							<li>Navigate to Settings</li>
							<li>Select Account Settings</li>
							<li>Choose Delete Account</li>
							<li>Review the information provided</li>
							<li>Confirm your identity</li>
							<li>Submit your deletion request</li>
						</OL>
					</SubSection>

					<SubSection title="Option 2 — Through the website">
						<OL>
							<li>Sign in to your AppsCombo account</li>
							<li>Go to Account Settings</li>
							<li>Select Privacy & Security</li>
							<li>Click Delete Account</li>
							<li>Review the deletion information</li>
							<li>Confirm your password</li>
							<li>Submit your request</li>
						</OL>
					</SubSection>

					<SubSection title="Option 3 — Submit a deletion request">
						<P>
							If you can&apos;t access your account, email{" "}
							<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
								support@appscombo.com
							</a>{" "}
							with your full name, registered email, and username (if available). Additional
							identity verification may be required to protect against unauthorized requests.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="What information will be deleted">
					<P>The following information is generally removed from our active systems:</P>
					<UL>
						<li>User profile information</li>
						<li>Photos and videos uploaded by you</li>
						<li>Posts and comments</li>
						<li>Stories and media content</li>
						<li>Account settings</li>
						<li>Followers and following relationships</li>
						<li>Community memberships</li>
						<li>Event participation records</li>
						<li>Messaging metadata</li>
						<li>Search history</li>
						<li>Activity logs associated with your account</li>
					</UL>
				</Section>

				<Divider />

				<Section title="Information that may be retained">
					<P>
						Certain information may be retained for legal, security, operational, or regulatory
						purposes — including security logs, fraud prevention records, legal compliance records,
						financial transaction records, records required for dispute resolution, and information
						required by applicable laws. Retained information is stored only as long as necessary to
						satisfy these obligations.
					</P>
				</Section>

				<Divider />

				<Section title="Messages and shared content">
					<UL>
						<li>Messages you sent to other users may remain visible in their inboxes</li>
						<li>
							Content shared, reposted, quoted, or saved by other users may remain accessible to
							those users
						</li>
						<li>
							Comments or interactions associated with other users&apos; content may remain where
							legally permitted
						</li>
					</UL>
					<P>
						Deletion of your account does not automatically remove copies of content previously
						shared by others.
					</P>
				</Section>

				<Divider />

				<Section title="Account deletion timeline">
					<SubSection title="Immediate actions">
						<P>
							After your request is submitted, your account may be deactivated immediately and
							access to AppsCombo services restricted.
						</P>
					</SubSection>
					<SubSection title="Processing period">
						<P>
							Account deletion requests are typically processed within 30 days. In some cases,
							deletion may take longer where legal obligations apply, security reviews are required,
							fraud investigations are ongoing, or technical processing delays occur.
						</P>
					</SubSection>
					<SubSection title="Can I cancel my deletion request?">
						<P>
							Yes. If your account enters a grace period before permanent deletion, you may be able
							to cancel the request by logging back in before the deletion process is finalized.
							After permanent deletion occurs, recovery is no longer possible.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Download your data first">
					<P>
						Before deleting, we recommend downloading a copy of your profile, posts, photos, videos,
						messages, events, and activity history via the Download Your Data feature in Account
						Settings.
					</P>
				</Section>

				<Divider />

				<Section title="Business accounts and pages">
					<P>
						If you manage Business Pages, Communities, Events, Creator Accounts, or Organization
						Profiles, transfer ownership or administrative access before deleting your account.
						Deletion of the primary account may impact associated services and assets.
					</P>
				</Section>

				<Divider />

				<Section title="Privacy and data protection rights">
					<P>
						AppsCombo respects user privacy rights under applicable laws and regulations, including
						the General Data Protection Regulation (GDPR), the Nigeria Data Protection Act (NDPA),
						the California Consumer Privacy Act (CCPA), and other applicable privacy laws. Users may
						request access, correction, portability, deletion, or restriction of processing where
						applicable.
					</P>
				</Section>

				<Divider />

				<Section title="Need help?">
					<p className="text-[13px] text-gray-500 leading-relaxed">
						Account Deletion Team:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						<br />
						Privacy Team:{" "}
						<a href="mailto:privacy@appscombo.com" className="text-primary hover:underline">
							privacy@appscombo.com
						</a>
						<br />
						Customer Support:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
					</p>
				</Section>

				<Divider />

				<Section title="Final confirmation">
					<P>By submitting an account deletion request, you acknowledge that:</P>
					<UL>
						<li>Account deletion is permanent</li>
						<li>Certain information may be retained where legally required</li>
						<li>Access to AppsCombo services will be terminated</li>
						<li>Deleted accounts cannot be restored after the deletion process is completed</li>
					</UL>
				</Section>

				<Divider />

				<section className="text-center pt-2">
					<p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto mb-6">
						We&apos;re grateful that you chose to be part of the AppsCombo community. Should you
						decide to return in the future, you&apos;re always welcome to create a new account.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<Link
							href="/sign-in"
							className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-destructive text-white text-sm font-semibold hover:opacity-90 transition-opacity"
						>
							Proceed to account deletion
						</Link>
						<Link
							href="/support"
							className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
						>
							Contact support
						</Link>
					</div>
					<p className="text-xs text-gray-400 mt-8">AppsCombo — Connect. Engage. Grow.</p>
				</section>
			</div>
		</>
	)
}
