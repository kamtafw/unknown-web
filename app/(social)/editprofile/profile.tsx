"use client";

import { useState, useRef } from "react";
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
import {
  useGetCurrentUserProfile,
  useUpdateProfilePhoto,
  useUpdateCoverPhoto,
  useGetMutualFollows,
} from "@/services/profile/useProfileService";

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

  const { data: userData } = useGetCurrentUserProfile();
  const { data: mutualFollows } = useGetMutualFollows(1, 3);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const updateProfilePhotoMutation = useUpdateProfilePhoto();
  const updateCoverPhotoMutation = useUpdateCoverPhoto();

  const handleProfilePhotoClick = () => profilePhotoInputRef.current?.click();
  const handleCoverPhotoClick = () => coverPhotoInputRef.current?.click();

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateProfilePhotoMutation.mutate(file);
  };

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) updateCoverPhotoMutation.mutate(file);
  };

  const profile = {
    name:
      `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim() ||
      "User",
    username: `@${userData?.username || "username"}`,
    bio: userData?.profile?.about_me || "No bio yet",
    website: userData?.external_links?.[0]?.url || "No website",
    location:
      userData?.state && userData?.country
        ? `${userData.state}, ${userData.country}`
        : "Not set",
    joinDate: new Date(userData?.date_joined || Date.now()).toLocaleDateString(
      "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    ),
    connections: "0",
    following: userData?.following_count || 0,
    followers: userData?.follower_count || 0,
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
            {userData?.cover_photo && (
              <Image
                src={
                  userData.cover_photo.startsWith("http")
                    ? userData.cover_photo
                    : `https://appscombo.s3.amazonaws.com${userData.cover_photo}`
                }
                alt="Cover"
                width={546}
                height={256}
                className="w-full h-full object-cover cursor-pointer"
                onClick={handleCoverPhotoClick}
              />
            )}
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoChange}
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
              {userData?.profile_photo && (
                <Image
                  src={
                    userData.profile_photo.startsWith("http")
                      ? userData.profile_photo
                      : `https://appscombo.s3.amazonaws.com${userData.profile_photo}`
                  }
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={handleProfilePhotoClick}
                />
              )}
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhotoChange}
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
                {userData?.external_links?.[0]?.url || "No website"}
              </span>
              {userData?.external_links &&
                userData.external_links.length > 1 && (
                  <span className="text-blue-500 text-xs sm:text-sm">
                    and {userData.external_links.length - 1} more
                  </span>
                )}
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
          {mutualFollows && mutualFollows.length > 0 && (
            <div className="mt-5 flex items-center gap-2 cursor-pointer mb-5">
              <div className="flex items-center">
                {mutualFollows.slice(0, 3).map((mutual, index) => (
                  <div
                    key={mutual.id}
                    className={`w-4 h-4 sm:w-10 sm:h-10 rounded-full border border-white overflow-hidden ${
                      index > 0 ? "-ml-3 sm:-ml-6" : ""
                    }`}
                  >
                    <Image
                      src={
                        mutual.profile_photo?.startsWith("http")
                          ? mutual.profile_photo
                          : `https://appscombo.s3.amazonaws.com${mutual.profile_photo}`
                      }
                      alt={`${mutual.first_name} ${mutual.last_name}`}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {mutualFollows.length > 3 && (
                  <div className="w-4 h-4 text-sm sm:w-10 sm:h-10 rounded-full bg-blue-500 border border-white text-white text-[10px] sm:text-[11px] font-semibold flex items-center justify-center -ml-3 sm:-ml-6">
                    {mutualFollows.length - 3}+
                  </div>
                )}
              </div>

              <span className="text-xs sm:text-sm">
                Followed by{" "}
                {mutualFollows.slice(0, 2).map((mutual, index) => (
                  <span key={mutual.id}>
                    {mutual.first_name} {mutual.last_name}
                    {index === 0 && mutualFollows.length > 1 && ", "}
                  </span>
                ))}
                {mutualFollows.length > 2 && (
                  <span>
                    , and {mutualFollows.length - 2} other
                    {mutualFollows.length - 2 > 1 ? "s" : ""} you follow
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
