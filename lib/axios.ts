import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"
import { toast } from "sonner"

export const apiClient: AxiosInstance = axios.create({
	withCredentials: true, // sends the HTTP-only cookies on every request
})

let isRefreshing = false
let waitingQueue: Array<{
	resolve: (value: unknown) => void
	reject: (reason?: unknown) => void
}> = []

function processQueue(error: AxiosError | null) {
	waitingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(undefined)))
	waitingQueue = []
}

const AUTH_ROUTES = ["/api/auth/login", "/api/auth/signup", "/api/auth/verify-otp"]

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
		const status = error.response?.status

		// these don't produce a useful body — individual onError handlers can't help
		if (status === 502 || status === 503 || status === 504) {
			toast.error(
				status === 503
					? "AppsCombo is briefly unavailable. Hang tight."
					: "Network error — please check your connection.",
				{ id: "gateway-error", duration: 6000 },
			)
			return Promise.reject(error)
		}

		// only attempt a refresh on 401, and only once per request
		if (
			status !== 401 ||
			original._retry ||
			AUTH_ROUTES.some((route) => original.url?.includes(route))
		) {
			return Promise.reject(error)
		}

		if (isRefreshing) {
			// queue request until ongoing refresh completes
			return new Promise((resolve, reject) => {
				waitingQueue.push({ resolve, reject })
			}).then(() => {
				original._retry = true
				return apiClient(original)
			})
		}

		original._retry = true
		isRefreshing = true

		try {
			// the refresh route handler reads the HTTP-only cookie itself —
			// no token needs to be passed in the body
			await axios.post("/api/auth/refresh", {}, { withCredentials: true })
			processQueue(null)
			return apiClient(original)
		} catch (refreshError) {
			processQueue(refreshError as AxiosError)
			// hard redirect to login; avoid router import to keep this file
			// usable outside React component trees
			if (typeof window !== "undefined") {
				window.location.href = "/sign-in"
			}
			return Promise.reject(refreshError)
		} finally {
			isRefreshing = false
		}
	},
)
