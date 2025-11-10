import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useSignUp,
  useVerifyOtp,
} from "@/services/auth/useUserAuthService";
import * as queries from "@/services/auth/userAuthQueries";
import { useAuthStore } from "@/store/userStore";

// Mock the queries
vi.mock("@/services/queries/userAuthQueries");

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return TestWrapper;
};

describe("useSignUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
  });

  it("calls signUpRequest with correct payload", async () => {
    const mockResponse = {
      status_code: 201,
      data: { user: { email: "test@example.com" } },
    };

    vi.mocked(queries.signUpRequest).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    const payload = {
      email: "test@example.com",
      phone_number: "1234567890",
      password: "Password1!",
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(queries.signUpRequest).toHaveBeenCalledWith(payload);
    });
  });

  it("updates auth store on successful signup", async () => {
    const mockResponse = {
      status_code: 201,
      data: {
        user: { email: "test@example.com" },
        access_token: "token123",
      },
    };

    vi.mocked(queries.signUpRequest).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: "test@example.com",
      phone_number: "1234567890",
      password: "Password1!",
    });

    await waitFor(() => {
      expect(useAuthStore.getState().user).toEqual(mockResponse.data);
    });
  });

  it("handles signup error", async () => {
    const mockError = {
      errors: {
        email: { message: "Email already exists" },
      },
    };

    vi.mocked(queries.signUpRequest).mockRejectedValue(mockError);

    const { result } = renderHook(() => useSignUp(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      email: "test@example.com",
      phone_number: "1234567890",
      password: "Password1!",
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe("useVerifyOtp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls verifyOtp with correct payload", async () => {
    const mockResponse = {
      status_code: 200,
      data: { user: { email: "test@example.com" } },
    };

    vi.mocked(queries.verifyOtp).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useVerifyOtp(), {
      wrapper: createWrapper(),
    });

    const payload = {
      email: "test@example.com",
      otp: "123456",
      need_tokens: true,
      need_otp_token: false,
    };

    result.current.mutate(payload);

    await waitFor(() => {
      expect(queries.verifyOtp).toHaveBeenCalledWith(payload);
    });
  });
});
