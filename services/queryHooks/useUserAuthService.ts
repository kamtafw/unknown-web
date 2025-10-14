/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from "@/store/userStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  // verifyTotp,
  // resendTotp,
  resendOtp,
  setUserInterests,
  signUpRequest,
  submitUserProfile,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../queries/userAuthQueries";

export const useSignUp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: signUpRequest,
    onSuccess: (data: any) => {
      console.log("Signup response:", data);
      if (data?.status_code === 201) {
        setUser(data?.data);
        document.cookie = `signupFlow=true; path=/; max-age=600; SameSite=Strict`;
        setTimeout(() => {
          router.push("/otp");
          router.refresh();
        }, 100);
      }
    },
  });
};

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
        setUser(data?.data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict`;
        }
        document.cookie = `loginFlow=true; path=/; max-age=600; SameSite=Strict`;
        setTempCredentials({
          email: data?.data?.user?.email || variables.identifier,
        });

        toast.success("OTP has been sent to your email for verification", {
          style: { background: "green", color: "white" },
        });

        setTimeout(() => {
          router.push("/verify-email");
          router.refresh();
        }, 100);
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Login failed. Please sign up instead.";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
      onErrorCallback?.();
    },
  });
};

export const useVerifyLoginOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp({ ...payload, need_tokens: true, need_otp_token: false }),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        setUser(data?.data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict`;
        }
        toast.success("Email verified successfully", {
          style: { background: "green", color: "white" },
        });
        setTimeout(() => {
          router.push("/home");
          router.refresh();
        }, 100);
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

export const useVerifyTotp = () => {
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
        }
        toast.success("2FA verification successful", {
          style: { background: "green", color: "white" },
        });
        router.push("/home");
      }
    },
    onError: (error: any) => {
      console.log("Full error:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message || "Invalid verification code";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

export const useResendTotp = () => {
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
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend code", {
        style: { background: "red", color: "white" },
      });
    },
  });
};

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
          document.cookie = `accessToken=${data.data.access_token}; path=/; max-age=86400; SameSite=Strict`;
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

export const useVerifyResetOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp({ ...payload, need_tokens: false, need_otp_token: true }),
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

export const useSubmitProfile = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: UserProfilePayload) => submitUserProfile(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 200) {
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

export const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onSuccess: (data: any) => {
      if (data?.status_code === 200) {
        toast.success("Reset code sent to your email", {
          style: { background: "green", color: "white" },
        });
        document.cookie = `resetFlow=true; path=/; max-age=600; SameSite=Strict`;
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
    onError: (error: any) => {
      console.log("Reset password error:", error);
      console.log("Error response:");
      toast.error("Failed to resend code", {
        style: { background: "red", color: "white" },
      });
    },
  });
};

export const useSetUserInterests = () => {
  return useMutation({
    mutationFn: (payload: InterestsPayload) => setUserInterests(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 200) {
        toast.success("Interests saved successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
  });
};

export const useGetListOfUsersToFollow = () => {
  return useQuery<any>({
    queryKey: ["suggestions"],
    queryFn: getListOfUsersToFollow,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

export const useFollowAUserAction = () => {
  return useMutation({
    mutationFn: (payload: FollowAUser) => followAUser(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 201) {
        toast.success("User followed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      console.log("Follow error details:", error?.response?.data);
      toast.error(error?.response?.data?.message || "Failed to follow user", {
        style: { background: "red", color: "white" },
      });
    },
  });
};

export const useUnfollowAUserAction = () => {
  return useMutation({
    mutationFn: (payload: FollowAUser) => unfollowAUser(payload),
    onSuccess: (data: any) => {
      if (data?.status_code == 201) {
        toast.success("User unfollowed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unfollow user", {
        style: { background: "red", color: "white" },
      });
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: async () => {
      document.cookie =
        "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      return { status_code: 200 };
    },
    onSuccess: () => {
      setAccessToken(null);
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
