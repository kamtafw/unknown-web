"use client";

import { GrScheduleNew } from "react-icons/gr";
import { MdGroups } from "react-icons/md";
import { FaUserGroup } from "react-icons/fa6";
import { TbCopyPlusFilled } from "react-icons/tb";

interface CopyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule?: () => void;
  onCreateCommunity?: () => void;
  onCreateGroup?: () => void;
}

export function CopyPopup({
  isOpen,
  onClose,
  onSchedule,
  onCreateCommunity,
  onCreateGroup,
}: CopyPopupProps) {
  if (!isOpen) return null;

  const handleScheduleClick = () => {
    onSchedule?.();
    onClose();
  };

  const handleCreateCommunityClick = () => {
    onCreateCommunity?.();
    onClose();
  };

  const handleCreateGroupClick = () => {
    onCreateGroup?.();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white backdrop-blur-md rounded-lg shadow-xl w-[300px] h-[400px] p-8 relative">
          <div className="absolute bottom-4 right-4 flex flex-col gap-4 items-end">
            <button
              type="button"
              onClick={handleScheduleClick}
              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group rounded-lg min-w-[200px]"
            >
              <span className="text-lg font-medium text-gray-800">
                Schedule
              </span>
              <div className="w-[40px] h-[40px] rounded-full bg-white shadow-lg flex items-center justify-center">
                <GrScheduleNew className="h-6 w-6 text-blue-500" />
              </div>
            </button>
            <button
              type="button"
              onClick={handleCreateCommunityClick}
              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group rounded-lg min-w-[200px]"
            >
              <span className="text-lg font-medium text-gray-800">
                Create Community
              </span>
              <div className="w-[40px] h-[40px] rounded-full bg-white shadow-lg flex items-center justify-center ml-3">
                <MdGroups className="h-6 w-6 text-blue-500" />
              </div>
            </button>
            <button
              type="button"
              onClick={handleCreateGroupClick}
              className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors group rounded-lg min-w-[200px]"
            >
              <span className="text-lg font-medium text-gray-800">
                Create Group
              </span>
              <div className="w-[40px] h-[40px] rounded-full bg-white shadow-lg flex items-center justify-center">
                <FaUserGroup className="h-5 w-5 text-blue-500" />
              </div>
            </button>
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-lg self-end">
              <TbCopyPlusFilled className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
