"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  EllipsisVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SharePopup from "../home/main-popup/SharePopup";
import MoreOptionsPopup from "../home/main-popup/MoreOptionsPopup";
import ProfilePopup from "../home/main-popup/ProfilePopup";
import RepostPopup from "../home/main-popup/RepostPopup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReadPostPopup from "../home/main-popup/ReadPostPopup";
import MutePopup from "../home/main-popup/MutePopup";
import RequestNotePopup from "../home/main-popup/RequestNotePopup";
import BlockPopup from "../home/main-popup/BlockPopup";

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

export default function BookmarkPage() {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const [repostedPosts, setRepostedPosts] = useState<number[]>([]);
  const [showSharePopup, setShowSharePopup] = useState<number | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState<number | null>(null);
  const [showRepostPopup, setShowRepostPopup] = useState<number | null>(null);
  const [showMutePopup, setShowMutePopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });
  const [showRequestNotePopup, setShowRequestNotePopup] = useState(false);
  const [showBlockPopup, setShowBlockPopup] = useState<{
    show: boolean;
    username: string;
  }>({ show: false, username: "" });
  const sharePopupRef = useRef<HTMLDivElement | null>(null);
  const morePopupRef = useRef<HTMLDivElement | null>(null);
  const profilePicRef = useRef<HTMLDivElement | null>(null);
  const profilePopupRef = useRef<HTMLDivElement | null>(null);
  const repostPopupRef = useRef<HTMLDivElement | null>(null);

  const posts: Post[] = [
    {
      id: 1,
      name: "Ariene McCoy",
      username: "@Ariene_McCoy",
      time: "2 Hours ago",
      location: "Dede, Lagos Nigeria",
      content:
        "Design isn't just about what it looks like etc; it;s about how it works. Every product tells a story- let's make sure it's worth sharing. #ProductDesign",
      image: "/Rectangle 12.png",
      profilePic: "/Rectangle5.png",
      likes: 23000,
      comments: 23000,
      reposts: 23000,
    },
    {
      id: 2,
      name: "John Doe",
      username: "@john_doe",
      time: "3 Hours ago",
      location: "Victoria Island, Lagos",
      content:
        "Just finished an amazing project! The client was thrilled with the results. #WebDevelopment #ClientSuccess",
      image: "/Rectangle 12.png",
      profilePic: "/Rectangle 1.png",
      likes: 15000,
      comments: 8500,
      reposts: 3200,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      username: "@sarah_j",
      time: "5 Hours ago",
      location: "Ikeja, Lagos",
      content:
        "Morning coffee thoughts: Sometimes the best ideas come when you're not actively trying to think of them. #Inspiration #Creativity ",
      image: "/Rectangle 12.png",
      profilePic: "/Rectangle 3.png",
      likes: 5600,
      comments: 1200,
      reposts: 890,
    },
    {
      id: 4,
      name: "Mike Chen",
      username: "@mike_chen",
      time: "6 Hours ago",
      location: "Lekki, Lagos",
      content:
        "New blog post is live! Sharing my thoughts on the future of web development. Check it out! #WebDev #BlogPost",
      image: "/Frame 427321627.png",
      profilePic: "/Rectangle 4.png",
      likes: 12000,
      comments: 4500,
      reposts: 2100,
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 100) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toLocaleString();
  };

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


  const [showReadPostPopup, setShowReadPostPopup] = useState<{
    show: boolean;
    content: string;
  }>({ show: false, content: "" });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setTimeout(() => {
        if (
          sharePopupRef.current &&
          !sharePopupRef.current.contains(event.target as Node)
        ) {
          setShowSharePopup(null);
        }
        if (
          morePopupRef.current &&
          !morePopupRef.current.contains(event.target as Node)
        ) {
          // setShowMorePopup(null);
        }
        if (
          profilePopupRef.current &&
          !profilePopupRef.current.contains(event.target as Node) &&
          profilePicRef.current &&
          !profilePicRef.current.contains(event.target as Node)
        ) {
          console.log("Closing ProfilePopup due to click outside");
          setShowProfilePopup(null);
        }
        if (
          repostPopupRef.current &&
          !repostPopupRef.current.contains(event.target as Node)
        ) {
          setShowRepostPopup(null);
        }
      }, 100);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleRepostEvent = (event: CustomEvent) => {
      const { postId } = event.detail;
      setRepostedPosts((prev) =>
        prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId]
      );
    };

    window.addEventListener("repost", handleRepostEvent as EventListener);
    return () =>
      window.removeEventListener("repost", handleRepostEvent as EventListener);
  }, []);

  const bookmarkedPostsList = posts.filter((post) =>
    bookmarkedPosts.includes(post.id)
  );

  return (
    <div className="w-full lg:max-w-4xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold p-4 border-b border-gray-200">
        Bookmarks
      </h2>
      <div className="space-y-0">
        {bookmarkedPostsList.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No bookmarked posts</p>
        ) : (
          bookmarkedPostsList.map((post) => (
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
                    onClick={() => router.push("/home/post")}
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
                        repostedPosts.includes(post.id)
                          ? "Undo repost"
                          : "Repost"
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
          ))
        )}
      </div>
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
