import Link from "next/link"

const LINKS = [
	{ label: "About", href: "/about" },
	{ label: "Advertising", href: "/advertising" },
	{ label: "Support", href: "/support" },
	{ label: "Contact", href: "/contact" },
	{ label: "Safety Report", href: "/safety-report" },
	{ label: "Legal Notice", href: "/legal-notice" },
	{ label: "Account Recovery", href: "/account-recovery" },
	{ label: "Delete Account", href: "/account-deletion" },
	{ label: "Terms", href: "/terms" },
	{ label: "Privacy", href: "/privacy-policy" },
]

export function Footer() {
	return (
		<footer className="py-6 px-4 border-t border-border mt-auto">
			<div className="max-w-4xl mx-auto">
				<nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-3">
					{LINKS.map(({ label, href }) => (
						<Link
							key={href}
							href={href}
							className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
						>
							{label}
						</Link>
					))}
				</nav>
				<p className="text-center text-[11px] text-muted-foreground/50">
					© {new Date().getFullYear()} AppsCombo Inc. All rights reserved.
				</p>
			</div>
		</footer>
	)
}
