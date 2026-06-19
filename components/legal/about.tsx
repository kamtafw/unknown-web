import {
	Briefcase,
	Building2,
	Calendar,
	Cpu,
	Globe,
	Image as ImageIcon,
	Lock,
	MessageCircle,
	Newspaper,
	ShoppingBag,
	Sparkles,
	TrendingUp,
	Users,
} from "lucide-react"
import Link from "next/link"

const DIFFERENTIATORS = [
	{
		icon: Users,
		title: "Social Networking",
		desc: "Connect with friends, family, colleagues, and communities through posts, comments, messaging, groups, and interactive experiences.",
	},
	{
		icon: Briefcase,
		title: "Professional Networking",
		desc: "Build your professional profile, showcase your skills, connect with industry professionals, and discover career opportunities.",
	},
	{
		icon: Globe,
		title: "Community Building",
		desc: "Create and manage communities around interests, industries, causes, educational topics, and shared experiences.",
	},
	{
		icon: Calendar,
		title: "Event Management",
		desc: "Plan, organize, promote, and manage events of all sizes — from conferences and workshops to weddings and corporate events.",
	},
	{
		icon: Sparkles,
		title: "Creator Economy",
		desc: "Tools for creators to grow audiences, share content, monetize influence, build personal brands, and engage communities.",
	},
	{
		icon: TrendingUp,
		title: "Business Growth",
		desc: "Reach new customers, build brand awareness, promote products and services, and run targeted campaigns with engagement analytics.",
	},
]

const FEATURES = [
	{
		icon: Users,
		title: "Profiles",
		desc: "Personal, professional, business, and organizational profiles tailored to different user needs.",
	},
	{
		icon: Newspaper,
		title: "News Feed",
		desc: "A personalized content experience built to surface relevant and meaningful content.",
	},
	{
		icon: MessageCircle,
		title: "Messaging",
		desc: "Secure one-on-one and group communication tools that keep people connected.",
	},
	{
		icon: ImageIcon,
		title: "Media Sharing",
		desc: "Share photos, videos, audio, stories, live streams, and documents.",
	},
	{
		icon: Globe,
		title: "Groups & Communities",
		desc: "Public or private spaces to learn, discuss, collaborate, and engage.",
	},
	{
		icon: Calendar,
		title: "Events",
		desc: "Manage invitations, registrations, guest lists, attendance, and post-event engagement.",
	},
	{
		icon: Building2,
		title: "Business Pages",
		desc: "Dedicated spaces for businesses and organizations to interact with customers and followers.",
	},
	{
		icon: ShoppingBag,
		title: "Marketplace & Opportunities",
		desc: "Discover jobs, freelance projects, partnerships, and networking opportunities.",
	},
]

const SUPPORT_GROUPS = [
	{
		title: "Creators",
		desc: "Helping creators grow audiences, build influence, and create sustainable opportunities.",
	},
	{
		title: "Businesses",
		desc: "Providing tools for customer engagement, marketing, advertising, analytics, and growth.",
	},
	{
		title: "Communities",
		desc: "Enabling meaningful discussions, collaboration, education, and collective impact.",
	},
	{
		title: "Professionals",
		desc: "Supporting career development, networking, recruitment, and professional growth.",
	},
]

const COMMITMENTS = [
	"Inclusive",
	"Innovative",
	"Secure",
	"Transparent",
	"Reliable",
	"Community-driven",
]

