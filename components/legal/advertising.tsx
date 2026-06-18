import {
	BarChart2,
	FileText,
	Image as ImageIcon,
	LayoutGrid,
	Target,
	TrendingUp,
	Users,
	Video,
} from "lucide-react"
import Link from "next/link"
import { LegalWrapper } from "./legal-wrapper"

const FORMATS = [
	{
		icon: ImageIcon,
		title: "Image Ads",
		desc: "Single or multi-image posts that appear natively in the feed. Supports JPG, PNG, and WebP up to 10 MB.",
	},
	{
		icon: Video,
		title: "Video Ads",
		desc: "Auto-playing video ads up to 60 seconds. Ideal for brand awareness and product demonstrations.",
	},
	{
		icon: LayoutGrid,
		title: "Carousel Ads",
		desc: "Swipeable multi-card format showcasing multiple products, features, or stories in a single placement.",
	},
	{
		icon: FileText,
		title: "Promoted Posts",
		desc: "Boost existing organic content to a wider audience beyond your current followers.",
	},
]

const REASONS = [
	{
		icon: Target,
		title: "Precise Targeting",
		desc: "Reach users by location, interests, age, behaviour, and more. Build custom audiences or use lookalike targeting.",
	},
	{
		icon: Users,
		title: "Engaged Audience",
		desc: "AppsCombo users spend an average of 28 minutes per session. Reach people when they are most receptive.",
	},
	{
		icon: BarChart2,
		title: "Real-time Analytics",
		desc: "Full-funnel reporting from impression to conversion. Export reports or connect to your preferred BI tool.",
	},
	{
		icon: TrendingUp,
		title: "Scalable Budgets",
		desc: "Start with as little as $5/day. Set daily or lifetime budgets and pause or adjust campaigns anytime.",
	},
]

export function Advertising() {
	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-16 sm:py-24 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
						Advertise on AppsCombo
					</p>
					<h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
						Reach millions of
						<br className="hidden sm:block" /> engaged users
					</h1>
					<p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
						AppsCombo Ads gives businesses of every size access to a highly engaged, growing
						audience with tools that make advertising simple and measurable.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center h-12 px-8 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Talk to our sales team
					</Link>
				</div>
			</section>

			<div className="max-w-5xl mx-auto px-4 sm:px-8">
				{/* Stats banner */}
				<section className="py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8 border-b border-gray-100">
					{[
						{ value: "2M+", label: "Monthly active users" },
						{ value: "50+", label: "Countries reached" },
						{ value: "3.2×", label: "Average ROAS reported" },
						{ value: "28 min", label: "Avg. session duration" },
					].map(({ value, label }) => (
						<div key={label} className="text-center">
							<p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
							<p className="text-sm text-gray-500 mt-1">{label}</p>
						</div>
					))}
				</section>

				{/* Why AppsCombo */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Why us
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Built for performance
					</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{REASONS.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="flex gap-4">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<Icon size={18} className="text-primary" />
								</div>
								<div>
									<h3 className="text-[14px] font-bold text-gray-900 mb-1">{title}</h3>
									<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Ad formats */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Ad formats
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Choose the right format
					</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{FORMATS.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="bg-gray-50 rounded-2xl p-6">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
									<Icon size={18} className="text-primary" />
								</div>
								<h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
								<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Policies note */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<div className="bg-amber-50 rounded-2xl p-6 sm:p-8 border border-amber-100">
						<h3 className="text-[15px] font-bold text-gray-900 mb-2">Advertising policies</h3>
						<p className="text-sm text-gray-600 leading-relaxed mb-3">
							All ads on AppsCombo must comply with our community guidelines and advertising
							policies. We prohibit ads that promote misleading claims, illegal products, hate
							speech, or content that targets vulnerable groups. Ads are reviewed before going live.
						</p>
						<Link href="/terms" className="text-sm font-semibold text-primary hover:underline">
							Read our full advertising policies →
						</Link>
					</div>
				</section>

				{/* CTA */}
				<section className="py-12 sm:py-16 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to grow your business?</h2>
					<p className="text-gray-500 mb-6 max-w-lg mx-auto">
						Our sales team is available to discuss targeting, creative strategy, and custom
						packages.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center h-12 px-8 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Contact sales
					</Link>
				</section>
			</div>
		</LegalWrapper>
	)
}
