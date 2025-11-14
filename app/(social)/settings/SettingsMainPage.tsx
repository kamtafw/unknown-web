"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  User,
  Lock,
  Bell,
  MessageSquare,
  Database,
  Languages,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useGetCurrentUserProfile } from "@/services/profile/useProfileService";

interface SettingsMainPageProps {
  onVerificationClick: () => void;
  onAccountClick: () => void;
  onPrivacyClick: () => void;
  onAlertClick: () => void;
  onChatClick: () => void;
  onDataAndStorageClick: () => void;
  onLanguagesClick: () => void;
  onSupportClick: () => void;
  onProfileClick?: () => void;
}

export default function SettingsMainPage({
  onVerificationClick,
  onAccountClick,
  onPrivacyClick,
  onAlertClick,
  onChatClick,
  onDataAndStorageClick,
  onLanguagesClick,
  onSupportClick,
}: SettingsMainPageProps) {
  const { data: userData } = useGetCurrentUserProfile();

  return (
    <div className="flex justify-center sm:justify-start w-full  mb-3">
      <div className="w-full max-w-[546px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto border border-gray-200 rounded-lg shadow-md">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3">
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 space-y-4">
          <div>
            <Link
              href="/editprofile"
              className="flex items-center gap-3 w-full text-left py-3 hover:bg-gray-50 rounded-md"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center">
                  {userData?.profile_photo ? (
                    <Image
                      src={
                        userData.profile_photo.startsWith("http")
                          ? userData.profile_photo
                          : `https://appscombo.s3.amazonaws.com${userData.profile_photo}`
                      }
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base">
                  {userData?.first_name || ""} {userData?.last_name || ""}
                </div>
                <p className="text-sm text-gray-500">
                  {userData?.profile?.about_me?.substring(0, 35) || "No bio"}...
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>
          </div>

          <div className="border-t border-gray-100"></div>

          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onVerificationClick}
            >
              <BadgeCheck size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Verification</span>
                <p className="text-sm text-gray-500">
                  Manage your premium account
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onAccountClick}
            >
              <User size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Account</span>
                <p className="text-sm text-gray-500">
                  Security, notifications, change number...
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onPrivacyClick}
            >
              <Lock size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Privacy</span>
                <p className="text-sm text-gray-500">
                  Block contact, status, live location, calls...
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onAlertClick}
            >
              <Bell size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Alert</span>
                <p className="text-sm text-gray-500">
                  Message, group and call tones
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onChatClick}
            >
              <MessageSquare size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Chat</span>
                <p className="text-sm text-gray-500">
                  Security notifications, change number...
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onDataAndStorageClick}
            >
              <Database size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Data and Storage</span>
                <p className="text-sm text-gray-500">
                  Power usage, photos, videos
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onLanguagesClick}
            >
              <Languages size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Languages</span>
                <p className="text-sm text-gray-500">
                  English (device language)
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
          <div>
            <button
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
              onClick={onSupportClick}
            >
              <HelpCircle size={20} className="text-gray-500" />
              <div className="flex-1">
                <span className="font-semibold">Support</span>
                <p className="text-sm text-gray-500">
                  Security notifications, change number...
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
