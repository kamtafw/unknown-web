"use client";

import Image from "next/image";
import { ChevronRight, Plus } from "lucide-react";
import CoverPic from "@/assets/edit-profile.png";
import ProfilePic from "@/assets/edit-profilepic.png";

interface EditProfilePageProps {
  onFieldEdit: (field: string) => void;
}

export default function EditProfilePage({ onFieldEdit }: EditProfilePageProps) {
  return (
    <div className="flex justify-start ml-5 mb-14">
      <div className="w-[546px] h-[796px] bg-white overflow-auto shadow-md">
        <div className="relative">
          <div className="w-full h-[256px] bg-gray-700 relative">
            <Image
              src={CoverPic}
              alt="Cover"
              width={546}
              height={256}
              className="w-full h-full object-cover"
            />
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
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white p-4">
            <h2 className="text-lg font-bold mb-4 text-[#6B7280]">About you</h2>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Name</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="cursor-pointer text-[#111827]" onClick={() => onFieldEdit("editName")}>Cameron Williamson</span>
                <ChevronRight
                  className="text-black cursor-pointer"
                  onClick={() => onFieldEdit("editName")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Username</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="cursor-pointer text-[#111827]" onClick={() => onFieldEdit("editUsername")}>@Cameron_Williamson</span>
                <ChevronRight
                  className="text-black  cursor-pointer"
                  onClick={() => onFieldEdit("editUsername")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Bio</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="cursor-pointer text-[#111827]" onClick={() => onFieldEdit("editBio")}>A product Designer who likes explore...</span>
                <ChevronRight
                  className="text-black  cursor-pointer "
                  onClick={() => onFieldEdit("editBio")}
                />
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Email</span>
              <div className="flex items-center gap-2">
                <span className="tex-[#6B7280]">Cameronwill@example.com</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Phone No</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-[#111827]">+234 8123456789</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#111827]">Date of birth</span>
              <div className="flex items-center gap-2 font-semibold">
                <span className="text-[#111827]">Set date of birth</span>
              </div>
            </div>
            <label className="flex justify-between items-center py-2 cursor-pointer">
              <span className="text-[#111827]">Show date of birth</span>
              <div className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  id="show-dob"
                  className="sr-only peer"
                  aria-label="Toggle show date of birth"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#4ADE80] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ADE80]"></div>
              </div>
            </label>
          </div>

          <div className="mt-4">
            <h2 className="text-lg mb-4 text-[#6B7280]">Link</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="w-8 h-8 rounded-full bg-[#6A88D1] flex items-center justify-center text-white cursor-pointer"
                aria-label="Add external link"
                onClick={() => onFieldEdit("addLink")}
              >
                <Plus size={16} />
              </button>
              <span
                className="text-[#6A88D1] hover:text-[#425483] cursor-pointer"
                onClick={() => onFieldEdit("addLink")}
              >
                Add External Link
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}