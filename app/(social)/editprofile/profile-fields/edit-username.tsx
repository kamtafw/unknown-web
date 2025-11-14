"use client";

import { useState } from "react";
import { ArrowLeft, User, Check, RefreshCw } from "lucide-react";
import ReservedUsernamePopup from "./ReservedUsernamePopup";
import { useUpdateUsername } from "@/services/profile/useProfileService";
import { useAuthStore } from "@/store/userStore";

interface EditUsernamePageProps {
  onBack: () => void;
}

export default function EditUsernamePage({ onBack }: EditUsernamePageProps) {
  const user = useAuthStore((state) => state.user?.user);
  const [newUsername, setNewUsername] = useState("");
  const oldUsername = user?.username || "username";
  const [showReservedPopup, setShowReservedPopup] = useState(false);
  const updateUsernameMutation = useUpdateUsername();

  return (
    <div className="flex justify-center ml-2 mb-4 px-2 sm:px-4 lg:ml-5 lg:mb-14">
      <div className="w-full max-w-[530px] bg-white overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2 mb-4">
            <ArrowLeft
              size={20}
              className="cursor-pointer text-gray-900 sm:w-6 sm:h-6"
              onClick={onBack}
            />
            <h2 className="text-base font-bold sm:text-lg">Change Username</h2>
          </div>
          <div className="mb-4 mt-6">
            <label
              htmlFor="old-username"
              className="block text-gray-600 text-sm font-semibold mb-2 sm:text-base"
            >
              Old Username
            </label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
              <User size={16} className="text-gray-500 mr-2 sm:w-5 sm:h-5" />
              <span className="text-gray-500 text-sm sm:text-base">
                @{oldUsername}
              </span>
            </div>
          </div>
          <div className="mb-4 mt-6">
            <label
              htmlFor="new-username"
              className="block text-gray-600 text-sm font-semibold mb-2 sm:text-base"
            >
              New Username
            </label>
            <p className="text-gray-500 text-xs mb-2 sm:text-sm">
              Usernames can contain only letters, numbers, underscores, and
              periods. Changing username will also change your profile link. You
              can only change your username once every 180 days.
            </p>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
              <User size={16} className="text-gray-500 mr-2 sm:w-5 sm:h-5" />
              <input
                type="text"
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Enter new username"
                className="flex-1 outline-none text-sm sm:text-base"
                aria-label="New username"
              />
              {newUsername && (
                <Check size={16} className="text-green-600 sm:w-5 sm:h-5" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-gray-900 cursor-pointer text-sm sm:text-base">
              Generate username
            </span>
            <RefreshCw size={16} className="text-gray-900 sm:w-5 sm:h-5" />
          </div>
          <button
            type="button"
            className="w-full py-2 bg-[#6A88D1] text-white rounded-md hover:bg-[#425483] text-sm sm:text-base disabled:opacity-50"
            disabled={updateUsernameMutation.isPending}
            onClick={() => {
              updateUsernameMutation.mutate(
                { username: newUsername },
                {
                  onSuccess: () => {
                    onBack();
                  },
                  onError: (error: {
                    response?: { data?: { message?: string } };
                  }) => {
                    const errorMessage = error?.response?.data?.message || "";
                    if (
                      errorMessage.toLowerCase().includes("reserved") ||
                      errorMessage.toLowerCase().includes("taken") ||
                      errorMessage.toLowerCase().includes("exists")
                    ) {
                      setShowReservedPopup(true);
                    }
                  },
                }
              );
            }}
          >
            {updateUsernameMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
        {showReservedPopup && (
          <ReservedUsernamePopup onClose={() => setShowReservedPopup(false)} />
        )}
      </div>
    </div>
  );
}
