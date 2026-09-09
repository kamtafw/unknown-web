import { Footer } from "@/components/shared/footer"
import Image from "next/image"
import Link from "next/link"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col bg-background min-h-screen">
			<header className="sticky top-0 z-50 px-5 sm:px-8 py-4 sm:py-5 bg-background/80 backdrop-blur-sm border-b border-border flex items-center justify-between">
				<Link href="/">
					<Image
						src="/logo.svg"
						alt="AppsCombo"
						width={150}
						height={30}
						className="object-contain w-28 sm:w-44 h-auto shrink-0 cursor-pointer"
						priority
					/>
				</Link>

				<div className="flex items-center gap-6 shrink-0">
					<Link
						href="/sign-in"
						className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Sign in
					</Link>
					<Link
						href="/sign-up"
						className="hidden sm:block text-sm font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/85 transition-colors"
					>
						Get started
					</Link>
				</div>
			</header>
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	)
}