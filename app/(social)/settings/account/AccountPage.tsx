"use client";

import {
  Shield,
  Lock,
  AlertCircle,
  Phone,
  UserPlus,
  UserMinus,
  LogOut,
  Clock,
} from "lucide-react";

interface AccountPageProps {
  onSecurityClick: () => void;
  onTwoStepVerificationClick: () => void;
  onReportProblemClick: () => void;
  onChangePhoneNumberClick: () => void;
  onAddAccountClick: () => void;
  onDeleteAccountClick: () => void;
  onTimeZoneClick: () => void;
  onLogoutClick: () => void;
}

export default function AccountPage({
  onSecurityClick,
  onTwoStepVerificationClick,
  onReportProblemClick,
  onChangePhoneNumberClick,
  onAddAccountClick,
  onDeleteAccountClick,
  onTimeZoneClick,
  onLogoutClick,
}: AccountPageProps) {
  return (
    <div className="flex justify-center sm:justify-start w-full md:ml-3">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg border border-gray-200">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Account</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 space-y-4">
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onSecurityClick}
          >
            <Shield size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Security Notification</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onTwoStepVerificationClick}
          >
            <Lock size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Two-Step Verification</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onReportProblemClick}
          >
            <AlertCircle size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Report Problem</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onChangePhoneNumberClick}
          >
            <Phone size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Change Phone Number</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onAddAccountClick}
          >
            <UserPlus size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Add Account</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onDeleteAccountClick}
          >
            <UserMinus size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Delete Account</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onTimeZoneClick}
          >
            <Clock size={20} className="text-gray-500" />
            <span className="font-semibold text-sm sm:text-base">Time Zone</span>
          </button>
          <button
            className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            onClick={onLogoutClick}
          >
            <LogOut size={20} className="text-red-500" />
            <span className="font-semibold text-red-500 text-sm sm:text-base">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}