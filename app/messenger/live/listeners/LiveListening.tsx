"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { FaShareAlt, FaCheck } from "react-icons/fa";
import { RiEmojiStickerFill } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { Listeners } from "./Listeners";
import { Comments } from "./Comments";
import { SharePopup } from "./SharePopup";
import { ForwardPopup } from "./ForwardPopup";
import { EmojiPopup } from "@/components/ui/EmojiPicker";
import { GuestsPopup } from "./GuestsPopup";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { HiDotsHorizontal } from "react-icons/hi";
import { FaUserGroup } from "react-icons/fa6";
import { MdChat } from "react-icons/md";
import { FaMicrophoneLines } from "react-icons/fa6";

interface LiveListeningProps {
  sessionData: {
    title: string;
    description: string;
    tags: string[];
  };
  onLeave: () => void;
}

export function LiveListening({ sessionData, onLeave }: LiveListeningProps) {
  const [activeTab, setActiveTab] = useState<"listeners" | "comments">(
    "listeners"
  );
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showForwardPopup, setShowForwardPopup] = useState(false);
  const [showHeaderPopup, setShowHeaderPopup] = useState(false);
  const [showGuestsPopup, setShowGuestsPopup] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && messageText.trim()) {
      handleSendMessage();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    const currentPosition =
      inputRef.current?.selectionStart || messageText.length;
    const newText =
      messageText.slice(0, currentPosition) +
      emoji +
      messageText.slice(currentPosition);
    setMessageText(newText);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(
          currentPosition + emoji.length,
          currentPosition + emoji.length
        );
      }
    }, 0);
    // Remove or comment out this line if it exists:
    // setShowEmojiPopup(false);
  };

  const handleMicClick = () => {
    console.log("Microphone clicked");
    setRequestSent(!requestSent);
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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "listeners" ? <Listeners /> : <Comments />}
      </div>

      {/* Bottom Message Bar */}
      <div className="p-4 bg-white">
        <div className="flex items-center gap-3">
          {/* Text input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message here"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Send Button or Mic Button */}
          {messageText.trim() ? (
            <button
              onClick={handleSendMessage}
              className="p-3 bg-blue-500 hover:bg-blue-600 rounded-full transition-colors"
              aria-label="Send message"
            >
              <IoSend className="text-white text-xl" />
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={handleMicClick}
                className={`p-2 rounded-full transition-colors ${
                  requestSent
                    ? "bg-green-500 hover:bg-green-600"
                    : "hover:bg-gray-100"
                }`}
                aria-label="Request to speak"
              >
                {requestSent ? (
                  <FaCheck className="text-white text-sm" />
                ) : (
                  <FaMicrophoneLines className="text-black text-xl" />
                )}
              </button>
              <span className="text-xs text-gray-600">
                {requestSent ? "Sent" : "Request"}
              </span>
            </div>
          )}

          <Popover open={showEmojiPopup}>
            <PopoverTrigger asChild>
              <button
                onClick={() => setShowEmojiPopup(!showEmojiPopup)}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Emoji picker"
              >
                <RiEmojiStickerFill className="text-gray-600 text-xl" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-270 p-2 rounded-lg">
              <EmojiPopup
                onSelect={handleEmojiSelect}
                onClose={() => setShowEmojiPopup(false)}
              />
            </PopoverContent>
          </Popover>

          <Popover
            open={showSharePopup && !showForwardPopup}
            onOpenChange={setShowSharePopup}
          >
            <PopoverTrigger asChild>
              <button
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Share"
              >
                <FaShareAlt className="text-gray-600 text-xl" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <SharePopup onForward={handleForward} />
            </PopoverContent>
          </Popover>

          <button
            onClick={() => setShowGuestsPopup(true)}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Group"
          >
            <FaUserGroup className="text-gray-600 text-xl" />
          </button>

          <button
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Chat"
          >
            <MdChat className="text-gray-600 text-xl" />
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
          <GuestsPopup onClose={() => setShowGuestsPopup(false)} />
        </div>
      )}
    </div>
  );
}
