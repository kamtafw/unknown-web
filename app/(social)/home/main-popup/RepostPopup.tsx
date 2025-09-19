"use client";

import { useState } from "react";
import {
  X,
  Repeat,
  PencilLine,
  Image as ImageIcon,
  Camera,
  MapPin,
  Hash,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TagPopup from "../../create-post/TagPopup";

interface RepostPopupProps {
  onClose: () => void;
  post: {
    id: number;
    name: string;
    username: string;
    time: string;
    location: string;
    content: string;
    image: string;
    profilePic: string;
  };
}

export default function RepostPopup({ onClose, post }: RepostPopupProps) {
  const router = useRouter();
  const [showQuotePopup, setShowQuotePopup] = useState(false);
  const [showTagPopup, setShowTagPopup] = useState(false);

  const handleRepost = () => {
    window.dispatchEvent(
      new CustomEvent("repost", { detail: { postId: post.id } })
    );
    onClose();
    router.push("/home");
  };

  if (showTagPopup) {
    return <TagPopup 
  onClose={() => setShowTagPopup(false)} 
  onTagSelect={(tag) => {
    console.log('Selected tag:', tag);
  }}
/>;
  }

  if (showQuotePopup) {
    return (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Repost</h3>
          <button
            onClick={onClose}
            aria-label="Close popup"
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="flex items-start mb-4">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
            <Image
              src={post.profilePic}
              alt={post.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{post.name}</span>
              <span className="text-sm text-gray-500">{post.username}</span>
            </div>
            <p className="text-sm text-gray-500">{post.time}</p>
          </div>
        </div>
        <textarea
          className="w-full p-1 border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add your comment..."
          rows={2}
        />
        <div className="flex gap-3 mb-4">
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Add Photo"
          >
            <ImageIcon className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Add Camera"
          >
            <Camera className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Add Location"
          >
            <MapPin className="h-5 w-5 text-gray-500" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Add Hashtag"
            onClick={() => setShowTagPopup(true)}
          >
            <Hash className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300">
              <Image
                src={post.profilePic}
                alt={post.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="ml-3">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-sm">{post.name}</span>
                <span className="text-xs text-gray-500">{post.username}</span>
              </div>
              <p className="text-xs text-gray-500">{post.time}</p>
              <p className="text-sm mt-1">{post.content}</p>
            </div>
          </div>
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded-full hover:bg-blue-600 transition-colors"
          onClick={handleRepost}
        >
          Repost
        </button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-12 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
      <div className="flex justify-end">
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md"
          onClick={handleRepost}
        >
          Repost
          <Repeat className="h-5 w-5 text-gray-500" />
        </button>
        <button
          className="flex items-center justify-between w-full text-left py-2 px-3 hover:bg-gray-50 rounded-md"
          onClick={() => setShowQuotePopup(true)}
        >
          Quote
          <PencilLine className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
