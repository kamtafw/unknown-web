"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Link,
  MapPin,
  Calendar,
  MoreVertical,
  BadgeCheck,
  Share2,
  Edit,
} from "lucide-react";
import Image from "next/image";
import CoverPic from "@/assets/profilecover.jpg";
import ProfilePic from "@/public/profilepic.jpg";

interface ProfilePageProps {
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  onConnectionsClick: () => void;
  onVerifiedClick: () => void;
  onEditProfileClick?: () => void;
}

export default function ProfilePage({
  onFollowersClick,
  onFollowingClick,
  onConnectionsClick,
  onVerifiedClick,
  onEditProfileClick,
}: ProfilePageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const profile = {
    name: "Cameron Williamson",
    username: "@Cameron_Williamson",
    bio: "Product Designer who likes exploring many aspect of creativity",
    website: "https://www.behance.net...",
    location: "Lagos, Nigeria",
    joinDate: "2 Dec, 2024",
    connections: "1,717",
    following: 93,
    followers: 29,
    followedBy: ["John adolp", "chinedu", "2 others you follow"],
  };

  const handleBackToSettings = () => {
    router.push("/settings");
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowMenu(false);
    alert("Profile link copied to clipboard!");
  };

  const handleEditProfile = () => {
    if (onEditProfileClick) {
      onEditProfileClick();
    }
    setShowMenu(false);
  };

  return (
    <div className="flex justify-center mb-4 lg:mb-14">
      <div className="flex flex-col w-full max-w-[550px] min-h-[auto] bg-white text-black overflow-auto border border-gray-200 rounded-lg shadow-md lg:w-[525px] lg:h-[796px]">
        <div className="relative">
          <div className="w-full h-32 bg-gray-700 relative sm:h-48 lg:h-[256px]">
            <Image
              src={CoverPic}
              alt="Cover"
              width={546}
              height={256}
              className="w-full h-full object-cover"
            />
            <div
              className="absolute top-2 left-2 p-1 rounded-full bg-black/50 cursor-pointer sm:top-4 sm:left-4 sm:p-2"
              onClick={handleBackToSettings}
            >
              <ArrowLeft size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
            <div
              className="absolute top-2 right-2 p-1 rounded-full bg-black/50 cursor-pointer sm:top-4 sm:right-4 sm:p-2"
              onClick={toggleMenu}
            >
              <MoreVertical size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
            {showMenu && (
              <div className="absolute top-10 right-2 bg-white rounded-lg shadow-lg z-10 w-40 sm:top-14 sm:right-4 sm:w-48">
                <div className="py-1">
                  <button
                    onClick={handleEditProfile}
                    className="w-full text-left px-2 py-1 text-black flex items-center gap-2 cursor-pointer sm:px-4 sm:py-2"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">Edit Profile</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-2 py-1 text-black flex items-center gap-2 cursor-pointer sm:px-4 sm:py-2"
                  >
                    <Share2 size={14} className="sm:w-4 sm:h-4" />
                    <span className="text-sm sm:text-base">
                      Share Profile Link
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-3 sm:px-4">
          <div className="flex justify-between items-start">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-600 relative -mt-8 sm:w-20 sm:h-20 sm:border-4 sm:-mt-10">
              <Image
                src={ProfilePic}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="mt-2 bg-transparent text-blue-500 border border-blue-500 rounded-full px-3 py-1 font-bold flex items-center gap-1 cursor-pointer sm:px-4"
              onClick={onVerifiedClick}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center sm:w-4 sm:h-4">
                <BadgeCheck size={10} className="text-white sm:w-3 sm:h-3" />
              </div>
              <span className="text-xs text-[#6A88D1] hover:text-[#425483] sm:text-sm">
                Get verified
              </span>
            </button>
          </div>
          <div className="mt-2 sm:mt-3">
            <h1 className="font-bold text-lg sm:text-xl">{profile.name}</h1>
            <p className="text-gray-500 text-sm sm:text-base">
              {profile.username}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-3 sm:mt-4 sm:gap-5">
            <div
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={onConnectionsClick}
              role="button"
              tabIndex={0}
              aria-label="View connections"
            >
              <span className="font-bold text-sm sm:text-base">
                {profile.connections}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Connections
              </span>
            </div>
            <div
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={onFollowingClick}
              role="button"
              tabIndex={0}
              aria-label="View following"
            >
              <span className="font-bold text-sm sm:text-base">
                {profile.following}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Following
              </span>
            </div>
            <div
              className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onFollowersClick}
              role="button"
              tabIndex={0}
              aria-label="View followers"
            >
              <span className="font-bold text-sm sm:text-base">
                {profile.followers}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm">
                Followers
              </span>
            </div>
          </div>
          <div className="mt-3 sm:mt-4">
            <p className="text-sm sm:text-base">{profile.bio}</p>
          </div>
          <div className="mt-3 space-y-1 sm:mt-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <Link size={14} className="text-gray-500 sm:w-4 sm:h-4" />
              <span className="font-semibold text-sm sm:text-base">
                {profile.website}
              </span>
              <span className="text-blue-500 text-xs sm:text-sm">
                and 2 more
              </span>
            </div>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4 sm:mt-4">
              <div className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-xs font-semibold sm:text-sm">
                  {profile.location}
                </span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer mt-1 sm:mt-0">
                <Calendar size={14} className="text-gray-500 sm:w-4 sm:h-4" />
                <span className="text-xs font-semibold sm:text-sm">
                  {profile.joinDate}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 cursor-pointer mb-5">
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
              <div
                className="w-4 h-4 text-sm sm:w-10 sm:h-10 rounded-full bg-blue-500 border border-white text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center -ml-3 sm:-ml-6
"
              >
                41+
              </div>
            </div>

            <span className="text-xs sm:text-sm">
              Followed by {profile.followedBy[0]}, {profile.followedBy[1]}, and{" "}
              {profile.followedBy[2]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
