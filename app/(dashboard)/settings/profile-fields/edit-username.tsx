"use client";

import { useState } from "react";
import { ArrowLeft, User, Check, RefreshCw } from "lucide-react";

interface EditUsernamePageProps {
  onBack: () => void;
}

export default function EditUsernamePage({ onBack }: EditUsernamePageProps) {
  const [newUsername, setNewUsername] = useState("");

  return (
    <div className="w-[546px] h-[796px] bg-white text-[#111827] overflow-auto shadow-md">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <ArrowLeft
            size={20}
            className="cursor-pointer text-black"
            onClick={onBack}
          />
          <h2 className="text-lg font-bold">Change Username</h2>
        </div>
        <div className="mb-4 mt-8">
          <label htmlFor="old-username" className="block text-gray-600 mb-2">
            Old Username
          </label>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <User size={16} className="text-gray-500 mr-2" />
            <span className="text-[6B7280]">@Cameron_Williamson</span>
          </div>
        </div>
        <div className="mb-4 mt-8">
          <label htmlFor="new-username" className="block text-gray-600 mb-2">
            New Username
          </label>
          <p className="text-[6B7280] text-sm mb-2">
            Usernames can contain only letters, numbers, underscores and periods, changing
            username will ali charge your profile link..... You can only change your username once every 180 days.
          </p>
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <User size={16} className="text-gray-500 mr-2" />
            <input
              type="text"
              id="new-username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Placeholder"
              className="flex-1 outline-none"
              aria-label="New username"
            />
            <Check size={16} className="text-[16A34A]" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-black cursor-pointer">Generate username</span>
          <RefreshCw size={16} className="text-black" />
        </div>
        <div className="pt-[340px] items-center">
          <button
            type="button"
            className="w-[498px] bg-[#6A88D1] hover:bg-[#425483]  text-white px-38 py-3 rounded-full font-bold text-lg transition-colors"
            onClick={() => console.log()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
