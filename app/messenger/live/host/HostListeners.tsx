"use client";

import { useState } from "react";
import Image from "next/image";
import { FaShareAlt } from "react-icons/fa";
import { RiEmojiStickerFill } from "react-icons/ri";
import { HostListenersTab } from "./HostListnersTab";
import { HostComments } from "./HostComments";
import { HostRequests } from "./HostRequests";
import { SharePopup } from "../listeners/SharePopup";
import { ForwardPopup } from "../listeners/ForwardPopup";
import { HostGuestsPopup } from "./HostGuestsPopup";
import { EmojiPopup } from "@/components/ui/EmojiPicker";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import { MdChat } from "react-icons/md";
import { IoSend } from "react-icons/io5";

interface HostListenersProps {
  sessionData: {
    title: string;
    description: string;
    tags: string[];
  };
  onLeave: () => void;
}

export function HostListeners({ sessionData, onLeave }: HostListenersProps) {
  const [activeTab, setActiveTab] = useState<
    "listeners" | "comments" | "requests"
  >("listeners");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [showHeaderPopup, setShowHeaderPopup] = useState(false);
  const [showGuestsPopup, setShowGuestsPopup] = useState(false);

  const handleForward = () => {
    setShowSharePopup(false);
    setShowHeaderPopup(false);
    setShowForwardPopup(true);
  };

  const handleForwardBack = () => {
    setShowForwardPopup(false);
    setShowSharePopup(true);
  };

  const handleForwardSelect = () => {
    setShowForwardPopup(false);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold mr-2">{sessionData.title}</h1>
            <Image
              src="/live.png"
              alt="Live"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-3">
            <Popover
              open={showHeaderPopup && !showForwardPopup}
              onOpenChange={setShowHeaderPopup}
            >
              <PopoverTrigger asChild>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="More options"
                  aria-label="More options"
                >
                  <HiDotsHorizontal className="text-gray-600 text-xl" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <SharePopup onForward={handleForward} />
              </PopoverContent>
            </Popover>

            <button
              onClick={onLeave}
              className=" hover:text-red-600 text-red-500 px-4 py-2 text-sm font-medium transition-colors"
            >
              Leave
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-[11px] mb-3">
          {sessionData.description}
        </p>

        <div className="flex flex-wrap gap-5">
          {sessionData.tags.map((tag, index) => (
            <span key={index} className="text-blue-500 text-[11px]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-green-900 rounded-full bg-gray-300 py-1 px-2">
        <button
          onClick={() => setActiveTab("listeners")}
          className={`flex-1 py-1 px-4 text-center text-[12px] font-medium transition-colors ${
            activeTab === "listeners"
              ? "text-blue-500 border-2 rounded-full  bg-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Listeners
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex-1 py-1 px-4 text-center text-[12px] font-medium transition-colors ${
            activeTab === "comments"
              ? "text-blue-500 border-2 rounded-full  bg-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Comments
          <span className="text-blue-500 text-[12px] ml-2">23k</span>
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`flex-1 py-1 px-4 text-center text-[12px] font-medium transition-colors ${
            activeTab === "requests"
              ? "text-blue-500 border-2 rounded-full  bg-white"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Requests
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "listeners" ? (
          <HostListenersTab />
        ) : activeTab === "comments" ? (
          <HostComments />
        ) : (
          <HostRequests />
        )}
      </div>

      {/* Bottom Message Bar */}
      <div className="p-4 sm:p-3 bg-white">
        <div className="flex items-center gap-3 sm:gap-1.5">
          <div className="flex-1 relative min-w-0">
            <input
              type="text"
              placeholder="Type a message here"
              className="w-full px-4 py-3 sm:px-2.5 sm:py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <button
            className=" p-1 sm:p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
            aria-label="Send message"
          >
            <IoSend className="text-white w-4 h-4 lg:w-5 lg:h-5" />
          </button>

          <Popover open={showEmojiPopup} onOpenChange={setShowEmojiPopup}>
            <PopoverTrigger asChild>
              <button
                className="p-1 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Emoji picker"
              >
                <RiEmojiStickerFill className="text-gray-600 text-lg sm:text-base" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-270 p-2 rounded-lg">
              <EmojiPopup onSelect={(emoji) => console.log(emoji)} />
            </PopoverContent>
          </Popover>

          <Popover
            open={showSharePopup && !showForwardPopup}
            onOpenChange={setShowSharePopup}
          >
            <PopoverTrigger asChild>
              <button
                 className="p-1 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Share"
              >
                <FaShareAlt className="text-gray-600 text-lg sm:text-base" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <SharePopup onForward={handleForward} />
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setShowGuestsPopup(true)}
             className="p-1 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Group"
          >
            <FaUserGroup className="text-gray-600 text-lg sm:text-base" />
          </button>

          <button
             className="p-1 sm:p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Chat"
          >
            <MdChat className="text-gray-600 text-lg sm:text-base" />
          </button>
        </div>
      </div>

      {/* Forward Popup Modal */}
      {showForwardPopup && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
          <ForwardPopup
            onBack={handleForwardBack}
            onSelect={handleForwardSelect}
          />
        </div>
      )}

      {/* Guests Popup Modal */}
      {showGuestsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <HostGuestsPopup onClose={() => setShowGuestsPopup(false)} />
        </div>
      )}
    </div>
  );
}
