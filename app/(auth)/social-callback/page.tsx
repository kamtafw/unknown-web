"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"

export default function SocialCallbackPage() {
	useEffect(() => {
		// the OAuth provider redirected here after completing auth;
		// just close the popup — the opener will detect this and refetch
		window.close()
	}, [])

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-white gap-5 px-4">
			<Image
				src="/logo.svg"
				alt="AppsCombo"
				width={130}
				height={30}
				className="object-contain"
				priority
			/>

			<div className="text-center">
				<div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
					<svg width={24} height={24} viewBox="0 0 24 24" fill="none">
						<path
							d="M5 13l4 4L19 7"
							stroke="#16a34a"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<p className="text-[15px] font-semibold text-gray-900">Account connected!</p>
				<p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
					This tab will close automatically. If it doesn&apos;t, use the button below.
				</p>
			</div>

			<Link
				href="/settings"
				className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/85 transition-colors"
			>
				Back to Settings
			</Link>
		</div>
	)
}
