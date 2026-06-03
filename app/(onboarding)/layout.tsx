import Image from "next/image"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col bg-white min-h-screen">
			<header className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-100">
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

			{/* page content */}
			<main className="flex-1">{children}</main>
		</div>
	)
}
