import { LegalWrapper } from "./legal-wrapper"
import { Users, Globe, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

const PILLARS = [
	{
		icon: Users,
		title: "Community First",
		desc: "We build features that bring people together — from neighbourhood groups to global communities built around shared passions.",
	},
	{
		icon: Globe,
		title: "Global by Design",
		desc: "AppsCombo is available in 50+ countries and growing. Every product decision is made with a global audience in mind.",
	},
	{
		icon: ShieldCheck,
		title: "Safe by Default",
		desc: "Safety is not a feature we toggle on — it's built into every layer of the platform, from moderation tools to end-to-end encrypted messaging.",
	},
	{
		icon: Zap,
		title: "Always Innovating",
		desc: "From AI-assisted content creation to real-time marketplace discovery, we are constantly pushing what a social platform can be.",
	},
]

const STATS = [
	{ value: "2M+", label: "Active users" },
	{ value: "50+", label: "Countries" },
	{ value: "500K+", label: "Posts per day" },
	{ value: "99.9%", label: "Platform uptime" },
]

const VALUES = [
	{ title: "Transparency", desc: "We communicate openly with our community about how we operate, what we collect, and how decisions are made." },
	{ title: "Inclusion", desc: "AppsCombo is built for everyone. We actively work to remove barriers that prevent people from participating fully." },
	{ title: "Accountability", desc: "When we make mistakes, we own them. Our trust and safety team is reachable and responsive." },
	{ title: "Privacy", desc: "Your data belongs to you. We never sell personal information and give you meaningful controls over what you share." },
]

export function About() {
	return (
		<LegalWrapper>
			{/* Hero */}
			<section className="bg-gray-50 py-16 sm:py-24 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">About AppsCombo</p>
					<h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
						Connecting people,<br className="hidden sm:block" /> building communities
					</h1>
					<p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
						AppsCombo is a next-generation social platform combining social media, marketplace,
						events, and messaging — all in one place.
					</p>
				</div>
			</section>

			<div className="max-w-5xl mx-auto px-4 sm:px-8">
				{/* Stats */}
				<section className="py-12 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8 border-b border-gray-100">
					{STATS.map(({ value, label }) => (
						<div key={label} className="text-center">
							<p className="text-3xl sm:text-4xl font-bold text-gray-900">{value}</p>
							<p className="text-sm text-gray-500 mt-1">{label}</p>
						</div>
					))}
				</section>

				{/* Mission */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<div className="grid sm:grid-cols-2 gap-10 items-center">
						<div>
							<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Our Mission</p>
							<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
								Technology that brings people closer
							</h2>
							<p className="text-gray-500 leading-relaxed mb-4">
								We started AppsCombo because we believed that social platforms had stopped serving people
								and started serving advertisers. Our mission is to reverse that — to build a platform where
								the user experience always comes first.
							</p>
							<p className="text-gray-500 leading-relaxed">
								Founded in 2023, we are a fast-growing team of engineers, designers, and community builders
								who believe technology can be both powerful and humane.
							</p>
						</div>
						<div className="bg-gray-50 rounded-3xl p-8 sm:p-10">
							<blockquote className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed italic">
								&quot;We&apos;re building the platform we always wanted to use — one that respects your time,
								your privacy, and your community.&quot;
							</blockquote>
							<p className="text-sm text-gray-400 mt-4">— AppsCombo Founding Team</p>
						</div>
					</div>
				</section>

				{/* Pillars */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">What we stand for</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">Our four pillars</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{PILLARS.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="bg-gray-50 rounded-2xl p-6">
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
									<Icon size={20} className="text-primary" />
								</div>
								<h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
								<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Values */}
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">Core values</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">How we operate</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{VALUES.map(({ title, desc }) => (
							<div key={title} className="flex gap-4">
								<div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
								<div>
									<h3 className="text-[14px] font-bold text-gray-900 mb-1">{title}</h3>
									<p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* CTA */}
				<section className="py-12 sm:py-16 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to join?</h2>
					<p className="text-gray-500 mb-6">Create your free account and start connecting today.</p>
					<Link
						href="/sign-up"
						className="inline-flex items-center h-12 px-8 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Create an account
					</Link>
				</section>
			</div>
		</LegalWrapper>
	)
}