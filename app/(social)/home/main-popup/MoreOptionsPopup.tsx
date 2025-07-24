"use client";

import {
  Volume2,
  XCircle,
  Bookmark,
  UserPlus,
  UserMinus,
  FileText,
  CircleSlash2,
} from "lucide-react";
import { useState } from "react";
import MutePopup from "./MutePopup";
import RequestNotePopup from "./RequestNotePopup";
import BlockPopup from "./BlockPopup";

interface MoreOptionsPopupProps {
  onClose: () => void;
  username: string;
}

export default function MoreOptionsPopup({
  username,
}: MoreOptionsPopupProps) {
  const [showMutePopup, setShowMutePopup] = useState(false);
  const [showRequestNotePopup, setShowRequestNotePopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState(false);

  return (
    <div className="absolute bottom-12 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Read post out loud
        <Volume2 className="h-5 w-5 text-gray-500" />
      </button>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Not interested in this post
        <XCircle className="h-5 w-5 text-gray-500" />
      </button>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Add or Remove from saved
        <Bookmark className="h-5 w-5 text-gray-500" />
      </button>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Connect {username}
        <UserPlus className="h-5 w-5 text-gray-500" />
      </button>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Follow {username}
        <UserPlus className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50"
        onClick={() => setShowMutePopup(true)}
      >
        Mute {username}
        <UserMinus className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50"
        onClick={() => setShowRequestNotePopup(true)}
      >
        Request community Note
        <FileText className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 text-red-600"
        onClick={() => setShowBlockPopup(true)}
      >
        Block {username}
        <CircleSlash2 className="h-5 w-5 text-gray-500" />
      </button>
      {showMutePopup && (
        <MutePopup
          onClose={() => setShowMutePopup(false)}
          username={username}
        />
      )}
      {showRequestNotePopup && (
        <RequestNotePopup onClose={() => setShowRequestNotePopup(false)} />
      )}
      {showBlockPopup && (
        <BlockPopup
          onClose={() => setShowBlockPopup(false)}
          username={username}
        />
      )}
    </div>
  );
}
