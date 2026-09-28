import { backupApi } from "@/lib/messenger/api"
import { recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MessengerE2eeRecoverySurface } from "./messenger-e2ee-debug-panel"

const runtimeState = { identity: null as { privateKey: Uint8Array; publicKey: Uint8Array } | null }
const authState = { user: { pkid: 42 } }

vi.mock("@/stores/auth-store", () => ({
	useAuthStore: Object.assign(
		(selector: (state: typeof authState) => unknown) => selector(authState),
		{ getState: () => authState },
	),
	__esModule: true,
}))

vi.mock("@/lib/messenger/api", () => ({
	backupApi: { getKeyBackup: vi.fn() },
}))

vi.mock("@/lib/messenger/e2ee", () => ({
	e2eeRuntime: {
		getState: vi.fn(() => runtimeState),
		getActiveAccountId: vi.fn(() => 42),
		activate: vi.fn(async () => {
			runtimeState.identity = { privateKey: new Uint8Array(32), publicKey: new Uint8Array(32) }
		}),
	},
	recoverIdentityFromBackup: vi.fn(),
}))

const validBackup = {
	identityPublicKey: new Uint8Array(32).fill(1),
	ciphertext: new Uint8Array(48).fill(2),
	nonce: new Uint8Array(24).fill(3),
	kdf: { salt: new Uint8Array(16).fill(4), iterations: 1000 },
} as const

describe("MessengerE2eeRecoverySurface", () => {
	beforeEach(() => {
		authState.user = { pkid: 42 }
		runtimeState.identity = null
		vi.clearAllMocks()
		vi.mocked(backupApi.getKeyBackup).mockResolvedValue({ status: "valid", backup: validBackup })
		vi.mocked(recoverIdentityFromBackup).mockResolvedValue(null)
	})

	it("renders nothing when an identity already exists", () => {
		runtimeState.identity = { privateKey: new Uint8Array(32), publicKey: new Uint8Array(32) }
		render(<MessengerE2eeRecoverySurface />)
		expect(screen.queryByText("Restore your encryption key")).not.toBeInTheDocument()
		expect(backupApi.getKeyBackup).not.toHaveBeenCalled()
	})

	it("checks for a backup when no identity exists", async () => {
		render(<MessengerE2eeRecoverySurface />)
		await waitFor(() => expect(backupApi.getKeyBackup).toHaveBeenCalledTimes(1))
		expect(screen.getByLabelText("PIN")).toBeInTheDocument()
	})

	it("shows mobile-enrollment guidance when no backup is available", async () => {
		vi.mocked(backupApi.getKeyBackup).mockResolvedValue({ status: "backup-unavailable" })
		render(<MessengerE2eeRecoverySurface />)
		await waitFor(() =>
			expect(screen.getByText(/No backup is available for this account yet/i)).toBeInTheDocument(),
		)
		expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument()
	})

	it("shows unsupported guidance without a PIN prompt", async () => {
		vi.mocked(backupApi.getKeyBackup).mockResolvedValue({
			status: "unsupported",
			reason: "different format",
		})
		render(<MessengerE2eeRecoverySurface />)
		await waitFor(() => expect(screen.getByText(/different device or format/i)).toBeInTheDocument())
		expect(screen.queryByLabelText("PIN")).not.toBeInTheDocument()
	})

	it("clears the PIN after a failed attempt", async () => {
		const user = userEvent.setup()
		vi.mocked(recoverIdentityFromBackup).mockResolvedValueOnce(null)
		render(<MessengerE2eeRecoverySurface />)
		const input = await screen.findByLabelText("PIN")
		await user.type(input, "123456")
		await user.click(screen.getByRole("button", { name: /restore key/i }))

		await waitFor(() => typeof (input as HTMLInputElement).value === "string")
		expect((input as HTMLInputElement).value).toBe("")
		expect(screen.getByText(/That PIN was not accepted/i)).toBeInTheDocument()
	})
})
