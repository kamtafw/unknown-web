"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import { useAuthStore } from "@/store/userStore";

export default function CreatePasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  const passwordRequirements = [
    {
      label: "At least 8 to 12 characters",
      met: newPassword.length >= 8 && newPassword.length <= 12,
    },
    {
      label: "Special character",
      met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
    {
      label: "One uppercase",
      met: /[A-Z]/.test(newPassword),
    },
    {
      label: "One number",
      met: /[0-9]/.test(newPassword),
    },
  ];

  const isPasswordValid = passwordRequirements.every((req) => req.met);


  const handleChangePassword = () => {
    if (!isPasswordValid) return;


    setUser({ ...user, password: newPassword });
    router.push("/confirm-password");
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Create new password
          </h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-medium text-gray-700"
            >
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10 h-12 border-2 border-blue-200 focus:border-blue-400 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {passwordRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    requirement.met ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {requirement.met && <Check className="w-3 h-3 text-white" />}
                </div>
                <span
                  className={`text-sm ${
                    requirement.met ? "text-green-600" : "text-gray-600"
                  }`}
                >
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={!isPasswordValid || isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Change password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
