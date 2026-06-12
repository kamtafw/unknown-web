"use client"

import { ArrowLeft, Home } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFound() {
	const router = useRouter()

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
					<div className="relative flex justify-center mb-10" style={{ height: 160 }}>
						<div className="absolute top-4 w-64 h-32 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm rotate-3 opacity-50" />
						<div className="absolute top-2 w-68 h-32 bg-gray-50/80 rounded-2xl border border-gray-100 shadow-sm rotate-[-1.5deg] opacity-70" />

						<div className="absolute top-0 w-72 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(136,146,196,0.12)] p-5 overflow-hidden">
							<div className="flex items-center gap-3 mb-4">
								<div
									className="w-9 h-9 rounded-full shrink-0"
									style={{ background: "rgba(136,146,196,0.12)" }}
								/>
								<div className="flex-1 space-y-2">
									<div
										className="h-2.5 rounded-full w-24"
										style={{ background: "rgba(136,146,196,0.10)" }}
									/>
									<div
										className="h-2 rounded-full w-16"
										style={{ background: "rgba(136,146,196,0.08)" }}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<div
									className="h-2 rounded-full w-full"
									style={{ background: "rgba(136,146,196,0.08)" }}
								/>
								<div
									className="h-2 rounded-full w-4/5"
									style={{ background: "rgba(136,146,196,0.08)" }}
								/>
								<div
									className="h-2 rounded-full w-3/5"
									style={{ background: "rgba(136,146,196,0.06)" }}
								/>
							</div>

							{/* 404 stamp overlay */}
							<div className="absolute inset-0 flex items-center justify-center">
								<div
									className="-rotate-6 px-4 py-1.5 rounded-xl"
									style={{
										border: "3px solid rgba(136,146,196,0.25)",
									}}
								>
									<span
										className="text-4xl font-black tracking-widest select-none"
										style={{ color: "rgba(136,146,196,0.30)" }}
									>
										404
									</span>
								</div>
							</div>
						</div>
					</div>

					<h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
						This page isn&apos;t in the feed
					</h1>
					<p className="text-[13.5px] text-gray-500 leading-relaxed mb-8">
						The link might be broken or the page may have been removed. Let&apos;s get you back.
					</p>

					<div className="flex items-center justify-center gap-3">
						<button
							onClick={() => router.back()}
							className="flex items-center gap-1.5 h-10 px-5 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
						>
							<ArrowLeft size={14} />
							Go back
						</button>
						<Link
							href="/home"
							className="flex items-center gap-1.5 h-10 px-5 rounded-full text-white text-[13px] font-semibold active:scale-[0.98] transition-all shadow-sm"
							style={{ background: "#6A88D1" }}
						>
							<Home size={14} />
							Home
						</Link>
					</div>
				</div>
			</main>

			{/* subtle background accent */}
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
