"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  EllipsisVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SharePopup from "./main-popup/SharePopup";
import MoreOptionsPopup from "./main-popup/MoreOptionsPopup";
import ProfilePopup from "./main-popup/ProfilePopup";
import RepostPopup from "./main-popup/RepostPopup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReadPostPopup from "./main-popup/ReadPostPopup";
import { useState } from "react";
import MutePopup from "./main-popup/MutePopup";
import RequestNotePopup from "./main-popup/RequestNotePopup";
import BlockPopup from "./main-popup/BlockPopup";

interface Post {
  id: number;
  name: string;
  username: string;
  time: string;
  location: string;
  content: string;
  image: string;
  profilePic: string;
  likes: number;
  comments: number;
  reposts: number;
}

interface ForYouPageProps {
  posts: Post[];
  likedPosts: number[];
  bookmarkedPosts: number[];
  repostedPosts: number[];
  showSharePopup: number | null;
  showMorePopup: number | null;
  showProfilePopup: number | null;
  showRepostPopup: number | null;
  setLikedPosts: React.Dispatch<React.SetStateAction<number[]>>;
  setBookmarkedPosts: React.Dispatch<React.SetStateAction<number[]>>;
  setRepostedPosts: React.Dispatch<React.SetStateAction<number[]>>;
  setShowSharePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowMorePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowProfilePopup: React.Dispatch<React.SetStateAction<number | null>>;
  setShowRepostPopup: React.Dispatch<React.SetStateAction<number | null>>;
  sharePopupRef: React.RefObject<HTMLDivElement | null>;
  morePopupRef: React.RefObject<HTMLDivElement | null>;
  profilePicRef: React.RefObject<HTMLDivElement | null>;
  profilePopupRef: React.RefObject<HTMLDivElement | null>;
  repostPopupRef: React.RefObject<HTMLDivElement | null>;
  formatNumber: (num: number) => string;
}

