import {
	ApiResponse,
	FullUser,
	LoginPayload,
	LoginResponseData,
	SignupPayload,
	VerifyOtpPayload,
	VerifyOtpResponseData,
} from "@/types/api"
import { apiClient } from "./axios"

// all calls go to Next.js route handlers and not Django directly,
// so HTTP-only cookies are set/read server-side

export const authApi = {
	login: (payload: LoginPayload) =>
		apiClient.post<ApiResponse<LoginResponseData>>("/api/auth/login", payload).then((r) => r.data),

	signup: (payload: SignupPayload) =>
		apiClient.post<ApiResponse<null>>("/api/auth/signup", payload).then((r) => r.data),

	verifyOtp: (payload: VerifyOtpPayload) =>
		apiClient
			.post<
				ApiResponse<VerifyOtpResponseData & { otp_token: string }>
			>("/api/auth/verify-otp", payload)
			.then((r) => r.data),

	logout: () => apiClient.post("/api/auth/logout").then((r) => r.data),
}

export const userApi = {
	/** full profile — call immediately after verify-otp success */
	getMe: () =>
		apiClient.get<ApiResponse<FullUser>>("/api/users/me").then((r) => {
			const user = r.data.data
			if (!user) throw new Error("getMe returned empty data")
			return user
		}),
}
