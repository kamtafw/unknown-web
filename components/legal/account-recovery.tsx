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

export function AccountRecovery() {
	return (
		<>
			{/* Hero */}
			<section className="py-14 sm:py-20 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-4">
						Account recovery
					</h1>
					<p className="text-gray-500 leading-relaxed max-w-2xl">
						At AppsCombo, we understand how important your account is. Whether you&apos;ve forgotten
						your password, lost access to your email or phone number, suspect unauthorized access,
						or are unable to sign in for any reason, we&apos;re here to help you recover your
						account securely.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Common account access issues">
					<P>You may need account recovery assistance if:</P>
					<UL>
						<li>You forgot your password</li>
						<li>You no longer have access to your email address or phone number</li>
						<li>Your account was hacked or compromised</li>
						<li>You are unable to complete two-factor authentication</li>
						<li>Your account has been locked for security reasons</li>
						<li>You believe someone else has access to your account</li>
						<li>You cannot verify your identity using standard methods</li>
					</UL>
				</Section>

				<Divider />

				<Section title="Recovery options">
					<SubSection title="Option 1 — Reset your password">
						<P>
							If you still have access to your registered email address or phone number, this is the
							fastest option.
						</P>
						<OL>
							<li>Visit the AppsCombo login page</li>
							<li>Select Forgot Password</li>
							<li>Enter your registered email, phone number, or username</li>
							<li>Follow the instructions sent to your recovery method</li>
							<li>Create a new password</li>
							<li>Sign in using your updated credentials</li>
						</OL>
					</SubSection>

					<SubSection title="Option 2 — Recover using email verification">
						<OL>
							<li>Select Recover Account</li>
							<li>Enter your email address</li>
							<li>Verify ownership through the email verification link</li>
							<li>Follow the recovery instructions</li>
						</OL>
						<P>For security reasons, verification links may expire after a limited period.</P>
					</SubSection>

					<SubSection title="Option 3 — Recover using phone verification">
						<OL>
							<li>Select Recover Account</li>
							<li>Enter your phone number</li>
							<li>Receive and enter a one-time verification code</li>
							<li>Follow the instructions to restore access</li>
						</OL>
						<P>Standard carrier charges may apply.</P>
					</SubSection>

					<SubSection title="Option 4 — Recover a compromised account">
						<P>
							If you believe your account has been hacked, accessed without permission, or otherwise
							compromised, immediately:
						</P>
						<UL>
							<li>Change your password if possible</li>
							<li>Log out of all active sessions</li>
							<li>Enable two-factor authentication</li>
							<li>Review account activity and security settings</li>
						</UL>
						<P>
							If you cannot access the account, contact the Security Team at{" "}
							<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
								support@appscombo.com
							</a>{" "}
							with your username, registered email and phone number (if available), approximate
							account creation date, and a description of the issue.
						</P>
					</SubSection>

					<SubSection title="Option 5 — Identity verification recovery">
						<P>
							If you no longer have access to your registered email address or phone number, we may
							require identity verification, which can include:
						</P>
						<UL>
							<li>Government-issued identification</li>
							<li>Verification of previous account activity</li>
							<li>Confirmation of account ownership details</li>
							<li>Security questions where applicable</li>
						</UL>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Two-factor authentication recovery">
					<P>
						If you are unable to access your two-factor authentication method, recovery options
						include recovery codes, alternate verification methods, approved backup devices, or
						manual verification by our security team. If none of these options are available,
						contact{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
						.
					</P>
				</Section>

				<Divider />

				<Section title="Locked or disabled accounts">
					<P>
						Accounts may be temporarily restricted or disabled for reasons including security
						concerns, suspicious login activity, violation of Terms of Service, Community Guidelines
						violations, or identity verification requirements. If you believe your account was
						restricted in error, you may submit an appeal through the recovery process.
					</P>
				</Section>

				<Divider />

				<Section title="Information required for recovery requests">
					<P>To help us verify ownership, you may be asked to provide:</P>
					<SubSection title="Personal information">
						<UL>
							<li>Full name</li>
							<li>Username</li>
							<li>Registered email address</li>
							<li>Registered phone number</li>
						</UL>
					</SubSection>
					<SubSection title="Account information">
						<UL>
							<li>Date of account creation (approximate)</li>
							<li>Previous passwords (if known)</li>
							<li>Recent login locations</li>
							<li>Devices used to access the account</li>
						</UL>
					</SubSection>
					<SubSection title="Additional verification">
						<UL>
							<li>Identification documents (where required)</li>
							<li>Screenshots of error messages</li>
							<li>Evidence of unauthorized activity</li>
						</UL>
					</SubSection>
					<P>Providing accurate information helps us process your request more efficiently.</P>
				</Section>

				<Divider />

				<Section title="Protecting your account">
					<P>Once access has been restored, we strongly recommend:</P>
					<UL>
						<li>Enabling two-factor authentication for an additional layer of security</li>
						<li>
							Using a strong, unique password — with uppercase and lowercase letters, numbers, and
							special characters, not reused across platforms
						</li>
						<li>Reviewing active sessions regularly and removing any unfamiliar devices</li>
						<li>Keeping your email address and phone number current</li>
					</UL>
				</Section>

				<Divider />

				<Section title="Recovery request processing times">
					<P>
						Most automated recovery requests are processed immediately. Manual recovery requests
						requiring investigation or identity verification typically take 24–72 hours, though more
						complex cases may require additional review time.
					</P>
				</Section>

				<Divider />

				<Section title="Privacy and security">
					<P>
						Information submitted during the recovery process is used solely to verify account
						ownership, prevent unauthorized access, protect user accounts, and comply with legal and
						regulatory obligations. For more information, review our{" "}
						<Link href="/privacy-policy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						.
					</P>
				</Section>

				<Divider />

				<Section title="Frequently asked questions">
					<SubSection title="How long does account recovery take?">
						<P>
							Most recovery requests are resolved within 24–72 hours, depending on the complexity of
							the case.
						</P>
					</SubSection>
					<SubSection title="Can I recover a deleted account?">
						<P>
							Accounts scheduled for deletion may be recoverable during the grace period.
							Permanently deleted accounts generally cannot be restored.
						</P>
					</SubSection>
					<SubSection title="What if I no longer have access to my email and phone number?">
						<P>
							You may still recover your account through identity verification and manual review.
						</P>
					</SubSection>
					<SubSection title="Why was my recovery request denied?">
						<P>
							Requests may be denied if we cannot verify account ownership or if submitted
							information is incomplete or inconsistent.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Contact the recovery team">
					<p className="text-[13px] text-gray-500 leading-relaxed mb-6">
						Account Recovery Support:{" "}
						<a href="mailto:recovery@appscombo.com" className="text-primary hover:underline">
							recovery@appscombo.com
						</a>
						<br />
						Security Team:{" "}
						<a href="mailto:security@appscombo.com" className="text-primary hover:underline">
							security@appscombo.com
						</a>
						<br />
						General Support:{" "}
						<a href="mailto:support@appscombo.com" className="text-primary hover:underline">
							support@appscombo.com
						</a>
					</p>
					<P>
						Our goal is to help legitimate account owners regain access as quickly and securely as
						possible while protecting the safety and privacy of all AppsCombo users. If you&apos;re
						having trouble accessing your account, don&apos;t worry — our team is ready to assist.
					</P>
					<Link
						href="/support"
						className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors mt-2"
					>
						Contact support
					</Link>
				</Section>

				<p className="text-center text-xs text-gray-400 pt-2">AppsCombo — Connect. Engage. Grow.</p>
			</div>
		</>
	)
}
