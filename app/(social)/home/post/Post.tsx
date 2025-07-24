"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  EllipsisVertical,
  ArrowLeft,
  Smile,
  ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import SharePopup from "../main-popup/SharePopup";
import MoreOptionsPopup from "../main-popup/MoreOptionsPopup";
import CommentPopup from "../main-popup/CommentPopup";
import { cn } from "@/lib/utils";

export default function PostPage() {
  const router = useRouter();

  const [mainPostLiked, setMainPostLiked] = useState(false);
  const [mainPostBookmarked, setMainPostBookmarked] = useState(false);
  const [replyLiked, setReplyLiked] = useState(false);
  const [replyBookmarked, setReplyBookmarked] = useState(false);

  const [showMainPostSharePopup, setShowMainPostSharePopup] = useState(false);
  const [showReplySharePopup, setShowReplySharePopup] = useState(false);

  const [showMorePopup, setShowMorePopup] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [activeMorePopup, setActiveMorePopup] = useState<string | null>(null);

  const mainSharePopupRef = useRef<HTMLDivElement>(null);
  const replySharePopupRef = useRef<HTMLDivElement>(null);
  const morePopupRef = useRef<HTMLDivElement>(null);

  const post = {
    id: 1,
    name: "Ariene McCoy",
    username: "@Ariene_McCoy",
    time: "2 Hours ago",
    location: "Dede, Lagos Nigeria",
    content: "Design isn't just about what it looks like etc",
    image: "/Rectangle 12.png",
    likes: 23000,
    comments: 23000,
    reposts: 23000,
  };

  const formatCount = (count: number) => {
    if (count >= 100) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      mainSharePopupRef.current &&
      !mainSharePopupRef.current.contains(event.target as Node)
    ) {
      setShowMainPostSharePopup(false);
    }
    if (
      replySharePopupRef.current &&
      !replySharePopupRef.current.contains(event.target as Node)
    ) {
      setShowReplySharePopup(false);
    }
    if (
      morePopupRef.current &&
      !morePopupRef.current.contains(event.target as Node)
    ) {
      setShowMorePopup(false);
      setActiveMorePopup(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMoreOptionsClick = (popupId: string) => {
    setActiveMorePopup(popupId);
    setShowMorePopup(true);
  };

  return (
    <div className="ml-1 lg:ml-1 w-full">
      <div className="w-full lg:max-w-4xl">
        <div className="sticky top-0 bg-white backdrop-blur-sm z-10 ">
          <div className="px-4 py-3 flex items-center gap-2">
            <button
              onClick={() => router.push("/home")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Back to Home"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>
        <div className="p space-y-4">
          <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-start flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                  <Image
                    src="/profilepic.jpg"
                    alt={post.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-1">
                    <button
                      className="font-semibold text-sm sm:text-base hover:underline truncate"
                      onClick={() => router.push(`/profile/${post.username}`)}
                      aria-label={`View ${post.name}'s profile`}
                    >
                      {post.name}
                    </button>
                    <span className="text-xs sm:text-sm text-gray-500 truncate">
                      {post.username}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {post.time} · {post.location}
                  </p>
                </div>
              </div>
              <button
                className="relative p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ml-2"
                onClick={() => handleMoreOptionsClick("main-post")}
                aria-label="More options"
              >
                <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                {showMorePopup && activeMorePopup === "main-post" && (
                  <div ref={morePopupRef}>
                    <MoreOptionsPopup
                      onClose={() => {
                        setShowMorePopup(false);
                        setActiveMorePopup(null);
                      }}
                      username={post.username}
                    />
                  </div>
                )}
              </button>
            </div>
            <div className="ml-0 sm:ml-0">
              <p className="text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-relaxed">
                {post.content}
              </p>
              <Image
                src={post.image}
                alt="Post image"
                width={500}
                height={300}
                className="w-full rounded-lg object-cover max-h-64 sm:max-h-80"
              />
              <div className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-4">
                <button
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors group"
                  onClick={() => setMainPostLiked(!mainPostLiked)}
                  aria-label={mainPostLiked ? "Unlike post" : "Like post"}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                      mainPostLiked
                        ? "text-red-500 fill-red-500"
                        : "text-gray-500 group-hover:text-red-500"
                    )}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {formatCount(post.likes)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors group"
                  onClick={() => setShowCommentPopup(true)}
                  aria-label="View comments"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {formatCount(post.comments)}
                  </span>
                </button>
                <button
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-green-50 transition-colors group"
                  aria-label="Repost"
                >
                  <Repeat className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-green-500 transition-colors" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {formatCount(post.reposts)}
                  </span>
                </button>
                <button
                  className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMainPostSharePopup(true)}
                  aria-label="Share post"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                  {showMainPostSharePopup && (
                    <div ref={mainSharePopupRef}>
                      <SharePopup
                        onClose={() => setShowMainPostSharePopup(false)}
                        postId={post.id}
                      />
                    </div>
                  )}
                </button>
                <button
                  className="p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors"
                  onClick={() => setMainPostBookmarked(!mainPostBookmarked)}
                  aria-label={
                    mainPostBookmarked ? "Remove bookmark" : "Bookmark post"
                  }
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                      mainPostBookmarked
                        ? "text-blue-500 fill-blue-500"
                        : "text-gray-500 hover:text-blue-500"
                    )}
                  />
                </button>
              </div>
              <div className="mt-4 flex items-center border border-gray-200 rounded-lg p-3 bg-gray-50">
                <Smile
                  className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  placeholder={`Reply to ${post.username}`}
                  className="flex-1 text-sm focus:outline-none bg-transparent"
                />
                <label className="cursor-pointer ml-3 flex-shrink-0">
                  <ImageIcon
                    className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Upload image"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label="Upload image"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <div className="bg-white">
              <h2 className="text-lg font-semibold ml-2 mt-2 ">Replies</h2>
            </div>
            <div className="space-y-4">
              <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-start flex-1 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
                      <Image
                        src="/profilepic.jpg"
                        alt={post.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1">
                        <button
                          className="font-semibold text-sm sm:text-base hover:underline truncate"
                          onClick={() =>
                            router.push(`/profile/${post.username}`)
                          }
                          aria-label={`View ${post.name}'s profile`}
                        >
                          {post.name}
                        </button>
                        <span className="text-xs sm:text-sm text-gray-500 truncate">
                          {post.username}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {post.time} · {post.location}
                      </p>
                    </div>
                  </div>
                  <button
                    className="relative p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ml-2"
                    onClick={() => handleMoreOptionsClick("reply-post")}
                    aria-label="More options"
                  >
                    <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    {showMorePopup && activeMorePopup === "reply-post" && (
                      <div ref={morePopupRef}>
                        <MoreOptionsPopup
                          onClose={() => {
                            setShowMorePopup(false);
                            setActiveMorePopup(null);
                          }}
                          username={post.username}
                        />
                      </div>
                    )}
                  </button>
                </div>
                <div className="ml-0 sm:ml-0">
                  <p className="text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-relaxed">
                    {post.content}
                  </p>
                  <Image
                    src={post.image}
                    alt="Reply image"
                    width={500}
                    height={300}
                    className="w-full rounded-lg object-cover max-h-64 sm:max-h-80"
                  />
                  <div className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-4">
                    <button
                      className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors group"
                      onClick={() => setReplyLiked(!replyLiked)}
                      aria-label={replyLiked ? "Unlike reply" : "Like reply"}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                          replyLiked
                            ? "text-red-500 fill-red-500"
                            : "text-gray-500 group-hover:text-red-500"
                        )}
                      />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {formatCount(post.likes)}
                      </span>
                    </button>
                    <button
                      className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors group"
                      onClick={() => setShowCommentPopup(true)}
                      aria-label="View comments"
                    >
                      <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {formatCount(post.comments)}
                      </span>
                    </button>
                    <button
                      className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-green-50 transition-colors group"
                      aria-label="Repost"
                    >
                      <Repeat className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-green-500 transition-colors" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {formatCount(post.reposts)}
                      </span>
                    </button>
                    <button
                      className="relative p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                      onClick={() => setShowReplySharePopup(true)}
                      aria-label="Share reply"
                    >
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                      {showReplySharePopup && (
                        <div ref={replySharePopupRef}>
                          <SharePopup
                            onClose={() => setShowReplySharePopup(false)}
                            postId={post.id}
                          />
                        </div>
                      )}
                    </button>
                    <button
                      className="p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors"
                      onClick={() => setReplyBookmarked(!replyBookmarked)}
                      aria-label={
                        replyBookmarked ? "Remove bookmark" : "Bookmark reply"
                      }
                    >
                      <Bookmark
                        className={cn(
                          "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                          replyBookmarked
                            ? "text-blue-500 fill-blue-500"
                            : "text-gray-500 hover:text-blue-500"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showCommentPopup && (
          <CommentPopup
            onClose={() => setShowCommentPopup(false)}
            post={post}
          />
        )}
      </div>
    </div>
  );
}
