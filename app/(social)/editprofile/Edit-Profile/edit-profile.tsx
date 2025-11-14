"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronRight, Plus } from "lucide-react";
import { CiCamera } from "react-icons/ci";
import CoverPic from "@/assets/edit-profile.png";
import ProfilePic from "@/assets/edit-profilepic.png";
import SetDateOfBirthPopup from "./SetDateOfBirthPopUp";
import {
  useGetCurrentUserProfile,
  useUpdateCoverPhoto,
  useUpdateProfilePhoto,
  useUpdateDobVisibility,
} from "@/services/profile/useProfileService";

interface EditProfilePageProps {
  onFieldEdit: (field: string) => void;
}

export default function EditProfilePage({ onFieldEdit }: EditProfilePageProps) {
  const [showDateOfBirthPopup, setShowDateOfBirthPopup] = useState(false);
  const { data: userData } = useGetCurrentUserProfile();
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const updateProfilePhotoMutation = useUpdateProfilePhoto();
  const updateCoverPhotoMutation = useUpdateCoverPhoto();
  const updateDobVisibilityMutation = useUpdateDobVisibility();

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

  return (
    <div className="flex justify-center  mb-4 lg:ml-3  lg:mb-14">
      <div className="w-full max-w-[530px] bg-white overflow-auto shadow-md lg:w-[546px] lg:h-[796px]">
        <div className="relative">
          <div className="w-full h-32 bg-gray-700 relative sm:h-48 lg:h-[256px]">
            <div className="relative">
              <Image
                src={
                  userData?.cover_photo
                    ? userData.cover_photo.startsWith("http")
                      ? userData.cover_photo
                      : `https://appscombo.s3.amazonaws.com${userData.cover_photo}`
                    : CoverPic
                }
                alt="Cover"
                width={546}
                height={256}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleCoverPhotoClick}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors sm:bottom-4 sm:right-4 sm:p-3"
                aria-label="Change cover photo"
              >
                <CiCamera size={20} className="sm:w-6 sm:h-6" />
              </button>
              <input
                ref={coverPhotoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverPhotoChange}
              />
            </div>
          </div>
          <div className="px-3 sm:px-4">
            <div className="flex justify-between items-start">
              <div className="relative w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-600 -mt-8 sm:w-20 sm:h-20 sm:border-4 sm:-mt-10">
                <Image
                  src={
                    userData?.profile_photo
                      ? userData.profile_photo.startsWith("http")
                        ? userData.profile_photo
                        : `https://appscombo.s3.amazonaws.com${userData.profile_photo}`
                      : ProfilePic
                  }
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleProfilePhotoClick}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
                  aria-label="Change profile photo"
                >
                  <CiCamera size={20} className="sm:w-6 sm:h-6" />
                </button>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhotoChange}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="px-3 mt-3 sm:px-4 sm:mt-4">
          <div className="bg-white p-3 sm:p-4">
            <h2 className="text-base font-bold mb-3 text-gray-500 sm:text-lg sm:mb-4">
              About you
            </h2>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">Name</span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => onFieldEdit("editName")}
                >
                  {`${userData?.first_name || ""} ${
                    userData?.last_name || ""
                  }`.trim() || "Not set"}
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => onFieldEdit("editName")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">
                Username
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => onFieldEdit("editUsername")}
                >
                  @{userData?.username || "Not set"}
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => onFieldEdit("editUsername")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">Bio</span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => onFieldEdit("editBio")}
                >
                  {userData?.profile?.about_me?.substring(0, 40) || "Not set"}
                  ...
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => onFieldEdit("editBio")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">Email</span>
              <span className="text-gray-500 text-sm sm:text-base">
                {userData?.email || "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">
                Phone No
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => onFieldEdit("changeNumber")}
                >
                  {userData?.phone_number || "Not set"}
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => onFieldEdit("changeNumber")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">
                Date of birth
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => setShowDateOfBirthPopup(true)}
                >
                  {userData?.dob || "Set date of birth"}
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => setShowDateOfBirthPopup(true)}
                />
              </div>
            </div>
            <label className="flex justify-between items-center py-2 cursor-pointer">
              <span className="text-gray-900 text-sm sm:text-base">
                Show date of birth
              </span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  id="show-dob"
                  checked={userData?.dob_visibility === "full"}
                  onChange={(e) => {
                    updateDobVisibilityMutation.mutate({
                      dob_visibility: e.target.checked ? "full" : "hidden",
                    });
                  }}
                  className="sr-only peer"
                  aria-label="Toggle show date of birth"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-400 sm:w-11 sm:h-6 sm:after:h-5 sm:after:w-5" />
              </div>
            </label>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-900 text-sm sm:text-base">
                Locations
              </span>
              <div className="flex items-center gap-2 font-semibold">
                <span
                  className="cursor-pointer text-gray-900 text-sm sm:text-base"
                  onClick={() => onFieldEdit("setLocation")}
                >
                  {userData?.state && userData?.country
                    ? `${userData.state}, ${userData.country}`
                    : "Set location"}
                </span>
                <ChevronRight
                  className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                  onClick={() => onFieldEdit("setLocation")}
                />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-base font-bold mb-3 text-gray-500 sm:text-lg sm:mb-4">
              Link
            </h2>
            <div className="flex items-center gap-2 py-2">
              <button
                type="button"
                className="w-7 h-7 rounded-full bg-[#6A88D1] flex items-center justify-center text-white cursor-pointer sm:w-8 sm:h-8"
                aria-label="Add external link"
                onClick={() => onFieldEdit("addLink")}
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
              </button>
              <span
                className="text-[#6A88D1] hover:text-[#425483] cursor-pointer text-sm sm:text-base"
                onClick={() => onFieldEdit("addLink")}
              >
                Add External Link
              </span>
            </div>
            {userData?.external_links && userData.external_links.length > 0 ? (
              userData.external_links.map(
                (link: { id: number; url: string; label: string }) => (
                  <div key={link.id} className="flex items-center gap-2 py-2">
                    <div className="w-7 h-7 rounded-full bg-[#6A88D1] flex items-center justify-center text-white sm:w-8 sm:h-8">
                      <Plus size={14} className="sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1">
                      <span
                        className="text-gray-900 font-semibold text-sm sm:text-base cursor-pointer"
                        onClick={() => onFieldEdit("editPortfolio")}
                      >
                        {link.label}
                      </span>
                      <p className="text-gray-500 text-sm">{link.url}</p>
                    </div>
                    <ChevronRight
                      className="text-gray-900 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
                      onClick={() => onFieldEdit("editPortfolio")}
                    />
                  </div>
                )
              )
            ) : (
              <p className="text-gray-500 text-sm py-2">No links added yet</p>
            )}
          </div>
        </div>
        {showDateOfBirthPopup && (
          <SetDateOfBirthPopup onClose={() => setShowDateOfBirthPopup(false)} />
        )}
      </div>
    </div>
  );
}
