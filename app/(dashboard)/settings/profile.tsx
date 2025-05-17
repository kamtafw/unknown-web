"use client";

import { useState } from "react";
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
import ProfilePic from "@/assets/profilepic.jpg";

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
    <div className="flex justify-start mb-14 ml-5">
      <div className="flex flex-col w-[525px] h-[796px] bg-white text-black overflow-auto border border-gray-200 rounded-lg shadow-md">
        <div className="relative">
          <div className="w-full h-[256] bg-gray-700 relative">
            <Image
              src={CoverPic}
              alt="Cover"
              width={546}
              height={256}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 p-2 rounded-full bg-black/50 cursor-pointer">
              <ArrowLeft size={20} className="text-white" />
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-full bg-black/50 cursor-pointer" onClick={toggleMenu}>
              <MoreVertical size={20} className="text-white" />
            </div>
            

            {showMenu && (
              <div className="absolute top-14 right-4 bg-white rounded-lg shadow-lg z-10 w-48">
                <div className="py-1">
                  <button 
                    onClick={handleEditProfile}
                    className="w-full text-left px-4 py-2 text-black  flex items-center gap-2 cursor-pointer"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 text-black flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 size={16} />
                    <span>Share Profile Link</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-4">
          <div className="flex justify-between items-start">
            <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-600 relative -mt-10">
              <Image
                src={ProfilePic}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              className="mt-2 bg-transparent text-blue-500 border border-blue-500 rounded-full px-4 py-1 font-bold flex items-center gap-1 cursor-pointer"
              onClick={onVerifiedClick}
            >
              <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <BadgeCheck size={12} className="text-white" />
              </div>
              <span className="text-sm text-[#6A88D1] hover:text-[#425483]">Get verified</span>
            </button>
          </div>
          <div className="mt-3">
            <h1 className="font-bold text-xl">{profile.name}</h1>
            <p className="text-gray-500">{profile.username}</p>
          </div>
          <div className="flex mt-4 gap-5">
            <div
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={onConnectionsClick}
              role="button"
              tabIndex={0}
              aria-label="View connections"
            >
              <span className="font-bold">{profile.connections}</span>
              <span className="text-gray-500 text-sm">Connections</span>
            </div>
            <div
              className="flex flex-col cursor-pointer hover:opacity-80"
              onClick={onFollowingClick}
              role="button"
              tabIndex={0}
              aria-label="View following"
            >
              <span className="font-bold">{profile.following}</span>
              <span className="text-gray-500 text-sm">Following</span>
            </div>
            <div
              className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
              onClick={onFollowersClick}
              role="button"
              tabIndex={0}
              aria-label="View followers"
            >
              <span className="font-bold">{profile.followers}</span>
              <span className="text-gray-500 text-sm">Followers</span>
            </div>
          </div>
          <div className="mt-4">
            <p>{profile.bio}</p>
          </div>
          <div className="mt-4 space-y-1 ">
            <div className="flex items-center gap-2 cursor-pointer">
              <Link size={16} className="text-gray-500" />
              <span className="font-semibold">{profile.website}</span>
              <span className="text-blue-500">and 2 more</span>
            </div>
            <div className="flex items-center gap-4 cursor-pointer mt-4">
              <div className="flex items-center gap-1">
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm font-semibold">{profile.location}</span>
              </div>
              <div className="flex items-center gap-1 cursor-pointer">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm font-semibold">{profile.joinDate}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 cursor-pointer">
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-blue-500 border border-white"></div>
              <div className="w-5 h-5 rounded-full bg-red-500 border border-white -ml-2"></div>
              <div className="w-5 h-5 rounded-full bg-green-500 border border-white -ml-2"></div>
            </div>
            <span className="text-sm">
              Followed by {profile.followedBy[0]}, {profile.followedBy[1]}, and{" "}
              {profile.followedBy[2]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
