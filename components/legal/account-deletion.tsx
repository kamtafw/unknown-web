import { AlertTriangle,ArrowRight,CheckCircle,Download,Info,Smartphone } from "lucide-react"
import Link from "next/link"

const WHAT_GETS_DELETED = [
	"Your profile, posts, and media will be permanently deleted",
	"All followers and following relationships will be removed",
	"Messages, bookmarks, and search history will be erased",
	"Community memberships and event participation records",
	"Account settings and activity logs associated with your account",
]

const WHAT_REMAINS = [
	"Messages you sent to other users — recipients retain their copy",
	"Content that other users have reposted, quoted, or saved before deletion",
	"Security, fraud prevention, and financial transaction records",
	"Information required by applicable laws and regulations",
]

const DELETE_METHODS = [
	{
		icon: Smartphone,
		title: "Through the App",
		steps: [
			"Open the AppsCombo app.",
			"Navigate to Settings → Account Settings.",
			'Choose "Delete Account."',
			"Review the information, confirm your identity, and submit.",
		],
	},
	{
		icon: ArrowRight,
		title: "Through the Website",
		steps: [
			"Sign in to your AppsCombo account.",
			"Go to Account Settings → Privacy & Security.",
			'Click "Delete Account."',
			"Review the deletion information, confirm your password, and submit.",
		],
	},
	{
		icon: Info,
		title: "Submit a Deletion Request",
		steps: [
			"If you can't access your account, email support@appscombo.com.",
			"Include your full name, registered email, and username (if available).",
			"Additional identity verification may be required to protect against unauthorized requests.",
		],
	},
]

const RIGHTS = [
	"General Data Protection Regulation (GDPR)",
	"Nigeria Data Protection Act (NDPA)",
	"California Consumer Privacy Act (CCPA)",
	"Other applicable privacy laws",
]

