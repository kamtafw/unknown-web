import React, { useState } from "react"
import * as Toggle from "@radix-ui/react-toggle"
import { Loader2, RefreshCw } from "lucide-react"

const FALLBACK_INTERESTS = [
	"Comedy",
	"Entertainment Culture",
	"Music",
	"Food & Drink",
	"Designs",
	"Tech Development",
	"Fashion & Lifestyle",
	"Literature & History",
	"Travel",
	"Sports",
	"Life Hacks",
	"Anime & Comics",
	"Family",
	"Auto Vehicle",
	"Science and education",
	"Health & Wellness",
	"Photography",
	"Gaming",
	"Finance & Business",
	"Politics",
	"Art",
	"Pets & Animals",
	"DIY & Crafts",
	"Parenting",
]

const PAGE_SIZE = 13

function getPage(pool: string[], offset: number) {
	if (pool.length <= PAGE_SIZE) return pool
	return Array.from({ length: PAGE_SIZE }, (_, i) => pool[(offset + i) % pool.length])
}

interface ChooseInterestsProps {
	interests?: string[]
	isLoading?: boolean
	isPending?: boolean
	onNext?: (selected: string[]) => void
	onSkip?: () => void
}

export function ChooseInterests({
	interests: externalInterests,
	isLoading = false,
	isPending = false,
	onNext,
	onSkip,
}: ChooseInterestsProps) {
	const pool = externalInterests ?? FALLBACK_INTERESTS
	const [selected, setSelected] = useState<Set<string>>(new Set())
	const [offset, setOffset] = useState(0)
	const [spinning, setSpinning] = useState(false)

	const visible = getPage(pool, offset)

	const toggle = (interest: string) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(interest)) next.delete(interest)
			else next.add(interest)
			return next
		})
	}

	const handleRefresh = () => {
		setSpinning(true)
		setTimeout(() => {
			setOffset((o) => (o + PAGE_SIZE) % pool.length)
			setSpinning(false)
		}, 400)
	}

	return (
		<div className="flex justify-center pt-16 px-4">
			<div className="w-full max-w-115">
				<h1 className="text-2xl font-bold text-gray-900 mb-1">Choose your interest</h1>
				<p className="text-sm text-gray-500 mb-6">
					Your feed will be personalised based on what you like
				</p>

				{isLoading ? (
					<div className="flex justify-center py-2">
						<div className="w-full max-w-115 animate-pulse">
							<div className="h-7 bg-gray-200 rounded-full w-2/5 mb-2" />
							<div className="h-4 bg-gray-200 rounded-full w-3/5 mb-6" />
							<div className="flex flex-wrap gap-2.5">
								{Array.from({ length: 10 }).map((_, i) => (
									<div key={i} className="h-9 w-24 bg-gray-200 rounded-full" />
								))}
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="flex flex-wrap gap-2.5 mb-6">
							{visible.map((interest) => {
								const isOn = selected.has(interest)
								return (
									<Toggle.Root
										key={interest}
										pressed={isOn}
										onPressedChange={() => toggle(interest)}
										className={`
                  px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer
                  ${
										isOn
											? "bg-primary text-white border-primary"
											: "bg-white text-gray-800 border-gray-300 hover:border-primary"
									}
                `}
									>
										{interest}
									</Toggle.Root>
								)
							})}
						</div>

						{pool.length > PAGE_SIZE && (
							<button
								onClick={handleRefresh}
								className="flex items-center gap-2 mx-auto text-sm text-gray-600 hover:text-gray-900 mb-8 transition-colors"
							>
								Refresh for more
								<RefreshCw
									size={15}
									className={`transition-transform duration-400 ${spinning ? "animate-spin" : ""}`}
								/>
							</button>
						)}
					</>
				)}

				<div className="flex gap-3 mt-8">
					<button
						onClick={onSkip}
						className="flex-1 h-13 rounded-2xl text-sm font-semibold text-primary bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
					>
						Skip
					</button>
					<button
						disabled={isPending}
						onClick={() => onNext?.(Array.from(selected))}
						className="flex-2 h-13 rounded-2xl text-white text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
					>
						{isPending ? (
							<>
								<Loader2 size={14} className="animate-spin" />
								Saving...
							</>
						) : (
							"Next"
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
