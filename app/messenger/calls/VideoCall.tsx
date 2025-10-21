"use client";

import { useState } from "react";
import { BsArrowsAngleExpand, BsArrowsAngleContract } from "react-icons/bs";
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { LuVolumeOff, LuVolume2 } from "react-icons/lu";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdCallEnd } from "react-icons/md";
import Image from "next/image";
import { ContactPopup } from "./ContactPopup";

interface Participant {
  id: number;
  name: string;
  avatar: string;
}

interface Contact {
  id: number;
  name: string;
  phone: string;
  avatar: string;
}

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  onEndCall: () => void;
  participants: Participant[];
  onAddParticipant?: () => void;
  groupName?: string;
}

export function VideoCall({
  isOpen,
  onEndCall,
  participants,
  groupName = "Video call",
}: VideoCallProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const displayedParticipants = participants.length > 0 ? participants : [];

  const getGridLayout = (count: number) => {
    if (count === 1) return { cols: 1, size: "w-80 h-80 sm:w-96 sm:h-96" };
    if (count === 2) return { cols: 2, size: "w-64 h-64 sm:w-80 sm:h-80" };
    if (count === 3) return { cols: 3, size: "w-48 h-48 sm:w-56 sm:h-56" };
    if (count === 4) return { cols: 2, size: "w-56 h-56 sm:w-64 sm:h-64" };
    if (count <= 6) return { cols: 3, size: "w-40 h-40 sm:w-48 sm:h-48" };
    if (count <= 9) return { cols: 3, size: "w-36 h-36 sm:w-40 sm:h-40" };
    return { cols: 4, size: "w-32 h-32 sm:w-36 sm:h-36" };
  };

  const handleEndCall = () => {
    setIsVideoOn(true);
    setIsVolumeOn(true);
    setIsExpanded(false);
    onEndCall();
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  const handleAddParticipant = () => {
    setShowContactPopup(true);
  };

  const handleContactSelect = (selectedContacts: Contact[]) => {
    const newParticipants = selectedContacts.map((contact) => ({
      id: contact.id,
       name: contact.name,
      avatar: contact.avatar,
    }));

    console.log("Adding participants:", newParticipants);

    setShowContactPopup(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-[50] flex items-center justify-center">
        <div
          className={`bg-[#111827] rounded-xl shadow-2xl transition-all duration-300 p-3 sm:p-4 lg:p-6 border-none ${
            isExpanded
              ? "w-full h-full rounded-none"
              : "w-[90%] h-[85%] sm:w-[90%] sm:h-[90%] lg:w-[800px] lg:h-[600px] sm:rounded-xl"
          } relative flex flex-col`}
        >
          {/* Header with Group Name */}
          <div className="flex items-center justify-center mb-3 sm:mb-4 lg:mb-6">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {groupName}
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">Video call</p>
            </div>
          </div>

          {/* Video Grid - Mobile Layout */}
          {/* <div className="flex-1 mb-3 sm:mb-4 lg:mb-6 overflow-y-auto block lg:hidden">
            {participantRowsMobile.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
                {row.map((participant) => (
                  <div key={participant.id} className="relative">
                    <div className="relative overflow-hidden rounded-lg aspect-video">
                      <Image
                        src={participant.avatar}
                        alt={`Participant ${participant.id}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div> */}
          <div className="flex-1 mb-3 sm:mb-4 lg:mb-6 overflow-auto p-2 sm:p-4 flex items-center justify-center">
            <div
              className="grid gap-3 sm:gap-4 justify-items-center"
              style={{
                gridTemplateColumns: `repeat(${
                  getGridLayout(displayedParticipants.length).cols
                }, minmax(0, 1fr))`,
              }}
            >
              {displayedParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Video Frame */}
                  <div
                    className={`relative rounded-xl overflow-hidden bg-gray-800 shadow-lg border border-gray-700 ${
                      getGridLayout(displayedParticipants.length).size
                    }`}
                  >
                    <Image
                      src={participant.avatar}
                      alt={participant.name}
                      fill
                      className="object-cover"
                    />
                    {/* Name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 sm:p-3">
                      <p className="text-white font-semibold text-xs sm:text-sm truncate">
                        {participant.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Video Grid - Desktop Layout */}  
          <div className="flex justify-center space-x-2 sm:space-x-3 lg:hidden">
            {/* End call - Always visible */}
            <button
              onClick={handleEndCall}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-10 h-10 sm:w-12 sm:h-12 bg-[#292F3D] rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "text-gray-600 hover:text-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isVideoOn ? "Turn off video" : "Turn on video"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <BsCameraVideoOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-[#292F3D] hover:bg-gray-300"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={isVolumeOn ? "Mute" : "Unmute"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              )}
            </button>

            {/* Add participant */}
            <button
              onClick={handleAddParticipant}
              className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </button>

            {/* More options */}
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 bg-[#292F3D] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <HiDotsHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
          </div>

          {/* Control Buttons - Desktop Layout (unchanged) */}
          <div className="hidden lg:flex justify-center space-x-4">
            {/* More options */}
            <button
              className="w-12 h-12 bg-[#292F3D] hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              aria-label="More options"
            >
              <HiDotsHorizontal className="h-5 w-5 text-gray-600" />
            </button>

            {/* Video toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 bg-[#292F3D] rounded-full flex items-center justify-center transition-colors ${
                isVideoOn
                  ? "text-gray-600 hover:text-gray-300"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
              title={isVideoOn ? "Turn off video" : "Turn on video"}
            >
              {isVideoOn ? (
                <BsCameraVideo className="h-5 w-5 text-gray-600" />
              ) : (
                <BsCameraVideoOff className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* End call */}
            <button
              onClick={handleEndCall}
              className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              title="End call"
            >
              <MdCallEnd className="h-5 w-5 text-white" />
            </button>

            {/* Volume toggle */}
            <button
              onClick={toggleVolume}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVolumeOn
                  ? "bg-[#292F3D] hover:bg-gray-300"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              title={isVolumeOn ? "Mute" : "Unmute"}
            >
              {isVolumeOn ? (
                <LuVolume2 className="h-5 w-5 text-gray-600" />
              ) : (
                <LuVolumeOff className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Add participant */}
            <button
              onClick={handleAddParticipant}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title="Add person"
            >
              <MdOutlinePersonAddAlt className="h-5 w-5 text-white" />
            </button>

            {/* Expand/Contract */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              {isExpanded ? (
                <BsArrowsAngleContract className="h-5 w-5 text-white" />
              ) : (
                <BsArrowsAngleExpand className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      <ContactPopup
        isOpen={showContactPopup}
        onClose={() => setShowContactPopup(false)}
        onStartCall={handleContactSelect}
      />
    </>
  );
}
