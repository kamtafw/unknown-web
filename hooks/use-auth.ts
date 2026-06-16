"use client"

import { authApi, userApi } from "@/lib/api"
import { extractMessage } from "@/lib/api-error"
import { toast } from "@/lib/toast"
import { useAuthStore } from "@/stores/auth-store"
import type {
	FullUser,
	LoginPayload,
	SignupPayload,
	SwitchOtpDefaultPayload,
	VerifyOtpPayload,
} from "@/types/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { useRouter } from "next/navigation"

export const authKeys = {
	me: ["auth", "me"] as const,
}

export function useLogin() {
	const router = useRouter()
	const setPendingAuth = useAuthStore((s) => s.setPendingAuth)

	return useMutation({
		mutationFn: (payload: LoginPayload) => authApi.login(payload),
		onSuccess: (res) => {
			if (!res.success) {
				toast.error(extractMessage(res, "Login failed. Please try again."))
				return
			}

			const user = res.data.user
			setPendingAuth(user)

			/**
			 * routing rule:
			 *
			 * otp_default tells the user's PREFERRED method, but it doesn't
			 * tell what other methods they have available; a user can have
			 * otp_default = 'email' while also having 2FA and PIN enabled — in
			 * that case they still need to see the tab switcher on /2fa.
			 *
			 * so the rule is:
			 *  has any additional method (2FA or PIN)   →  /2fa
			 *   (TwoFactorVerification seeds the active tab from otp_default)
			 *  email only (neither flag is true)        →  /verify
			 *   (OTPVerification — no switcher shown)
			 */

			const hasAdditionalMethods = user.is_2fa_enabled || user.is_pin_enabled

			if (hasAdditionalMethods) {
				toast.info("Security verification required")
				router.push("/2fa")
			} else {
				toast.info("OTP code sent to your email")
				router.push("/verify?flow=signin")
			}
		},
		onError: (error) => {
			toast.error(extractMessage(error, "Invalid email or password. Please try again."))
		},
	})
}

export function useSignup() {
	const router = useRouter()

	return useMutation({
		mutationFn: (payload: SignupPayload) => authApi.signup(payload),
		onSuccess: (res, vars) => {
			if (!res.success) return

			useAuthStore.setState({
				pendingAuth: {
					email: vars.email,
					otp_default: "email",
					is_2fa_enabled: false,
					is_pin_enabled: false,
				},
			})
			toast.success("Account created! Check your inbox for a verification code.")
			router.push("/verify?flow=signup")
		},
	})
}

export function useVerifyOtp(flow: "signup" | "signin" | "reset") {
	const router = useRouter()
	const queryClient = useQueryClient()
	const setUser = useAuthStore((s) => s.setUser)

	return useMutation({
		mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
		onSuccess: async (res, vars) => {
			if (!res.success) return

			if (flow === "reset") {
				useAuthStore.setState((state) => ({
					pendingAuth: state.pendingAuth
						? { ...state.pendingAuth, reset_otp: vars.otp }
						: state.pendingAuth,
				}))
				toast.success("Code verified! Set your new password.")
				router.push("/create-new-password")
				return
			}

			const fullUser = res.data.user as FullUser | null

			if (!fullUser) {
				router.push("/sign-in")
				return
			}

			queryClient.setQueryData(authKeys.me, fullUser)
			setUser(fullUser)

			if (flow === "signin") {
				toast.success(`Welcome back, ${fullUser.first_name || fullUser.username}!`)
				router.push("/home")
			}
		},
		onError: (error) => {
			toast.error(extractMessage(error, "Invalid or expired code. Please try again."))
		},
	})
}

export function useSwitchOtpDefault() {
	return useMutation({
		mutationFn: (payload: SwitchOtpDefaultPayload) => authApi.switchOtpDefault(payload),
	})
}

export function useForgotPassword() {
	const router = useRouter()

	return useMutation({
		mutationFn: (email: string) => authApi.forgotPassword(email),
		onSuccess: (res, email) => {
			if (!res.success) return // TODO: add an error toast

			useAuthStore.setState({
				pendingAuth: { email, otp_default: "email", is_2fa_enabled: false, is_pin_enabled: false },
			})
			toast.success("OTP sent to your email.")
			router.push("/verify?flow=reset")
		},
		onError: (error) => {
			toast.error(extractMessage(error, "Email does not exist in our database."))
		},
	})
}

export function useResetPassword() {
	const router = useRouter()
	const clearPendingAuth = useAuthStore((s) => s.clearPendingAuth)

	return useMutation({
		mutationFn: (payload: { new_password: string; confirm_password: string }) => {
			const pendingAuth = useAuthStore.getState().pendingAuth
			return authApi.resetPassword({
				email: pendingAuth!.email,
				otp: pendingAuth!.reset_otp!,
				...payload,
			})
		},
		onSuccess: (res) => {
			if (!res.success) return

			// TODO: add a success toast
			clearPendingAuth()

			router.push("/sign-in")
		},
		onError: (error) => {
			const axiosErr = error as AxiosError<{ error?: Record<string, string[]> }>
			const fieldErrors = axiosErr.response?.data?.error
			if (fieldErrors) {
				toast.error(Object.values(fieldErrors).flat()[0] || "Password reset failed.")
			} else {
				toast.error(extractMessage(error, "Password reset failed. Please try again."))
			}
		},
	})
}

export function useCompleteProfile() {
	const router = useRouter()

	return useMutation({
		mutationFn: userApi.completeProfile,
		onSuccess: (res) => {
			if (!res.success) return

			toast.success("Profile saved! Now let's personalise your feed.")
			router.push("/interests")
		},
		onError: (error) => {
			toast.error(extractMessage(error, "Couldn't save your profile. Please try again."))
		},
	})
}

export function useResendOtp() {
	return useMutation({
		mutationFn: (email: string) => authApi.resendOtp(email),
		onSuccess: () => {
			toast.success("New code sent to your email")
		},
		onError: (error) => {
			toast.error(extractMessage(error, "Couldn't resend code. Try again shortly."))
		},
	})
}

export function useMe() {
	return useQuery({
		queryKey: authKeys.me,
		queryFn: userApi.getMe,
		staleTime: 1000 * 60 * 5,
	})
}

export function useLogout() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const logout = useAuthStore((s) => s.logout)

	return useMutation({
		mutationFn: authApi.logout,
		onSettled: () => {
			logout()
			queryClient.clear()
			router.push("/sign-in")
		},
	})
}
