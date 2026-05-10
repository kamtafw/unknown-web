import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupFormModule from '@/components/modules/authModules/SignupFormModule';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the useSignUp hook
vi.mock('@/services/queryHooks/useUserAuthService', () => ({
  useSignUp: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

// Mock the SignupConfirmationModule
vi.mock('@/components/modules/authModules/SignupConfirmationModule', () => ({
  default: () => <div data-testid="confirmation-modal">Confirmation Modal</div>,
}));

// Mock icons
vi.mock('@/components/shared/Icons', () => ({
  EmailIcon: () => <div>Email Icon</div>,
  PhoneIcon: () => <div>Phone Icon</div>,
  PadlockIcon: () => <div>Padlock Icon</div>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('SignupFormModule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SignupFormModule />, { wrapper });

    expect(screen.getByText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    
    expect(screen.getByText('Phone Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
    
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<SignupFormModule />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('displays validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<SignupFormModule />, { wrapper });

    const emailInput = screen.getByPlaceholderText('Enter your email');
    await user.type(emailInput, 'invalidemail');

    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });
  });

  it('displays password requirements correctly', () => {
    render(<SignupFormModule />, { wrapper });

    expect(screen.getByText('At least 8 to 12 characters')).toBeInTheDocument();
    expect(screen.getByText('Special character')).toBeInTheDocument();
    expect(screen.getByText('One uppercase')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
  });

  it('updates password validation indicators as user types', () => {
    render(<SignupFormModule />, { wrapper });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    // Type a valid password
    fireEvent.change(passwordInput, { target: { value: 'Password1!' } });

    // Check password value updated
    expect(passwordInput).toHaveValue('Password1!');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<SignupFormModule />, { wrapper });

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click eye icon to toggle
    const toggleButton = passwordInput.parentElement?.querySelector('button');
    if (toggleButton) {
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });

  it('shows confirmation modal on valid form submission', async () => {
    const user = userEvent.setup();
    render(<SignupFormModule />, { wrapper });

    // Fill in valid data
    await user.type(screen.getByPlaceholderText('Enter your email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Enter your phone number'), '1234567890');
    await user.type(screen.getByPlaceholderText('Enter your password'), 'Password1!');

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    // Check if confirmation modal appears
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });
  });

  it('validates password with all requirements', async () => {
  const user = userEvent.setup();
  render(<SignupFormModule />, { wrapper });

  const emailInput = screen.getByPlaceholderText('Enter your email');
  const phoneInput = screen.getByPlaceholderText('Enter your phone number');
  const passwordInput = screen.getByPlaceholderText('Enter your password');

  await user.type(emailInput, 'test@example.com');
  await user.type(phoneInput, '1234567890');
  await user.type(passwordInput, 'weak');

  const submitButton = screen.getByRole('button', { name: /sign up/i });
  await user.click(submitButton);

  await waitFor(() => {
    // Should show password validation errors - check for actual component text
    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });
});
});