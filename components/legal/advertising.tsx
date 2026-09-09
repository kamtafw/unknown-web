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
	return <hr className="border-border my-8 sm:my-10" />
}

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
			<section className="py-14 sm:py-20 px-4 border-b border-border">
				<div className="max-w-3xl mx-auto">
					<p className="text-xs font-semibold text-primary tracking-widest uppercase mb-3">
						Advertise on AppsCombo
					</p>
					<h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4">
						Reach the right audience. Grow your brand. Drive results.
					</h1>
					<p className="text-muted-foreground leading-relaxed max-w-2xl">
						AppsCombo is a next-generation social platform that connects people, communities,
						creators, professionals, organizations, and businesses worldwide. Whether you&apos;re
						looking to increase brand awareness, generate leads, drive sales, promote events,
						recruit talent, or grow your audience, AppsCombo provides powerful advertising tools to
						help you achieve your goals.
					</p>
					<Link
						href="/contact"
						className="inline-flex items-center h-11 px-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 transition-colors mt-6"
					>
						Talk to our sales team
					</Link>
				</div>
			</section>

			<div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
				<Section title="Why advertise on AppsCombo?">
					<P>
						AppsCombo combines social networking, professional networking, community engagement,
						business promotion, event management, and creator ecosystems in one platform — meaning
						advertisers can reach highly engaged audiences across multiple interests, industries,
						and demographics.
					</P>
					<P>Benefits of advertising on AppsCombo:</P>
					<UL>
						<li>Reach targeted audiences</li>
						<li>Increase brand awareness</li>
						<li>Generate leads and inquiries</li>
						<li>Promote products and services</li>
						<li>Drive website traffic and boost app downloads</li>
						<li>Promote events and campaigns</li>
						<li>Grow followers and communities</li>
						<li>Recruit talent and employees</li>
						<li>Measure performance with detailed analytics</li>
					</UL>
				</Section>

				<Divider />

				<Section title="Advertising solutions">
					<P>AppsCombo offers flexible advertising solutions for businesses of all sizes.</P>
					<SubSection title="Sponsored posts">
						<P>
							Promote content directly within users&apos; feeds. Ideal for brand awareness, product
							launches, community engagement, and audience growth.
						</P>
					</SubSection>
					<SubSection title="Video advertising">
						<P>
							Capture attention with engaging video campaigns — perfect for product demonstrations,
							brand storytelling, educational content, and promotional campaigns.
						</P>
					</SubSection>
					<SubSection title="Business promotion">
						<P>
							Increase visibility for your business page and connect with potential customers.
							Suitable for local businesses, startups, SMEs, enterprises, and nonprofits.
						</P>
					</SubSection>
					<SubSection title="Event promotion">
						<P>
							Promote events — conferences, workshops, seminars, concerts, exhibitions, corporate
							events, religious gatherings, and educational programs — to targeted audiences and
							increase registrations.
						</P>
					</SubSection>
					<SubSection title="Creator collaborations">
						<P>
							Partner with creators and influencers to amplify your brand message, gaining authentic
							engagement, audience trust, expanded reach, and targeted communities.
						</P>
					</SubSection>
					<SubSection title="Recruitment advertising">
						<P>
							Connect with qualified candidates and promote job opportunities — ideal for
							recruitment agencies, HR departments, hiring companies, and educational institutions.
						</P>
					</SubSection>
					<SubSection title="Community sponsorships">
						<P>
							Support relevant communities and engage audiences around shared interests, perfect for
							industry groups, educational communities, professional associations, and social
							causes.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Ad formats">
					<P>AppsCombo supports multiple advertising formats:</P>
					<UL>
						<li>
							<span className="text-foreground font-medium">Image ads</span> — high-quality visuals
							for products, services, and announcements
						</li>
						<li>
							<span className="text-foreground font-medium">Video ads</span> — engaging storytelling
							and promotional experiences
						</li>
						<li>
							<span className="text-foreground font-medium">Carousel ads</span> — multiple products,
							services, features, or offers in one ad
						</li>
						<li>
							<span className="text-foreground font-medium">Sponsored content</span> — native
							advertisements integrated into the user experience
						</li>
						<li>
							<span className="text-foreground font-medium">Story ads</span> — full-screen, immersive
							advertising experiences
						</li>
						<li>
							<span className="text-foreground font-medium">Event ads</span> — drive registrations,
							ticket sales, and attendance
						</li>
						<li>
							<span className="text-foreground font-medium">Lead generation ads</span> — capture
							customer information directly on AppsCombo
						</li>
						<li>
							<span className="text-foreground font-medium">Website traffic ads</span> — drive users
							to external sites and landing pages
						</li>
					</UL>
				</Section>

				<Divider />

				<Section title="Audience targeting">
					<P>
						AppsCombo provides intelligent audience targeting tools to help advertisers reach the
						most relevant users, based on:
					</P>
					<SubSection title="Demographics">
						<P>Age, gender, language, education level.</P>
					</SubSection>
					<SubSection title="Geography">
						<P>Country, state, region, city.</P>
					</SubSection>
					<SubSection title="Interests">
						<P>
							Technology, business, education, sports, entertainment, health, lifestyle, finance,
							travel, and more.
						</P>
					</SubSection>
					<SubSection title="Behaviors">
						<P>
							Content engagement, community participation, event interests, professional interests.
						</P>
					</SubSection>
					<P>
						<span className="text-foreground font-medium">Custom audiences: </span>
						advertisers may be able to create audiences using customer lists and approved data
						sources, subject to applicable laws and privacy regulations.
					</P>
				</Section>

				<Divider />

				<Section title="Advertising analytics">
					<P>
						AppsCombo provides detailed campaign insights to help advertisers understand
						performance. Metrics may include reach, impressions, clicks, engagement, video views,
						conversions, lead generation, audience growth, and event registrations — helping
						advertisers optimize campaigns and maximize return on investment.
					</P>
				</Section>

				<Divider />

				<Section title="Advertising policies">
					<P>
						To maintain a safe and trustworthy environment, all advertisements must comply with
						AppsCombo Advertising Policies. Advertisements must:
					</P>
					<UL>
						<li>Be accurate and truthful</li>
						<li>Comply with applicable laws</li>
						<li>Respect intellectual property rights</li>
						<li>Avoid deceptive practices</li>
						<li>Respect user privacy</li>
						<li>Clearly identify promotional content where required</li>
					</UL>
					<SubSection title="Prohibited advertising content">
						<P>The following categories may be restricted or prohibited:</P>
						<UL>
							<li>Illegal products and services</li>
							<li>Fraudulent or misleading claims</li>
							<li>Harmful or dangerous content</li>
							<li>Hate speech and discrimination</li>
							<li>Adult or sexually exploitative content</li>
							<li>Intellectual property violations</li>
							<li>Malware or deceptive downloads</li>
						</UL>
					</SubSection>
					<SubSection title="Ad review process">
						<P>
							All advertisements may undergo review before publication, evaluating content quality,
							policy compliance, legal compliance, user safety, and intellectual property concerns.
							Ads may be approved, rejected, restricted, or require modification before publication.
						</P>
					</SubSection>
				</Section>

				<Divider />

				<Section title="Pricing and billing">
					<P>
						AppsCombo offers flexible advertising options for organizations of all sizes. Campaigns
						may be based on impressions, clicks, engagement, leads, conversions, or event
						registrations. Detailed pricing information is available through the AppsCombo Ads
						Manager.
					</P>
				</Section>

				<Divider />

				<Section title="Agencies and enterprise solutions">
					<P>
						AppsCombo supports advertising agencies, large brands, and enterprise organizations
						through advanced advertising solutions, including dedicated account management,
						strategic campaign support, advanced analytics, large-scale campaign management, custom
						advertising solutions, and partnership opportunities.
					</P>
				</Section>

				<Divider />

				<Section title="Data privacy and advertising">
					<P>
						AppsCombo is committed to responsible advertising practices. Our advertising systems are
						designed with privacy, security, and regulatory compliance in mind — we strive to
						protect user information, respect privacy preferences, comply with data protection
						regulations, and provide transparency regarding our advertising practices. For more
						information, review our{" "}
						<Link href="/privacy-policy" className="text-primary hover:underline">
							Privacy Policy
						</Link>
						.
					</P>
				</Section>

				<Divider />

				<section className="text-center pt-2">
					<h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
						Start advertising today
					</h2>
					<p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto mb-7">
						Reach more people. Build stronger relationships. Grow your impact.
					</p>
					<div className="flex flex-col items-center gap-1 text-sm mb-8">
						{CONTACTS.map(({ label, email }, i) => (
							<span key={label} className="text-muted-foreground">
								{label}{" "}
								<a href={`mailto:${email}`} className="text-primary hover:underline">
									{email}
								</a>
								{i < CONTACTS.length - 1 && <span className="hidden sm:inline"> · </span>}
							</span>
						))}
					</div>
					<p className="text-xs text-muted-foreground">AppsCombo — Connect. Engage. Grow.</p>
				</section>
			</div>
		</>
	)
}
