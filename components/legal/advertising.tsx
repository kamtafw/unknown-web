import {
	BarChart2,
	Building2,
	Calendar,
	CheckCircle2,
	Handshake,
	Image as ImageIcon,
	LayoutGrid,
	Mail,
	Megaphone,
	ShieldAlert,
	Sparkles,
	Target,
	TrendingUp,
	Users,
	Video,
} from "lucide-react"
import Link from "next/link"

const BENEFITS = [
	"Reach targeted audiences",
	"Increase brand awareness",
	"Generate leads and inquiries",
	"Promote products and services",
	"Drive website traffic",
	"Boost app downloads",
	"Promote events and campaigns",
	"Grow followers and communities",
	"Recruit talent and employees",
	"Measure performance with detailed analytics",
]

const SOLUTIONS = [
	{
		icon: Megaphone,
		title: "Sponsored Posts",
		desc: "Promote content directly within users' feeds.",
		tags: ["Brand awareness", "Product launches", "Community engagement", "Audience growth"],
	},
	{
		icon: Video,
		title: "Video Advertising",
		desc: "Capture attention with engaging video campaigns.",
		tags: ["Product demos", "Brand storytelling", "Educational content", "Promotions"],
	},
	{
		icon: Building2,
		title: "Business Promotion",
		desc: "Increase visibility for your business page and connect with potential customers.",
		tags: ["Local businesses", "Startups", "SMEs", "Enterprises", "Nonprofits"],
	},
	{
		icon: Calendar,
		title: "Event Promotion",
		desc: "Promote events to targeted audiences and increase registrations.",
		tags: ["Conferences", "Workshops", "Concerts", "Corporate events", "Religious gatherings"],
	},
	{
		icon: Sparkles,
		title: "Creator Collaborations",
		desc: "Partner with creators and influencers to amplify your brand message.",
		tags: ["Authentic engagement", "Audience trust", "Expanded reach"],
	},
	{
		icon: Users,
		title: "Recruitment Advertising",
		desc: "Connect with qualified candidates and promote job opportunities.",
		tags: ["Recruitment agencies", "HR teams", "Hiring companies", "Institutions"],
	},
	{
		icon: Handshake,
		title: "Community Sponsorships",
		desc: "Support relevant communities and engage audiences around shared interests.",
		tags: ["Industry groups", "Education", "Associations", "Social causes"],
	},
]

const AD_FORMATS = [
	{
		icon: ImageIcon,
		title: "Image Ads",
		desc: "High-quality visuals for products, services, and announcements.",
	},
	{ icon: Video, title: "Video Ads", desc: "Engaging storytelling and promotional experiences." },
	{
		icon: LayoutGrid,
		title: "Carousel Ads",
		desc: "Showcase multiple products or offers in one ad.",
	},
	{
		icon: Megaphone,
		title: "Sponsored Content",
		desc: "Native ads integrated into the user experience.",
	},
	{ icon: Sparkles, title: "Story Ads", desc: "Full-screen, immersive advertising experiences." },
	{
		icon: Calendar,
		title: "Event Ads",
		desc: "Drive registrations, ticket sales, and attendance.",
	},
	{
		icon: Target,
		title: "Lead Generation Ads",
		desc: "Capture customer information directly on AppsCombo.",
	},
	{
		icon: TrendingUp,
		title: "Website Traffic Ads",
		desc: "Drive users to external sites and landing pages.",
	},
]

const TARGETING = [
	{ title: "Demographics", items: ["Age", "Gender", "Language", "Education level"] },
	{ title: "Geography", items: ["Country", "State", "Region", "City"] },
	{
		title: "Interests",
		items: [
			"Technology",
			"Business",
			"Education",
			"Sports",
			"Entertainment",
			"Health",
			"Finance",
			"Travel",
		],
	},
	{
		title: "Behaviors",
		items: [
			"Content engagement",
			"Community participation",
			"Event interests",
			"Professional interests",
		],
	},
]

