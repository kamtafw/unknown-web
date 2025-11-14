/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/userStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { initializeSocket } from "../calls/socketService";
import { disconnectSocket } from "../calls/socketService";

import {
  FollowAUser,
  InterestsPayload,
  UserProfilePayload,
  VerifyOtpPayload,
} from "@/types/signup/user";
import {
  followAUser,
  unfollowAUser,
  getListOfInterests,
  getListOfUsersToFollow,
  loginRequest,
  generateTotp,
  verifyTotpSetup,
  resendOtp,
  setUserInterests,
  signUpRequest,
  submitUserProfile,
  verifyOtp,
  forgotPassword,
  resetPassword,
  switchOtpDefault,
  changeOtpDefault,
  setPin,
  verifyPin,
  confirmPassword,
} from "./userAuthQueries";

// SignUP
export const useSignUp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signUpRequest,
    onSuccess: (data: any) => {
      if (data?.status_code === 201) {
        setUser(data?.data);
        document.cookie = `signupFlow=true; path=/; max-age=600; SameSite=Strict; Secure`;
        setTimeout(() => {
          router.push("/otp");
          router.refresh();
        }, 100);
      }
    },
  });
};

// Login
export const useLogin = ({
  onErrorCallback,
}: { onErrorCallback?: () => void } = {}) => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setTempCredentials = useAuthStore((state) => state.setTempCredentials);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (
      data: any,
      variables: { identifier: string; password: string }
    ) => {
      if (data?.status_code === 200) {
        const userOtpDefault =
          data?.data?.user?.otp_default || data?.data?.otp_default;

        if (!data?.data?.access_token) {
          if (userOtpDefault) {
            setUser(data?.data);
            setTempCredentials({
              email: variables.identifier,
              password: variables.password,
            });

            toast.info("Please verify your identity", {
              style: { background: "#2196F3", color: "white" },
            });

            setTimeout(() => {
              router.push("/2fa-verification");
            }, 500);
            return;
          }
        }
        setUser(data?.data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict; Secure`;
          initializeSocket();
        }

        toast.success("Login successful", {
          style: { background: "green", color: "white" },
        });

        setTimeout(() => {
          router.push("/home");
        }, 500);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
      onErrorCallback?.();
    },
  });
};

// Switch OTP Default
export const useSwitchOtpDefault = () => {
  return useMutation({
    mutationFn: (payload: { identifier: string; otp_default: string }) =>
      switchOtpDefault(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("2FA method enabled successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to enable 2FA method";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Change OTP Default
export const useChangeOtpDefault = () => {
  return useMutation({
    mutationFn: (payload: { otp_default: string }) => changeOtpDefault(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("2FA method updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to update 2FA method";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Verify Login OTP from email
export const useVerifyLoginOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp({
        email: payload.email,
        otp: payload.otp,
        need_tokens: true,
        need_otp_token: false,
      }),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        setUser(data?.data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict; Secure`;
        }
        toast.success("Login successful", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/home");
        }, 500);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Invalid verification code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Resend Login OTP
export const useResendLoginOtp = () => {
  return useMutation({
    mutationFn: (email: string) => resendOtp(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 200 || data?.status_code === 201) {
        toast.success("Code sent to your email", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to resend code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Set PIN for 2FA
export const useSetPin = () => {
  return useMutation({
    mutationFn: (payload: { pin: string }) => setPin(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200 || data?.status_code === 201) {
        toast.success("PIN set successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to set PIN";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Use Verify PIN for 2FA
export const useVerifyPin = () => {
  return useMutation({
    mutationFn: (payload: { pin: string }) => verifyPin(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("PIN verified successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Incorrect PIN";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Confirm Password in forgotten password
export const useConfirmPassword = () => {
  return useMutation({
    mutationFn: (payload: { password: string }) => confirmPassword(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("Password confirmed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Incorrect password";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// 2FA for Login - Generate Google Authenticator TOTP
export const useGenerateTotp = () => {
  return useMutation({
    mutationFn: (email: string) => generateTotp(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 201 || data?.status_code === 200) {
        toast.success("2FA QR code generated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to generate 2FA code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// 2FA for Login - Verify Google Authenticator TOTP
export const useVerifyTotpSetup = () => {
  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyTotpSetup(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("2FA code verified successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Invalid verification code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get List of interests for user after signup
export const useGetListOfInterests = () => {
  return useQuery<string[]>({
    queryKey: ["interests"],
    queryFn: getListOfInterests,
    select: (data: any) => {
      return data?.data?.interests || [];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

// Verify OTP for signup
export const useVerifyOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtp(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 200) {
        setUser(data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict; Secure`;
        }
        toast.success("OTP verified successfully", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/profile");
          router.refresh();
        }, 100);
      }
    },
  });
};

// Verify OTP for password reset
export const useVerifyResetOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp({
        ...payload,
        need_tokens: false,
        need_otp_token: true,
        verification_type: "email",
      }),
    onSuccess: (data: any, variables: { email: string; otp: string }) => {
      if (data?.status_code === 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          email: variables.email,
          otp_token: data?.data?.otp_token || data?.otp_token,
        });
        toast.success("Code verified successfully", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/create-password");
          router.refresh();
        }, 100);
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Invalid code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// resend OTP
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => resendOtp(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 200 || data?.status_code === 201) {
        toast.success("OTP sent to your email", {
          style: { background: "green", color: "white" },
        });
        return data;
      }
    },
  });
};

// Submit User Profile after signup
export const useSubmitProfile = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (payload: UserProfilePayload) => submitUserProfile(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          user: {
            ...currentUser?.user,
            first_name: data?.data?.first_name,
            last_name: data?.data?.last_name,
            dob: data?.data?.dob,
          },
        });

        toast.success("Profile completed successfully", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/interest");
          router.refresh();
        }, 100);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit profile";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Forgot Password
export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("Reset code sent to your email", {
          style: { background: "green", color: "white" },
        });
        document.cookie = `resetFlow=true; path=/; max-age=600; SameSite=Strict; Secure`;
        setTimeout(() => {
          router.push("/verify-code");
          router.refresh();
        }, 100);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Email does not exist in our database.";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Reset Password
export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: {
      email: string;
      otp_token: string;
      otp: string;
      new_password: string;
      confirm_password: string;
    }) => resetPassword(payload),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("Password reset successful", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/success");
          router.refresh();
        }, 100);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Resend Reset Code
export const useResendResetCode = () => {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("Code resent successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: () => {
      toast.error("Failed to resend code", {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Set User Interests after signup
export const useSetUserInterests = () => {
  const setUser = useAuthStore((state) => state.setUser);
  return useMutation({
    mutationFn: (payload: InterestsPayload) => setUserInterests(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 200) {
        const currentUser = useAuthStore.getState().user;
        setUser({
          ...currentUser,
          interests: data?.data?.interests || data?.interests,
        });

        toast.success("Interests saved successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
  });
};

// Get List of Users to Follow
export const useGetListOfUsersToFollow = () => {
  return useQuery<any>({
    queryKey: ["suggestions"],
    queryFn: getListOfUsersToFollow,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

// Follow User
export const useFollowAUserAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FollowAUser) => followAUser(payload),

    onSuccess: (data: any) => {
      if (data?.status_code == 201 || data?.status_code == 200) {
        queryClient.invalidateQueries({ queryKey: ["suggestions"] });
        queryClient.invalidateQueries({ queryKey: ["followers"] });
        queryClient.invalidateQueries({ queryKey: ["following"] });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("User followed successfully", {
          id: "follow-success",
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to follow user", {
        id: "follow-error",
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Unfollow User
export const useUnfollowAUserAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { followed_user: number }) => unfollowAUser(payload),
    onSuccess: (data: any) => {
      if (
        data?.status_code == 200 ||
        data?.status_code == 201 ||
        data?.status_code == 204
      ) {
        queryClient.invalidateQueries({ queryKey: ["suggestions"] });
        queryClient.invalidateQueries({ queryKey: ["following"] });
        queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
        toast.success("User unfollowed successfully", {
          id: "unfollow-success",
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unfollow user", {
        id: "unfollow-error",
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Logout
export const useLogout = () => {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const cookiesToClear = [
        "accessToken",
        "signupFlow",
        "loginFlow",
        "resetFlow",
      ];

      cookiesToClear.forEach((cookieName) => {
        document.cookie = `${cookieName}=; path=/; max-age=0; SameSite=Strict; Secure`;
      });

      return { status_code: 200 };
    },
    onSuccess: () => {
      disconnectSocket();
      logout();
      toast.success("Logged out successfully", {
        style: { background: "green", color: "white" },
      });
      router.push("/");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Logout failed";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};
