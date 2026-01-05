"use client";

import { Heart, MessageSquare, Repeat, Share2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import SharePopup from "./main-popup/SharePopup";
import RepostPopup from "./main-popup/RepostPopup";

interface PostActionsProps {
  post: {
    id: number;
    name: string;
    username: string;
    time: string;
    location: string;
    content: string;
    media: string[];
    profilePic: string;
    likes: number;
    comments: number;
    reposts: number;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  onRepost: (postId: number) => void;
  isReposted: boolean;
  showSharePopup: boolean;
  showRepostPopup: boolean;
  onLike: (postId: number) => void;
  onBookmark: (postId: number) => void;
  onShowSharePopup: (show: boolean) => void;
  onShowRepostPopup: (show: boolean) => void;
  sharePopupRef: React.RefObject<HTMLDivElement | null>;
  repostPopupRef: React.RefObject<HTMLDivElement | null>;
  formatNumber: (num: number) => string;
}

export default function PostActions({
  post,
  isLiked,
  isBookmarked,
  onRepost,
  isReposted,
  showSharePopup,
  showRepostPopup,
  onLike,
  onBookmark,
  onShowSharePopup,
  onShowRepostPopup,
  sharePopupRef,
  repostPopupRef,
  formatNumber,
}: PostActionsProps) {
  return (
    <div className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-4">
      {/* Like Button */}
      <button
        className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors group"
        onClick={() => onLike(post.id)}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <Heart
          className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
            isLiked
              ? "text-blue-500 fill-blue-500"
              : "text-gray-500 group-hover:text-blue-500"
          )}
        />
        <span className="text-xs sm:text-sm text-gray-600">
          {formatNumber(post.likes)}
        </span>
      </button>

      {/* Comment Button */}
      <button
        className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors group"
        aria-label="View comments"
      >
        <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
        <span className="text-xs sm:text-sm text-gray-600">
          {formatNumber(post.comments)}
        </span>
      </button>

      {/* Repost Button */}
      <div className="relative">
        <button
          className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-green-50 transition-colors group"
          onClick={() => onShowRepostPopup(true)}
          aria-label={isReposted ? "Undo repost" : "Repost"}
        >
          <Repeat
            className={cn(
              "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
              isReposted
                ? "text-blue-500"
                : "text-gray-500 group-hover:text-blue-500"
            )}
          />
          <span className="text-xs sm:text-sm text-gray-600">
            {formatNumber(post.reposts)}
          </span>
        </button>
        {showRepostPopup && (
          <div ref={repostPopupRef}>
            <RepostPopup
              onClose={() => onShowRepostPopup(false)}
              onRepost={onRepost}
              post={post}
            />
          </div>
        )}
      </div>

      {/* Share Button */}
      <div className="relative">
        <button
          className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => onShowSharePopup(true)}
          aria-label="Share post"
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
        </button>
        {showSharePopup && (
          <div ref={sharePopupRef}>
            <SharePopup
              onClose={() => onShowSharePopup(false)}
              postId={post.id}
            />
          </div>
        )}
      </div>

      {/* Bookmark Button */}
      <button
        className="p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors"
        onClick={() => onBookmark(post.id)}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
      >
        <Bookmark
          className={cn(
            "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
            isBookmarked
              ? "text-blue-500 fill-blue-500"
              : "text-gray-500 hover:text-blue-500"
          )}
        />
      </button>
    </div>
  );
}
