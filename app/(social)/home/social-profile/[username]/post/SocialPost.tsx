"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Heart,
  MessageSquare,
  Repeat,
  Share2,
  Bookmark,
  EllipsisVertical,
  // X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SharePopup from "../../../main-popup/SharePopup";
import MoreOptionsPopup from "../../../main-popup/MoreOptionsPopup";
import ProfilePopup from "../../../main-popup/ProfilePopup";
import RepostPopup from "../../../main-popup/RepostPopup";
import { useRouter } from "next/navigation";

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

export default function SocialPost() {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([
    1, 2, 3, 4,
  ]);
  const [repostedPosts, setRepostedPosts] = useState<number[]>([]);
  const [showSharePopup, setShowSharePopup] = useState<number | null>(null);
  const [showMorePopup, setShowMorePopup] = useState<number | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState<number | null>(null);
  const [showRepostPopup, setShowRepostPopup] = useState<number | null>(null);
  const [postImages, setPostImages] = useState<{ [key: number]: string[] }>({
    2: ["/Beli.png", "/Beli.png", "/Beli.png", "/Beli.png"],
  });
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
      content: "Design isn't just about what it looks like etc",
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
        "Just finished an amazing project! The client was thrilled with the results.",
      image: "/Beli.png",
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
        "Morning coffee thoughts: Sometimes the best ideas come when you're not actively trying to think of them.",
      image: "/bottle.png",
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
        "New blog post is live! Sharing my thoughts on the future of web development.",
      image: "/Rectangle 12.png",
      profilePic: "/Rectangle 4.png",
      likes: 12000,
      comments: 4500,
      reposts: 2100,
    },
    {
      id: 5,
      name: "Emma Wilson",
      username: "@emma_w",
      time: "8 Hours ago",
      location: "Surulere, Lagos",
      content:
        "Grateful for this beautiful sunset. Nature never fails to inspire.",
      image: "/Frame 427321627.png",
      profilePic: "/Rectangle 1.png",
      likes: 8900,
      comments: 2300,
      reposts: 1500,
    },
    {
      id: 6,
      name: "David Brown",
      username: "@david_brown",
      time: "10 Hours ago",
      location: "Yaba, Lagos",
      content:
        "Just launched our new startup! Excited to share this journey with everyone.",
      image: "/Ai Combo.png",
      profilePic: "/Rectangle 2.png",
      likes: 18000,
      comments: 9200,
      reposts: 4800,
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(num % 1000 >= 100 ? 1 : 0) + "k";
    }
    return num.toString();
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

  const handleProfileClick = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(
      `Clicked on ${
        posts.find((p) => p.id === postId)?.name
      }'s profile picture`
    );
    setShowProfilePopup((prev) => (prev === postId ? null : postId));
  };

  const handleRemoveImage = (postId: number, index: number) => {
    setPostImages((prev) => ({
      ...prev,
      [postId]: prev[postId].filter((_, i) => i !== index),
    }));
  };

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
          setShowMorePopup(null);
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

  return (
    <div className="ml-3 lg:ml-5 w-full">
      <div className="w-full lg:max-w-4xl space-y-0">
        {posts.map((post) => (
          <div
            key={post.id}
            className={cn(
              "border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors duration-200"
            )}
          >
            {/* Main Post Header with More Options Button */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-start flex-1 min-w-0">
                <div
                  ref={showProfilePopup === post.id ? profilePicRef : null}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0"
                  onClick={(e) => handleProfileClick(post.id, e)}
                >
                  <Image
                    src={post.profilePic}
                    alt={post.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-150"
                  />
                  {showProfilePopup === post.id && (
                    <div ref={profilePopupRef} className="relative">
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
                    <span className="font-semibold text-sm sm:text-base truncate">
                      {post.name}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {post.username}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {post.time}
                  </p>
                </div>
              </div>
              <button
                className="relative p-1 rounded-full hover:bg-gray-100 transition-colors duration-150 flex-shrink-0 ml-2"
                onClick={() => {
                  setShowSharePopup(null);
                  setShowProfilePopup(null);
                  setShowRepostPopup(null);
                  setShowMorePopup(post.id);
                }}
                aria-label="More options"
              >
                <EllipsisVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                {showMorePopup === post.id && (
                  <div ref={morePopupRef}>
                    <MoreOptionsPopup
                      onClose={() => setShowMorePopup(null)}
                      username={post.username}
                    />
                  </div>
                )}
              </button>
            </div>
            {post.id === 6 && (
              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-base text-gray-900 mt-2 mb-3 sm:mb-4 leading-relaxed">
                  {post.content}
                </p>
              </div>
            )}
            <div
              className={cn(
                post.id === 6
                  ? "border border-gray-300 rounded-lg p-3 sm:p-4"
                  : ""
              )}
            >
              {post.id === 6 && (
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-start flex-1 min-w-0">
                    <div
                      className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0"
                      onClick={(e) => handleProfileClick(post.id, e)}
                    >
                      <Image
                        src={post.profilePic}
                        alt={post.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover hover:opacity-90 transition-opacity duration-150"
                      />
                    </div>
                    <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="font-semibold text-sm sm:text-base truncate">
                          {post.name}
                        </span>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {post.username}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {post.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="ml-0 sm:ml-0">
                <p className="text-sm sm:text-base text-gray-900 mb-2 sm:mb-3 leading-relaxed">
                  {post.content}
                </p>
                {postImages[post.id] ? (
                  <div className="grid grid-cols-2 gap-x-0 gap-y-2 mb-3 max-w-full">
                    {postImages[post.id].map((img, index) => (
                      <div
                        key={index}
                        className="relative w-full aspect-square overflow-hidden rounded-lg"
                      >
                        <Image
                          src={img}
                          alt="Post image"
                          fill
                          className="object-contain"
                        />
                        <button
                          className="absolute top-1 right-1 rounded-full p-1 hover:bg-black/80 transition-colors"
                          onClick={() => handleRemoveImage(post.id, index)}
                          aria-label="Remove image"
                        >
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
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
                      className={cn(
                        "w-full rounded-lg",
                        post.image === "/bottle.png"
                          ? "object-contain max-h-[300px]"
                          : "object-cover max-h-64 sm:max-h-80"
                      )}
                    />
                  </button>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-3 sm:mt-4 gap-2 sm:gap-4">
              <button
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-red-50 transition-colors duration-150 group"
                onClick={() => handleLike(post.id)}
                aria-label={
                  likedPosts.includes(post.id) ? "Unlike post" : "Like post"
                }
              >
                <Heart
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-150",
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
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors duration-150 group"
                onClick={() => router.push("/home/post")}
                aria-label="View comments"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-150" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {formatNumber(post.comments)}
                </span>
              </button>
              <div className="relative">
                <button
                  className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors duration-150 group"
                  onClick={() => setShowRepostPopup(post.id)}
                  aria-label={
                    repostedPosts.includes(post.id) ? "Undo repost" : "Repost"
                  }
                >
                  <Repeat
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-150",
                      repostedPosts.includes(post.id)
                        ? "text-blue-500"
                        : "text-gray-500 group-hover:text-blue-500"
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
                  className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors duration-150"
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
                className="p-1 sm:p-2 rounded-full hover:bg-blue-50 transition-colors duration-150"
                onClick={() => handleBookmark(post.id)}
                aria-label={
                  bookmarkedPosts.includes(post.id)
                    ? "Remove bookmark"
                    : "Bookmark post"
                }
              >
                <Bookmark
                  className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-150",
                    bookmarkedPosts.includes(post.id)
                      ? "text-blue-500 fill-blue-500"
                      : "text-gray-500 hover:text-blue-500"
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
