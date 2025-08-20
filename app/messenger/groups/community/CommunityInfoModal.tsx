import React, { useState } from "react";
import { X, Users, UserPlus, Settings, LogOut, Bell } from "lucide-react";
import Image from "next/image";
import {
  MdGroups2,
  MdOutlineChevronRight,
  MdOutlineGroupAdd,
  MdOutlinePlaylistAdd,
} from "react-icons/md";
import { IoLinkOutline } from "react-icons/io5";
import "@/app/global.css";
import { RiGroupLine } from "react-icons/ri";
import { BiEditAlt, BiSearch } from "react-icons/bi";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuMessageCircleWarning } from "react-icons/lu";
import { SlPicture } from "react-icons/sl";
import { HiHashtag } from "react-icons/hi";
import { AddMembersModal } from "./AddMembersModal";
import { AddGroupsModal } from "./AddGroupsModal";
import EditCommunityModal from "./EditCommunityModal";
import { CommunitySettingsModal } from "./CommunitySettingsModal";
import { ReportCommunityModal } from "./ReportCommunityModal";
import MediaModal from "./MediaModal";

interface Group {
  id: string;
  name: string;
  status?: string;
  icon?: React.ReactNode;
  time: string;
  message: string;
  badge?: number;
  online?: boolean;
  pinned?: boolean;
  statusIcon?: string;
  avatar?: string;
  hasGroupIcon?: boolean;
  isMuted?: boolean;
  hasHashIcon?: boolean;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  role?: "Admin" | "Member" | "Owner";
  avatar: string;
}

interface CommunityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    id: string;
    name: string;
    groupCount: number;
    memberCount: number;
    description: string;
  };
  currentUserRole?: "Admin" | "Member";
  availableGroups?: Group[];
  onGroupsAdded?: (groups: Group[]) => void;
  onCommunityUpdated?: (updatedCommunity: {
    name: string;
    description: string;
    avatar?: string;
  }) => void;
}

const mockMembers: Member[] = [
  {
    id: "1",
    name: "Cameron Williamson",
    phone: "+234 8123456789",
    role: "Owner",
    avatar: "/Rectangle5.png",
  },
  {
    id: "2",
    name: "Ralph Edwards",
    phone: "+234 8123456789",
    role: "Admin",
    avatar: "/Rectangle5.png",
  },
  {
    id: "3",
    name: "Cameron Williamson",
    phone: "+234 8181956789",
    avatar: "/Rectangle5.png",
  },
  {
    id: "4",
    name: "Cameron_Williamson",
    phone: "+234 8123456789",
    avatar: "/Rectangle 4.png",
  },
];

const mockMediaItems = [
  {
    id: 1,
    type: "video",
    thumbnail: "/image.png",
  },
  { id: 2, type: "image", thumbnail: "/image.png" },
  { id: 3, type: "image", thumbnail: "/media.jpg" },
  { id: 4, type: "image", thumbnail: "/media.jpg" },
];

const defaultAvailableGroups: Group[] = [
  {
    id: "1",
    name: "Dec Party",
    avatar: "/Rectangle 3.png",
    message: "Lorem ipsum dolor sit amet, con...",
    time: "00:57",
    badge: 4,
    isMuted: true,
  },
  {
    id: "2",
    name: "CSC101 Tutorials",
    hasGroupIcon: true,
    online: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum dolor sit, con...",
    time: "00:59",
    isMuted: true,
  },
  {
    id: "3",
    name: "Programmer's Circuit",
    hasGroupIcon: true,
    message: "Lorem ipsum dolor sit amet, con...",
    time: "1:59",
    badge: 4,
    isMuted: true,
  },
  {
    id: "4",
    name: "Good",
    hasGroupIcon: true,
    icon: <HiHashtag className="h-4 w-4 text-black" />,
    message: "Lorem ipsum sit, con...",
    time: "00:59",
  },
];

