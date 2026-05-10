'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PasswordResetSuccessPage() {
  const router = useRouter();

  const handleProceedToLogin = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Password reset successful</h1>
        </div>

        <Button
          onClick={handleProceedToLogin}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Proceed to login
        </Button>
      </div>
    </div>
  );
}