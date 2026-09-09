import * as Toggle from "@radix-ui/react-toggle"
import { Loader2, RefreshCw } from "lucide-react"
import { useState } from "react"

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
		<div className="flex justify-center pt-10 sm:pt-15 px-4 pb-10">
			<div className="w-full max-w-md">
				<h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Choose your interest</h1>
				<p className="text-[13px] sm:text-sm text-muted-foreground mb-5 sm:mb-6">
					Your feed will be personalised based on what you like
				</p>

				{isLoading ? (
					<div className="animate-pulse">
						<div className="flex flex-wrap gap-2 sm:gap-2.5">
							{Array.from({ length: 10 }).map((_, i) => (
								<div
									key={i}
									className="h-8 sm:h-9 rounded-full bg-muted"
									style={{ width: `${70 + (i % 4) * 20}px` }}
								/>
							))}
						</div>
					</div>
				) : (
					<>
						<div className="flex flex-wrap gap-2 sm:gap-2.5 mb-5 sm:mb-6">
							{visible.map((interest) => {
								const isOn = selected.has(interest)
								return (
									<Toggle.Root
										key={interest}
										pressed={isOn}
										onPressedChange={() => toggle(interest)}
										className={`
											px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
											text-[13px] sm:text-sm font-medium border
											transition-all duration-150 cursor-pointer
											${
												isOn
													? "bg-primary text-primary-foreground border-primary shadow-sm"
													: "bg-card text-foreground border-border hover:border-primary hover:bg-accent"
											}
										`}
									>
										{interest}
									</Toggle.Root>
								)
							})}
						</div>

						{pool.length > PAGE_SIZE && (
							<div className="flex justify-center mb-3 sm:mb-5">
								<button
									onClick={handleRefresh}
									className="flex items-center gap-2 mx-auto text-[13px] sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-full hover:bg-accent"
								>
									Refresh for more
									<RefreshCw
										size={13}
										className={`transition-transform duration-400 ${spinning ? "animate-spin" : ""}`}
									/>
								</button>
							</div>
						)}
					</>
				)}

				<div className="flex gap-3 mt-6 sm:mt-8">
					<button
						onClick={onSkip}
						className="flex-1 h-12 sm:h-13 rounded-full text-sm font-semibold text-primary bg-muted hover:bg-accent transition-colors cursor-pointer"
					>
						Skip
					</button>
					<button
						disabled={isPending}
						onClick={() => onNext?.(Array.from(selected))}
						className="flex-2 h-12 sm:h-13 rounded-full text-primary-foreground text-sm font-semibold bg-primary hover:bg-primary/85 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
