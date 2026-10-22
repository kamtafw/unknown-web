import axios, { AxiosError, type AxiosAdapter } from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { apiClient } from "./axios"

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }))

beforeEach(() => vi.clearAllMocks())

describe("HTTP request cancellation", () => {
	it("silently rejects a pending lookup cancelled by its AbortSignal", async () => {
		const controller = new AbortController()
		const adapter = vi.fn<AxiosAdapter>(
			(config) =>
				new Promise((_, reject) => {
					config.signal?.addEventListener?.("abort", () =>
						reject(new axios.CanceledError("Superseded lookup", config)),
					)
				}),
		)
		const request = apiClient.get(
			"/api/marketplace/products/specification-suggestions",
			{
				signal: controller.signal,
				adapter,
			},
		)
		const rejection = expect(request).rejects.toMatchObject({
			code: "ERR_CANCELED",
			_interceptorHandled: true,
		})
		await vi.waitFor(() => expect(adapter).toHaveBeenCalledTimes(1))
		controller.abort()
		await rejection
		expect(toast.error).not.toHaveBeenCalled()
	})

	it("does not toast for a signal cancelled before dispatch", async () => {
		const controller = new AbortController()
		controller.abort()
		const adapter = vi.fn<AxiosAdapter>()
		await expect(
			apiClient.get("/lookup", { signal: controller.signal, adapter }),
		).rejects.toMatchObject({ code: "ERR_CANCELED" })
		expect(adapter).not.toHaveBeenCalled()
		expect(toast.error).not.toHaveBeenCalled()
	})

	it.each(["ECONNABORTED", "ETIMEDOUT"])(
		"still reports actual %s timeouts",
		async (code) => {
			await expect(
				apiClient.get("/lookup", {
					adapter: async (config) => {
						throw new AxiosError("Timed out", code, config)
					},
				}),
			).rejects.toMatchObject({ code })
			expect(toast.error).toHaveBeenCalledExactlyOnceWith(
				"Request timed out — please check your connection and try again.",
				expect.objectContaining({ id: "request-timeout" }),
			)
		},
	)

	it("still reports genuine network failures", async () => {
		await expect(
			apiClient.get("/lookup", {
				adapter: async (config) => {
					throw new AxiosError("Offline", "ERR_NETWORK", config)
				},
			}),
		).rejects.toMatchObject({ code: "ERR_NETWORK" })
		expect(toast.error).toHaveBeenCalledExactlyOnceWith(
			"Network error — please check your connection.",
			expect.objectContaining({ id: "network-error" }),
		)
	})
})
