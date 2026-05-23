import React, { useState } from "react"
import * as Toggle from "@radix-ui/react-toggle"
import { RefreshCw } from "lucide-react"

const ALL_INTERESTS = [
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

interface ChooseInterestsProps {
	onNext?: (selected: string[]) => void
	onSkip?: () => void
}

export function ChooseInterests({ onNext, onSkip }: ChooseInterestsProps) {
	const [selected, setSelected] = useState<Set<string>>(new Set(["Comedy", "Travel"]))
	const [offset, setOffset] = useState(0)
	const [spinning, setSpinning] = useState(false)

	const visible = ALL_INTERESTS.slice(offset, offset + PAGE_SIZE)

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
		const nextOffset = (offset + PAGE_SIZE) % ALL_INTERESTS.length
		setTimeout(() => {
			setOffset(nextOffset)
			setSpinning(false)
		}, 400)
	}

	return (
		<div className="flex justify-center pt-16 px-4">
			<div className="w-full max-w-115">
				<h1 className="text-2xl font-bold text-gray-900 mb-1">Choose your interest</h1>
				<p className="text-sm text-gray-500 mb-6">
					Your feed will be personalized based on what you like
				</p>

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
											? "bg-[#8892C4] text-white border-[#8892C4]"
											: "bg-white text-gray-800 border-gray-300 hover:border-[#8892C4]"
									}
                `}
							>
								{interest}
							</Toggle.Root>
						)
					})}
				</div>

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

				<div className="flex gap-3">
					<button
						onClick={onSkip}
						className="
              flex-1 h-13 rounded-2xl text-sm font-semibold text-[#8892C4]
              bg-gray-100 hover:bg-gray-200 transition-colors duration-150
            "
					>
						Skip
					</button>
					<button
						onClick={() => onNext?.(Array.from(selected))}
						className="
              flex-2 h-13 rounded-2xl text-white text-sm font-semibold
              bg-[#8892C4] hover:bg-[#7580b8] active:scale-[0.99]
              transition-all duration-200
            "
					>
						Next
					</button>
				</div>
			</div>
		</div>
	)
}
