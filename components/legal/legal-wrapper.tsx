import { Footer } from "@/components/shared/footer"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

export function LegalWrapper({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-white flex flex-col">
			<header className="sticky top-0 z-10 bg-white border-b border-gray-100">
				<div className="flex items-center justify-between px-4 sm:px-8 h-14 sm:h-16 max-w-5xl mx-auto w-full">
					<Link href="/home">
						<Image
							src="/logo.svg"
							alt="AppsCombo"
							width={140}
							height={30}
							className="object-contain w-28 sm:w-36 h-auto"
							priority
						/>
					</Link>
					<div className="flex items-center gap-3">
						<Link
							href="/sign-in"
							className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
						>
							Sign in
						</Link>
						<Link
							href="/sign-up"
							className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/85 transition-colors"
						>
							Get started
						</Link>
					</div>
				</div>
			</header>
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	)
}
