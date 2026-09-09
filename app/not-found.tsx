"use client"

import { ArrowLeft, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
	const router = useRouter()

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
					{/* Decorative stacked card illustration */}
					<div className="relative flex justify-center mb-10" style={{ height: 160 }}>
						<div className="absolute top-4 w-64 h-32 bg-muted rounded-2xl border border-border shadow-sm rotate-3 opacity-50" />
						<div className="absolute top-2 w-68 h-32 bg-muted/80 rounded-2xl border border-border shadow-sm rotate-[-1.5deg] opacity-70" />

						<div className="absolute top-0 w-72 bg-card rounded-2xl border border-border shadow-md p-5 overflow-hidden">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-9 h-9 rounded-full shrink-0 bg-primary/10" />
								<div className="flex-1 space-y-2">
									<div className="h-2.5 rounded-full w-24 bg-primary/10" />
									<div className="h-2 rounded-full w-16 bg-primary/8" />
								</div>
							</div>
							<div className="space-y-2">
								<div className="h-2 rounded-full w-full bg-primary/8" />
								<div className="h-2 rounded-full w-4/5 bg-primary/8" />
								<div className="h-2 rounded-full w-3/5 bg-primary/6" />
							</div>

							{/* 404 stamp overlay */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="-rotate-6 px-4 py-1.5 rounded-xl border-[3px] border-primary/25">
									<span className="text-4xl font-black tracking-widest select-none text-primary/30">
										404
									</span>
								</div>
							</div>
						</div>
					</div>

					<h1 className="text-xl font-bold text-foreground mb-2 leading-tight">
						This page isn&apos;t in the feed
					</h1>
					<p className="text-[13.5px] text-muted-foreground leading-relaxed mb-8">
						The link might be broken or the page may have been removed. Let&apos;s get you back.
					</p>

					<div className="flex items-center justify-center gap-3">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-border text-[13px] font-semibold text-foreground hover:bg-muted active:scale-[0.98] transition-all"
						>
							<ArrowLeft size={14} />
							Go back
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