export function AccountDeletion() {
	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Delete your account</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						We are sorry to see you go. This page explains exactly what happens when you delete your
						account and how to do it. Please read carefully before proceeding — deletion is
						permanent.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12">
				{/* Warning */}
				<div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
					<AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
					<div>
						<p className="text-[14px] font-semibold text-gray-900 mb-2">
							Before you delete your account
						</p>
						<p className="text-sm text-gray-600 leading-relaxed mb-3">
							When your account is deleted:
						</p>
						<ul className="space-y-1.5">
							{[
								"Your profile will be removed from AppsCombo",
								"Your login credentials will be permanently disabled",
								"Posts, photos, videos, and comments may be removed from public view",
								"You will lose access to communities, groups, events, and messages",
								"You will lose access to subscriptions, premium features, and purchased services",
							].map((item) => (
								<li key={item} className="flex items-start gap-2 text-sm text-red-600/80">
									<span className="w-1 h-1 rounded-full bg-red-400 mt-1.75 shrink-0" />
									{item}
								</li>
							))}
						</ul>
						<p className="text-sm text-gray-600 leading-relaxed mt-3">
							Once the deletion process is completed, your account cannot be recovered.
						</p>
					</div>
				</div>

				{/* How to delete */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-6">How to delete your account</h2>
					<div className="space-y-5">
						{DELETE_METHODS.map(({ icon: Icon, title, steps }) => (
							<div key={title} className="border border-gray-100 rounded-2xl p-6">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
										<Icon size={16} className="text-primary" />
									</div>
									<h3 className="text-[15px] font-bold text-gray-900">{title}</h3>
								</div>
								<ol className="space-y-2">
									{steps.map((s, i) => (
										<li key={i} className="flex items-start gap-3">
											<span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
												{i + 1}
											</span>
											<p className="text-sm text-gray-600 leading-relaxed">{s}</p>
										</li>
									))}
								</ol>
							</div>
						))}
					</div>
				</div>

				{/* What gets deleted */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-5">What gets deleted</h2>
					<div className="space-y-3">
						{WHAT_GETS_DELETED.map((item) => (
							<div key={item} className="flex items-start gap-3">
								<div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
								<p className="text-sm text-gray-600">{item}</p>
							</div>
						))}
					</div>
				</div>

				{/* What stays */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-5">What may remain</h2>
					<div className="space-y-3">
						{WHAT_REMAINS.map((item) => (
							<div key={item} className="flex items-start gap-3">
								<CheckCircle size={15} className="text-gray-400 mt-0.5 shrink-0" />
								<p className="text-sm text-gray-600">{item}</p>
							</div>
						))}
					</div>
					<p className="text-xs text-gray-400 mt-4 leading-relaxed">
						Deletion of your account does not automatically remove copies of content previously
						shared by others.
					</p>
				</div>

				{/* Timeline */}
				<div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 sm:p-8">
					<h2 className="text-[15px] font-bold text-gray-900 mb-4">Account deletion timeline</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						<div>
							<p className="text-sm font-semibold text-gray-800 mb-1">Immediate actions</p>
							<p className="text-sm text-gray-600 leading-relaxed">
								Your account may be deactivated immediately and access to AppsCombo services
								restricted.
							</p>
						</div>
						<div>
							<p className="text-sm font-semibold text-gray-800 mb-1">Processing period</p>
							<p className="text-2xl font-bold text-primary mb-1">30 days</p>
							<p className="text-xs text-gray-500 leading-relaxed">
								May take longer where legal obligations, security reviews, or fraud investigations
								apply.
							</p>
						</div>
					</div>
					<p className="text-sm text-gray-600 leading-relaxed mt-5 pt-5 border-t border-primary/10">
						<span className="font-semibold text-gray-800">You can cancel anytime:</span> if your
						account enters a grace period before permanent deletion, simply log back in to cancel
						the request. After permanent deletion occurs, recovery is no longer possible.
					</p>
				</div>

				{/* Download data + business accounts */}
				<div className="grid sm:grid-cols-2 gap-6">
					<div className="border border-gray-100 rounded-2xl p-6">
						<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
							<Download size={16} className="text-primary" />
						</div>
						<h3 className="text-[14px] font-bold text-gray-900 mb-2">Download your data first</h3>
						<p className="text-sm text-gray-500 leading-relaxed">
							Before deleting, we recommend downloading a copy of your profile, posts, photos,
							videos, messages, events, and activity history via the Download Your Data feature in
							Account Settings.
						</p>
					</div>
					<div className="border border-gray-100 rounded-2xl p-6">
						<div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
							<Info size={16} className="text-primary" />
						</div>
						<h3 className="text-[14px] font-bold text-gray-900 mb-2">
							Manage business accounts first
						</h3>
						<p className="text-sm text-gray-500 leading-relaxed">
							If you manage business pages, communities, events, or creator accounts, transfer
							ownership or administrative access before deleting your primary account.
						</p>
					</div>
				</div>

				{/* Privacy rights */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-3">
						Privacy and data protection rights
					</h2>
					<p className="text-sm text-gray-500 leading-relaxed mb-4">
						AppsCombo respects user privacy rights under applicable laws and regulations, including
						the following — you may request access, correction, portability, deletion, or
						restriction of processing where applicable.
					</p>
					<div className="flex flex-wrap gap-2">
						{RIGHTS.map((r) => (
							<span
								key={r}
								className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5"
							>
								{r}
							</span>
						))}
					</div>
				</div>

				{/* Delete CTA */}
				<div className="border-t border-gray-100 pt-10">
					<p className="text-sm text-gray-500 mb-5">
						By submitting a deletion request, you acknowledge that deletion is permanent, certain
						information may be retained where legally required, and deleted accounts cannot be
						restored after the process is completed. Ready to proceed? Sign in to your account and
						follow the steps above.
					</p>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link
							href="/sign-in"
							className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
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
				</div>
			</div>
		</>
	)
}
