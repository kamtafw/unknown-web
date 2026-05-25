import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://dev.appscombo.org/api/v1"

export const apiClient: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	withCredentials: true, // sends the HTTP-only cookies on every request
	headers: { "Content-Type": "application/json" },
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

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean
		}

		// only attempt a refresh on 401, and only once per request
		if (error.response?.status !== 401 || original._retry) {
			return Promise.reject(error)
		}

		if (isRefreshing) {
			// queue request until ongoing refresh completes
			return new Promise((resolve, reject) => {
				waitingQueue.push({ resolve, reject })
			}).then(() => {
				original._retry=true
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
