"use client";

import {
  ArrowLeft,
  Phone,
  Folder,
  Cloud,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";
import { useState } from "react";
import ResetNetworkUsagePopup from "./ResetNetworkUsagePopup";
import "./NetworkUsage.css";

interface NetworkUsagePageProps {
  onBack: () => void;
  setShowResetPopup?: (show: boolean) => void;
}

export default function NetworkUsagePage({
  onBack,
  setShowResetPopup,
}: NetworkUsagePageProps) {
  const [usageStats] = useState({
    call: "9.5 MB",
    folder: "9.5 MB",
    storage: "9.5 MB",
    message: "9.5 MB",
    wow: "9.5 MB",
  });
  const [showResetPopup, setShowResetPopupLocal] = useState(false);

  const handleResetClick = () => {
    if (setShowResetPopup) {
      setShowResetPopup(true);
    } else {
      setShowResetPopupLocal(true);
    }
  };

  const handleResetConfirm = () => {
    if (setShowResetPopup) {
      setShowResetPopup(false);
    } else {
      setShowResetPopupLocal(false);
    }
  };

  const handleResetCancel = () => {
    if (setShowResetPopup) {
      setShowResetPopup(false);
    } else {
      setShowResetPopupLocal(false);
    }
  };

  return (
    <div className="flex justify-start ml-5 md:ml-5">
      <div className="w-full md:w-[530px] h-[796px] max-h-[100vh] bg-white text-black overflow-auto shadow-md">
        <div className="">
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
            <div className="px-4 py-3 flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to Data and Storage"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold">Network Usage</h1>
            </div>
          </div>
          <div className="px-4 py-3 flex flex-col space-y-4">
            <div className="flex flex-col items-start w-full">
              <div className="flex flex-col items-start">
                <span className="text-[14px] font-semibold">Usage</span>
                <span className="text-[24px] font-bold">
                  2.3 <span className="text-xs">GB</span>
                </span>
              </div>
              <div className="flex justify-between w-full mt-5">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <ArrowUp size={16} className="text-gray-500" />
                    <span className="text-[14px] font-semibold">Sent</span>
                  </div>
                  <span className="text-[24px] font-bold">
                    2.3 <span className="text-xs">GB</span>
                  </span>
                </div>
                <div className="flex flex-col items-end mr-8">
                  <div className="flex items-center gap-1">
                    <ArrowDown size={16} className="text-gray-500" />
                    <span className="text-[14px] font-semibold">Received</span>
                  </div>
                  <span className="text-[24px] font-bold">
                    2.3 <span className="text-xs">GB</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-2 lg:mt-0 h-px w-full bg-gray-300" />
            <h1 className="text-sm text-gray-500">Review and delete items</h1>
            <div className="flex items-start gap-4 mt-2">
              <Phone size={25} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold">Call</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowUp size={16} />
                    <span>{usageStats.call}</span>
                    <ArrowDown size={16} />
                    <span>{usageStats.call}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded w-[60%]"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  134 outgoing, 202 incoming
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-2">
              <Folder size={25} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold">Folder</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowUp size={16} />
                    <span>{usageStats.folder}</span>
                    <ArrowDown size={16} />
                    <span>{usageStats.folder}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded w-[40%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-3">
              <Cloud size={25} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold">Storage</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowUp size={16} />
                    <span>{usageStats.storage}</span>
                    <ArrowDown size={16} />
                    <span>{usageStats.storage}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded w-[30%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-3">
              <MessageCircle size={25} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold">Message</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowUp size={16} />
                    <span>{usageStats.message}</span>
                    <ArrowDown size={16} />
                    <span>{usageStats.message}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded w-[45%]"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-3">
              <LoaderCircle size={25} className="text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold">Wow</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ArrowUp size={16} />
                    <span>{usageStats.wow}</span>
                    <ArrowDown size={16} />
                    <span>{usageStats.wow}</span>
                  </div>
                </div>
                <div className="w-full mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-500 rounded w-[25%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 h-px w-full bg-gray-300" />
            <button
              onClick={handleResetClick}
              className="flex items-center gap-3 w-full text-left py-2 hover:bg-gray-50 rounded-md"
            >
              <RefreshCw size={20} className="text-gray-500" />
              <span className="text-sm font-semibold">Reset statistics</span>
            </button>
          </div>
          {showResetPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ResetNetworkUsagePopup
                onClose={handleResetCancel}
                onConfirm={handleResetConfirm}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
