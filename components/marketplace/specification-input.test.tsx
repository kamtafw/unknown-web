import { useState } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { marketplaceApi } from "@/lib/marketplace/api"
import { SpecificationInput } from "./specification-input"

vi.mock("@/lib/marketplace/api", () => ({
	marketplaceApi: { specificationSuggestions: vi.fn() },
}))

function show(
	props: {
		field?: "name" | "value"
		specificationName?: string
		excluded?: string[]
		initialValue?: string
	} = {},
) {
	const { initialValue = "", ...inputProps } = props
	const submit = vi.fn((event) => event.preventDefault())
	function Example() {
		const [value, setValue] = useState(initialValue)
		return (
			<form onSubmit={submit}>
				<SpecificationInput
					label="Specification"
					field="name"
					value={value}
					categoryIds={[2, 1, 2]}
					onChange={setValue}
					placeholder="Type a specification"
					className=""
					{...inputProps}
				/>
				<button type="button">Outside</button>
			</form>
		)
	}
	render(
		<QueryClientProvider
			client={
				new QueryClient({ defaultOptions: { queries: { retry: false } } })
			}
		>
			<Example />
		</QueryClientProvider>,
	)
	return { input: screen.getByRole("combobox"), submit }
}

beforeEach(() => {
	vi.resetAllMocks()
	vi.mocked(marketplaceApi.specificationSuggestions).mockResolvedValue([
		"Weight",
		"Width",
	])
})

describe("specification suggestions", () => {
	it("debounces typing, passes category context and supports keyboard selection without submitting", async () => {
		const { input, submit } = show()
		const user = userEvent.setup()
		await user.type(input, "Wei")
		expect(marketplaceApi.specificationSuggestions).not.toHaveBeenCalled()
		await screen.findByRole("option", { name: "Weight" })
		expect(
			marketplaceApi.specificationSuggestions,
		).toHaveBeenCalledExactlyOnceWith(
			{
				field: "name",
				q: "Wei",
				name: undefined,
				category_ids: "1,2",
				exclude: '["wei"]',
			},
			expect.any(AbortSignal),
		)
		await user.keyboard("{ArrowDown}{Enter}")
		expect(input).toHaveValue("Weight")
		expect(input).toHaveAttribute("aria-expanded", "false")
		expect(submit).not.toHaveBeenCalled()
	})

	it("keeps already-used names out of the choices and selects with a mouse", async () => {
		const { input } = show({ excluded: [" WEIGHT "] })
		const user = userEvent.setup()
		await user.type(input, "W")
		await screen.findByRole("option", { name: "Width" })
		expect(marketplaceApi.specificationSuggestions).toHaveBeenCalledWith(
			expect.objectContaining({ exclude: '["w","weight"]' }),
			expect.any(AbortSignal),
		)
		expect(
			screen.queryByRole("option", { name: "Weight" }),
		).not.toBeInTheDocument()
		await user.click(screen.getByRole("option", { name: "Width" }))
		expect(input).toHaveValue("Width")
		expect(input).toHaveFocus()
	})

	it("suggests values for the chosen name, including popular values on focus", async () => {
		vi.mocked(marketplaceApi.specificationSuggestions).mockResolvedValue([
			"12 kg",
			"15 kg",
		])
		const { input } = show({ field: "value", specificationName: " Weight " })
		await userEvent.click(input)
		await screen.findByRole("option", { name: "12 kg" })
		expect(marketplaceApi.specificationSuggestions).toHaveBeenCalledWith(
			{
				field: "value",
				q: "",
				name: "Weight",
				category_ids: "1,2",
				exclude: undefined,
			},
			expect.any(AbortSignal),
		)
	})

	it("keeps differently-cased values available when the exact typed value is hidden", async () => {
		vi.mocked(marketplaceApi.specificationSuggestions).mockResolvedValue([
			"1 mW",
			"1 MW",
		])
		const { input } = show({
			field: "value",
			specificationName: "Power",
			initialValue: "1 mW",
		})
		await userEvent.click(input)
		await screen.findByRole("option", { name: "1 MW" })
		expect(
			screen.queryByRole("option", { name: "1 mW" }),
		).not.toBeInTheDocument()
		expect(marketplaceApi.specificationSuggestions).toHaveBeenCalledWith(
			expect.objectContaining({ exclude: '["1 mW"]' }),
			expect.any(AbortSignal),
		)
		await userEvent.click(
			screen.getByRole("option", { name: "1 MW" }),
		)
		expect(input).toHaveValue("1 MW")
	})

	it("does not request values without a name", async () => {
		const { input } = show({ field: "value" })
		await userEvent.type(input, "12")
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 300))
		})
		expect(marketplaceApi.specificationSuggestions).not.toHaveBeenCalled()
	})

	it("hides stale results immediately when typing changes and ignores late responses", async () => {
		let finish!: (value: string[]) => void
		vi.mocked(marketplaceApi.specificationSuggestions)
			.mockReturnValueOnce(
				new Promise((resolve) => {
					finish = resolve
				}),
			)
			.mockResolvedValueOnce(["Battery life"])
		const { input } = show()
		fireEvent.focus(input)
		fireEvent.change(input, { target: { value: "Wei" } })
		await waitFor(() =>
			expect(marketplaceApi.specificationSuggestions).toHaveBeenCalledTimes(1),
		)
		fireEvent.change(input, { target: { value: "Bat" } })
		finish(["Weight"])
		expect(
			screen.queryByRole("option", { name: "Weight" }),
		).not.toBeInTheDocument()
		await screen.findByRole("option", { name: "Battery life" })
		expect(
			screen.queryByRole("option", { name: "Weight" }),
		).not.toBeInTheDocument()
	})

	it("allows custom input when suggestions fail", async () => {
		vi.mocked(marketplaceApi.specificationSuggestions).mockRejectedValue(
			new Error("Offline"),
		)
		const { input } = show()
		await userEvent.type(input, "Custom dimension")
		await waitFor(() =>
			expect(marketplaceApi.specificationSuggestions).toHaveBeenCalledTimes(1),
		)
		expect(input).toHaveValue("Custom dimension")
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
	})

	it("dismisses with Escape and blur without changing the typed text", async () => {
		const { input } = show()
		const user = userEvent.setup()
		await user.type(input, "W")
		await screen.findByRole("option", { name: "Weight" })
		await user.keyboard("{Escape}")
		expect(input).toHaveValue("W")
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
		await user.click(screen.getByRole("button", { name: "Outside" }))
		await user.click(input)
		await screen.findByRole("listbox")
		await user.tab()
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
	})
})
