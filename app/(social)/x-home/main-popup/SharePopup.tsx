"use client";

import { MessageSquare, Users, Repeat } from "lucide-react";
import { useState } from "react";
import ShareToFollowersPopup from "./ShareToFollowersPopup";


interface SharePopupProps {
  onClose: () => void;
  postId: string | number;
}

export default function SharePopup({}: SharePopupProps) {
  const [showFollowersPopup, setShowFollowersPopup] = useState(false);

  return (
    <div className="absolute bottom-12 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
      <h3 className="font-semibold text-left">Share content</h3>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Share to messenger
        <MessageSquare className="h-5 w-5 text-gray-500" />
      </button>
      <button
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50"
        onClick={() => setShowFollowersPopup(true)}
      >
        Share to followers
        <Users className="h-5 w-5 text-gray-500" />
      </button>
      <button className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50">
        Re-post
        <Repeat className="h-5 w-5 text-gray-500" />
      </button>
      {showFollowersPopup && (
        <ShareToFollowersPopup onClose={() => setShowFollowersPopup(false)} />
      )}
    </div>
  );
}
