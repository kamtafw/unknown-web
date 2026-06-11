"use client"

import { Home, RotateCcw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export default function DashboardError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error("[Dashboard Error]", error)
	}, [error])

	return (
		// mirrors the shape of Feed / Bookmarks — fills the children slot in dashboard layout
		<div className="flex-1 min-w-0 flex items-center justify-center bg-white rounded-t-2xl border border-gray-100">
			<div className="w-full max-w-xs text-center px-6 py-16">
				{/* Broken post card */}
				<div className="flex justify-center mb-7">
					<div
						className="w-14 h-14 rounded-2xl flex items-center justify-center"
						style={{ background: "rgba(136,146,196,0.10)" }}
					>
						<svg
							width={24}
							height={24}
							viewBox="0 0 24 24"
							fill="none"
							style={{ color: "#6A88D1" }}
						>
							<path
								d="m13.5 6-6 6m0 0 6 6m-6-6H21M3 12h1"
								stroke="currentColor"
								strokeWidth={1.5}
								strokeLinecap="round"
								strokeLinejoin="round"
								opacity={0}
							/>
							<path
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
								stroke="currentColor"
								strokeWidth={1.5}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
				</div>

				<h2 className="text-[15px] font-bold text-gray-900 mb-1.5 leading-tight">
					Something went wrong
				</h2>
				<p className="text-[12.5px] text-gray-500 leading-relaxed mb-6">
					This section failed to load. You can try again or head back to your feed.
				</p>

				{error.digest && (
					<p className="text-[10.5px] text-gray-300 font-mono mb-5 tabular-nums">{error.digest}</p>
				)}

				<div className="flex items-center justify-center gap-2.5">
					<button
						onClick={reset}
						className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-gray-200 text-[12.5px] font-semibold text-gray-600 hover:bg-gray-50 active:scale-[0.98] transition-all"
					>
						<RotateCcw size={12} />
						Retry
					</button>
					<Link
						href="/home"
						className="flex items-center gap-1.5 h-9 px-4 rounded-full text-white text-[12.5px] font-semibold active:scale-[0.98] transition-all"
						style={{ background: "#6A88D1" }}
					>
						<Home size={13} />
						Home
					</Link>
				</div>
			</div>
		</div>
	)
}