const METRICS = [
	"Reach",
	"Impressions",
	"Clicks",
	"Engagement",
	"Video views",
	"Conversions",
	"Lead generation",
	"Audience growth",
	"Event registrations",
]

const MUST_COMPLY = [
	"Be accurate and truthful",
	"Comply with applicable laws",
	"Respect intellectual property rights",
	"Avoid deceptive practices",
	"Respect user privacy",
	"Clearly identify promotional content where required",
]

const PROHIBITED = [
	"Illegal products and services",
	"Fraudulent or misleading claims",
	"Harmful or dangerous content",
	"Hate speech and discrimination",
	"Adult or sexually exploitative content",
	"Intellectual property violations",
	"Malware or security risks",
]

const CONTACTS = [
	{ label: "Advertising Support", email: "advertising@appscombo.com" },
	{ label: "Business Development", email: "business@appscombo.com" },
	{ label: "Partnerships", email: "partnerships@appscombo.com" },
	{ label: "Enterprise Advertising", email: "enterprise@appscombo.com" },
]

export function Advertising() {
	return (
		<>
			{/* Hero */}
			<section className="bg-gray-50 py-16 sm:py-24 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
						Advertise on AppsCombo
					</p>
					<h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
						Reach the right audience.
						<br className="hidden sm:block" /> Grow your brand. Drive results.
					</h1>
					<p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8">
						AppsCombo connects people, communities, creators, professionals, organizations, and
						businesses worldwide — giving advertisers powerful tools to reach highly engaged
						audiences.
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
				{/* Benefits */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Why advertise with us
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Built for performance, not just visibility
					</h2>
					<div className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
						{BENEFITS.map((b) => (
							<div key={b} className="flex items-center gap-2.5">
								<CheckCircle2 size={16} className="text-primary shrink-0" />
								<span className="text-sm text-gray-600">{b}</span>
							</div>
						))}
					</div>
				</section>

				{/* Solutions */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Advertising solutions
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Flexible solutions for businesses of every size
					</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{SOLUTIONS.map(({ icon: Icon, title, desc, tags }) => (
							<div key={title} className="bg-gray-50 rounded-2xl p-6">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
									<Icon size={18} className="text-primary" />
								</div>
								<h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{title}</h3>
								<p className="text-sm text-gray-500 leading-relaxed mb-3">{desc}</p>
								<div className="flex flex-wrap gap-1.5">
									{tags.map((t) => (
										<span
											key={t}
											className="text-[11px] font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1"
										>
											{t}
										</span>
									))}
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
						Choose the right format for your campaign
					</h2>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
						{AD_FORMATS.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="flex flex-col gap-3">
								<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
									<Icon size={16} className="text-primary" />
								</div>
								<div>
									<h3 className="text-[13.5px] font-bold text-gray-900 mb-1">{title}</h3>
									<p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Targeting */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Audience targeting
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Reach the people who matter most
					</h2>
					<div className="grid sm:grid-cols-2 gap-6 mb-6">
						{TARGETING.map(({ title, items }) => (
							<div key={title} className="border border-gray-100 rounded-2xl p-6">
								<h3 className="text-[14px] font-bold text-gray-900 mb-3">{title}</h3>
								<div className="flex flex-wrap gap-1.5">
									{items.map((i) => (
										<span
											key={i}
											className="text-[11.5px] font-medium text-primary bg-primary/8 rounded-full px-2.5 py-1"
										>
											{i}
										</span>
									))}
								</div>
							</div>
						))}
					</div>
					<p className="text-sm text-gray-500 leading-relaxed">
						<span className="font-semibold text-gray-800">Custom audiences:</span> Advertisers may
						be able to create audiences using customer lists and approved data sources, subject to
						applicable laws and privacy regulations.
					</p>
				</section>

				{/* Analytics */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<div className="flex items-start gap-4 mb-6">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
							<BarChart2 size={20} className="text-primary" />
						</div>
						<div>
							<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
								Advertising analytics
							</h2>
							<p className="text-sm text-gray-500 leading-relaxed">
								Detailed campaign insights help advertisers understand performance and optimize
								campaigns to maximize return on investment.
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2">
						{METRICS.map((m) => (
							<span
								key={m}
								className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5"
							>
								{m}
							</span>
						))}
					</div>
				</section>

				{/* Policies */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Advertising policies
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Keeping ads safe and trustworthy
					</h2>
					<div className="grid sm:grid-cols-2 gap-8">
						<div>
							<h3 className="text-[14px] font-bold text-gray-900 mb-3">Advertisements must:</h3>
							<div className="space-y-2.5">
								{MUST_COMPLY.map((m) => (
									<div key={m} className="flex items-start gap-2.5">
										<CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
										<span className="text-sm text-gray-600">{m}</span>
									</div>
								))}
							</div>
						</div>
						<div className="bg-red-50 border border-red-100 rounded-2xl p-6">
							<div className="flex items-center gap-2 mb-3">
								<ShieldAlert size={16} className="text-destructive" />
								<h3 className="text-[14px] font-bold text-gray-900">Prohibited content</h3>
							</div>
							<div className="space-y-2">
								{PROHIBITED.map((p) => (
									<div key={p} className="flex items-start gap-2.5">
										<span className="w-1 h-1 rounded-full bg-red-400 mt-2 shrink-0" />
										<span className="text-sm text-red-600/80">{p}</span>
									</div>
								))}
							</div>
						</div>
					</div>
					<p className="text-sm text-gray-500 leading-relaxed mt-6">
						All advertisements may undergo review before publication, evaluating content quality,
						policy compliance, legal compliance, user safety, and intellectual property concerns.
						Ads may be approved, rejected, restricted, or require modification before publication.
					</p>
				</section>

				{/* Pricing & Enterprise */}
				<section className="py-12 sm:py-16 border-b border-gray-100 grid sm:grid-cols-2 gap-10">
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-3">Pricing and billing</h2>
						<p className="text-sm text-gray-500 leading-relaxed mb-3">
							AppsCombo offers flexible advertising options for organizations of all sizes.
							Campaigns may be based on impressions, clicks, engagement, leads, conversions, or
							event registrations.
						</p>
						<p className="text-sm text-gray-500 leading-relaxed">
							Detailed pricing information is available through the AppsCombo Ads Manager.
						</p>
					</div>
					<div>
						<h2 className="text-xl font-bold text-gray-900 mb-3">Agencies & enterprise</h2>
						<p className="text-sm text-gray-500 leading-relaxed">
							We support advertising agencies, large brands, and enterprise organizations with
							dedicated account management, strategic campaign support, advanced analytics,
							large-scale campaign management, and custom advertising solutions.
						</p>
					</div>
				</section>

				{/* Data privacy */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<h2 className="text-xl font-bold text-gray-900 mb-3">Data privacy and advertising</h2>
					<p className="text-sm text-gray-500 leading-relaxed max-w-3xl">
						AppsCombo is committed to responsible advertising practices. Our advertising systems are
						designed with privacy, security, and regulatory compliance in mind — we work to protect
						user information, respect privacy preferences, and provide transparency regarding our
						advertising practices. For more information, review our{" "}
						<Link href="/privacy-policy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						.
					</p>
				</section>

				{/* Contact */}
				<section className="py-12 sm:py-16">
					<h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
						Start advertising today
					</h2>
					<p className="text-gray-500 mb-10 text-center max-w-lg mx-auto">
						Reach more people. Build stronger relationships. Grow your impact.
					</p>
					<div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
						{CONTACTS.map(({ label, email }) => (
							<a
								key={label}
								href={`mailto:${email}`}
								className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-primary/5 border border-gray-100 transition-colors"
							>
								<div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
									<Mail size={15} className="text-primary" />
								</div>
								<div className="min-w-0">
									<p className="text-[13px] font-semibold text-gray-800">{label}</p>
									<p className="text-xs text-gray-500 truncate">{email}</p>
								</div>
							</a>
						))}
					</div>
				</section>
			</div>
		</>
	)
}
