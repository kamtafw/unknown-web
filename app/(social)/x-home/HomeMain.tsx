"use client";

import React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import ForYouPage from "./ForYou";
import FollowingPage from "./FollowingHome";


interface HomeMainPageProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function HomeMain({
  activeView,
  setActiveView,
}: HomeMainPageProps) {
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
            bookmarkedPosts={bookmarkedPosts}
            repostedPosts={repostedPosts}
            showSharePopup={showSharePopup}
            showMorePopup={showMorePopup}
            showProfilePopup={showProfilePopup}
            showRepostPopup={showRepostPopup}
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
            bookmarkedPosts={bookmarkedPosts}
            repostedPosts={repostedPosts}
            showSharePopup={showSharePopup}
            showMorePopup={showMorePopup}
            showProfilePopup={showProfilePopup}
            showRepostPopup={showRepostPopup}
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
