'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/userStore';

export const useTokenSync = () => {
  useEffect(() => {
    const checkToken = () => {
      // Get token from cookie
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];
      
      // Get token from store
      const storeToken = useAuthStore.getState().accessToken;
      
      // If cookie expired but store still has token, logout
      if (!cookieToken && storeToken) {
        console.log('Token mismatch detected - logging out');
        useAuthStore.getState().logout();
      }
    };
    
    // Check immediately on mount
    checkToken();
    
    // Check every 60 seconds
    const interval = setInterval(checkToken, 60000);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
};