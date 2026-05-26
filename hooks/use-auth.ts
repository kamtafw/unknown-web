"use client"

import { authApi, userApi } from "@/lib/api"
import { useAuthStore } from "@/stores/auth-store"
import type { FullUser, LoginPayload, SignupPayload, VerifyOtpPayload } from "@/types/api"
import { useShallow } from "zustand/react/shallow"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
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
			if (!res.success) return

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
				router.push("/2fa")
			} else {
				router.push("/verify?flow=signin")
			}
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
			router.push("/verify?flow=signup")
		},
	})
}

export function useVerifyOtp(flow: "signup" | "signin" | "reset") {
	const router = useRouter()
	const queryClient = useQueryClient()

	const { setUser, clearPendingAuth } = useAuthStore(
		useShallow((s) => ({
			setUser: s.setUser,
			clearPendingAuth: s.clearPendingAuth,
		})),
	)

	return useMutation({
		mutationFn: (payload: VerifyOtpPayload) => authApi.verifyOtp(payload),
		onSuccess: async (res) => {
			if (!res.success) return

			if (flow === "reset") {
				clearPendingAuth()
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
				router.push("/home")
			}
		},
	})
}

export function useMe() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

	return useQuery({
		queryKey: authKeys.me,
		queryFn: userApi.getMe,
		enabled: isAuthenticated,
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
