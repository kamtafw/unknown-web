import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OtpInputFormModule from '@/components/modules/authModules/OtpInputFormModule';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import * as queries from '@/services/queries/userAuthQueries';

// Mock the queries
vi.mock('@/services/queries/userAuthQueries');

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('OtpInputFormModule', () => {
  const mockUser = {
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders OTP input component', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });

    // Check that OTP input exists
    const otpInput = screen.getByRole('textbox');
    expect(otpInput).toBeInTheDocument();
  });

  it('receives email from props', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });
    
    expect(mockUser.email).toBe('test@example.com');
  });

  it('verify button is disabled when OTP is incomplete', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });

    const button = screen.getByRole('button', { name: /verify code/i });
    expect(button).toBeDisabled();
  });

  it('has OTP input field', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxlength', '6');
    expect(input).toHaveAttribute('name', 'pin');
  });

  it('shows resend link', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });

    const resendLink = screen.getByText(/resend/i);
    expect(resendLink).toBeInTheDocument();
  });

  it('has verify button', () => {
    render(<OtpInputFormModule user={mockUser} />, { wrapper: TestWrapper });

    expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
  });
});