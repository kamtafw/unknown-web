import { beforeEach, describe, expect, it, vi } from "vitest"
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { marketplaceApi } from "@/lib/marketplace/api"
import { orderKeys } from "@/lib/marketplace/orders"
import type { SellerOrder } from "@/types/marketplace"
import { ShipmentTracking } from "./shipment-tracking"

vi.mock("@/lib/marketplace/api", () => ({
	marketplaceApi: { updateShipment: vi.fn(), addTrackingEvent: vi.fn() },
	marketplaceError: (error: Error) => error.message,
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

const order: SellerOrder = {
	id: 3,
	buyer_id: "buyer-1",
	seller: 7,
	seller_name: "My Business",
	shipping_address: null,
	subtotal: "900.00",
	commission: "27.00",
	total: "1000.00",
	refunded_amount: "0.00",
	status: "paid",
	created_at: "2026-10-27T10:51:39Z",
	items: [
		{ product: 42, product_name: "Smart watch", quantity: 1, price: "900.00" },
	],
	delivery_selections: [
		{ product_id: 42, delivery_option_id: 6, name: "DHL", price: "100.00" },
	],
	shipment: {},
}

function show(data = order) {
	const client = new QueryClient({
		defaultOptions: { mutations: { retry: false } },
	})
	render(
		<QueryClientProvider client={client}>
			<ShipmentTracking order={data} />
		</QueryClientProvider>,
	)
	return { user: userEvent.setup(), client }
}

beforeEach(() => vi.resetAllMocks())

describe("buyer-selected delivery in seller shipment details", () => {
	it("shows the buyer's company and fee and saves tracking with that carrier", async () => {
		const saved = {
			...order,
			shipment: {
				carrier: "DHL",
				tracking_number: "ABC123",
				estimated_delivery: "2026-11-05",
			},
		}
		vi.mocked(marketplaceApi.updateShipment).mockResolvedValue(saved)
		const { user, client } = show()
		expect(
			screen.getByRole("heading", { name: "Buyer’s delivery choice" }),
		).toBeVisible()
		expect(screen.getByRole("listitem")).toHaveTextContent("DHL")
		expect(screen.getByRole("listitem")).toHaveTextContent("Smart watch")
		expect(screen.getByRole("listitem")).toHaveTextContent("₦100.00")

		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		const dialog = within(screen.getByRole("dialog"))
		expect(dialog.getByLabelText("Carrier", { exact: true })).toHaveValue("DHL")
		await user.type(dialog.getByLabelText("Tracking number"), "ABC123")
		fireEvent.change(dialog.getByLabelText("Estimated delivery date"), {
			target: { value: "2026-11-05" },
		})
		await user.click(
			dialog.getByRole("button", { name: "Save shipment details" }),
		)
		await waitFor(() =>
			expect(marketplaceApi.updateShipment).toHaveBeenCalledWith(
				3,
				saved.shipment,
			),
		)
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		)
		expect(client.getQueryData(orderKeys.detail(order.id))).toEqual(saved)
	})

	it("lists each product's choice and requires an explicit carrier when companies differ", async () => {
		vi.mocked(marketplaceApi.updateShipment).mockResolvedValue(order)
		const { user } = show({
			...order,
			items: [
				...order.items,
				{
					product: 43,
					product_name: "Headphones",
					quantity: 1,
					price: "200.00",
				},
			],
			delivery_selections: [
				...order.delivery_selections!,
				{ product_id: 43, delivery_option_id: 9, name: "UPS", price: "150.00" },
			],
		})
		const choices = screen.getAllByRole("listitem")
		expect(choices[0]).toHaveTextContent("DHL")
		expect(choices[0]).toHaveTextContent("Smart watch")
		expect(choices[1]).toHaveTextContent("UPS")
		expect(choices[1]).toHaveTextContent("Headphones")
		expect(choices[1]).toHaveTextContent("₦150.00")
		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		const dialog = within(screen.getByRole("dialog"))
		expect(dialog.getByRole("combobox", { name: "Carrier" })).toHaveValue("")
		await user.click(
			dialog.getByRole("button", { name: "Save shipment details" }),
		)
		expect(marketplaceApi.updateShipment).not.toHaveBeenCalled()
		await user.selectOptions(
			dialog.getByRole("combobox", { name: "Carrier" }),
			"UPS",
		)
		await user.type(dialog.getByLabelText("Tracking number"), "UPS123")
		await user.click(
			dialog.getByRole("button", { name: "Save shipment details" }),
		)
		await waitFor(() =>
			expect(marketplaceApi.updateShipment).toHaveBeenCalledWith(3, {
				carrier: "UPS",
				tracking_number: "UPS123",
				estimated_delivery: null,
			}),
		)
	})

	it("prefills one shared company when multiple products use it", async () => {
		const { user } = show({
			...order,
			delivery_selections: [
				...order.delivery_selections!,
				{ product_id: 43, delivery_option_id: 6, name: "DHL", price: "100.00" },
			],
		})
		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		expect(
			within(screen.getByRole("dialog")).getByLabelText("Carrier", {
				exact: true,
			}),
		).toHaveValue("DHL")
	})

	it("preserves saved shipment details while still showing the buyer's original choice", async () => {
		const { user } = show({
			...order,
			shipment: {
				carrier: "Existing courier",
				tracking_number: "OLD123",
				estimated_delivery: "2026-11-03",
			},
		})
		expect(screen.getByRole("listitem")).toHaveTextContent("DHL")
		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		const dialog = within(screen.getByRole("dialog"))
		expect(dialog.getByLabelText("Carrier", { exact: true })).toHaveValue(
			"Existing courier",
		)
		expect(dialog.getByLabelText("Tracking number")).toHaveValue("OLD123")
		expect(dialog.getByLabelText("Estimated delivery date")).toHaveValue(
			"2026-11-03",
		)
	})

	it("keeps manual carrier entry available for older orders without a recorded choice", async () => {
		vi.mocked(marketplaceApi.updateShipment).mockResolvedValue(order)
		const { user } = show({ ...order, delivery_selections: undefined })
		expect(
			screen.getByText("No delivery choice recorded for this order."),
		).toBeVisible()
		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		const dialog = within(screen.getByRole("dialog"))
		await user.type(
			dialog.getByLabelText("Carrier", { exact: true }),
			"Local courier",
		)
		await user.click(
			dialog.getByRole("button", { name: "Save shipment details" }),
		)
		await waitFor(() =>
			expect(marketplaceApi.updateShipment).toHaveBeenCalledWith(3, {
				carrier: "Local courier",
				estimated_delivery: null,
			}),
		)
	})

	it("keeps entered details available when saving fails", async () => {
		vi.mocked(marketplaceApi.updateShipment).mockRejectedValue(
			new Error("Could not save shipment."),
		)
		const { user } = show()
		await user.click(screen.getByRole("button", { name: "Edit shipment" }))
		const dialog = within(screen.getByRole("dialog"))
		await user.type(dialog.getByLabelText("Tracking number"), "ABC123")
		await user.click(
			dialog.getByRole("button", { name: "Save shipment details" }),
		)
		expect(await dialog.findByRole("alert")).toHaveTextContent(
			"Could not save shipment.",
		)
		expect(dialog.getByLabelText("Tracking number")).toHaveValue("ABC123")
		expect(dialog.getByLabelText("Carrier", { exact: true })).toHaveValue("DHL")
	})
})
