"use client";

import {
  X,
  Image as ImageIcon,
  Camera,
  Hash,
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import SharePopup from "./SharePopup";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CommentPopup({
  onClose,
  post,
}: {
  onClose: () => void;
  post: any;
}) {
  const router = useRouter();
  const [textareaValue, setTextareaValue] = useState("");
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [images, setImages] = useState<string[]>([
    "/Beli.png",
    "/Beli.png",
    "/Beli.png",
  ]);
  const sharePopupRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sharePopupRef.current &&
      !sharePopupRef.current.contains(event.target as Node)
    ) {
      setShowSharePopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && images.length < 3) {
      const newImages = Array.from(e.target.files)
        .slice(0, 3 - images.length)
        .map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    router.push("/home");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[550px] h-[90vh] shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold">Reply Comment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close comment popup"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                <Image
                  src="/profilepic.jpg"
                  alt={post.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-base truncate">
                    {post.name}
                  </span>
                  <span className="text-sm text-gray-500 truncate">
                    {post.username}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">{post.time}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-base leading-relaxed">{post.content}</p>
              <div className="mt-3 rounded-lg overflow-hidden">
                <Image
                  src={post.image}
                  alt="Post image"
                  width={550}
                  height={275}
                  className="w-full object-contain"
                />
              </div>
              <div className="flex justify-between items-center mt-4 max-w-sm">
                <button
                  className="flex items-center gap-2 hover:bg-red-50 p-2 rounded-full transition-colors group"
                  onClick={() => setLiked(!liked)}
                  aria-label={liked ? "Unlike post" : "Like post"}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      liked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 group-hover:text-red-500"
                    )}
                  />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.likes)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-full transition-colors group"
                  aria-label="View comments"
                >
                  <MessageSquare className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.comments)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-2 hover:bg-green-50 p-2 rounded-full transition-colors group"
                  aria-label="Repost"
                >
                  <Repeat className="h-5 w-5 text-gray-500 group-hover:text-green-500" />
                  <span className="text-sm text-gray-600">
                    {formatCount(post.reposts)}
                  </span>
                </button>
                <div className="relative">
                  <button
                    className="hover:bg-blue-50 p-2 rounded-full transition-colors group"
                    onClick={() => setShowSharePopup(true)}
                    aria-label="Share post"
                  >
                    <Share2 className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                  </button>
                  {showSharePopup && (
                    <div className="absolute right-0 bottom-12 z-50">
                      <SharePopup
                        onClose={() => setShowSharePopup(false)}
                        postId={post.id}
                      />
                    </div>
                  )}
                </div>
                <button
                  className="flex items-center gap-2 hover:bg-blue-50 p-2 rounded-full transition-colors group"
                  onClick={() => setBookmarked(!bookmarked)}
                  aria-label={bookmarked ? "Remove bookmark" : "Bookmark post"}
                >
                  <Bookmark
                    className={cn(
                      "h-5 w-5 transition-colors",
                      bookmarked
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-500 group-hover:text-blue-500"
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                <Image
                  src="/profilepic.jpg"
                  alt="Profile"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex flex-wrap items-center gap-1 mb-2">
                  <span className="font-semibold text-base">Kenechukwu</span>
                  <span className="text-sm text-gray-500">@Kene_chukwu</span>
                </div>
                <textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  className="w-full p-1 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs min-h-[2px]"
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  style={{ overflow: "hidden" }}
                />
              </div>
            </div>
            {images.length > 0 && (
              <div className="flex flex-row gap-3 ml-3">
                {images.map((image, index) => (
                  <div key={index} className="relative flex-1 max-w-[160px]">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      width={160}
                      height={120}
                      className="w-full rounded-lg object-contain"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <label className="cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors">
                <ImageIcon
                  className="h-5 w-5 text-gray-600"
                  aria-label="Upload image"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Upload images"
                />
              </label>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                aria-label="Open camera"
              >
                <Camera className="h-5 w-5 text-gray-600" />
              </button>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                title="Add location"
              >
                <MapPin className="h-6 w-6 text-gray-600" />
              </button>
              <button
                className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                onClick={() => router.push("/home/tags")}
                aria-label="Add hashtag"
              >
                <Hash className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePost}
              disabled={!textareaValue.trim() && images.length === 0}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
