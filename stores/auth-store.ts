import { FullUser, LoginUser, OtpDefault } from "@/types/api"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PendingAuth {
	/** from the sign-in response — enough to route to the right verify screen */
	email: string
	otp_default: OtpDefault
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	reset_otp?:string
}

interface AuthStore {
	user: FullUser | null
	isAuthenticated: boolean
	pendingAuth: PendingAuth | null
	setPendingAuth: (data: LoginUser) => void
	setUser: (data: FullUser) => void
	clearPendingAuth: () => void
	logout: () => void
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			pendingAuth: null,
			setPendingAuth: (loginUser) =>
				set({
					pendingAuth: {
						email: loginUser.email,
						otp_default: loginUser.otp_default,
						is_2fa_enabled: loginUser.is_2fa_enabled,
						is_pin_enabled: loginUser.is_pin_enabled,
					},
				}),
			setUser: (user) => set({ user, isAuthenticated: true, pendingAuth: null }),
			clearPendingAuth: () => set({ pendingAuth: null }),
			logout: () => set({ user: null, isAuthenticated: false, pendingAuth: null }),
		}),
		{
			name: "auth-store",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: false,
				// pendingAuth intentionally excluded cos it's transient
			}),
		},
	),
)
