"use client";

import { useState, useRef, useEffect } from "react";
import { X, Share2, UserPlus, VolumeX, Flag, Ban, Link  } from "lucide-react";
import ShareToFollowersPopup from "../../main-popup/ShareToFollowersPopup";
import MutePopup from "../../main-popup/MutePopup";
import ReportPopup from "../../main-popup/ReportPopup";
import BlockPopup from "../../main-popup/BlockPopup";

interface MoreOptionsPopupProps {
  onClose: () => void;
  username: string;
}

export default function MoreOptionsPopup({ onClose, username }: MoreOptionsPopupProps) {
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showMutePopup, setShowMutePopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Profile link copied to clipboard!");
    onClose();
  };

  const handleFollow = () => {
    console.log(`Follow ${username}`); 
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (showSharePopup) {
    return <ShareToFollowersPopup onClose={() => setShowSharePopup(false)} />;
  }

  if (showMutePopup) {
    return <MutePopup onClose={() => setShowMutePopup(false)} username={username} />;
  }

  if (showReportPopup) {
    return <ReportPopup onClose={() => setShowReportPopup(false)} username={username} />;
  }

  if (showBlockPopup) {
    return <BlockPopup onClose={() => setShowBlockPopup(false)} username={username} />;
  }

  return (
    <div
      ref={popupRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-60 w-64 sm:w-72"
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <span className="font-semibold text-lg"></span>
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="flex flex-col p-2">
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Copy profile link
          <Link size={16} className="text-gray-500" />
        </button>
        <button
          onClick={() => setShowSharePopup(true)}
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Share Profile via
          <Share2 size={16} className="text-gray-500" />
        </button>
        <button
          onClick={handleFollow}
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Follow {username}
          <UserPlus size={16} className="text-gray-500" />
        </button>
        <button
          onClick={() => setShowMutePopup(true)}
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Mute {username}
          <VolumeX size={16} className="text-gray-500" />
        </button>
        <button
          onClick={() => setShowReportPopup(true)}
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Report {username}
          <Flag size={16} className="text-gray-500" />
        </button>
        <button
          onClick={() => setShowBlockPopup(true)}
          className="flex items-center justify-between w-full text-left text-red-500 py-2 px-3 hover:bg-gray-50 rounded-md text-sm sm:text-base"
        >
          Block {username}
          <Ban size={16} className="text-red-500" />
        </button>
      </div>
    </div>
  );
}