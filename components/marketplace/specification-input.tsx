"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { marketplaceApi } from "@/lib/marketplace/api"
import { cn } from "@/lib/utils"

export function SpecificationInput({
	label,
	field,
	value,
	specificationName = "",
	categoryIds,
	excluded = [],
	onChange,
	placeholder,
	className,
}: {
	label: string
	field: "name" | "value"
	value: string
	specificationName?: string
	categoryIds: number[]
	excluded?: string[]
	onChange: (value: string) => void
	placeholder: string
	className: string
}) {
	const id = useId()
	const listRef = useRef<HTMLUListElement>(null)
	const [focused, setFocused] = useState(false)
	const [dismissed, setDismissed] = useState(false)
	const [activeIndex, setActiveIndex] = useState(-1)
	const text = value.trim().replace(/\s+/g, " ")
	const q = useDebouncedValue(text, 250)
	const name = specificationName.trim().replace(/\s+/g, " ")
	const categories = [...new Set(categoryIds)].sort((a, b) => a - b).join(",")
	const normalize = (s: string) => {
		const trimmed = s.trim().replace(/\s+/g, " ")
		return field === "name" ? trimmed.toLowerCase() : trimmed
	}
	const excludedOptions = [...new Set([...excluded, text].map(normalize))]
		.filter(
			(option) =>
				option &&
				option.length <= 200 &&
				option.toLowerCase().includes(text.toLowerCase()),
		)
		.sort()
	const exclusions = JSON.stringify(excludedOptions)
	const suggestions = useQuery({
		queryKey: [
			"marketplace",
			"specification-suggestions",
			field,
			q,
			name,
			categories,
			exclusions,
		],
		queryFn: ({ signal }) =>
			marketplaceApi.specificationSuggestions(
				{
					field,
					q,
					name: field === "value" ? name : undefined,
					category_ids: categories || undefined,
					exclude: excludedOptions.length ? exclusions : undefined,
				},
				signal,
			),
		enabled:
			focused &&
			!dismissed &&
			text === q &&
			q.length <= 100 &&
			(field === "name" ? q.length > 0 : name.length > 0 && name.length <= 200),
		staleTime: 60_000,
		retry: false,
		refetchOnWindowFocus: false,
	})
	const excludedNames = new Set(excluded.map(normalize))
	const options = (suggestions.data || []).filter(
		(option) =>
			!excludedNames.has(normalize(option)) &&
			normalize(option) !== normalize(text),
	)
	const open =
		focused &&
		!dismissed &&
		text === q &&
		!suggestions.isError &&
		options.length > 0
	const active =
		activeIndex >= 0 && activeIndex < options.length ? activeIndex : -1
	useEffect(() => {
		if (open && active >= 0) {
			listRef.current?.children
				.item(active)
				?.scrollIntoView?.({ block: "nearest" })
		}
	}, [active, open])
	function select(option: string) {
		onChange(option)
		setDismissed(true)
		setActiveIndex(-1)
	}
	return (
		<div className="relative min-w-0">
			<input
				role="combobox"
				aria-label={label}
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls={open ? `${id}-options` : undefined}
				aria-activedescendant={
					open && active >= 0 ? `${id}-option-${active}` : undefined
				}
				autoComplete="off"
				value={value}
				onFocus={() => {
					setFocused(true)
					setDismissed(false)
				}}
				onBlur={() => {
					setFocused(false)
					setActiveIndex(-1)
				}}
				onChange={(event) => {
					onChange(event.target.value)
					setActiveIndex(-1)
					setDismissed(false)
				}}
				onKeyDown={(event) => {
					if (event.nativeEvent.isComposing) return
					if (event.key === "Escape") {
						if (open) {
							event.preventDefault()
							event.stopPropagation()
						}
						setDismissed(true)
						setActiveIndex(-1)
					} else if (
						open &&
						(event.key === "ArrowDown" || event.key === "ArrowUp")
					) {
						event.preventDefault()
						setActiveIndex(
							event.key === "ArrowDown"
								? (active + 1) % options.length
								: (active <= 0 ? options.length : active) - 1,
						)
					} else if (open && event.key === "Enter") {
						event.preventDefault()
						if (active >= 0) select(options[active])
						else setDismissed(true)
					}
				}}
				placeholder={placeholder}
				className={className}
			/>
			{open && (
				<div className="absolute top-full z-20 mt-1 w-full min-w-0 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg">
					<p className="px-2 py-1.5 text-[11px] text-muted-foreground">
						Used on other products
					</p>
					<ul
						ref={listRef}
						id={`${id}-options`}
						role="listbox"
						aria-label={`${label} suggestions`}
						className="max-h-52 overflow-y-auto"
					>
						{options.map((option, index) => (
							<li
								key={option}
								id={`${id}-option-${index}`}
								role="option"
								aria-selected={active === index}
								className={cn(
									"cursor-pointer rounded-lg px-2 py-2 text-sm break-words hover:bg-muted",
									active === index && "bg-muted",
								)}
								onMouseDown={(event) => event.preventDefault()}
								onClick={() => select(option)}
							>
								{option}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}
