"use client";

import { ArrowLeft } from "lucide-react";

interface PrivacyPageProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
  lastSeenText: string;
  statusText: string;
  groupText: string;
  blockedCount: number;
}

export default function PrivacyPage({ onBack, onNavigate, lastSeenText, statusText, groupText, blockedCount }: PrivacyPageProps) {
  const handleViewChange = (view: string) => {
    if (onNavigate) onNavigate(view);
  };

  return (
    <div className="flex ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md rounded-lg scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200 scrollbar-hover:scrollbar-thumb-gray-500">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Privacy</h1>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <p className="text-[14px] text-gray-600 mb-6">
            Who can see my personal info
          </p>
          
          <div className="space-y-1">
            <button
              onClick={() => handleViewChange("lastSeen")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Last seen and Online</div>
              <div className="text-[14px] text-gray-500">{lastSeenText}</div>
            </button>
            
            <button
              onClick={() => handleViewChange("status")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Status</div>
              <div className="text-[14px] text-gray-500">{statusText}</div>
            </button>
            
            <button
              onClick={() => handleViewChange("group")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Groups</div>
              <div className="text-[14px] text-gray-500">{groupText}</div>
            </button>
            <div className="mt-2 h-px w-full bg-gray-300" />
            <button
              onClick={() => handleViewChange("liveLocation")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Live Location</div>
              <div className="text-[14px] text-gray-500">Everyone</div>
            </button>
            
            <button
              onClick={() => handleViewChange("chatLock")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Chat Lock</div>
              <div className="text-[14px] text-gray-500">Disabled</div>
            </button>
            
            <button
              onClick={() => handleViewChange("blockedContacts")}
              className="w-full text-left py-3 hover:bg-gray-50 rounded-lg"
            >
              <div className="text-[16px] text-black">Blocked Contacts/Users</div>
              <div className="text-[14px] text-gray-500">{blockedCount}</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}