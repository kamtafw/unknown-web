"use client"

import { DropdownMenu } from "radix-ui"
import { ReactNode, useState } from "react"

export interface ActionDropdownItem {
	label: string
	icon: ReactNode
	onSelect: () => void
	destructive?: boolean
}

interface ActionDropdownProps {
	trigger: ReactNode
	items: ActionDropdownItem[]
	clsName?: string
}

export function ActionDropdown({ trigger, items, clsName }: ActionDropdownProps) {
	const [open, setOpen] = useState(false)

	return (
		<DropdownMenu.Root open={open} onOpenChange={setOpen}>
			<DropdownMenu.Trigger asChild>
				<button
					className={clsName}
					onPointerDown={(e) => e.preventDefault()}
					onClick={() => setOpen((prev) => !prev)}
				>
					{trigger}
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					side="bottom"
					sideOffset={-32}
					align="end"
					collisionPadding={12}
					className="z-99 min-w-48 bg-white rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.10)] border border-gray-100
						data-[state=open]:animate-in data-[state=closed]:animate-out
						data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
						data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
						origin-top-right"
				>
					{items.map((item) => (
						<DropdownMenu.Item
							key={item.label}
							onSelect={item.onSelect}
							className={`flex items-center justify-between gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer outline-none select-none transition-colors
									${item.destructive ? "text-destructive data-highlighted:bg-red-50" : "text-gray-800 data-highlighted:bg-gray-50"}`}
						>
							<span>{item.label}</span>
							<span
								className={`shrink-0 ${item.destructive ? "text-destructive/80" : "text-gray-500"}`}
							>
								{item.icon}
							</span>
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