export default function CommunityInfoModal({
  isOpen,
  onClose,
  community,
  currentUserRole = "Member",
  availableGroups = defaultAvailableGroups,
  onGroupsAdded,
  onCommunityUpdated,
}: CommunityInfoModalProps) {
  const [activeTab, setActiveTab] = useState<"community" | "announcement">(
    "community"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isAddGroupsModalOpen, setIsAddGroupsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCommunitySettingsModalOpen, setIsCommunitySettingsModalOpen] =
    useState(false);
  const [communitySettings, setCommunitySettings] = useState({
    whoCanAddMembers: "Everyone" as "Everyone" | "Only Admins",
    whoCanAddGroups: "Everyone" as "Everyone" | "Only Admins",
  });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUserRole === "Admin";

  console.log("CommunityInfoModal - currentUserRole:", currentUserRole);
  console.log("CommunityInfoModal - isAdmin:", isAdmin);

  const filteredMembers = mockMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const handleAddGroups = () => {
    setIsAddGroupsModalOpen(true);
  };

  const handleGroupsAdded = (selectedGroups: Group[]) => {
    if (onGroupsAdded) {
      onGroupsAdded(selectedGroups);
    }
    setIsAddGroupsModalOpen(false);
  };

  const handleEditCommunity = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveCommunity = (updatedData: {
    name: string;
    description: string;
    avatar?: string;
  }) => {
    if (onCommunityUpdated) {
      onCommunityUpdated(updatedData);
    }
    setIsEditModalOpen(false);
  };

  const handleSettingsChange = (newSettings: typeof communitySettings) => {
    setCommunitySettings(newSettings);
    console.log("Settings updated:", newSettings);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg  w-[400] max-h-[90vh] flex flex-col overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="p-4">
            <div className="p-4">
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded mb-2"
                aria-label="Close community information modal"
                title="Close modal"
                type="button"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
              <div className="flex flex-col items-center justify-center">
                <div className="h-20 w-20 bg-gray-300 rounded-xl flex items-center justify-center mb-3">
                  <MdGroups2 className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <h2 className="font-semibold text-lg">{community.name}</h2>
                  <p className="text-sm text-gray-500">
                    Community • {community.groupCount} groups
                  </p>
                  <p className="text-sm text-gray-500">
                    {community.memberCount} members total
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-9 py-3 ml-13">
            <button className="h-17 w-30 p-2 border-2 rounded-lg flex flex-col items-center gap-2">
              <IoLinkOutline className="h-9 w-9 text-blue-500" />
              <span className="text-xs text-black">Invite</span>
            </button>
            <button
              className="h-17 w-30 p-2 border-2 rounded-lg flex flex-col items-center gap-2"
              onClick={() => setIsAddMembersModalOpen(true)}
            >
              <UserPlus className="h-9 w-9 text-blue-500" />
              <span className="text-xs text-black">Add members</span>
            </button>
            <button
              className="h-17 w-30 p-2 border-2 rounded-lg flex flex-col items-center gap-2"
              onClick={handleAddGroups}
            >
              <Users className="h-9 w-9 text-blue-500" />
              <span className="text-xs text-black">Add groups</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-2 rounded-full p-1 bg-gray-200">
            <button
              onClick={() => setActiveTab("community")}
              className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === "community"
                  ? "bg-white text-black shadow-sm"
                  : "text-black hover:text-gray-700"
              }`}
            >
              Community
            </button>
            <button
              onClick={() => setActiveTab("announcement")}
              className={`flex-1 py-1.5 px-2 text-sm font-medium rounded-full transition-all duration-200 ${
                activeTab === "announcement"
                  ? "bg-white text-black shadow-sm"
                  : "text-black hover:text-gray-700"
              }`}
            >
              Announcement
            </button>
          </div>

          <div className="pt-4 ml-3">
            <p className="text-sm text-gray-700">
              Bring together a neighborhood, school, or more. Create topic-based
              group for members, and easily send them admin announcements
            </p>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "community" ? (
              <div className="p-4 space-y-6">
                {/* Media Section */}
                <div>
                  <button
                    onClick={() => setIsMediaModalOpen(true)}
                    className="flex items-center justify-between mb-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <h3 className="font-medium">Media, Links, & Docs</h3>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-sm">101</span>
                      <MdOutlineChevronRight className="h-7 w-7 text-black" />
                    </div>
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    {mockMediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <div className="relative w-full h-full bg-gray-200">
                          <Image
                            src={item.thumbnail}
                            alt="media"
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Section */}
                <div>
                  <h3 className="font-medium mb-3">Action</h3>
                  <div className="space-y-1">
                    {isAdmin && (
                      <>
                        <button
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                          onClick={handleEditCommunity}
                        >
                          <BiEditAlt className="h-5 w-5 text-black" />
                          <span className="text-sm">Edit community info</span>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                          <MdOutlineGroupAdd className="h-5 w-5 text-black" />
                          <span className="text-sm">Manage groups</span>
                        </button>
                        <button
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                          onClick={() => setIsCommunitySettingsModalOpen(true)}
                        >
                          <Settings className="h-5 w-5 text-black" />
                          <span className="text-sm">Community settings</span>
                        </button>
                      </>
                    )}
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                      <RiGroupLine className="h-5 w-5 text-black" />
                      <span className="text-sm">View groups (4)</span>
                    </button>
                  </div>
                </div>

                {/* Members List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {mockMembers.length} members
                    </span>
                    <button
                      className="p-1"
                      onClick={() => setShowSearch(!showSearch)}
                      aria-label="Search members"
                      title="Search members"
                    >
                      <BiSearch className="h-5 w-5 text-black" />
                    </button>
                  </div>
                  {showSearch && (
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-3"
                      autoFocus
                    />
                  )}
                  <div className="space-y-1">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover"
                            width={40}
                            height={40}
                          />
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">
                              {member.phone}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-5 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            member.role || ""
                          )}`}
                        >
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-700">
                    Bring together a neighborhood, school, or more. Create
                    topic-based group for members, and easily send them admin
                    announcements
                  </p>
                </div>

                {/* Exit Community Action */}
                <div className="pt-4 border-t space-y-1">
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                    <MdOutlinePlaylistAdd className="h-5 w-5 text-black" />
                    <span className="text-sm text-black">Assign new owner</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                    <LogOut className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-500">Exit community</span>
                  </button>
                  {isAdmin && (
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                      <FaRegTrashCan className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-500">
                        Deactivate community
                      </span>
                    </button>
                  )}
                  <button
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <LuMessageCircleWarning className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-blue-500">
                      Report community
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {/* Media Section */}
                <div>
                  <button
                    onClick={() => setIsMediaModalOpen(true)}
                    className="flex items-center justify-between mb-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <h3 className="font-medium">Media, Links, & Docs</h3>
                    <div className="flex items-center gap-1 text-gray-500">
                      <span className="text-sm">101</span>
                      <MdOutlineChevronRight className="h-7 w-7 text-black" />
                    </div>
                  </button>
                  <div className="grid grid-cols-4 gap-2">
                    {mockMediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <div className="relative w-full h-full bg-gray-200">
                          <Image
                            src={item.thumbnail}
                            alt="media"
                            className="w-full h-full object-cover"
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Section for Announcement Tab */}
                <div>
                  <h3 className="font-medium mb-3">Action</h3>
                  <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                      <Bell className="h-5 w-5 text-gray-600" />
                      <span className="text-sm">Notification</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                      <SlPicture className="h-5 w-5 text-gray-600" />
                      <span className="text-sm">Media visibility</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left">
                      <RiGroupLine className="h-5 w-5 text-gray-600" />
                      <span className="text-sm">View groups (4)</span>
                    </button>
                    <button
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg text-left"
                      onClick={() => setIsReportModalOpen(true)}
                    >
                      <LuMessageCircleWarning className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-blue-500">
                        Report community
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        onSubmit={(selectedMembers) => {
          console.log("Selected members:", selectedMembers);
          setIsAddMembersModalOpen(false);
        }}
      />

      <AddGroupsModal
        isOpen={isAddGroupsModalOpen}
        onClose={() => setIsAddGroupsModalOpen(false)}
        availableGroups={availableGroups}
        onCreateGroup={handleGroupsAdded}
      />

      <EditCommunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        community={{
          id: community.id,
          name: community.name,
          description: community.description,
          avatar: "",
        }}
        onSave={handleSaveCommunity}
      />
      <CommunitySettingsModal
        isOpen={isCommunitySettingsModalOpen}
        onClose={() => setIsCommunitySettingsModalOpen(false)}
        settings={communitySettings}
        onSettingsChange={handleSettingsChange}
      />
      <ReportCommunityModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={(reason, feedback) => {
          console.log("Report submitted:", { reason, feedback });
          setIsReportModalOpen(false);
        }}
      />
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
      />
    </>
  );
}