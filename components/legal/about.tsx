import Link from "next/link"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="mb-10 sm:mb-12">
			<h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight mb-4">{title}</h2>
			{children}
		</section>
	)
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="mt-5">
			<h3 className="text-sm font-semibold text-foreground mb-2">{title}</h3>
			{children}
		</div>
	)
}

function P({ children }: { children: React.ReactNode }) {
	return <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>
}

function UL({ children }: { children: React.ReactNode }) {
	return (
		<ul className="list-disc pl-5 sm:pl-6 mb-3 text-[13px] sm:text-sm text-muted-foreground leading-relaxed space-y-1">
			{children}
		</ul>
	)
}

function Divider() {
	return <hr className="border-border-100 my-8 sm:my-10" />
}

export function About() {
	return (
		<>
			{/* Hero */}
			<section className="py-14 sm:py-20 px-4 border-b border-border-100">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						About AppsCombo
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
						Connecting people, communities, businesses, and opportunities
					</h1>
					<p className="text-muted-foreground leading-relaxed max-w-2xl">
						AppsCombo is a next-generation social networking platform designed to help people
						connect, communicate, collaborate, and build meaningful relationships in an increasingly
						digital world. We believe social media should be more than likes, follows, and endless
						scrolling — it should be a place where people discover opportunities, grow communities,
						share experiences, build businesses, attend events, learn new skills, and create lasting
						connections.
					</p>
					<p className="text-muted-foreground font-medium leading-relaxed max-w-2xl mt-4">
						AppsCombo was created with a simple mission: to bring people, communities, businesses,
						creators, professionals, and organizations together on one powerful platform.
					</p>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Who we are">
					<P>
						AppsCombo is a global social platform that combines the best elements of social
						networking, professional networking, community engagement, event management, creator
						tools, and digital collaboration into a single ecosystem. Whether you are:
					</P>
					<UL>
						<li>An individual looking to connect with friends and family</li>
						<li>A creator building an audience</li>
						<li>A student seeking knowledge and opportunities</li>
						<li>A professional growing your career</li>
						<li>A business expanding your customer base</li>
						<li>An organization building communities</li>
						<li>An event organizer managing attendees</li>
					</UL>
					<P>AppsCombo provides the tools you need to connect and succeed.</P>
				</Section>

				<Divider />

				<Section title="Our vision">
					<P>
						Our vision is to become the world&apos;s most inclusive digital community — where every
						person, creator, business, and organization can connect, share, collaborate, and thrive.
						We envision a future where technology breaks barriers, creates opportunities, and
						empowers people regardless of location, background, or industry.
					</P>
				</Section>

				<Divider />

				<Section title="Our mission">
					<P>Our mission is to build innovative digital experiences that:</P>
					<UL>
						<li>Strengthen human connections</li>
						<li>Empower creators and innovators</li>
						<li>Support businesses and entrepreneurs</li>
						<li>Promote learning and collaboration</li>
						<li>Foster vibrant communities</li>
						<li>Enable meaningful engagement</li>
						<li>Create opportunities for personal and professional growth</li>
					</UL>
				</Section>

				<Divider />

				<Section title="What makes AppsCombo different">
					<P>
						Unlike traditional social media platforms that focus primarily on content sharing,
						AppsCombo is designed as a complete social ecosystem.
					</P>
					<SubSection title="Social networking">
						<P>
							Connect with friends, family, colleagues, and communities through posts, comments,
							messaging, groups, and interactive experiences.
						</P>
					</SubSection>
					<SubSection title="Professional networking">
						<P>
							Build your professional profile, showcase your skills, connect with industry
							professionals, and discover career opportunities.
						</P>
					</SubSection>
					<SubSection title="Community building">
						<P>
							Create and manage communities around interests, industries, causes, educational
							topics, and shared experiences.
						</P>
					</SubSection>
					<SubSection title="Event management">
						<P>Plan, organize, promote, and manage events of all sizes, including:</P>
						<UL>
							<li>Conferences, seminars, and workshops</li>
							<li>Weddings and parties</li>
							<li>Religious gatherings</li>
							<li>Educational programs</li>
							<li>Corporate events</li>
						</UL>
					</SubSection>
					<SubSection title="Creator economy">
						<P>
							AppsCombo provides creators with tools to grow audiences, share content, monetize
							influence, build personal brands, and engage communities.
						</P>
					</SubSection>
					<SubSection title="Business growth">
						<P>
							Businesses can leverage AppsCombo to reach new customers, build brand awareness,
							promote products and services, engage directly with audiences, run targeted campaigns,
							and analyze customer engagement.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Our platform features">
					<SubSection title="Profiles">
						<P>
							Personal, professional, business, and organizational profiles tailored to different
							user needs.
						</P>
					</SubSection>
					<SubSection title="News feed">
						<P>
							A personalized content experience designed to help users discover relevant and
							meaningful content.
						</P>
					</SubSection>
					<SubSection title="Messaging">
						<P>Secure one-on-one and group communication tools that help users stay connected.</P>
					</SubSection>
					<SubSection title="Media sharing">
						<P>Share photos, videos, audio, stories, live streams, and documents.</P>
					</SubSection>
					<SubSection title="Groups and communities">
						<P>
							Create public or private spaces where people can learn, discuss, collaborate, and
							engage.
						</P>
					</SubSection>
					<SubSection title="Events">
						<P>
							Manage invitations, registrations, guest lists, attendance tracking, announcements,
							and post-event engagement.
						</P>
					</SubSection>
					<SubSection title="Business pages">
						<P>
							Dedicated spaces for businesses and organizations to interact with customers and
							followers.
						</P>
					</SubSection>
					<SubSection title="Marketplace and opportunities">
						<P>
							Connect users with opportunities including jobs, freelance projects, partnerships,
							business opportunities, and networking events.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Innovation through technology">
					<P>
						At AppsCombo, innovation is at the heart of everything we do. We leverage modern
						technologies including artificial intelligence, machine learning, cloud infrastructure,
						advanced security systems, data analytics, and real-time communication technologies to
						deliver a smarter, safer, and more personalized experience.
					</P>
					<P>
						Our technology helps users discover relevant content, connect with the right people, and
						engage with communities that matter most to them.
					</P>
				</Section>

				<Divider />

				<Section title="Privacy and security">
					<P>
						Trust is fundamental to every digital interaction. AppsCombo is committed to protecting
						user privacy and maintaining a secure environment for all users. We continuously invest
						in data protection, account security, fraud prevention, platform integrity, content
						moderation, and privacy controls to ensure that our community remains safe and
						trustworthy.
					</P>
				</Section>

				<Divider />

				<Section title="Supporting creators, businesses, and communities">
					<SubSection title="Creators">
						<P>
							Helping creators grow audiences, build influence, and create sustainable
							opportunities.
						</P>
					</SubSection>
					<SubSection title="Businesses">
						<P>
							Providing tools for customer engagement, marketing, advertising, analytics, and
							growth.
						</P>
					</SubSection>
					<SubSection title="Communities">
						<P>Enabling meaningful discussions, collaboration, education, and collective impact.</P>
					</SubSection>
					<SubSection title="Professionals">
						<P>Supporting career development, networking, recruitment, and professional growth.</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Our commitment">
					<P>We are committed to building a platform that is:</P>
					<UL>
						<li>Inclusive</li>
						<li>Innovative</li>
						<li>Secure</li>
						<li>Transparent</li>
						<li>Reliable</li>
						<li>Community-driven</li>
					</UL>
					<P>
						We continuously listen to our users and evolve our platform to meet the changing needs
						of a connected world.
					</P>
				</Section>

				<Divider />

				<Section title="Looking ahead">
					<P>
						The future of social interaction is not just about sharing content — it is about
						creating opportunities, building relationships, fostering communities, and empowering
						people to achieve more together. AppsCombo is dedicated to shaping that future, and as
						we grow, our focus remains on delivering meaningful digital experiences that connect
						people, strengthen communities, and create opportunities worldwide.
					</P>
				</Section>

				<Divider />

				<section className="text-center pt-2">
					<h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
						Join the AppsCombo community
					</h2>
					<p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-7">
						Whether you&apos;re here to connect, learn, create, collaborate, promote your business,
						organize events, or discover new opportunities — together, we are building a smarter,
						more connected future.
					</p>
					<Link
						href="/sign-up"
						className="inline-flex items-center h-11 px-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors"
					>
						Create an account
					</Link>
					<p className="text-xs text-muted-foreground mt-8">AppsCombo — Connect. Engage. Grow.</p>
				</section>
			</div>
		</>
	)
}