export default function ForYouPage({
  posts,
  likedPosts,
  bookmarkedPosts,
  repostedPosts,
  showSharePopup,
  showProfilePopup,
  showRepostPopup,
  setLikedPosts,
  setBookmarkedPosts,
  setShowSharePopup,
  setShowProfilePopup,
  setShowRepostPopup,
  sharePopupRef,
  repostPopupRef,
  formatNumber,
}: ForYouPageProps) {
  const router = useRouter();
  const [showReadPostPopup, setShowReadPostPopup] = useState<{
    show: boolean;
    content: string;
  }>({ show: false, content: "" });
  const [showMutePopup, setShowMutePopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });
  const [showRequestNotePopup, setShowRequestNotePopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });

  const handleLike = (postId: number) => {
    setLikedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBookmark = (postId: number) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <div className="space-y-0">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-start justify-between mb-2 sm:mb-3">
            <div className="flex items-start flex-1 min-w-0">
              <div className="relative">
                <div
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0 group"
                  onMouseEnter={() => {
                    setShowProfilePopup(post.id);
                  }}
                  onMouseLeave={() => {
                    setTimeout(() => {
                      setShowProfilePopup(null);
                    }, 100);
                  }}
                >
                  <Image
                    src={post.profilePic}
                    alt={post.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
                {/* Render popup outside but keep it connected */}
                {showProfilePopup === post.id && (
                  <div
                    className="absolute top-0 left-0 z-50"
                    onMouseEnter={() => {
                      setShowProfilePopup(post.id);
                    }}
                    onMouseLeave={() => {
                      setShowProfilePopup(null);
                    }}
                  >
                    <ProfilePopup
                      name={post.name}
                      username={post.username}
                      profilePic={post.profilePic}
                      location={post.location}
                      onClose={() => setShowProfilePopup(null)}
                    />
                  </div>
                )}
              </div>
              <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-1">
                  <button
                    className="font-semibold text-sm sm:text-base hover:underline truncate"
                    onClick={() => router.push(`/home/social-profile`)}
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
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="p-1 rounded-full hover:bg-gray-100 flex-shrink-0 ml-2"
                  aria-label="More options"
                >
                  <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-0" asChild>
                <div>
                  <MoreOptionsPopup
                    username={post.username}
                    postContent={post.content}
                    onReadPost={(content: string) => {
                      setShowReadPostPopup({ show: true, content });
                      const trigger = document.querySelector(
                        '[data-state="open"]'
                      );
                      if (trigger) {
                        (trigger as HTMLElement).click();
                      }
                    }}
                    onMute={(username: string) =>
                      setShowMutePopup({ show: true, username })
                    }
                    onRequestNote={() => setShowRequestNotePopup(true)}
                    onBlock={(username: string) =>
                      setShowBlockPopup({ show: true, username })
                    }
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="ml-0 sm:ml-0">
            <p className="text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-relaxed">
              {post.content}
            </p>
            <button
              onClick={() => router.push("/home/post")}
              aria-label="View post"
              className="w-full"
            >
              <Image
                src={post.image}
                alt="Post image"
                width={500}
                height={300}
                className="w-full rounded-lg object-cover max-h-64 sm:max-h-80"
              />
            </button>
            <div className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-4">
              <button
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors group"
                onClick={() => handleLike(post.id)}
                aria-label={
                  likedPosts.includes(post.id) ? "Unlike post" : "Like post"
                }
              >
                <Heart
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                    likedPosts.includes(post.id)
                      ? "text-red-500 fill-red-500"
                      : "text-gray-500 group-hover:text-red-500"
                  )}
                />
                <span className="text-xs sm:text-sm text-gray-600">
                  {formatNumber(post.likes)}
                </span>
              </button>
              <button
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors group"
                aria-label="View comments"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {formatNumber(post.comments)}
                </span>
              </button>
              <div className="relative">
                <button
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-green-50 transition-colors group"
                  onClick={() => setShowRepostPopup(post.id)}
                  aria-label={
                    repostedPosts.includes(post.id) ? "Undo repost" : "Repost"
                  }
                >
                  <Repeat
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                      repostedPosts.includes(post.id)
                        ? "text-green-500"
                        : "text-gray-500 group-hover:text-green-500"
                    )}
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {formatNumber(post.reposts)}
                  </span>
                </button>
                {showRepostPopup === post.id && (
                  <div ref={repostPopupRef}>
                    <RepostPopup
                      onClose={() => setShowRepostPopup(null)}
                      post={post}
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => setShowSharePopup(post.id)}
                  aria-label="Share post"
                >
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                </button>
                {showSharePopup === post.id && (
                  <div ref={sharePopupRef}>
                    <SharePopup
                      onClose={() => setShowSharePopup(null)}
                      postId={post.id}
                    />
                  </div>
                )}
              </div>
              <button
                className="p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors"
                onClick={() => handleBookmark(post.id)}
                aria-label={
                  bookmarkedPosts.includes(post.id)
                    ? "Remove bookmark"
                    : "Bookmark post"
                }
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                    bookmarkedPosts.includes(post.id)
                      ? "text-blue-500 fill-blue-500"
                      : "text-gray-500 hover:text-blue-500"
                  )}
                />
              </button>
            </div>
          </div>
        </div>
      ))}
      {showReadPostPopup.show && (
        <ReadPostPopup
          onClose={() => setShowReadPostPopup({ show: false, content: "" })}
          postContent={showReadPostPopup.content}
        />
      )}
      {showMutePopup.show && (
        <MutePopup
          onClose={() => setShowMutePopup({ show: false, username: "" })}
          username={showMutePopup.username}
        />
      )}
      {showRequestNotePopup && (
        <RequestNotePopup onClose={() => setShowRequestNotePopup(false)} />
      )}
      {showBlockPopup.show && (
        <BlockPopup
          onClose={() => setShowBlockPopup({ show: false, username: "" })}
          username={showBlockPopup.username}
        />
      )}
    </div>
  );
}
