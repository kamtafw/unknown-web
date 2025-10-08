'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useResendResetCode, useVerifyResetOtp } from '@/services/queryHooks/useUserAuthService';
import { useAuthStore } from '@/store/userStore';
import { Toaster } from '@/components/ui/sonner';

export default function VerifyCodePage() {
  const [code, setCode] = useState('');
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mutate: verifyOtp, isPending } = useVerifyResetOtp();
  const { mutate: resendCode, isPending: isResending } = useResendResetCode();

  const email = user?.email || '';

  const handleBack = () => {
    router.push('/forgot-password');
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) return;
    
    verifyOtp({ email, otp: code });
  };

  const handleResendCode = () => {
    resendCode(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Enter code</h1>
          <div className="space-y-1">
            <p className="text-gray-600">
              Enter the 6 digit code we sent to your email.
            </p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={code}
              onChange={setCode}
              maxLength={6}
            >
              <InputOTPGroup className="gap-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className="w-12 h-12 text-lg font-medium border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:ring-0 bg-white"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={code.length !== 6 || isPending}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="text-center">
            <p className="text-gray-600">
              I didn&apos;t receive any code{' '}
              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend'}
              </button>
            </p>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}