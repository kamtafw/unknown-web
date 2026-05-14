import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col bg-white min-h-screen">
			<header className="px-8 py-5 border-b border-gray-100">
				<div className="flex items-center gap-2">
					<Image
						src="/logo.svg"
						alt="App Combo"
						width={180}
						height={35}
						className="mr-2 object-contain"
					/>
				</div>
			</header>

			{/* page content */}
			<main className="flex-1">{children}</main>
		</div>
	)
}
