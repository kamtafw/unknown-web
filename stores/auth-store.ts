import { FullUser, LoginUser, OtpDefault } from "@/types/api"
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PendingAuth {
	/** from the sign-in response — enough to route to the right verify screen */
	email: string
	otp_default: OtpDefault
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	reset_otp?: string
}

interface PhotoVersions {
	profile: number // 0 = untouched, Date.now() after first update
	cover: number
}

interface AuthStore {
	user: FullUser | null
	isAuthenticated: boolean
	pendingAuth: PendingAuth | null
	photoVersions: PhotoVersions
	setPendingAuth: (data: LoginUser) => void
	setUser: (data: FullUser) => void
	bumpPhotoVersion: (type: keyof PhotoVersions) => void
	clearPendingAuth: () => void
	logout: () => void
}

/**
 * append ?v=<version> to any http(s) URL so the browser fetches a fresh copy
 * when the underlying S3 key is reused; blob preview URLs and empty strings
 * pass through unchanged
 */
function withVersion(url: string | null | undefined, version: number): string {
	if (!url || !url.startsWith("http") || version === 0) return url ?? ""
	return `${url.split("?")[0]}?v=${version}`
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			isAuthenticated: false,
			pendingAuth: null,
			photoVersions: { profile: 0, cover: 0 },

			setPendingAuth: (loginUser) =>
				set({
					pendingAuth: {
						email: loginUser.email,
						otp_default: loginUser.otp_default,
						is_2fa_enabled: loginUser.is_2fa_enabled,
						is_pin_enabled: loginUser.is_pin_enabled,
					},
				}),

			setUser: (user) =>
				set((state) => ({
					user: {
						...user,
						profile_photo: withVersion(user.profile_photo, state.photoVersions.profile),
						cover_photo: withVersion(user.cover_photo, state.photoVersions.cover),
					},
					isAuthenticated: true,
					pendingAuth: null,
				})),

			bumpPhotoVersion: (type) =>
				set((state) => ({
					photoVersions: { ...state.photoVersions, [type]: Date.now() },
				})),
			clearPendingAuth: () => set({ pendingAuth: null }),
			logout: () => set({ user: null, isAuthenticated: false, pendingAuth: null }),
		}),
		{
			name: "auth-store",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: false,
				photoVersions: state.photoVersions,
				// pendingAuth intentionally excluded cos it's transient
			}),
		},
	),
)
