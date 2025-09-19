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

interface MoreOptionsPopupProps {
  username: string;
  postContent?: string;
  onReadPost?: (content: string) => void;
  onMute?: (username: string) => void;
  onRequestNote?: () => void;
  onBlock?: (username: string) => void;
}

export default function MoreOptionsPopup({
  username,
  postContent = "",
  onReadPost,
  onMute,
  onRequestNote,
  onBlock,
}: MoreOptionsPopupProps) {
  return (
    <div className="p-4">
      <button
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50"
        onClick={() => onReadPost?.(postContent)}
      >
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
        onClick={() => {
          const trigger = document.querySelector('[data-state="open"]');
          if (trigger) {
            (trigger as HTMLElement).click();
          }
          onMute?.(username);
        }}
      >
        Mute {username}
        <UserMinus className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50"
        onClick={() => {
          const trigger = document.querySelector('[data-state="open"]');
          if (trigger) {
            (trigger as HTMLElement).click();
          }
          onRequestNote?.();
        }}
      >
        Request community Note
        <FileText className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 text-red-600"
        onClick={() => {
          const trigger = document.querySelector('[data-state="open"]');
          if (trigger) {
            (trigger as HTMLElement).click();
          }
          onBlock?.(username);
        }}
      >
        Block {username}
        <CircleSlash2 className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}
