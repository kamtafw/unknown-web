import { Footer } from "@/components/shared/footer"
import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col bg-background min-h-screen">
			<header className="sticky top-0 z-10 px-4 sm:px-8 py-4 sm:py-5 border-b border-border bg-background/80 backdrop-blur-sm">
				<div className="flex items-center gap-2">
					<Image
						src="/logo.svg"
						alt="App Combo"
						width={150}
						height={30}
						className="mr-2 object-contain w-32.5 sm:w-45 h-auto"
						priority
					/>
				</div>
			</header>

			<main className="flex-1">{children}</main>

			<Footer />
		</div>
	)
}
