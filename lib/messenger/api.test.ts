import { isAxiosError } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { apiClient } from "../axios"
import { backupApi } from "./api"
import { BACKUP_VECTOR } from "./e2ee/e2ee-test-vectors"

vi.mock("../axios", () => ({
	apiClient: {
		get: vi.fn(),
	},
}))

const validBackup = {
	format_version: 1,
	recovery_method: "six_digit_pin",
	encryption_algorithm: "nacl_secretbox_xsalsa20poly1305",
	identity_public_key: BACKUP_VECTOR.identityPublicKeyBase64,
	ciphertext: BACKUP_VECTOR.ciphertextBase64,
	nonce: BACKUP_VECTOR.nonceBase64,
	kdf: {
		algorithm: "pbkdf2",
		prf: "hmac_sha256",
		salt: BACKUP_VECTOR.saltBase64,
		iterations: 600_000,
		output_length: 32,
	},
	updated_at: "2026-09-27T00:00:00Z",
} as const

function axiosLikeError(status?: number) {
	return Object.assign(new Error("request failed"), {
		isAxiosError: true,
		...(status === undefined
			? {}
			: {
					response: {
						status,
						data: { success: false, data: null },
					},
				}),
	})
}

describe("backupApi.getKeyBackup", () => {
	const getMock = vi.mocked(apiClient.get)

	beforeEach(() => {
		vi.resetAllMocks()
	})

	it("classifies a valid v1 backup inside a successful API envelope", async () => {
		getMock.mockResolvedValue({
			data: { success: true, status_code: 200, message: null, data: validBackup },
		} as never)

		const result = await backupApi.getKeyBackup()

		expect(getMock).toHaveBeenCalledOnce()
		expect(getMock).toHaveBeenCalledWith("/api/chats/users/key-backup")
		expect(result.status).toBe("valid")
		if (result.status !== "valid") throw new Error("expected a valid backup")
		expect(result.backup.identityPublicKey).toHaveLength(32)
		expect(result.backup.ciphertext).toHaveLength(48)
		expect(result.backup.nonce).toHaveLength(24)
		expect(result.backup.kdf.salt).toHaveLength(16)
	})

	it.each([
		["missing data", { success: true, status_code: 200, message: null }],
		["null data", { success: true, status_code: 200, message: null, data: null }],
		["array data", { success: true, status_code: 200, message: null, data: [] }],
		["primitive data", { success: true, status_code: 200, message: null, data: "backup" }],
	])("returns api-error when the success envelope has %s", async (_label, envelope) => {
		getMock.mockResolvedValue({ data: envelope } as never)

		await expect(backupApi.getKeyBackup()).resolves.toEqual({ status: "api-error" })
	})

	it("returns api-error when the API envelope reports success=false", async () => {
		getMock.mockResolvedValue({
			data: {
				success: false,
				status_code: 500,
				message: "Request failed",
				data: validBackup,
			},
		} as never)

		await expect(backupApi.getKeyBackup()).resolves.toEqual({ status: "api-error" })
	})

	it("classifies a recognizable unsupported KDF as unsupported", async () => {
		getMock.mockResolvedValue({
			data: {
				success: true,
				status_code: 200,
				message: null,
				data: {
					...validBackup,
					kdf: { ...validBackup.kdf, algorithm: "argon2id" },
				},
			},
		} as never)

		const result = await backupApi.getKeyBackup()
		expect(result.status).toBe("unsupported")
	})

	it("classifies malformed backup fields as malformed", async () => {
		getMock.mockResolvedValue({
			data: {
				success: true,
				status_code: 200,
				message: null,
				data: { ...validBackup, identity_public_key: "not-base64!" },
			},
		} as never)

		const result = await backupApi.getKeyBackup()
		expect(result.status).toBe("malformed")
	})

	it("maps HTTP 404 to backup-unavailable", async () => {
		getMock.mockRejectedValue(axiosLikeError(404))

		await expect(backupApi.getKeyBackup()).resolves.toEqual({ status: "backup-unavailable" })
	})

	it("rethrows network failures so the caller can offer retry", async () => {
		const error = axiosLikeError()
		expect(isAxiosError(error)).toBe(true)
		getMock.mockRejectedValue(error)

		await expect(backupApi.getKeyBackup()).rejects.toBe(error)
	})

	it("rethrows HTTP 500 so the caller can offer retry", async () => {
		const error = axiosLikeError(500)
		getMock.mockRejectedValue(error)

		await expect(backupApi.getKeyBackup()).rejects.toBe(error)
	})
})
