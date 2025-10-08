import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/userStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.getState().logout();
  });

  it('initializes with null user', () => {
    const { user } = useAuthStore.getState();
    expect(user).toBeNull();
  });

  it('sets user correctly', () => {
    const mockUser = {
      email: 'test@example.com',
      access_token: 'token123',
    };

    useAuthStore.getState().setUser(mockUser);

    const { user } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
  });

  it('logs out user correctly', () => {
    const mockUser = {
      email: 'test@example.com',
      access_token: 'token123',
    };

    useAuthStore.getState().setUser(mockUser);
    expect(useAuthStore.getState().user).toEqual(mockUser);

    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
  });
});