import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the entire axiosInstance module
vi.mock('@/lib/api/axiosInstance', () => {
  const mockPost = vi.fn();
  const mockGet = vi.fn();

  return {
    axiosIsntanceAuth: {
      post: mockPost,
      get: mockGet,
    },
    default: {
      post: mockPost,
      get: mockGet,
    },
  };
});

// Mock the auth store
vi.mock('@/store/userStore', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      accessToken: 'mock-token',
    })),
  },
}));

import { signUpRequest, verifyOtp, loginRequest } from '@/services/auth/userAuthQueries';
import { axiosIsntanceAuth } from '@/lib/api/axiosInstance';

describe('userAuthQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUpRequest', () => {
    it('makes POST request to correct endpoint', async () => {
      const mockResponse = {
        data: { status_code: 201, data: { user: { email: 'test@example.com' } } },
      };

      vi.mocked(axiosIsntanceAuth.post).mockResolvedValue(mockResponse);

      const payload = {
        email: 'test@example.com',
        phone_number: '1234567890',
        password: 'Password1!',
      };

      const result = await signUpRequest(payload);

      expect(axiosIsntanceAuth.post).toHaveBeenCalledWith('/auth/signup', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyOtp', () => {
    it('makes POST request with OTP payload', async () => {
      const mockResponse = {
        data: { status_code: 200, data: { verified: true } },
      };

      vi.mocked(axiosIsntanceAuth.post).mockResolvedValue(mockResponse);

      const payload = {
        email: 'test@example.com',
        otp: '123456',
        need_tokens: true,
        need_otp_token: false,
      };

      const result = await verifyOtp(payload);

      expect(axiosIsntanceAuth.post).toHaveBeenCalledWith('/auth/verify-otp', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('loginRequest', () => {
    it('makes POST request to login endpoint', async () => {
      const mockResponse = {
        data: { 
          status_code: 200, 
          data: { 
            user: { email: 'test@example.com' },
            access_token: 'token123'
          } 
        },
      };

      vi.mocked(axiosIsntanceAuth.post).mockResolvedValue(mockResponse);

      const payload = {
        identifier: 'test@example.com',
        password: 'Password1!',
      };

      const result = await loginRequest(payload);

      expect(axiosIsntanceAuth.post).toHaveBeenCalledWith('/auth/login', payload);
      expect(result).toEqual(mockResponse.data);
    });
  });
});