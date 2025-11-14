import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  reportProblem,
  changePhoneNumber,
  confirmPassword,
  getCurrentTimezone,
  getAvailableTimezones,
  changeTimezone,
} from "./accountQueries";
import { useAccountStore } from "@/store/accountStore";

interface ReportProblemResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    report: {
      problem_type: string;
      feedback?: string;
    };
  };
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: Record<string, string[]>;
      errors?: Record<string, string[]>;
    };
  };
}

// Report Problem
export const useReportProblem = () => {
  const addReportedProblem = useAccountStore(
    (state) => state.addReportedProblem
  );

  return useMutation({
    mutationFn: (payload: { problem_type: string; feedback?: string }) =>
      reportProblem(payload),
    onSuccess: (data: ReportProblemResponse) => {
      if (data?.status_code === 201) {
        // Store the reported problem
        addReportedProblem({
          ...data.data.report,
          timestamp: new Date().toISOString(),
          id: Date.now().toString(),
        });
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to submit problem report";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Change Phone Number
export const useChangePhoneNumber = () => {
  return useMutation({
    mutationFn: (payload: { old_number: string; new_number: string; otp?: string }) =>
      changePhoneNumber(payload),
    onSuccess: (data) => {
      console.log("Phone change success:", data); // Debug log
      if (data?.status_code === 200) {
        toast.success(data.message || "Phone number changed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      console.error("Phone change error:", error);
      const errorData =
        error?.response?.data?.errors || error?.response?.data?.error;

      if (errorData) {
        // Handle non-field errors (Old number is not correct, New number must be different)
        if (errorData.non_field_errors) {
          toast.error(errorData.non_field_errors[0], {
            style: { background: "red", color: "white" },
          });
        }
        // Handle field-specific errors (blank fields, invalid format)
        else if (errorData.old_number || errorData.new_number) {
          const errors = [];
          if (errorData.old_number) {
            errors.push(errorData.old_number[0]);
          }
          if (errorData.new_number) {
            errors.push(errorData.new_number[0]);
          }
          toast.error(errors.join(". "), {
            style: { background: "red", color: "white" },
          });
        }
        // Fallback for any other error format
        else {
          const errorMessages = Object.values(errorData).flat().join(". ");

          toast.error(errorMessages || "Failed to change phone number", {
            style: { background: "red", color: "white" },
          });
        }
      } else {
        const errorMessage =
          error?.response?.data?.message || "Failed to change phone number";
        toast.error(errorMessage, {
          style: { background: "red", color: "white" },
        });
      }
    },
  });
};

// Confirm Password
export const useConfirmPassword = () => {
  return useMutation({
    mutationFn: (payload: { password: string }) => confirmPassword(payload),
    onSuccess: (data) => {
      console.log("Password confirm success:", data); // Debug log
      if (data?.status_code === 200) {
        toast.success(data.message || "Password confirmed successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      console.error("Password confirm error:", error);
      const errorData =
        error?.response?.data?.errors || error?.response?.data?.error;

      let errorMessage = "Incorrect password";

      if (errorData) {
        const firstError = Object.values(errorData)[0];
        errorMessage = firstError?.[0] || errorMessage;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};

// Get Current Timezone
export const useGetCurrentTimezone = () => {
  const setCurrentTimezone = useAccountStore(
    (state) => state.setCurrentTimezone
  );

  return useQuery({
    queryKey: ["current-timezone"],
    queryFn: async () => {
      const data = await getCurrentTimezone();
      if (data?.status_code === 200) {
        setCurrentTimezone(data.data.timezone);
      }
      return data;
    },
    retry: 1,
  });
};

// Get Available Timezones (use useQuery for this)
export const useGetAvailableTimezones = (locale: string = "en") => {
  return useQuery({
    queryKey: ["available-timezones", locale],
    queryFn: () => getAvailableTimezones(locale),
  });
};

// Change Timezone
export const useChangeTimezone = () => {
  const setCurrentTimezone = useAccountStore(
    (state) => state.setCurrentTimezone
  );

  return useMutation({
    mutationFn: (payload: { timezone: string }) => changeTimezone(payload),
    onSuccess: (data) => {
      if (data?.status_code === 200) {
        setCurrentTimezone(data.data.timezone);
        toast.success(data.message || "Timezone updated successfully", {
          style: { background: "green", color: "white" },
        });
      }
    },
    onError: (error: ApiError) => {
      const errorMessage =
        error?.response?.data?.message || "Failed to change timezone";
      toast.error(errorMessage, {
        style: { background: "red", color: "white" },
      });
    },
  });
};