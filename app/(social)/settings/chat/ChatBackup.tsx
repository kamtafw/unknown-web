"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AccountPopup from "./GoogleAccountPopup";
import FrequencyPopup from "./FrequencyPopup";

interface ChatBackupPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function ChatBackupPage({ onBack }: ChatBackupPageProps) {
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [showFrequencyPopup, setShowFrequencyPopup] = useState(false);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [backupUsingCellular, setBackupUsingCellular] = useState(false);
  const [keepChatsArchived, setKeepChatsArchived] = useState(false);

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Chat"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Chat backup</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <h2 className="text-lg text-[12px] text-gray-500">Backup settings</h2>
          <p className="mt-2 text-[12px] text-gray-500">
            Backup your chat and media to your email account&apos;s storage. You
            can restore it on the new phone after you download Appscombo on it.
          </p>
          <p className="mt-4 font-bold text-black text-[16px]">
            Last Backup: Yesterday, 08:14
          </p>
          <p className="font-bold text-black text-[16px]">Size: 1.7 GB</p>
          <Button
            className="mt-3 w-[89px] h-[40px] rounded-full bg-[#6A88D1] hover:bg-[#425483] text-white"
          >
            Backup
          </Button>
          <hr className="my-3 border-gray-200" />
          <h2 className="text-lg text-[14px] text-blue-600 font-bold">
            Manage Google storage
          </h2>
          <div className="mt-5 space-y-6">
            <Button
              onClick={() => setShowAccountPopup(true)}
              className="w-full flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
            >
              <div className="text-left">
                <span className="text-sm font-semibold text-[14px]">
                  Google account
                </span>
                <p className="text-sm text-gray-500">
                  Cameron_william@gmail.com
                </p>
              </div>
            </Button>
            <Button
              onClick={() => setShowFrequencyPopup(true)}
              className="w-full flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
            >
              <div className="text-left">
                <span className="text-sm font-semibold text-[14px]">
                  Frequency
                </span>
                <p className="text-sm text-gray-500">Monthly</p>
              </div>
            </Button>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-[14px]">
                  Include videos
                </p>
              </div>
              <button
                onClick={() => setIncludeVideos(!includeVideos)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  includeVideos ? "end" : "start"
                } transition-colors ${
                  includeVideos ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle include videos"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-[14px]">
                  Backup using cellular
                </p>
              </div>
              <button
                onClick={() => setBackupUsingCellular(!backupUsingCellular)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  backupUsingCellular ? "end" : "start"
                } transition-colors ${
                  backupUsingCellular ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle backup using cellular"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
          </div>
          <hr className="my-4 border-gray-200" />
          <h2 className="text-lg text-gray-500 text-[12px]">Archive chats</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Keep chats archived
                </p>
                <p className="text-sm text-gray-500 text-[14px]">
                  Archived chats will remain achieved when <br /> you receive a new message.
                </p>
              </div>
              <button
                onClick={() => setKeepChatsArchived(!keepChatsArchived)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  keepChatsArchived ? "end" : "start"
                } transition-colors ${
                  keepChatsArchived ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle keep chats archived"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
          </div>
        </div>
        {showAccountPopup && (
          <AccountPopup
            onCancel={() => setShowAccountPopup(false)}
            onConfirm={() => setShowAccountPopup(false)}
          />
        )}
        {showFrequencyPopup && (
          <FrequencyPopup
            onCancel={() => setShowFrequencyPopup(false)}
            onConfirm={() => setShowFrequencyPopup(false)}
          />
        )}
      </div>
    </div>
  );
}