export function About() {
	return (
		<>
			<section className="bg-gray-50 py-16 sm:py-24 px-4">
				<div className="max-w-3xl mx-auto text-center">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-4">
						About AppsCombo
					</p>
					<h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
						Connecting people, communities,
						<br className="hidden sm:block" /> businesses, and opportunities
					</h1>
					<p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
						AppsCombo is a next-generation social networking platform designed to help people
						connect, communicate, collaborate, and build meaningful relationships in an increasingly
						digital world.
					</p>
				</div>
			</section>

			<div className="max-w-5xl mx-auto px-4 sm:px-8">
				<section className="py-12 sm:py-16 border-b border-gray-100">
					<div className="grid sm:grid-cols-2 gap-10 items-center">
						<div>
							<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
								Who we are
							</p>
							<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-snug">
								A complete social ecosystem
							</h2>
							<p className="text-gray-500 leading-relaxed mb-4">
								We believe social media should be more than likes, follows, and endless scrolling.
								It should be a place where people discover opportunities, grow communities, share
								experiences, build businesses, attend events, learn new skills, and create lasting
								connections.
							</p>
							<p className="text-gray-500 leading-relaxed">
								AppsCombo combines the best elements of social networking, professional networking,
								community engagement, event management, creator tools, and digital collaboration
								into a single ecosystem.
							</p>
						</div>
						<div className="bg-gray-50 rounded-3xl p-8 sm:p-10">
							<blockquote className="text-lg sm:text-xl font-medium text-gray-800 leading-relaxed">
								&quot;To bring people, communities, businesses, creators, professionals, and
								organizations together on one powerful platform.&quot;
							</blockquote>
							<p className="text-sm text-gray-400 mt-4">— Our Mission</p>
						</div>
					</div>
				</section>

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<div className="grid sm:grid-cols-2 gap-10">
						<div>
							<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
								Our vision
							</p>
							<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-snug">
								The world&apos;s most inclusive digital community
							</h2>
							<p className="text-gray-500 leading-relaxed">
								We envision a future where every person, creator, business, and organization can
								connect, share, collaborate, and thrive — where technology breaks barriers, creates
								opportunities, and empowers people regardless of location, background, or industry.
							</p>
						</div>
						<div>
							<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
								Our mission
							</p>
							<h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-snug">
								Building experiences that empower
							</h2>
							<ul className="space-y-2">
								{[
									"Strengthen human connections",
									"Empower creators and innovators",
									"Support businesses and entrepreneurs",
									"Promote learning and collaboration",
									"Foster vibrant communities",
									"Create opportunities for personal and professional growth",
								].map((item) => (
									<li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
										<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.75 shrink-0" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						What makes us different
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						A complete social ecosystem, not just a feed
					</h2>
					<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{DIFFERENTIATORS.map(({ icon: Icon, title, desc }) => (
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

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Platform features
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Everything you need, in one place
					</h2>
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
						{FEATURES.map(({ icon: Icon, title, desc }) => (
							<div key={title} className="flex flex-col gap-3">
								<div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
									<Icon size={17} className="text-primary" />
								</div>
								<div>
									<h3 className="text-[13.5px] font-bold text-gray-900 mb-1">{title}</h3>
									<p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="py-12 sm:py-16 border-b border-gray-100 grid sm:grid-cols-2 gap-10">
					<div>
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
							<Cpu size={20} className="text-primary" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-3">Innovation through technology</h2>
						<p className="text-sm text-gray-500 leading-relaxed mb-4">
							We leverage modern technologies — including artificial intelligence, machine learning,
							cloud infrastructure, advanced security systems, data analytics, and real-time
							communication — to deliver a smarter, safer, and more personalized experience.
						</p>
						<p className="text-sm text-gray-500 leading-relaxed">
							Our technology helps users discover relevant content, connect with the right people,
							and engage with communities that matter most to them.
						</p>
					</div>
					<div>
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
							<Lock size={20} className="text-primary" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-3">Privacy and security</h2>
						<p className="text-sm text-gray-500 leading-relaxed mb-4">
							Trust is fundamental to every digital interaction. We continuously invest in data
							protection, account security, fraud prevention, platform integrity, content
							moderation, and privacy controls.
						</p>
						<p className="text-sm text-gray-500 leading-relaxed">
							This ensures our community remains safe and trustworthy as it grows.
						</p>
					</div>
				</section>

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Built to support everyone
					</p>
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10">
						Creators, businesses, communities, and professionals
					</h2>
					<div className="grid sm:grid-cols-2 gap-6">
						{SUPPORT_GROUPS.map(({ title, desc }) => (
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

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Our commitment</h2>
					<p className="text-gray-500 leading-relaxed mb-6 max-w-2xl">
						We continuously listen to our users and evolve our platform to meet the changing needs
						of a connected world. We are committed to building a platform that is:
					</p>
					<div className="flex flex-wrap gap-2.5">
						{COMMITMENTS.map((c) => (
							<span
								key={c}
								className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
							>
								{c}
							</span>
						))}
					</div>
				</section>

				<section className="py-12 sm:py-16 border-b border-gray-100">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Looking ahead</h2>
					<p className="text-gray-500 leading-relaxed max-w-3xl">
						The future of social interaction is not just about sharing content — it is about
						creating opportunities, building relationships, fostering communities, and empowering
						people to achieve more together. As we continue to grow, our focus remains on delivering
						meaningful digital experiences that connect people, strengthen communities, and create
						opportunities worldwide.
					</p>
				</section>

				<section className="py-12 sm:py-16 text-center">
					<h2 className="text-2xl font-bold text-gray-900 mb-3">Join the AppsCombo community</h2>
					<p className="text-gray-500 mb-6">
						Connect, learn, create, collaborate, promote your business, organize events, or discover
						new opportunities — together.
					</p>
					<Link
						href="/sign-up"
						className="inline-flex items-center h-12 px-8 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Create an account
					</Link>
				</section>
			</div>
		</>
	)
}
