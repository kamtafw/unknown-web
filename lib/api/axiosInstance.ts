import { useAuthStore } from "@/store/userStore"
import axios from "axios"

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL

// const apiUrl = "https://dev.appscombo.org/api/v1"

export const axiosIsntanceAuth = axios.create({
	baseURL: apiUrl,
	headers: {
		"Content-Type": "application/json",
	},
})

const axiosIstanceAuthenticated = axios.create({
	baseURL: apiUrl,
	headers: {
		"Content-Type": "application/json",
	},
})

axiosIstanceAuthenticated.interceptors.request.use(
	(config) => {
		const { accessToken } = useAuthStore.getState()

		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`
		}

		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

axiosIstanceAuthenticated.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			const errorMessage = error.response?.data?.message || ""

			if (
				errorMessage.includes("token not valid") ||
				errorMessage.includes("Authentication credentials were not provided")
			) {
				console.warn("⚠️ Token invalid - logging out")

				useAuthStore.getState().logout()

				if (typeof window !== "undefined") {
					window.location.href = "/"
				}
			}
		}

		return Promise.reject(error)
	},
)

export default axiosIstanceAuthenticated
