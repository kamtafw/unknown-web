"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ForYouPage from "./ForYou";
import FollowingPage from "./FollowingHome";

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

interface HomeMainPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function HomeMain({
  activeView,
  setActiveView,
}: HomeMainPageProps) {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);
  const [repostedPosts, setRepostedPosts] = useState<number[]>([]);
  const [showSharePopup, setShowSharePopup] = useState<number | null>(null);
  const [showMorePopup, setShowMorePopup] = useState<number | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState<number | null>(null);
  const [showRepostPopup, setShowRepostPopup] = useState<number | null>(null);
  const sharePopupRef = useRef<HTMLDivElement>(null);
  const morePopupRef = useRef<HTMLDivElement>(null);
  const profilePicRef = useRef<HTMLDivElement>(null);
  const profilePopupRef = useRef<HTMLDivElement>(null);
  const repostPopupRef = useRef<HTMLDivElement>(null);

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
    {
      id: 5,
      name: "Emma Wilson",
      username: "@emma_w",
      time: "8 Hours ago",
      location: "Surulere, Lagos",
      content:
        "Grateful for this beautiful sunset. Nature never fails to inspire. #NatureLover #Sunset ",
      image: "/Rectangle 12.png",
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
        "Just launched our new startup! Excited to share this journey with everyone. #StartupLife #Entrepreneurship",
      image: "/Rectangle 12.png",
      profilePic: "/Rectangle 2.png",
      likes: 18000,
      comments: 10000,
      reposts: 4000,
    },
  ];

  const formatNumber = (num: number): string => {
    if (num >= 100) {
      return `${(num / 1000).toFixed(0)}k`;
    }
    return num.toLocaleString();
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
    <div className="ml-1 lg:ml-1 w-full">
      <div className="w-full lg:max-w-4xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b border-gray-200">
          <div className="grid grid-cols-2">
            <button
              className={cn(
                "text-base sm:text-lg font-semibold pb-2 transition-colors mt-3",
                activeView === "forYou"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveView("forYou")}
            >
              For You
            </button>
            <button
              className={cn(
                "text-base sm:text-lg font-semibold pb-2 transition-colors mt-3",
                activeView === "following"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveView("following")}
            >
              Following
            </button>
          </div>
        </div>
        {activeView === "forYou" && (
          <ForYouPage
            posts={posts}
            likedPosts={likedPosts}
            bookmarkedPosts={bookmarkedPosts}
            repostedPosts={repostedPosts}
            showSharePopup={showSharePopup}
            showMorePopup={showMorePopup}
            showProfilePopup={showProfilePopup}
            showRepostPopup={showRepostPopup}
            setLikedPosts={setLikedPosts}
            setBookmarkedPosts={setBookmarkedPosts}
            setRepostedPosts={setRepostedPosts}
            setShowSharePopup={setShowSharePopup}
            setShowMorePopup={setShowMorePopup}
            setShowProfilePopup={setShowProfilePopup}
            setShowRepostPopup={setShowRepostPopup}
            sharePopupRef={sharePopupRef}
            morePopupRef={morePopupRef}
            profilePicRef={profilePicRef}
            profilePopupRef={profilePopupRef}
            repostPopupRef={repostPopupRef}
            formatNumber={formatNumber}
          />
        )}
        {activeView === "following" && (
          <FollowingPage
            posts={posts}
            likedPosts={likedPosts}
            bookmarkedPosts={bookmarkedPosts}
            repostedPosts={repostedPosts}
            showSharePopup={showSharePopup}
            showMorePopup={showMorePopup}
            showProfilePopup={showProfilePopup}
            showRepostPopup={showRepostPopup}
            setLikedPosts={setLikedPosts}
            setBookmarkedPosts={setBookmarkedPosts}
            setRepostedPosts={setRepostedPosts}
            setShowSharePopup={setShowSharePopup}
            setShowMorePopup={setShowMorePopup}
            setShowProfilePopup={setShowProfilePopup}
            setShowRepostPopup={setShowRepostPopup}
            sharePopupRef={sharePopupRef}
            morePopupRef={morePopupRef}
            profilePicRef={profilePicRef}
            profilePopupRef={profilePopupRef}
            repostPopupRef={repostPopupRef}
            formatNumber={formatNumber}
          />
        )}
      </div>
    </div>
  );
}
