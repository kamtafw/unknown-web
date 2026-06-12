"use client"

import { Home,RotateCcw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		// error reporting service plugged here (Sentry, etc.)
		console.error("[App Error]", error)
	}, [error])

	return (
		<div className="min-h-screen bg-white flex flex-col">
			<header className="px-5 sm:px-8 py-4 sm:py-5 border-b border-gray-100">
				<Link href="/home">
					<Image
						src="/logo.svg"
						alt="AppsCombo"
						width={130}
						height={30}
						className="object-contain w-28 sm:w-32 h-auto"
						priority
					/>
				</Link>
			</header>

			<main className="flex-1 flex items-center justify-center px-5 py-16">
				<div className="w-full max-w-85 text-center">
					{/* Animated icon */}
					<div className="flex justify-center mb-8">
						<div className="relative">
							{/* Pulsing ring */}
							<div
								className="absolute inset-0 rounded-full animate-ping opacity-20"
								style={{ background: "#8892C4", animationDuration: "2s" }}
							/>
							<div
								className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
								style={{ background: "rgba(136,146,196,0.12)" }}
							>
								<svg
									width={28}
									height={28}
									viewBox="0 0 24 24"
									fill="none"
									style={{ color: "#8892C4" }}
								>
									<path
										d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
										stroke="currentColor"
										strokeWidth={1.5}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>
					</div>

					<h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
						Something went wrong
					</h1>
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-2">
						We hit an unexpected snag. This has been noted and we&apos;re looking into it.
					</p>
					{error.digest && (
						<p className="text-[11px] text-gray-300 font-mono mb-6 tabular-nums">
							ref: {error.digest}
						</p>
					)}
					{!error.digest && <div className="mb-6" />}

					<div className="flex items-center justify-center gap-3">
						<button
							onClick={reset}
							className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
						>
							<RotateCcw size={13} />
							Try again
						</button>
						<Link
							href="/home"
							className="flex items-center gap-1.5 h-10 px-5 rounded-full text-white text-[13px] font-semibold active:scale-[0.98] transition-all shadow-sm"
							style={{ background: "#8892C4" }}
						>
							<Home size={14} />
							Home feed
						</Link>
					</div>
				</div>
			</main>

			<div
				className="fixed inset-0 pointer-events-none -z-10"
				style={{
					background:
						"radial-gradient(ellipse 60% 40% at 50% 0%, rgba(136,146,196,0.06) 0%, transparent 70%)",
				}}
			/>
		</div>
	)
}
