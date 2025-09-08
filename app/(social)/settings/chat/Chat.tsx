"use client";
import { useState } from "react";
import { ArrowLeft, Paintbrush, Archive } from "lucide-react";
import { MdImage } from "react-icons/md";
import { Button } from "@/components/ui/button";
import ThemePopup from "./ThemePopup";
import FontSizePopup from "./FontSizePopup";

interface ChatPageProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export default function ChatPage({ onBack, onNavigate }: ChatPageProps) {
  const [enterIsSend, setEnterIsSend] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState(true);
  const [keepChatsArchived, setKeepChatsArchived] = useState(false);
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [showFontSizePopup, setShowFontSizePopup] = useState(false);

  return (
    <div className="flex md:ml-3 justify-center sm:justify-start w-full">
      <div className="w-full max-w-[530px] h-[796px] max-h-[100vh] bg-white text-gray-900 overflow-auto shadow-md rounded-lg">
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Chat</h1>
          </div>
        </div>
        <div className="px-2 sm:px-4 py-3 flex flex-col">
          <h2 className="text-lg text-gray-500 text-[12px]">Display</h2>
          <div className="mt-4 space-y-6">
            <Button
              onClick={() => setShowThemePopup(true)}
              variant="ghost"
              className="w-full flex items-center justify-start gap-3 px-4 py-3 bg-white text-gray-900 hover:bg-gray-100 !border-none !ring-0 !outline-none focus:!ring-0 focus:!outline-none focus:!border-none"
            >
              <Paintbrush size={20} className="text-[#6A88D1]" />
              <div className="text-left flex flex-col justify-center">
                <span className="block text-base font-semibold text-[14px]">
                  Theme
                </span>
                <p className="text-sm text-gray-500">System default</p>
              </div>
            </Button>

            <Button
              onClick={() => onNavigate("chat-wallpaper")}
              className="w-full flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
            >
              <MdImage size={30} className="text-[#6A88D1]" />
              <span className="text-sm font-semibold text-[14px]">
                Wallpaper
              </span>
            </Button>
          </div>
          <hr className="my-4 border-gray-200" />
          <h2 className="text-lg text-gray-500 text-[12px]">Chat Settings</h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Enter is send
                </p>
                <p className="text-sm text-gray-500 text-[14px]">
                  Enter key will send messages
                </p>
              </div>
              <button
                onClick={() => setEnterIsSend(!enterIsSend)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  enterIsSend ? "end" : "start"
                } transition-colors ${
                  enterIsSend ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle enter is send"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Media visibility
                </p>
                <p className="text-sm text-gray-500 text-[14px]">
                  Show media in chats
                </p>
              </div>
              <button
                onClick={() => setMediaVisibility(!mediaVisibility)}
                className={`w-[45px] h-[25px] rounded-full p-1 flex items-center justify-${
                  mediaVisibility ? "end" : "start"
                } transition-colors ${
                  mediaVisibility ? "bg-green-500" : "bg-gray-300"
                }`}
                title="Toggle media visibility"
              >
                <div className="w-[19px] h-[19px] bg-white rounded-full shadow-md transition-all" />
              </button>
            </div>
            <Button
              onClick={() => setShowFontSizePopup(true)}
              className="w-full flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
            >
              <span className="text-sm font-semibold text-[16px]">
                Font size
              </span>
            </Button>
          </div>
          <hr className="my-4 border-gray-200" />
          <h2 className="text-lg text-gray-500 text-[14px]">Archive chats</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[16px]">
                  Keep chats archived
                </p>
                <p className="text-sm text-gray-500 text-[14px]">
                  Chats stay archived when new messages arrive
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
            <Button
              onClick={() => onNavigate("chat-backup")}
              className="w-full flex items-center justify-start gap-3 bg-white text-gray-900 hover:bg-gray-100"
            >
              <Archive size={20} className="text-[#6A88D1]" />
              <span className="text-sm font-semibold text-[16px]">
                Chat backup
              </span>
            </Button>
          </div>
        </div>
        {showThemePopup && (
          <ThemePopup
            onCancel={() => setShowThemePopup(false)}
            onConfirm={() => setShowThemePopup(false)}
          />
        )}
        {showFontSizePopup && (
          <FontSizePopup
            onCancel={() => setShowFontSizePopup(false)}
            onConfirm={() => setShowFontSizePopup(false)}
          />
        )}
      </div>
    </div>
  );
}
