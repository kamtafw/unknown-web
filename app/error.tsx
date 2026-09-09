"use client"

import { Home, RotateCcw } from "lucide-react"
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
		console.error("[App Error]", error)
	}, [error])

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<header className="px-5 sm:px-8 py-4 sm:py-5 border-b border-border">
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
							<span
								className="absolute inset-0 rounded-full animate-ping bg-primary/20"
								style={{ animationDuration: "2s" }}
							/>
							<div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10">
								<svg
									width={28}
									height={28}
									viewBox="0 0 24 24"
									fill="none"
									className="text-primary"
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

					<h1 className="text-xl font-bold text-foreground mb-2 leading-tight">
						Something went wrong
					</h1>
					<p className="text-[13.5px] text-muted-foreground leading-relaxed mb-2">
						We hit an unexpected snag. This has been noted and we&apos;re looking into it.
					</p>
					{error.digest && (
						<p className="text-[11px] text-muted-foreground/40 font-mono mb-6 tabular-nums">
							ref: {error.digest}
						</p>
					)}
					{!error.digest && <div className="mb-6" />}

					<div className="flex items-center justify-center gap-3">
						<button
							onClick={reset}
							className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-border text-[13px] font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all"
						>
							<RotateCcw size={13} />
							Try again
						</button>
						<Link
							href="/home"
							className="flex items-center gap-1.5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold active:scale-[0.98] transition-all shadow-sm"
						>
							<Home size={14} />
							Home
						</Link>
					</div>
				</div>
			</main>

			{/* Ambient glow — theme-safe */}
			<div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
				<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-lg h-lg bg-primary/5 rounded-full blur-3xl" />
			</div>
		</div>
	)
}