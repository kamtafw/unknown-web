'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!emailOrPhone.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to verify code page
      router.push('/verify-code');
    } catch (error) {
      console.error('Error sending reset code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password</h1>
          <p className="text-gray-600">
            Kindly provide the email address or phone number registered to your account
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
              Email or phone number
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="Placeholder"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="pl-10 h-12 border-2 border-blue-200 focus:border-blue-400 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!emailOrPhone.trim() || isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}