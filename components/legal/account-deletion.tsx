import { AlertTriangle, ArrowRight, CheckCircle, Info } from "lucide-react"
import Link from "next/link"
import { LegalWrapper } from "./legal-wrapper"

const WHAT_GETS_DELETED = [
	"Your profile, display name, username, and bio",
	"All posts, reposts, quotes, and comments you have made",
	"Your direct messages and group conversations",
	"Bookmarks, likes, and saved content",
	"Follower and following relationships",
	"Marketplace listings and purchase history",
	"Event registrations and created events",
	"Connected third-party app authorisations",
]

const WHAT_REMAINS = [
	"Messages you sent to other users — recipients retain their copy",
	"Content that other users have reposted or quoted before deletion",
	"Aggregated, anonymised analytics data used for platform improvements",
	"Legal records we are required to retain under applicable law",
]

const STEPS = [
	{
		step: "1",
		title: "Sign in",
		desc: "Log in to the account you wish to delete. Account deletion must be initiated by the account owner.",
	},
	{
		step: "2",
		title: "Go to Settings",
		desc: 'Open Settings from the sidebar, then navigate to Account → "Delete your account".',
	},
	{
		step: "3",
		title: "Verify your identity",
		desc: "Enter your phone number and password to confirm it is really you making this request.",
	},
	{
		step: "4",
		title: "Confirm deletion",
		desc: "Review the consequences and confirm. Your account enters a 30-day deactivation window before permanent deletion.",
	},
]

export function AccountDeletion() {
	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-12 sm:py-16 px-4 border-b border-gray-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Account
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Delete your account</h1>
					<p className="text-gray-500 leading-relaxed max-w-xl">
						We are sorry to see you go. This page explains exactly what happens when you delete your
						account and how to do it. Please read carefully before proceeding.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16 space-y-12">
				{/* Warning */}
				<div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex gap-4">
					<AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
					<div>
						<p className="text-[14px] font-semibold text-gray-900 mb-1">
							Account deletion is permanent
						</p>
						<p className="text-sm text-gray-600 leading-relaxed">
							After the 30-day grace period, your account and all associated data will be
							permanently deleted and cannot be recovered. Consider downloading your data before
							proceeding.
						</p>
					</div>
				</div>

				{/* Grace period */}
				<div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex gap-4">
					<Info size={20} className="text-primary shrink-0 mt-0.5" />
					<div>
						<p className="text-[14px] font-semibold text-gray-900 mb-1">30-day grace period</p>
						<p className="text-sm text-gray-600 leading-relaxed">
							When you request deletion, your account is deactivated immediately but not permanently
							deleted for 30 days. If you sign back in during this window, deletion is cancelled and
							your account is fully restored.
						</p>
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
				</div>

				{/* Steps */}
				<div>
					<h2 className="text-xl font-bold text-gray-900 mb-6">How to delete your account</h2>
					<div className="space-y-4">
						{STEPS.map(({ step, title, desc }) => (
							<div key={step} className="flex gap-5">
								<div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
									{step}
								</div>
								<div className="pt-1">
									<p className="text-[14px] font-semibold text-gray-900 mb-1">{title}</p>
									<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Alternative */}
				<div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
					<h3 className="text-[15px] font-bold text-gray-900 mb-2">
						Consider deactivating instead
					</h3>
					<p className="text-sm text-gray-500 leading-relaxed mb-4">
						Deactivation hides your profile and content without permanently deleting your data. You
						can reactivate at any time by simply signing back in.
					</p>
					<Link
						href="/sign-in"
						className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
					>
						Go to settings to deactivate <ArrowRight size={14} />
					</Link>
				</div>

				{/* Delete CTA */}
				<div className="border-t border-gray-100 pt-10">
					<p className="text-sm text-gray-500 mb-5">
						Ready to proceed? Sign in to your account and follow the steps above. If you have
						trouble, contact our support team.
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
		</LegalWrapper>
	)
}
