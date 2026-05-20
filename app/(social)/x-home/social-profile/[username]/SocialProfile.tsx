"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Link,
  MapPin,
  Calendar,
  MoreVertical,
  BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FollowersPopup from "./FollowersPopup";
import FollowingPopup from "./FollowingPopup";
import ConnectionsPopup from "./ConnectionsPopup";
import MoreOptionsPopup from "./SocialOptionsPopup";
import SocialPost from "../[username]/post/SocialPost";
import SocialReplies from "../[username]/replies/SocialReplies";
import SocialLikes from "../[username]/likes/SocialLikes";
import SocialMedia from "../[username]/media/SocialMedia";
import { cn } from "@/lib/utils";

export default function SocialProfile() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("Post");
  const [showMenu, setShowMenu] = useState(false);
  const [showFollowersPopup, setShowFollowersPopup] = useState(false);
  const [showFollowingPopup, setShowFollowingPopup] = useState(false);
  const [showConnectionsPopup, setShowConnectionsPopup] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const profile = {
    id: 1,
    name: "Cameron Williamson",
    username: "@Cameron_Williamson",
    bio: "Product Designer who likes exploring many aspect of creativity",
    website: "https://www.behance.net",
    location: "Lagos, Nigeria",
    joinDate: "2 Dec, 2024",
    connections: "1,717",
    following: 93,
    followers: 29,
    followedBy: ["John adolp", "chinedu", "2 others you follow"],
    profilePic: "/Rectangle5.png",
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full">
      <div className="w-full lg:max-w-4xl">
        <div className="relative">
          <div className="w-full h-32 bg-gray-700 relative sm:h-48 lg:h-[256px] rounded-lg overflow-hidden">
            <Image
              src="/Frame 427321627.png"
              alt="Cover"
              width={546}
              height={256}
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-2 left-2 p-1 rounded-full bg-black/50 sm:top-4 sm:left-4 sm:p-2"
              onClick={() => router.push("/home")}
              aria-label="Back to home"
            >
              <ArrowLeft size={16} className="text-white sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-start">
            <div
              className="w-24 h-24 rounded-full border-2 border-white overflow-hidden bg-gray-600 relative -mt-8 sm:w-28 sm:h-28 sm:border-4 sm:-mt-10 lg:w-36 lg:h-36 lg:border-[6] lg:-mt-14"
            >
              <Image
                src={profile.profilePic}
                alt={profile.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 mt-5">
              <button
                className="bg-blue-500 text-white rounded-full px-5 sm:px-10 py-1.5 sm:py-3 font-semibold text-xs sm:text-sm"
                onClick={() => console.log("Follow clicked")}
              >
                Follow
              </button>
              <button
                className="bg-transparent text-blue-500 border border-blue-500 rounded-full px-5 sm:px-10 py-1.5 sm:py-3 font-semibold text-xs sm:text-sm"
                onClick={() => router.push(`/messages/${profile.username}`)}
                aria-label="Send message"
              >
                Message
              </button>
              <button
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-gray-300 bg-white hover:bg-gray-100"
                onClick={() => setShowMenu(true)}
                aria-label="More options"
              >
                <MoreVertical size={20} className="text-gray-500" />
              </button>
              {showMenu && (
                <div ref={menuRef}>
                  <MoreOptionsPopup
                    onClose={() => setShowMenu(false)}
                    username={profile.username}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <h1 className="font-bold text-lg sm:text-xl">{profile.name}</h1>
            <div className="flex items-center gap-1 mt-2">
              <p className="text-gray-500 text-sm sm:text-base">
                {profile.username}
              </p>
              <BadgeCheck size={16} className="text-blue-500" />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-15 sm:mt-4 sm:gap-45">
            <button
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={() => setShowConnectionsPopup(true)}
              aria-label="View connections"
            >
              <span className="font-bold text-sm text-[18px]">
                {profile.connections}
              </span>
              <span className="text-gray-500 text-xs text-[14px]">
                Connections
              </span>
            </button>
            <button
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={() => setShowFollowingPopup(true)}
              aria-label="View following"
            >
              <span className="font-bold text-sm text-[18px]">
                {profile.following}
              </span>
              <span className="text-gray-500 text-xs text-[14px]">
                Following
              </span>
            </button>
            <button
              className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => setShowFollowersPopup(true)}
              aria-label="View followers"
            >
              <span className="font-bold text-sm text-[18px]">
                {profile.followers}
              </span>
              <span className="text-gray-500 text-xs text-[14px]">
                Followers
              </span>
            </button>
          </div>
          <div className="mt-4 sm:mt-8">
            <p className="text-sm text-[16px]">{profile.bio}</p>
          </div>
          <div className="mt-4 space-y-1 sm:mt-8">
            <div className="flex items-center gap-2 cursor-pointer">
              <Link size={14} className="text-gray-500 sm:w-4 sm:h-4" />
              <span className="font-semibold text-sm text-[16px]">
                {profile.website}
              </span>
              <span className="text-blue-500 text-xs text-[16px]">
                and 2 more
              </span>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:mt-8">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-xs font-semibold text-[14px]">
                  {profile.location}
                </span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer mt-4 sm:mt-0">
                <Calendar size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-[14px] font-semibold">
                  {profile.joinDate}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-8 flex items-center gap-2 cursor-pointer mb-5">
            <div className="flex items-center">
              <div className="w-4 h-4 sm:w-10 sm:h-10 rounded-full border border-white overflow-hidden">
                <Image
                  src="/friend.png"
                  alt="Profile 1"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-4 h-4 sm:w-10 sm:h-10 rounded-full border border-white overflow-hidden -ml-3 sm:-ml-6">
                <Image
                  src="/Rectangle 2.png"
                  alt="Profile 2"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-4 h-4 sm:w-10 sm:h-10 rounded-full border border-white overflow-hidden -ml-3 sm:-ml-6">
                <Image
                  src="/Rectangle 4.png"
                  alt="Profile 3"
                  width={20}
                  height={20}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-4 h-4 text-sm sm:w-10 sm:h-10 rounded-full bg-blue-500 border border-white text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center -ml-3 sm:-ml-6">
                41+
              </div>
            </div>
            <span className="text-xs sm:text-sm">
              Followed by {profile.followedBy[0]}, {profile.followedBy[1]}, and{" "}
              {profile.followedBy[2]}
            </span>
          </div>
          <div className="sticky top-0 backdrop-blur-sm z-10">
            <div className="grid grid-cols-4">
              <button
                className={cn(
                  "text-base sm:text-lg font-semibold pb-2 transition-colors",
                  activeView === "Post"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveView("Post")}
              >
                Post
              </button>
              <button
                className={cn(
                  "text-base sm:text-lg font-semibold pb-2 transition-colors",
                  activeView === "Replies"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveView("Replies")}
              >
                Replies
              </button>
              <button
                className={cn(
                  "text-base sm:text-lg font-semibold pb-2 transition-colors",
                  activeView === "Likes"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveView("Likes")}
              >
                Likes
              </button>
              <button
                className={cn(
                  "text-base sm:text-lg font-semibold pb-2 transition-colors",
                  activeView === "Media"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                )}
                onClick={() => setActiveView("Media")}
              >
                Media
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-0">
            {activeView === "Post" && <SocialPost />}
            {activeView === "Replies" && <SocialReplies />}
            {activeView === "Likes" && <SocialLikes />}
            {activeView === "Media" && <SocialMedia />}
          </div>
        </div>
        {showFollowersPopup && (
          <FollowersPopup onClose={() => setShowFollowersPopup(false)} />
        )}
        {showFollowingPopup && (
          <FollowingPopup onClose={() => setShowFollowingPopup(false)} />
        )}
        {showConnectionsPopup && (
          <ConnectionsPopup onClose={() => setShowConnectionsPopup(false)} />
        )}
      </div>
    </div>
  );
}