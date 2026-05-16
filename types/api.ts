export interface ApiResponse<T> {
	success: boolean
	status_code: number
	message: string
	data: T
}

// auth
export type OtpDefault = "email" | "pin" | "2fa"

/** minimal user shape returned by login — enough to drive routing */
export interface LoginUser {
	pkid: number
	id: string
	first_name: string
	last_name: string
	email: string
	username: string
	phone_number: string
	dob: string | null
	dob_visibility: "full" | "partial" | "hidden"
	profile_photo: string
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	otp_default: OtpDefault
	is_active: boolean
	is_administrator: boolean
}

export interface LoginResponseData {
	user: LoginUser
}

/** full user shape from `/users/me` */
export interface FullUser {
	pkid: number
	id: string
	first_name: string | null
	last_name: string | null
	email: string
	username: string
	phone_number: string
	dob: string | null
	country: string
	state: string
	date_joined: string
	dob_visibility: "full" | "partial" | "hidden"
	profile_photo: string
	cover_photo: string
	is_2fa_enabled: boolean
	is_pin_enabled: boolean
	otp_default: OtpDefault
	is_active: boolean
	is_administrator: boolean
	profile: {
		occupation: string
		interests: string[]
		about_me: string
	}
	external_links: Array<{
		id: number
		url: string
		label: string
	}>
	follower_count: number
	following_count: number
	connection_count: number
}

/** data returned by verify-otp — tokens stay server-side; client gets user + otp_token */
export interface VerifyOtpResponseData {
	user: {
		pkid: number
		id: string
		first_name: string | null
		last_name: string | null
		email: string
		username: string
		phone_number: string
		profile_photo: string
		is_2fa_enabled: boolean
		is_pin_enabled: boolean
		is_active: boolean
	}
	/** opaque token for actions that need OTP re-confirmation */
	otp_token: string
}

export interface LoginPayload {
	identifier: string
	password: string
}

export interface SignupPayload {
	email: string
	phone_number: string
	password: string
}

export interface VerifyOtpPayload {
	email: string
	otp: string
	need_tokens?: boolean
	need_otp_token?: boolean
}
