import { backupApi } from "@/lib/messenger/api"
import { recoverIdentityFromBackup } from "@/lib/messenger/e2ee"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MessengerE2eeRecoverySurface } from "./messenger-e2ee-recovery-surface"

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
		expect(await screen.findByLabelText("Six-digit recovery PIN")).toBeInTheDocument()
	})

	it("shows mobile-enrollment guidance when no backup is available", async () => {
		vi.mocked(backupApi.getKeyBackup).mockResolvedValue({ status: "backup-unavailable" })
		render(<MessengerE2eeRecoverySurface />)
		expect(
			await screen.findByText(/There is no messaging backup for this account yet/i),
		).toBeInTheDocument()
		expect(screen.queryByLabelText("Six-digit recovery PIN")).not.toBeInTheDocument()
	})

	it("shows original-device replacement instructions for an unsupported backup", async () => {
		vi.mocked(backupApi.getKeyBackup).mockResolvedValue({
			status: "unsupported",
			reason: "different format",
		})
		render(<MessengerE2eeRecoverySurface />)
		expect(
			await screen.findByText(/Update the backup on your original device/i),
		).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /Check for updated backup/i })).toBeInTheDocument()
		expect(screen.getByText(/Do not delete the old backup/i)).toBeInTheDocument()
		expect(screen.queryByLabelText("Six-digit recovery PIN")).not.toBeInTheDocument()
	})

	it("preserves unsupported-backup guidance when checking for an update fails", async () => {
		const user = userEvent.setup()
		vi.mocked(backupApi.getKeyBackup)
			.mockResolvedValueOnce({ status: "unsupported", reason: "legacy format" })
			.mockResolvedValueOnce({ status: "api-error" })
		render(<MessengerE2eeRecoverySurface />)

		await user.click(await screen.findByRole("button", { name: /Check for updated backup/i }))

<<<<<<< HEAD
		expect(await screen.findByRole("alert")).toHaveTextContent(/current recovery options are unchanged/i)
=======
		expect(await screen.findByRole("alert")).toHaveTextContent(
			/current recovery options are unchanged/i,
		)
>>>>>>> 843d8dae80065628be944cc7076945906d94641a
		expect(screen.getByText(/Update the backup on your original device/i)).toBeInTheDocument()
		expect(screen.getByRole("button", { name: /Check for updated backup/i })).toBeInTheDocument()
		expect(backupApi.getKeyBackup).toHaveBeenCalledTimes(2)
	})

	it("keeps a recovery entry point when the dialog is dismissed", async () => {
		const user = userEvent.setup()
		render(<MessengerE2eeRecoverySurface />)

		await screen.findByLabelText("Six-digit recovery PIN")
		await user.click(screen.getByRole("button", { name: /^Not now$/i }))

		const resumeButton = await screen.findByRole("button", { name: /Resume recovery/i })
		expect(screen.getByText(/Secure messaging is unavailable on this device/i)).toBeInTheDocument()
		await user.click(resumeButton)
		expect(await screen.findByLabelText("Six-digit recovery PIN")).toBeInTheDocument()
	})

	it("clears the PIN after a failed attempt", async () => {
		const user = userEvent.setup()
		vi.mocked(recoverIdentityFromBackup).mockResolvedValueOnce(null)
		render(<MessengerE2eeRecoverySurface />)
		const firstDigit = await screen.findByRole("textbox", { name: "Character 1 of 6" })
		await user.type(firstDigit, "123456")
		await user.click(screen.getByRole("button", { name: /^restore$/i }))
		expect(await screen.findByText(/That PIN wasn't accepted/i)).toBeInTheDocument()
		expect(screen.getByRole("textbox", { name: "Character 1 of 6" })).toHaveValue("")
		expect(recoverIdentityFromBackup).toHaveBeenCalledTimes(1)
	})
})
