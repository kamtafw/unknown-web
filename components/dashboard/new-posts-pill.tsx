"use client"

import { ArrowUp, Loader2 } from "lucide-react"
import Image from "next/image"

interface NewPostsPillProps {
	count: number
	avatarUrls: (string | null)[]
	loading?: boolean
	onClick: () => void
}

export function NewPostsPill({ count, avatarUrls, loading, onClick }: NewPostsPillProps) {
	if (loading) return

	return (
		<div className="sticky top-2 z-20 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
			<button
				onClick={onClick}
				disabled={loading}
				className="pointer-events-auto flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.97] transition-all cursor-pointer disabled:opacity-70"
			>
				{avatarUrls.length > 0 ? (
					<div className="flex -space-x-2">
						{avatarUrls.slice(0, 3).map((url, i) => (
							<div
								key={i}
								className="w-6 h-6 rounded-full border-2 border-primary bg-primary-foreground/20 overflow-hidden shrink-0"
							>
								{url && (
									<Image
										src={url}
										alt=""
										width={24}
										height={24}
										className="w-full h-full object-cover"
									/>
								)}
							</div>
						))}
					</div>
				) : (
					<span className="w-6 h-6 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
						<ArrowUp size={13} strokeWidth={2.5} />
					</span>
				)}

				<span className="text-[13px] font-semibold whitespace-nowrap">
					{loading ? "Loading…" : `${count} new ${count === 1 ? "post" : "posts"}`}
				</span>

				{loading ? (
					<Loader2 size={13} className="animate-spin" />
				) : (
					<ArrowUp size={13} strokeWidth={2.5} />
				)}
			</button>
		</div>
	)
}
