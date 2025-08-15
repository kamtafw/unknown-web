"use client";

import { useState } from "react";
import {
  X,
  Users,
  Video,
  Phone,
  Bell,
  Search,
  UserPlus,
  UserX,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { HiDotsVertical } from "react-icons/hi";
import { IoIosCamera } from "react-icons/io";
import { FaAngleRight } from "react-icons/fa";
import { SlPicture } from "react-icons/sl";
import { IoExitOutline, IoLinkSharp } from "react-icons/io5";
import { TbPlaylistAdd } from "react-icons/tb";
import { MdGroups } from "react-icons/md";
import { GroupInfoOptionsPopup } from "./GroupInfoOptionsPopup";
import { MediaVisibilityPopup } from "./MediaVisibilityPopup";
import { NotificationPopup } from "./NotificationPopup";
import { MemberContextMenuPopup } from "./MemberContextMenuPopup";
import { GroupLinkPopup } from "./GroupLinkPopup";
import { ReportGroupPopup } from "./ReportGroupPopup";
import { AddToListPopup } from "../../../chats/AddToListPopup";
import { AddMemberPopup } from "./AddMemberPopup";
import { LuMessageCircleWarning } from "react-icons/lu";
import { GroupPermissionPopup } from "./GroupPermissionPopup";
import { PauseGroupPopup } from "./PauseGroupPopup";
import { RemoveMemberPopup } from "./RemoveMemberPopup";
import { SuspendMemberPopup } from "./SuspendMemberPopup";
import { AddToCommunityPopup } from "./AddToCommunityPopup";
import "./GroupInfoPopup.css";

interface GroupInfoPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupName: string;
  groupAvatar?: string;
  hasGroupIcon?: boolean;
  memberCount?: number;
  onStartVideoCall?: () => void;
  onStartAudioCall?: () => void;
  onChangeGroupName?: () => void;
  onAddToList?: () => void;
  onTabChange?: (tab: string) => void;
  onExitGroup?: () => void;
  isAdmin?: boolean;
}

