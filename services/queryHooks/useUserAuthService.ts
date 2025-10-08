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
        router.push("/otp");
      }
    },
    onError: (error: any) => {
      console.log("sign up error", error);
    },
  });
};

export const useLogin = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data: any) => {
      console.log("Login response:", data);
      if (data?.status_code === 200) {
        setUser(data?.data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
        }
        toast.success("Login successful", {
          style: { background: "green", color: "white" },
        });
        router.push("/home");
      }
    },
    onError: (error: any) => {
      console.log("Login error", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Login failed. Please sign up instead.";
      toast.error(errorMessage, {
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
      console.log("verify otp", data);
      console.log(" Access token:", data?.data?.access_token);
      if (data?.status_code == 200) {
        setUser(data);
        if (data?.data?.access_token) {
          setAccessToken(data.data.access_token);
        }
        toast.success("OTP verified successfully", {
          style: { background: "green", color: "white" },
        });
        router.push("/profile");
      }
    },
  });
};

// export const useVerifyResetOtp = () => {
//   const router = useRouter();
//   const setUser = useAuthStore((state) => state.setUser);

//   return useMutation({
//     mutationFn: (payload: { email: string; otp: string }) =>
//       verifyOtp({ ...payload, need_tokens: false, need_otp_token: true }),
//     onSuccess: (data: any) => {
//       console.log("Verify reset OTP response:", data);
//       if (data?.status_code === 200) {
//         // Store the otp_token returned from API
//         const currentUser = useAuthStore.getState().user;
//         setUser({
//           ...currentUser,
//           email: payload.email, // Keep the email
//           otp_token: data?.data?.otp_token || data?.otp_token,
//         });
//         // setUser((prev: any) => ({
//         //   ...prev,
//         //   otp_token: data?.data?.otp_token || data?.otp_token
//         // }));
//         toast.success("Code verified successfully", {
//           style: { background: "green", color: "white" },
//         });
//         router.push("/create-password");
//       }
//     },
//     onError: (error: any) => {
//       const errorMessage = error?.response?.data?.message || "Invalid code";
//       toast.error(errorMessage, {
//         style: { background: "red", color: "white" },
//       });
//     },
//   });
// };
export const useVerifyResetOtp = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: { email: string; otp: string }) =>
      verifyOtp({ ...payload, need_tokens: false, need_otp_token: true }),
    onSuccess: (data: any, variables: { email: string; otp: string }) => {
      console.log("Verify reset OTP response:", data);
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
        router.push("/create-password");
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
      console.log("Resend OTP response:", data);
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
        router.push("/interest");
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
        router.push("/verify-code");
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Email not found";
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
        router.push("/success");
      }
    },
    onError: (error: any) => {
      console.log("Reset password full error:", error);
      console.log("Error response data:", error?.response?.data);
      console.log("Error response status:", error?.response?.status);
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
      console.log("Error response:", error?.response?.data);
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
      console.log("Unfollow error details:", error?.response?.data);
      toast.error(error?.response?.data?.message || "Failed to unfollow user", {
        style: { background: "red", color: "white" },
      });
    },
  });
};
