'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function GoogleAuthVerificationPage() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.push('/forgot-password');
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to create new password page
      router.push('/forgot-password/create-password');
    } catch (error) {
      console.error('Error verifying Google Auth code:', error);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Security Verification</h1>
          <div className="space-y-1">
            <p className="text-gray-600">
              Enter the 6 digit code we sent to your google authenticator app
            </p>
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
            disabled={code.length !== 6 || isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Button>

          <div className="text-center">
            <p className="text-gray-600">
              I didn&apos;t receive any code{' '}
              <button
                onClick={() => {
                  alert('Please check your Google Authenticator app for the current 6-digit code');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}