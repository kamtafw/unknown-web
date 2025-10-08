// Mock axios before importing the queries
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })),
  },
}));

// Mock the auth store
vi.mock("@/store/userStore", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: "mock-token",
    })),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginFormModule from "@/components/modules/authModules/LoginFormModule"; // Update this path
import { useLogin } from "@/services/queryHooks/useUserAuthService";

// Mock the useLogin hook
vi.mock("@/services/queryHooks/useUserAuthService", () => ({
  useLogin: vi.fn(),
}));

// Mock the Icons
vi.mock("@/components/shared/Icons", () => ({
  EmailIcon: () => <div data-testid="email-icon">Email Icon</div>,
  PadlockIcon: () => <div data-testid="padlock-icon">Padlock Icon</div>,
}));

// Mock sonner toast
vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

describe("LoginFormModule", () => {
  let queryClient: QueryClient;
  const mockMutate = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mock before each test
    vi.clearAllMocks();

    // Default mock implementation
    (useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <LoginFormModule />
      </QueryClientProvider>
    );
  };

  it("renders the login form correctly", () => {
    renderComponent();

    expect(screen.getByText("Email or Phone")).toBeInTheDocument();
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your email or phone number")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(
      "Enter your password"
    ) as HTMLInputElement;

    // Initially password should be hidden
    expect(passwordInput.type).toBe("password");

    // Click the toggle button
    const toggleButtons = screen.getAllByRole("button") as HTMLButtonElement[];
    const eyeButton = toggleButtons.find(
      (btn) =>
        btn.type === "button" &&
        btn !== screen.getByRole("button", { name: /sign in/i })
    );

    if (eyeButton) {
      await user.click(eyeButton);
      expect(passwordInput.type).toBe("text");

      await user.click(eyeButton);
      expect(passwordInput.type).toBe("password");
    }
  });

  it("calls mutate with correct data when form is submitted", async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByPlaceholderText(
      "Enter your email or phone number"
    );
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Fill in the form
    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    // Submit the form
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        identifier: "test@example.com",
        password: "password123",
      });
    });
  });

  it("shows loading state when form is submitting", () => {
    (useLogin as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    renderComponent();

    const submitButton = screen.getByRole("button", { name: /signing in/i });
    expect(submitButton).toBeDisabled();
  });

  it("accepts phone number as identifier", async () => {
    const user = userEvent.setup();
    renderComponent();

    const identifierInput = screen.getByPlaceholderText(
      "Enter your email or phone number"
    );
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(identifierInput, "+1234567890");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        identifier: "+1234567890",
        password: "password123",
      });
    });
  });

  it("renders forgot password link with correct href", () => {
    renderComponent();

    const forgotPasswordLink = screen.getByText("Forgot Password?");
    expect(forgotPasswordLink.closest("a")).toHaveAttribute(
      "href",
      "forgot-password"
    );
  });

  it("renders sign up link with correct href", () => {
    renderComponent();

    const signUpLink = screen.getByText("Sign Up");
    expect(signUpLink.closest("a")).toHaveAttribute("href", "/signup");
  });

  it("does not submit form with empty fields", async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole("button", { name: /sign in/i });

    // Try to submit without filling fields
    await user.click(submitButton);

    // mutate should not be called because validation will fail
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("renders email and padlock icons", () => {
    renderComponent();

    expect(screen.getByTestId("email-icon")).toBeInTheDocument();
    expect(screen.getByTestId("padlock-icon")).toBeInTheDocument();
  });
});
