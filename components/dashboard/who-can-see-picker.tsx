"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { WhoCanSee } from "@/types/socials/api"
import { Check, ChevronDown } from "lucide-react"
import { ReactNode, useState } from "react"
import { Everyone, Followers } from "../posts/icons"

interface VisibilityOption {
	value: WhoCanSee
	label: string
	icon: ReactNode
}

const VISIBILITY_OPTIONS: VisibilityOption[] = [
	{
		value: "EVERYONE",
		label: "Everyone",
		icon: <Everyone size={15} />,
	},
	{
		value: "ONLY_FOLLOWERS",
		label: "Followers only",
		icon: <Followers size={15} />,
	},
]

interface WhoCanSeePickerProps {
	value: WhoCanSee
	onChange: (value: WhoCanSee) => void
}

export function WhoCanSeePicker({ value, onChange }: WhoCanSeePickerProps) {
	const [open, setOpen] = useState(false)
	const current = VISIBILITY_OPTIONS.find((o) => o.value === value) ?? VISIBILITY_OPTIONS[0]

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					className="flex items-center gap-1.5 pl-2.5 pr-2 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 active:scale-[0.97] transition-all w-fit cursor-pointer"
				>
					<span className="shrink-0">{current.icon}</span>
					{current.label}
					<ChevronDown
						size={12}
						className={`text-primary/70 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
					/>
				</button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				sideOffset={6}
				className="w-64 p-0 rounded-2xl border border-border shadow-xl"
			>
				<div className="px-3 pt-3.5 pb-2.5">
					<h3 className="font-bold text-foreground text-[13px] px-1 mb-2">
						Who can see this post?
					</h3>
					<div className="flex flex-col gap-0.5">
						{VISIBILITY_OPTIONS.map((opt) => {
							const active = opt.value === value
							return (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										onChange(opt.value)
										setOpen(false)
									}}
									className="flex items-center gap-2 w-full px-2 py-2 rounded-xl hover:bg-accent transition-colors text-left cursor-pointer"
								>
									<div
										className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
											active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
										}`}
									>
										{opt.icon}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-[13px] font-semibold text-foreground">{opt.label}</p>
									</div>
									{active && (
										<div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
											<Check size={11} className="text-primary-foreground" strokeWidth={3} />
										</div>
									)}
								</button>
							)
						})}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}

export { VISIBILITY_OPTIONS }
