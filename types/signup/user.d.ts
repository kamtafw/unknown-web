/* eslint-disable @typescript-eslint/no-explicit-any */
export interface User {
  // email: string;
  // phone_number: string;
  // token?: string;
  success: boolean,
  status_code: number,
  message: string,
  data: {
      user: {
          pkid: number,
          id: string,
          first_name: string | null,
          last_name: string | null,
          email: string,
          username: string,
          phone_number: string,
          dob: string | null,
          dob_visibility: string,
          profile_photo: string | null,
          is_2fa_enabled: boolean,
          is_pin_enabled: boolean,
          is_active: boolean,
          is_administrator: boolean
      },
      access_token: string,
      refresh_token: string
  }
}

export interface UserAuthState {
  user: any;
  setUser: (user: any) => void;
  logout: () => void;
}

export interface SignupPayload {
  email: string;
  phone_number: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  need_tokens: boolean; // use false if you don't need auth tokens to be returned
  need_otp_token: boolean;
}

export interface UserProfilePayload {
  first_name: string;
  last_name: string;
  dob: string;
}

export interface InterestsPayload {
  interests: string[]
}

export type FollowAUser = {
  followed_user: string | number
}