export function GroupInfoPopup({
  isOpen,
  onClose,
  groupName,
  groupAvatar,
  memberCount = 24,
  onStartVideoCall,
  onStartAudioCall,
  onChangeGroupName,
  onAddToList,
  onExitGroup,
  isAdmin = false,
}: GroupInfoPopupProps) {
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  const [showMediaVisibility, setShowMediaVisibility] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [showGroupLink, setShowGroupLink] = useState(false);
  const [showReportGroup, setShowReportGroup] = useState(false);
  const [showAddToList, setShowAddToList] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showGroupPermission, setShowGroupPermission] = useState(false);
  const [showPauseGroup, setShowPauseGroup] = useState(false);
  const [showRemoveMember, setShowRemoveMember] = useState(false);
  const [showSuspendMember, setShowSuspendMember] = useState(false);
  const [showAddToCommunity, setShowAddToCommunity] = useState(false);

  const members = [
    {
      id: 1,
      name: "Cameron Williamson",
      phone: "+234 8023456789",
      avatar: "/Rectangle5.png",
      status: "Group admin",
    },
    {
      id: 2,
      name: "Jane Cooper",
      phone: "+234 8034567890",
      avatar: "/Rectangle5.png",
      status: "Restricted",
      statusColor: "red",
    },
    {
      id: 3,
      name: "Brooklyn Simmons",
      phone: "+234 8045678901",
      avatar: "/Rectangle5.png",
    },
    {
      id: 4,
      name: "Kristin Watson",
      phone: "+234 8056789012",
      avatar: "/Rectangle5.png",
    },
    {
      id: 5,
      name: "Albert Flores",
      phone: "+234 8067890123",
      avatar: "/Rectangle5.png",
    },
    {
      id: 6,
      name: "Jacob Jones",
      phone: "+234 8078901234",
      avatar: "/Rectangle5.png",
    },
    {
      id: 7,
      name: "Jenny Wilson",
      phone: "+234 8089012345",
      avatar: "/Rectangle5.png",
    },
    {
      id: 8,
      name: "Ralph Edwards",
      phone: "+234 8090123456",
      avatar: "/Rectangle5.png",
    },
    {
      id: 9,
      name: "Cameron Williamson",
      phone: "+234 8001234567",
      avatar: "/Rectangle5.png",
    },
    {
      id: 10,
      name: "@Cameron_Williamson",
      phone: "+234 8012345678",
      avatar: "/Rectangle5.png",
    },
  ];

  const handleCreateNewList = () => {
    console.log("Creating new list");
    setShowAddToList(false);
  };

  const handleAddToFavorites = () => {
    console.log("Adding to favorites");
    setShowAddToList(false);
  };

  const handleOptionsClick = () => {
    setShowOptionsPopup(true);
  };

  const handleChangeGroupName = () => {
    setShowOptionsPopup(false);
    if (onChangeGroupName) {
      onChangeGroupName();
    }
  };

  const handleMemberRightClick = (
    event: React.MouseEvent,
    memberName: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedMember(memberName);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setShowContextMenu(true);
  };

  const handlePauseGroup = () => {
    console.log("Pausing group");
    setShowPauseGroup(true);
  };

  const handleGroupPermissions = () => {
    console.log("Managing group permissions");
    setShowGroupPermission(true);
  };

  const handleRemoveMember = () => {
    console.log("Removing member:", selectedMember);
    setShowContextMenu(false);
    setShowRemoveMember(true);
  };

  const handleSuspendMember = () => {
    console.log("Suspending member:", selectedMember);
    setShowContextMenu(false);
    setShowSuspendMember(true);
  };

  const handleConfirmRemove = () => {
    console.log("Confirmed removal of:", selectedMember);
    setShowRemoveMember(false);
  };

  const handleConfirmSuspend = (duration: string) => {
    console.log("Confirmed suspension of:", selectedMember, "for", duration);
    setShowSuspendMember(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="!fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[80vh] flex flex-col mx-4 my-8 overflow-y-scroll scrollbar-hide">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X className="h-7 w-7 text-black" />
            </button>
            <button
              onClick={handleOptionsClick}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="More options"
            >
              <HiDotsVertical className="h-7 w-7 text-black" />
            </button>
          </div>

          {/* Group Details */}
          <div className="p-4 text-center">
            {/* Group Avatar */}
            <div className="flex justify-center mb-4">
              {groupAvatar ? (
                <div className="relative">
                  <Image
                    src={groupAvatar}
                    alt={groupName}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <IoIosCamera className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="h-20 w-20 border-2 border-gray-300 rounded-full flex items-center justify-center bg-gray-100 relative">
                  <Users className="h-6 w-6 text-gray-600" />
                  <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                    <IoIosCamera className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Group Info */}
            <h3 className="text-xl font-semibold text-black mb-1">
              {groupName}
            </h3>
            <div className="text-sm text-black mb-4">
              <div className="mb-1">Group</div>
              <div>{memberCount} members</div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <button
                  onClick={onStartVideoCall}
                  className="w-19 h-19 border border-gray-300 hover:bg-gray-50 rounded-lg flex flex-col items-center justify-center transition-colors"
                >
                  <Video className="h-9 w-9 text-blue-300" />
                  <span className="text-xs text-gray-600 mt-1 block">
                    Video
                  </span>
                </button>
              </div>

              {isAdmin && (
                <div className="text-center">
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="w-19 h-19 border border-gray-300 hover:bg-gray-50 rounded-lg flex flex-col items-center justify-center transition-colors"
                  >
                    <UserPlus className="h-9 w-9 text-blue-300" />
                    <span className="text-xs text-gray-600 mt-1 block">
                      Add
                    </span>
                  </button>
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={onStartAudioCall}
                  className="w-19 h-19 border border-gray-300 hover:bg-gray-50 rounded-lg flex flex-col items-center justify-center transition-colors"
                >
                  <Phone className="h-9 w-9 text-blue-300" />
                  <span className="text-xs text-gray-600 mt-1 block">Call</span>
                </button>
              </div>

              <div className="text-center">
                <button className="w-19 h-19 border border-gray-300 hover:bg-gray-50 rounded-lg flex flex-col items-center justify-center transition-colors">
                  <Search className="h-9 w-9 text-blue-300" />
                  <span className="text-xs text-gray-600 mt-1 block">
                    Search
                  </span>
                </button>
              </div>
            </div>

            {/* New section with image and text */}
            <div className="flex gap-3 py-4 mt-4 border-t border-b border-gray-200">
              <Image
                src="/Question.png"
                alt="Question"
                width={24}
                height={24}
                className="h-8 w-8"
              />
              <div className="-space-y-1">
                <div className="text-lg font-semi-bold text-black">
                  Celebration all the way
                </div>
                <div className="text-sm text-gray-500 mr-10">
                  Created on 01/01/2024
                </div>
              </div>
            </div>
          </div>

          {/* Media, Links & Docs Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-3 flex justify-between items-center">
              Media, Links & Docs
              <div className="flex items-center gap-2">
                <span>101</span>
                <FaAngleRight className="h-5 w-5 text-gray-300" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/image.png"
                  alt="Image"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/image.png"
                  alt="Image"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-green-500 rounded-lg overflow-hidden">
                <Image
                  src="/media.jpg"
                  alt="Media"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square bg-green-600 rounded-lg overflow-hidden">
                <Image
                  src="/media.jpg"
                  alt="Media"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-3">
              Actions
            </div>

            <div className="space-y-1">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowAddMember(true)}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserPlus className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-800">Add members</span>
                  </button>

                  <button
                    onClick={handlePauseGroup}
                    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <UserX className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-800">Pause group</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setShowMediaVisibility(true)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <SlPicture className="h-5 w-5 text-gray-600" />
                <span className="text-gray-800">Media visibility</span>
              </button>

              <button
                onClick={() => setShowNotification(true)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="text-gray-800">Notification</span>
              </button>

              {isAdmin && (
                <button
                  onClick={handleGroupPermissions}
                  className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Shield className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-800">Group permissions</span>
                </button>
              )}
            </div>
          </div>


          {/* Add group to community Section */}
          {isAdmin && (
            <div className="px-4 py-3 border-b border-gray-200">
              <button
                onClick={() => setShowAddToCommunity(true)}
                className="w-full flex items-center px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <MdGroups className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left ml-5">
                  <div className="text-sm font-medium text-gray-800">
                    Add group to community
                  </div>
                  <div className="text-xs text-gray-500">
                    Bring members together in topic-based...
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Members Section */}
          <div className="px-4 pb-2 mt-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  {memberCount} members
                </span>
              </div>
              <Search className="h-4 w-4 text-black" />
            </div>

            <div className="">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 transition-colors"
                  onContextMenu={(e) => handleMemberRightClick(e, member.name)}
                >
                  <div className="relative">
                    <Image
                      src={member.avatar}
                      alt={member.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {member.name}
                      </span>
                      {member.status && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            member.statusColor === "red"
                              ? "text-red-600 bg-red-50"
                              : member.status === "Group admin"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 bg-gray-50"
                          }`}
                        >
                          {member.status}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{member.phone}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full text-center py-2 text-sm text-blue-600 hover:bg-gray-50 rounded-lg transition-colors">
              View all members
            </button>
          </div>

          {/* Group Actions */}
          <div className="px-4 py-2 border-gray-200">
            <div className="space-y-0">
              <button
                onClick={() => setShowGroupLink(true)}
                className="w-full flex items-center justify-start gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className=" flex items-center justify-center">
                  <IoLinkSharp className="h-6 w-6 text-blue-300" />
                </div>
                <span className="text-sm text-gray-800">Group link</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onAddToList?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="h-5 w-5 flex items-center justify-center">
                  <TbPlaylistAdd className="h-6 w-6 text-black" />
                </div>
                <span className="text-sm text-gray-800">Add to list</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onExitGroup?.();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="h-5 w-5 flex items-center justify-center">
                  <IoExitOutline className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-sm text-red-600">Exit group</span>
              </button>

              <button
                onClick={() => setShowReportGroup(true)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
              >
                <div className="h-5 w-5 flex items-center justify-center">
                  <LuMessageCircleWarning className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600">Report group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <GroupInfoOptionsPopup
        isOpen={showOptionsPopup}
        onClose={() => setShowOptionsPopup(false)}
        onChangeGroupName={handleChangeGroupName}
        isAdmin={isAdmin}
        onAddMembers={() => {
          setShowOptionsPopup(false);
          setShowAddMember(true);
        }}
        onGroupPermission={() => {
          setShowOptionsPopup(false);
          handleGroupPermissions();
        }}
      />
      <MediaVisibilityPopup
        isOpen={showMediaVisibility}
        onClose={() => setShowMediaVisibility(false)}
        onSave={(visibility) => {
          console.log("Media visibility set to:", visibility);
        }}
        defaultValue="default"
      />
      <NotificationPopup
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        onSave={(settings) => {
          console.log("Notification settings saved:", settings);
        }}
      />
      <GroupLinkPopup
        isOpen={showGroupLink}
        onClose={() => setShowGroupLink(false)}
        groupName={groupName}
        groupAvatar={groupAvatar}
        hasGroupIcon={!groupAvatar}
        onSendViaAppsCombo={() => {
          console.log("Send via AppsCombo");
          setShowGroupLink(false);
        }}
        onCopyLink={() => {
          console.log("Link copied to clipboard");
        }}
        onShareLink={() => {
          console.log("Share link");
          setShowGroupLink(false);
        }}
        onShowQRCode={() => {
          console.log("Show QR code");
          setShowGroupLink(false);
        }}
        onResetLink={() => {
          console.log("Reset link");
          setShowGroupLink(false);
        }}
      />
      <ReportGroupPopup
        isOpen={showReportGroup}
        onClose={() => setShowReportGroup(false)}
        groupName={groupName}
        groupAvatar={groupAvatar}
        hasGroupIcon={!groupAvatar}
        onSubmitReport={(reason, details) => {
          console.log("Report submitted:", { reason, details, groupName });
        }}
      />
      <AddToListPopup
        isOpen={showAddToList}
        onClose={() => setShowAddToList(false)}
        onCreateNewList={handleCreateNewList}
        onAddToFavorites={handleAddToFavorites}
      />
      <AddMemberPopup
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onBack={() => setShowAddMember(false)}
        onAddMembers={(selectedContacts) => {
          console.log("Adding members:", selectedContacts);
          setShowAddMember(false);
        }}
      />
      <GroupPermissionPopup
        isOpen={showGroupPermission}
        onClose={() => setShowGroupPermission(false)}
        groupName={groupName}
      />
      <PauseGroupPopup
        isOpen={showPauseGroup}
        onClose={() => setShowPauseGroup(false)}
        onConfirm={(settings) => {
          console.log("Pause group settings:", settings);
          setShowPauseGroup(false);
        }}
      />
      <RemoveMemberPopup
        isOpen={showRemoveMember}
        onClose={() => setShowRemoveMember(false)}
        memberName={selectedMember}
        onConfirm={handleConfirmRemove}
      />
      <SuspendMemberPopup
        isOpen={showSuspendMember}
        onClose={() => setShowSuspendMember(false)}
        memberName={selectedMember}
        onConfirm={handleConfirmSuspend}
      />
      <MemberContextMenuPopup
        isOpen={showContextMenu}
        onClose={() => setShowContextMenu(false)}
        memberName={selectedMember}
        position={contextMenuPosition}
        isCurrentUserAdmin={isAdmin}
        memberStatus={members.find((m) => m.name === selectedMember)?.status}
        onMessageMember={() => {
          console.log("Message", selectedMember);
          setShowContextMenu(false);
        }}
        onViewMember={() => {
          console.log("View", selectedMember);
          setShowContextMenu(false);
        }}
        onRemoveMember={handleRemoveMember}
        onMakeAdmin={() => {
          console.log("Making admin:", selectedMember);
          setShowContextMenu(false);
        }}
        onRestrictMember={() => {
          console.log("Restricting member:", selectedMember);
          setShowContextMenu(false);
        }}
        onSuspendMember={handleSuspendMember}
      />
      <AddToCommunityPopup
        isOpen={showAddToCommunity}
        onClose={() => setShowAddToCommunity(false)}
        onSubmit={(selectedCommunity) => {
          console.log("Adding group to community:", selectedCommunity);
          setShowAddToCommunity(false);
        }}
      />
    </>
  );
}
