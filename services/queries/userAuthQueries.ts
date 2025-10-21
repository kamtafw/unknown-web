/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosIsntanceAuth } from "../../lib/api/axiosInstance";
import axiosIstanceAuthenticated from "../../lib/api/axiosInstance";
import { SignupPayload } from "@/types/signup/user";

// Signup - NO TOKEN
export const signUpRequest = async (payload: SignupPayload) => {
  const response = await axiosIsntanceAuth.post("/auth/signup", payload);
  return response.data;
};

// Verify OTP - NO TOKEN
export const verifyOtp = async (payload: any) => {
  const response = await axiosIsntanceAuth.post("/auth/verify-otp", payload);
  return response.data;
};

// Resend OTP - NO TOKEN
export const resendOtp = async (email: string) => {
  const response = await axiosIsntanceAuth.post("/auth/send-otp", { email });
  return response.data;
};

// Login - NO TOKEN
export const loginRequest = async (payload: {
  identifier: string;
  password: string;
}) => {
  const response = await axiosIsntanceAuth.post("/auth/login", payload);
  return response.data;
};

// Switch OTP Default (Initial setup) - NEEDS TOKEN
export const switchOtpDefault = async (payload: {
  identifier: string;
  otp_default: string;
}) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/switch-otp-default",
    payload
  );
  return response.data;
};

// Change OTP Default (Change existing method) - NEEDS TOKEN
export const changeOtpDefault = async (payload: { otp_default: string }) => {
  const response = await axiosIstanceAuthenticated.patch(
    "/users/change-otp-default",
    payload
  );
  return response.data;
};

// Set PIN - NEEDS TOKEN
export const setPin = async (payload: { pin: string }) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/set-pin",
    payload
  );
  return response.data;
};

// Verify PIN - NEEDS TOKEN
export const verifyPin = async (payload: { pin: string }) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/verify-pin",
    payload
  );
  return response.data;
};

// Generate TOTP (Google Authenticator) - NO TOKEN
export const generateTotp = async (email: string) => {
  const response = await axiosIsntanceAuth.post("/auth/generate-totp", {
    email,
  });
  return response.data;
};

// Verify TOTP - NO TOKEN (used during setup)
export const verifyTotpSetup = async (payload: { email: string; otp: string }) => {
  const response = await axiosIsntanceAuth.post("/auth/verify-totp", payload);
  return response.data;
};

// Confirm Password - NEEDS TOKEN
export const confirmPassword = async (payload: { password: string }) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/confirm-password",
    payload
  );
  return response.data;
};

// Forgot Password - NO TOKEN
export const forgotPassword = async (email: string) => {
  const response = await axiosIsntanceAuth.post("/auth/forgot-password", {
    email,
  });
  return response.data;
};

// Reset Password - NO TOKEN
export const resetPassword = async (payload: {
  email: string;
  otp_token: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}) => {
  const requestPayload = payload;
  const response = await axiosIsntanceAuth.post(
    "/auth/reset-password",
    requestPayload
  );
  return response.data;
};

// Complete Profile - NEEDS TOKEN
export const submitUserProfile = async (payload: any) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/complete-profile",
    payload
  );
  return response.data;
};

// Get Interests - NEEDS TOKEN
export const getListOfInterests = async () => {
  const response = await axiosIstanceAuthenticated.get("/users/interests");
  return response.data;
};

// Set Interests - NEEDS TOKEN
export const setUserInterests = async (payload: any) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/interests",
    payload
  );
  return response.data;
};

// Get Users to Follow - NEEDS TOKEN
export const getListOfUsersToFollow = async () => {
  const response = await axiosIstanceAuthenticated.get(
    "/users/friend-suggestions"
  );
  return response.data;
};

// Follow User - NEEDS TOKEN
export const followAUser = async (payload: any) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/follow",
    payload
  );
  return response.data;
};

// Unfollow User - NEEDS TOKEN
export const unfollowAUser = async (payload: any) => {
  const response = await axiosIstanceAuthenticated.post(
    "/users/unfollow",
    payload
  );
  return response.data;
};
